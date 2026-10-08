<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\DocumentSequence;
use App\Models\InventoryMovement;
use App\Models\PayableOpenItem;
use App\Models\ProductService;
use App\Models\Purchase;
use App\Models\PurchaseDraft;
use App\Models\PurchaseLine;
use App\Models\PurchasePostdatedCheck;
use App\Models\Supplier;
use App\Models\TaxCode;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostPurchase
{
    public function totals(Company $company, array $items): array
    {
        $grossTotal = $discountTotal = $taxTotal = 0;
        $lines = [];
        $products = ProductService::query()->where('company_id', $company->id)->where('is_active', true)->whereIn('id', array_column($items, 'product_id'))->get()->keyBy('id');
        $taxes = TaxCode::query()->where('company_id', $company->id)->where('is_active', true)->get()->keyBy('id');
        foreach ($items as $i => $item) {
            $product = $products->get($item['product_id']);
            $this->ensure($product !== null, "items.$i.product_id", 'The selected product is unavailable in this company.');
            $tax = ! empty($item['tax_id']) ? $taxes->get($item['tax_id']) : null;
            $this->ensure(empty($item['tax_id']) || $tax !== null, "items.$i.tax_id", 'The selected tax code is unavailable.');
            $this->ensure(($tax?->rate_basis_points ?? 0) <= 10000, "items.$i.tax_id", 'The tax rate is outside the supported range.');
            $quantity = Money::quantity($item['quantity']);
            $cost = Money::cents($item['unit_cost']);
            $gross = Money::divideAndRound($quantity * $cost, 10000);
            $discount = Money::divideAndRound($gross * Money::basisPoints($item['discount_percent']), 10000);
            $net = $gross - $discount;
            $vat = Money::divideAndRound($net * ($tax?->rate_basis_points ?? 0), 10000);
            $grossTotal += $gross;
            $discountTotal += $discount;
            $taxTotal += $vat;
            $lines[] = ['product_id' => $product->id, 'code' => $product->code, 'name' => $product->name, 'unit' => $product->unit_name, 'quantity' => $item['quantity'], 'unit_cost' => $item['unit_cost'], 'unit_cost_cents' => $cost, 'discount_percent' => $item['discount_percent'], 'tax_id' => $tax?->id, 'tax_name' => $tax?->name ?? 'No tax', 'tax_rate' => $tax?->rate_basis_points ?? 0, 'gross_cents' => $gross, 'discount_cents' => $discount, 'net_cents' => $net, 'tax_cents' => $vat, 'track_inventory' => $product->track_inventory && $product->type === 'product'];
        }
        $total = $grossTotal - $discountTotal + $taxTotal;
        $this->ensure($total <= 9999999999, 'items', 'The purchase total exceeds the supported amount.');

        return ['lines' => $lines, 'gross_cents' => $grossTotal, 'discount_cents' => $discountTotal, 'subtotal_cents' => $grossTotal - $discountTotal, 'tax_cents' => $taxTotal, 'total_cents' => $total];
    }

    public function handle(Company $company, array $data, string $key): array
    {
        $data += ['payment_method' => null, 'cash_account_id' => null];
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($company, $data, $key, $hash): array {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $existing = Purchase::query()->where('company_id', $company->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_unless(hash_equals($existing->request_hash, $hash), 409, 'This submission key was already used for a different purchase.');

                return [$existing, true];
            }
            $supplier = Supplier::query()->where('company_id', $company->id)->where('is_active', true)->whereKey($data['supplier_id'])->first();
            $this->ensure($supplier !== null, 'supplier_id', 'Select an active supplier belonging to this company.');
            $invoiceKey = mb_strtoupper(trim($data['invoice_number']));
            $this->ensure(! Purchase::query()->where('company_id', $company->id)->where('supplier_id', $supplier->id)->where('invoice_key', $invoiceKey)->exists(), 'invoice_number', 'This supplier invoice has already been recorded.');
            $totals = $this->totals($company, $data['items']);
            $total = $totals['total_cents'];
            $this->ensure($total > 0, 'items', 'The purchase total must be greater than zero.');
            $paid = Money::cents($data['amount_paid']);
            $mode = $data['payment_mode'];
            $this->ensure(($mode === 'full' && $paid === $total) || ($mode === 'partial' && $paid > 0 && $paid < $total) || ($mode === 'later' && $paid === 0), 'amount_paid', 'The paid amount must match the selected full, partial, or pay-later option.');
            $due = $total - $paid;
            $this->ensure($due === 0 || ! empty($data['due_date']), 'due_date', 'A due date is required when there is an amount due.');
            $pdc = $data['pdc'] ?? null;
            $this->ensure(! $pdc || ($mode === 'later' && Money::cents($pdc['amount']) <= $total), 'pdc', 'A post-dated check is only allowed for pay-later purchases and cannot exceed the amount due.');
            if ($pdc) {
                app(RecordSupplierPayment::class)->account($company, $pdc['account_id'], 'Check');
            }
            $draft = ! empty($data['draft_id']) ? PurchaseDraft::query()->where('company_id', $company->id)->findOrFail($data['draft_id']) : null;
            $sequence = DocumentSequence::query()->firstOrCreate(['company_id' => $company->id, 'document_type' => 'purchase'], ['prefix' => 'PUR', 'next_number' => 1]);
            $number = $sequence->prefix.'-'.str_pad((string) $sequence->next_number, 6, '0', STR_PAD_LEFT);
            $sequence->increment('next_number');
            $purchase = Purchase::query()->create(['company_id' => $company->id, 'supplier_id' => $supplier->id, 'purchase_number' => $number, 'purchase_date' => $data['purchase_date'], 'supplier_invoice_number' => $data['invoice_number'], 'invoice_key' => $invoiceKey, 'payment_status' => $mode, 'due_date' => $due > 0 ? $data['due_date'] : null, 'total_cents' => $total, 'paid_cents' => $paid, 'due_cents' => $due, 'idempotency_key' => $key, 'request_hash' => $hash, 'snapshot' => ['company' => ['name' => $company->name, 'currency' => $company->currency_code], 'supplier' => ['id' => $supplier->id, 'name' => $supplier->name, 'code' => $supplier->code], 'totals' => $totals, 'payment' => ['mode' => $mode, 'method' => $paid > 0 ? $data['payment_method'] : null, 'account_id' => $paid > 0 ? $data['cash_account_id'] : null, 'reference' => $data['reference'] ?? '', 'check_date' => $data['payment_method'] === 'Check' && $paid > 0 ? $data['purchase_date'] : null, 'pdc' => $pdc], 'notes' => $data['notes'] ?? '', 'attachments' => $data['attachments']]]);
            foreach ($totals['lines'] as $i => $line) {
                $savedLine = PurchaseLine::query()->create(['purchase_id' => $purchase->id, 'product_service_id' => $line['product_id'], 'line_number' => $i + 1, 'quantity' => $line['quantity'], 'unit_cost_cents' => $line['unit_cost_cents'], 'gross_cents' => $line['gross_cents'], 'discount_cents' => $line['discount_cents'], 'net_cents' => $line['net_cents'], 'tax_cents' => $line['tax_cents'], 'snapshot' => $line]);
                if ($line['track_inventory']) {
                    InventoryMovement::query()->create(['company_id' => $company->id, 'product_service_id' => $line['product_id'], 'purchase_line_id' => $savedLine->id, 'quantity' => $line['quantity'], 'cost_cents' => $line['net_cents'], 'movement_date' => $data['purchase_date'], 'direction' => 'in']);
                }
            }
            PayableOpenItem::query()->create(['company_id' => $company->id, 'supplier_id' => $supplier->id, 'purchase_id' => $purchase->id, 'due_date' => $due > 0 ? $data['due_date'] : $data['purchase_date'], 'original_cents' => $total, 'outstanding_cents' => $total, 'status' => 'open']);
            if ($paid > 0) {
                app(RecordSupplierPayment::class)->handle($company, $purchase, ['method' => $data['payment_method'] ?? '', 'cash_account_id' => $data['cash_account_id'] ?? '', 'reference' => $data['reference'] ?? '', 'payment_date' => $data['purchase_date'], 'amount' => $data['amount_paid']], $key);
            }
            if ($pdc) {
                PurchasePostdatedCheck::query()->create(['company_id' => $company->id, 'purchase_id' => $purchase->id, 'cash_account_id' => $pdc['account_id'], 'check_number' => $pdc['check_number'], 'check_date' => $pdc['check_date'], 'amount_cents' => Money::cents($pdc['amount']), 'status' => 'pending']);
            }
            AuditLog::query()->create(['company_id' => $company->id, 'correlation_id' => $key, 'event_type' => 'purchase.posted', 'subject_type' => 'purchase', 'subject_id' => $purchase->id, 'metadata' => ['total_cents' => $total, 'paid_cents' => $paid, 'due_cents' => $due], 'occurred_at' => now()]);
            $draft?->delete();

            return [$purchase, false];
        }, 3);
    }

    public function serialize(Purchase $purchase): array
    {
        $snapshot = $purchase->snapshot;
        $snapshot['attachments'] = array_map(fn ($a, $i): array => ['name' => $a['name'], 'mime' => $a['mime'], 'index' => $i], $snapshot['attachments'], array_keys($snapshot['attachments']));
        $outstanding = PayableOpenItem::query()->where('purchase_id', $purchase->id)->value('outstanding_cents') ?? $purchase->due_cents;
        $check = PurchasePostdatedCheck::query()->where('purchase_id', $purchase->id)->first();

        return ['id' => $purchase->id, 'purchase_number' => $purchase->purchase_number, 'purchase_date' => $purchase->purchase_date->toDateString(), 'invoice_number' => $purchase->supplier_invoice_number, 'due_date' => $purchase->due_date?->toDateString(), 'total_cents' => $purchase->total_cents, 'paid_cents' => $purchase->total_cents - (int) $outstanding, 'due_cents' => (int) $outstanding, 'payments' => $purchase->exists ? DB::table('supplier_payments')->where('purchase_id', $purchase->id)->get(['id', 'method', 'reference', 'payment_date', 'amount_cents']) : [], 'postdated_check' => $check ? ['id' => $check->id, 'check_date' => $check->check_date->toDateString(), 'check_number' => $check->check_number, 'amount_cents' => $check->amount_cents, 'status' => $check->status] : null, ...$snapshot];
    }

    private function ensure(bool $condition, string $field, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages([$field => $message]);
        }
    }
}
