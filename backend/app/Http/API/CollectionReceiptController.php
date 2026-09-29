<?php

namespace App\Http\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReceivePaymentRequest;
use App\Models\CollectionDraft;
use App\Models\CollectionReceipt;
use App\Models\Company;
use App\Models\Customer;
use App\Services\ReceiveCustomerPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CollectionReceiptController extends Controller
{
    public function bootstrap(Request $request, ReceiveCustomerPayment $service): JsonResponse
    {
        return response()->json(['data' => $service->bootstrap($request->attributes->get('company'))]);
    }

    public function store(ReceivePaymentRequest $request, ReceiveCustomerPayment $service): JsonResponse
    {
        $key = $request->header('Idempotency-Key');
        if (! is_string($key) || ! Str::isUuid($key)) {
            throw ValidationException::withMessages(['idempotency_key' => 'A UUID Idempotency-Key header is required.']);
        }
        [$receipt, $replay] = $service->post($request->attributes->get('company'), $request->validated(), $key);

        return response()->json(['data' => $service->serialize($receipt), 'meta' => ['idempotent_replay' => $replay]], $replay ? 200 : 201);
    }

    public function index(Request $request): JsonResponse
    {
        $rows = CollectionReceipt::query()->where('company_id', $request->attributes->get('company')->id)->latest()->paginate(25);

        return response()->json(['data' => $rows->getCollection()->map(fn ($r): array => ['id' => $r->id, 'receipt_number' => $r->receipt_number, 'receipt_date' => $r->receipt_date->toDateString(), 'customer_name' => $r->snapshot['customer']['name'], 'amount_cents' => $r->amount_cents, 'unapplied_cents' => $r->unapplied_cents]), 'meta' => ['page' => $rows->currentPage(), 'last_page' => $rows->lastPage(), 'total' => $rows->total()]]);
    }

    public function show(Request $request, string $receipt, ReceiveCustomerPayment $service): JsonResponse
    {
        return response()->json(['data' => $service->serialize($this->receipt($request, $receipt))]);
    }

    public function attachment(Request $request, string $receipt, int $index)
    {
        $file = $this->receipt($request, $receipt)->snapshot['attachments'][$index] ?? null;
        abort_unless($file !== null, 404);

        return response()->streamDownload(fn () => print (base64_decode($file['content'], true)), $file['name'], ['Content-Type' => $file['mime'], 'X-Content-Type-Options' => 'nosniff']);
    }

    public function drafts(Request $request): JsonResponse
    {
        return response()->json(['data' => CollectionDraft::query()->where('company_id', $request->attributes->get('company')->id)->latest('updated_at')->get()->map(fn ($d): array => ['id' => $d->id, 'customer_key' => $d->payload['customer_key'], 'receipt_date' => $d->payload['receipt_date'], 'amount' => $d->payload['amount'], 'updated_at' => $d->updated_at->toISOString()])]);
    }

    public function draft(Request $request, string $draft): JsonResponse
    {
        $row = CollectionDraft::query()->where('company_id', $request->attributes->get('company')->id)->findOrFail($draft);

        return response()->json(['data' => [...$row->payload, 'draft_id' => $row->id]]);
    }

    public function saveDraft(ReceivePaymentRequest $request): JsonResponse
    {
        $company = $request->attributes->get('company');
        $data = $request->validated();
        $draft = DB::transaction(function () use ($company, $data): CollectionDraft {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $draft = ! empty($data['draft_id']) ? CollectionDraft::query()->where('company_id', $company->id)->findOrFail($data['draft_id']) : new CollectionDraft(['company_id' => $company->id]);
            $draft->payload = $data;
            $draft->save();

            return $draft;
        });

        return response()->json(['data' => ['id' => $draft->id]]);
    }

    public function createCustomer(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:160']]);
        $customer = Customer::query()->create(['company_id' => $request->attributes->get('company')->id, 'code' => 'CUST-'.Str::upper(Str::random(10)), 'name' => $data['name'], 'credit_status' => 'eligible', 'credit_limit_amount' => '0.00', 'is_active' => true]);

        return response()->json(['data' => ['key' => 'master:'.$customer->id, 'name' => $customer->name, 'code' => $customer->code, 'terms' => '', 'phone' => '', 'address' => '']], 201);
    }

    private function receipt(Request $request, string $id): CollectionReceipt
    {
        return CollectionReceipt::query()->where('company_id', $request->attributes->get('company')->id)->findOrFail($id);
    }
}
