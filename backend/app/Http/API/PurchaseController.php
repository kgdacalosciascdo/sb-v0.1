<?php

namespace App\Http\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Models\CashAccount;
use App\Models\Company;
use App\Models\ProductService;
use App\Models\Purchase;
use App\Models\PurchaseDraft;
use App\Models\PurchasePostdatedCheck;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\TaxCode;
use App\Services\PostPurchase;
use App\Services\RecordSupplierPayment;
use App\Support\Money;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PurchaseController extends Controller
{
    public function bootstrap(Request $request): JsonResponse
    {
        $company = $request->attributes->get('company');

        return response()->json(['data' => [
            'company' => ['id' => $company->id, 'name' => $company->name, 'currency' => $company->currency_code],
            'suppliers' => Supplier::query()->where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'terms_days']),
            'products' => ProductService::query()->where('company_id', $company->id)->where('is_active', true)->orderBy('code')->get()->map(fn ($p): array => ['id' => $p->id, 'code' => $p->code, 'name' => $p->name, 'unit' => $p->unit_name, 'cost' => $p->default_purchase_cost ?? '0.00', 'tax_id' => $p->default_tax_code_id, 'track_inventory' => $p->track_inventory]),
            'taxes' => TaxCode::query()->where('company_id', $company->id)->where('is_active', true)->get(['id', 'name', 'rate_basis_points']),
            'accounts' => CashAccount::query()->where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'payment_methods']),
            'next_number' => '[Auto-generated]',
        ]]);
    }

    public function store(StorePurchaseRequest $request, PostPurchase $service): JsonResponse
    {
        [$purchase, $replay] = $service->handle($request->attributes->get('company'), $request->validated(), $this->key($request));

        return response()->json(['data' => $service->serialize($purchase), 'meta' => ['idempotent_replay' => $replay]], $replay ? 200 : 201);
    }

    public function index(Request $request, PostPurchase $service): JsonResponse
    {
        $query = Purchase::query()->where('company_id', $request->attributes->get('company')->id)->latest();
        if ($supplier = $request->query('supplier_id')) {
            $query->where('supplier_id', $supplier);
        }
        $rows = $query->paginate(25);

        return response()->json(['data' => $rows->getCollection()->map(function ($p) use ($service): array {
            $record = $service->serialize($p);

            return collect($record)->only(['id', 'purchase_number', 'purchase_date', 'supplier', 'invoice_number', 'total_cents', 'paid_cents', 'due_cents', 'due_date', 'postdated_check'])->all();
        }), 'meta' => ['page' => $rows->currentPage(), 'last_page' => $rows->lastPage(), 'total' => $rows->total()]]);
    }

    public function show(Request $request, string $purchase, PostPurchase $service): JsonResponse
    {
        return response()->json(['data' => $service->serialize($this->purchase($request, $purchase))]);
    }

    public function overview(Request $request): JsonResponse
    {
        $company = $request->attributes->get('company');
        $today = CarbonImmutable::now($company->timezone)->toDateString();
        $month = substr($today, 0, 7).'-01';
        $nextMonth = CarbonImmutable::parse($month)->addMonth()->toDateString();
        $payables = DB::table('payable_open_items as o')->join('purchases as p', 'p.id', '=', 'o.purchase_id')->join('suppliers as s', 's.id', '=', 'o.supplier_id')->where('o.company_id', $company->id)->where('o.outstanding_cents', '>', 0)->orderBy('o.due_date')->get(['o.id', 'o.purchase_id', 'o.supplier_id', 'o.due_date', 'o.outstanding_cents', 'p.purchase_number', 'p.supplier_invoice_number', 's.name as supplier_name']);
        $purchasesMonth = Purchase::query()->where('company_id', $company->id)->where('purchase_date', '>=', $month)->where('purchase_date', '<', $nextMonth)->sum('total_cents');
        $paymentsMonth = SupplierPayment::query()->where('company_id', $company->id)->where('payment_date', '>=', $month)->where('payment_date', '<', $nextMonth)->sum('amount_cents');
        $supplierBalances = Supplier::query()->where('company_id', $company->id)->get(['id', 'name', 'code'])->map(fn ($s): array => ['id' => $s->id, 'name' => $s->name, 'code' => $s->code, 'outstanding_cents' => (int) $payables->where('supplier_id', $s->id)->sum('outstanding_cents')]);

        return response()->json(['data' => ['today' => $today, 'purchases_month_cents' => (int) $purchasesMonth, 'payments_month_cents' => (int) $paymentsMonth, 'outstanding_cents' => (int) $payables->sum('outstanding_cents'), 'overdue_cents' => (int) $payables->where('due_date', '<', $today)->sum('outstanding_cents'), 'due_today_count' => $payables->where('due_date', $today)->count(), 'overdue_count' => $payables->where('due_date', '<', $today)->count(), 'due_soon_count' => $payables->where('due_date', '>', $today)->where('due_date', '<=', CarbonImmutable::parse($today)->addDays(7)->toDateString())->count(), 'draft_count' => PurchaseDraft::query()->where('company_id', $company->id)->count(), 'pending_check_count' => PurchasePostdatedCheck::query()->where('company_id', $company->id)->where('status', 'pending')->count(), 'suppliers' => $supplierBalances, 'payables' => $payables, 'recent' => Purchase::query()->where('company_id', $company->id)->latest()->limit(5)->get()->map(fn ($p): array => ['id' => $p->id, 'date' => $p->purchase_date->toDateString(), 'number' => $p->purchase_number, 'supplier' => $p->snapshot['supplier']['name'], 'amount_cents' => $p->total_cents])]]);
    }

    public function stock(Request $request): JsonResponse
    {
        $companyId = $request->attributes->get('company')->id;
        $rows = DB::table('inventory_movements as m')->join('products_services as p', 'p.id', '=', 'm.product_service_id')->where('m.company_id', $companyId)->selectRaw('p.id, p.code, p.name, p.unit_name, SUM(m.quantity) as received_quantity, SUM(m.cost_cents) as cost_cents')->groupBy('p.id', 'p.code', 'p.name', 'p.unit_name')->orderBy('p.code')->get();
        $recent = DB::table('inventory_movements as m')->join('purchase_lines as l', 'l.id', '=', 'm.purchase_line_id')->join('purchases as p', 'p.id', '=', 'l.purchase_id')->join('products_services as i', 'i.id', '=', 'm.product_service_id')->where('m.company_id', $companyId)->orderByDesc('m.created_at')->limit(25)->get(['m.id', 'm.quantity', 'm.movement_date', 'm.cost_cents', 'i.name', 'p.purchase_number', 'p.id as purchase_id']);

        return response()->json(['data' => ['items' => $rows, 'recent' => $recent]]);
    }

    public function cash(Request $request): JsonResponse
    {
        $companyId = $request->attributes->get('company')->id;
        $incoming = DB::table('cash_account_movements')->where('company_id', $companyId)->selectRaw('cash_account_id, SUM(amount_cents) as amount')->groupBy('cash_account_id')->pluck('amount', 'cash_account_id');
        $outgoing = DB::table('purchase_cash_movements')->where('company_id', $companyId)->selectRaw('cash_account_id, SUM(amount_cents) as amount')->groupBy('cash_account_id')->pluck('amount', 'cash_account_id');
        $accounts = CashAccount::query()->where('company_id', $companyId)->get(['id', 'name'])->map(fn ($a): array => ['id' => $a->id, 'name' => $a->name, 'received_cents' => (int) ($incoming[$a->id] ?? 0), 'paid_cents' => (int) ($outgoing[$a->id] ?? 0), 'net_cents' => (int) ($incoming[$a->id] ?? 0) - (int) ($outgoing[$a->id] ?? 0)]);
        $payments = DB::table('supplier_payments as s')->join('purchases as p', 'p.id', '=', 's.purchase_id')->join('cash_accounts as a', 'a.id', '=', 's.cash_account_id')->where('s.company_id', $companyId)->orderByDesc('s.created_at')->limit(25)->get(['s.id', 's.method', 's.reference', 's.payment_date', 's.amount_cents', 'a.name as account_name', 'p.purchase_number', 'p.id as purchase_id']);

        return response()->json(['data' => ['accounts' => $accounts, 'payments' => $payments]]);
    }

    public function payment(Request $request, string $purchase, RecordSupplierPayment $service, PostPurchase $posting): JsonResponse
    {
        $data = $request->validate(['method' => ['required', Rule::in(['Cash', 'Bank Transfer', 'Check', 'E-Wallet', 'Credit Card'])], 'cash_account_id' => ['required', 'uuid'], 'reference' => ['nullable', 'string', 'max:120'], 'payment_date' => ['required', 'date_format:Y-m-d'], 'amount' => ['required', 'numeric', 'gt:0', 'max:99999999.99', 'decimal:0,2']]);
        $record = $this->purchase($request, $purchase);
        [, $replay] = $service->handle($request->attributes->get('company'), $record, $data, $this->key($request));

        return response()->json(['data' => $posting->serialize($record), 'meta' => ['idempotent_replay' => $replay]], $replay ? 200 : 201);
    }

    public function clearCheck(Request $request, string $purchase, RecordSupplierPayment $payments, PostPurchase $posting): JsonResponse
    {
        $today = CarbonImmutable::now($request->attributes->get('company')->timezone)->toDateString();
        $data = $request->validate(['cleared_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.$today]]);
        $record = $this->purchase($request, $purchase);
        $company = $request->attributes->get('company');
        $key = $this->key($request);
        DB::transaction(function () use ($company, $record, $data, $payments, $key): void {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $check = PurchasePostdatedCheck::query()->where('company_id', $company->id)->where('purchase_id', $record->id)->lockForUpdate()->firstOrFail();
            if ($check->status === 'cleared') {
                return;
            }
            if ($data['cleared_date'] < $check->check_date->toDateString()) {
                throw ValidationException::withMessages(['cleared_date' => 'A post-dated check cannot be cleared before its date.']);
            }
            [$payment] = $payments->handle($company, $record, ['method' => 'Check', 'cash_account_id' => $check->cash_account_id, 'reference' => $check->check_number, 'payment_date' => $data['cleared_date'], 'amount' => Money::decimal($check->amount_cents)], $key);
            $check->update(['status' => 'cleared', 'supplier_payment_id' => $payment->id]);
        }, 3);

        return response()->json(['data' => $posting->serialize($record)]);
    }

    public function saveDraft(StorePurchaseRequest $request): JsonResponse
    {
        $company = $request->attributes->get('company');
        $data = $request->validated();
        $draft = DB::transaction(function () use ($company, $data): PurchaseDraft {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $draft = ! empty($data['draft_id']) ? PurchaseDraft::query()->where('company_id', $company->id)->findOrFail($data['draft_id']) : new PurchaseDraft(['company_id' => $company->id]);
            $draft->payload = $data;
            $draft->save();

            return $draft;
        });

        return response()->json(['data' => ['id' => $draft->id]]);
    }

    public function drafts(Request $request): JsonResponse
    {
        return response()->json(['data' => PurchaseDraft::query()->where('company_id', $request->attributes->get('company')->id)->latest('updated_at')->get()->map(fn ($d): array => ['id' => $d->id, 'date' => $d->payload['purchase_date'], 'invoice_number' => $d->payload['invoice_number'] ?? '', 'updated_at' => $d->updated_at->toISOString()])]);
    }

    public function draft(Request $request, string $draft): JsonResponse
    {
        $row = PurchaseDraft::query()->where('company_id', $request->attributes->get('company')->id)->findOrFail($draft);

        return response()->json(['data' => [...$row->payload, 'draft_id' => $row->id]]);
    }

    public function supplier(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:160'], 'terms_days' => ['required', 'integer', 'min:0', 'max:365']]);
        $row = Supplier::query()->create(['company_id' => $request->attributes->get('company')->id, 'name' => $data['name'], 'terms_days' => $data['terms_days'], 'code' => 'SUP-'.Str::upper(Str::random(10)), 'is_active' => true]);

        return response()->json(['data' => $row->only(['id', 'name', 'code', 'terms_days'])], 201);
    }

    public function attachment(Request $request, string $purchase, int $index)
    {
        $file = $this->purchase($request, $purchase)->snapshot['attachments'][$index] ?? null;
        abort_unless($file, 404);

        return response()->streamDownload(fn () => print (base64_decode($file['content'], true)), $file['name'], ['Content-Type' => $file['mime'], 'X-Content-Type-Options' => 'nosniff']);
    }

    private function purchase(Request $request, string $id): Purchase
    {
        return Purchase::query()->where('company_id', $request->attributes->get('company')->id)->findOrFail($id);
    }

    private function key(Request $request): string
    {
        $key = $request->header('Idempotency-Key');
        if (! is_string($key) || ! Str::isUuid($key)) {
            throw ValidationException::withMessages(['idempotency_key' => 'A UUID Idempotency-Key header is required.']);
        }

        return $key;
    }
}
