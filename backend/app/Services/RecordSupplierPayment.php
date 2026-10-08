<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\CashAccount;
use App\Models\Company;
use App\Models\PayableOpenItem;
use App\Models\Purchase;
use App\Models\SupplierPayment;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RecordSupplierPayment
{
    public function handle(Company $company, Purchase $purchase, array $data, string $key): array
    {
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($company, $purchase, $data, $key, $hash): array {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $existing = SupplierPayment::query()->where('company_id', $company->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_unless($existing->purchase_id === $purchase->id && hash_equals($existing->request_hash, $hash), 409, 'This submission key was already used for another payment.');

                return [$existing, true];
            }
            $payable = PayableOpenItem::query()->where('company_id', $company->id)->where('purchase_id', $purchase->id)->lockForUpdate()->firstOrFail();
            $account = $this->account($company, $data['cash_account_id'] ?? '', $data['method'] ?? '');
            $amount = Money::cents($data['amount']);
            $this->ensure($amount > 0 && $amount <= $payable->outstanding_cents, 'amount', 'Payment must be positive and cannot exceed the current supplier balance.');
            $this->ensure($data['payment_date'] >= $purchase->purchase_date->toDateString(), 'payment_date', 'Payment date cannot precede the purchase date.');
            $this->ensure($data['method'] === 'Cash' || trim($data['reference'] ?? '') !== '', 'reference', 'A reference or check number is required for this payment method.');
            $payment = SupplierPayment::query()->create(['company_id' => $company->id, 'purchase_id' => $purchase->id, 'cash_account_id' => $account->id, 'method' => $data['method'], 'reference' => $data['reference'] ?? '', 'payment_date' => $data['payment_date'], 'amount_cents' => $amount, 'idempotency_key' => $key, 'request_hash' => $hash, 'snapshot' => ['account_name' => $account->name, 'supplier_id' => $purchase->supplier_id, 'purchase_number' => $purchase->purchase_number]]);
            DB::table('purchase_cash_movements')->insert(['id' => (string) Str::uuid(), 'company_id' => $company->id, 'cash_account_id' => $account->id, 'supplier_payment_id' => $payment->id, 'amount_cents' => $amount, 'direction' => 'out', 'movement_date' => $data['payment_date'], 'created_at' => now(), 'updated_at' => now()]);
            $payable->outstanding_cents -= $amount;
            $payable->status = $payable->outstanding_cents === 0 ? 'settled' : 'partial';
            $payable->save();
            $purchase->update(['paid_cents' => $purchase->total_cents - $payable->outstanding_cents, 'due_cents' => $payable->outstanding_cents]);
            AuditLog::query()->create(['company_id' => $company->id, 'correlation_id' => $key, 'event_type' => 'supplier.payment.posted', 'subject_type' => 'supplier_payment', 'subject_id' => $payment->id, 'metadata' => ['purchase_id' => $purchase->id, 'amount_cents' => $amount], 'occurred_at' => now()]);

            return [$payment, false];
        }, 3);
    }

    public function account(Company $company, string $id, string $method): CashAccount
    {
        $account = CashAccount::query()->where('company_id', $company->id)->where('is_active', true)->whereKey($id)->first();
        $compatible = $method === 'Check' ? 'Cheque' : $method;
        $this->ensure($account !== null && in_array($compatible, $account->payment_methods, true), 'cash_account_id', 'Choose an active account compatible with this payment method.');

        return $account;
    }

    private function ensure(bool $condition, string $field, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages([$field => $message]);
        }
    }
}
