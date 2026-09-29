<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\CashAccount;
use App\Models\CollectionDraft;
use App\Models\CollectionReceipt;
use App\Models\Company;
use App\Models\Customer;
use App\Models\DemoSale;
use App\Models\DocumentSequence;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReceiveCustomerPayment
{
    public function bootstrap(Company $company): array
    {
        $customers = [];
        $items = [];
        $paid = DB::table('collection_applications as a')
            ->join('collection_receipts as r', 'r.id', '=', 'a.collection_receipt_id')
            ->where('r.company_id', $company->id)
            ->selectRaw('a.demo_sale_id, SUM(a.amount_cents) as paid')->groupBy('a.demo_sale_id')->pluck('paid', 'demo_sale_id');
        // Existing demo sales are the source of truth; never synthesize reference invoices.
        foreach (DemoSale::query()->where('company_id', $company->id)->where('status', 'completed')->orderBy('created_at')->get() as $sale) {
            $customer = $sale->customer;
            if (! is_array($customer) || empty($customer['id'])) {
                continue; // Anonymous cash sales cannot be allocated to an arbitrary customer.
            }
            $key = 'sale:'.$customer['id'];
            $customers[$key] = ['key' => $key, 'name' => $customer['name'] ?? 'Customer', 'code' => $customer['code'] ?? '', 'terms' => $customer['defaultTerms'] ?? '', 'phone' => $customer['phone'] ?? '', 'address' => $customer['address'] ?? ''];
            $original = $this->originalBalance($sale);
            $balance = max(0, $original - (int) ($paid[$sale->id] ?? 0));
            if ($balance > 0) {
                $items[] = ['id' => $sale->id, 'customer_key' => $key, 'document_number' => $sale->sale_number, 'date' => $sale->form_data['salesDate'] ?? $sale->created_at->toDateString(), 'due_date' => $sale->form_data['dueDate'] ?? '', 'total_cents' => Money::cents($sale->calculations['totalAmount'] ?? 0), 'balance_cents' => $balance];
            }
        }
        foreach (Customer::query()->where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get() as $customer) {
            $key = 'master:'.$customer->id;
            $customers[$key] = ['key' => $key, 'name' => $customer->name, 'code' => $customer->code, 'terms' => '', 'phone' => '', 'address' => ''];
        }

        return [
            'company' => ['name' => $company->name, 'currency' => $company->currency_code],
            'customers' => array_values($customers), 'open_items' => $items,
            'accounts' => CashAccount::query()->where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'payment_methods']),
            'payment_methods' => ['Bank Transfer', 'Cash', 'Cheque', 'E-Wallet'],
        ];
    }

    public function originalBalance(DemoSale $sale): int
    {
        $calculations = $sale->calculations;

        return isset($calculations['outstanding']) ? Money::cents($calculations['outstanding']) : max(0, Money::cents($calculations['totalAmount'] ?? 0) - Money::cents($calculations['amountReceived'] ?? 0));
    }

    public function post(Company $company, array $data, string $key): array
    {
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($company, $data, $key, $hash): array {
            // A company lock serializes numbering, first-use sequences, and concurrent allocations.
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $existing = CollectionReceipt::query()->where('company_id', $company->id)->where('idempotency_key', $key)->first();
            if ($existing) {
                abort_unless(hash_equals($existing->request_hash, $hash), 409, 'This submission key was already used for a different payment.');

                return [$existing, true];
            }
            $bootstrap = $this->bootstrap($company);
            $customer = collect($bootstrap['customers'])->firstWhere('key', $data['customer_key']);
            $this->ensure($customer !== null, 'customer_key', 'Select an existing customer belonging to this company.');
            $amount = Money::cents($data['amount']);
            $this->ensure($amount > 0, 'amount', 'Enter an amount greater than zero.');
            $tenders = [];
            $tenderTotal = 0;
            foreach ($data['tenders'] as $i => $tender) {
                $account = CashAccount::query()->where('company_id', $company->id)->where('is_active', true)->whereKey($tender['account_id'])->first();
                $this->ensure($account !== null && in_array($tender['method'], $account->payment_methods, true), "tenders.$i.account_id", 'Choose an active cash account compatible with this payment method.');
                $value = Money::cents($tender['amount']);
                $this->ensure($value > 0, "tenders.$i.amount", 'Every payment method must have a positive amount.');
                $this->ensure($tender['method'] === 'Cash' || trim($tender['reference'] ?? '') !== '', "tenders.$i.reference", 'Enter a reference number for non-cash payments.');
                $tenderTotal += $value;
                $tenders[] = ['method' => $tender['method'], 'account_id' => $account->id, 'account_name' => $account->name, 'reference' => $tender['reference'] ?? '', 'amount_cents' => $value];
            }
            $this->ensure($tenderTotal === $amount, 'tenders', 'Payment method amounts must equal the amount received.');
            $applications = [];
            $applied = 0;
            foreach ($data['applications'] as $i => $application) {
                $value = Money::cents($application['amount']);
                $item = collect($bootstrap['open_items'])->firstWhere('id', $application['sale_id']);
                $this->ensure($item !== null && $item['customer_key'] === $data['customer_key'], "applications.$i", 'The selected invoice is not an open balance for this customer. Refresh balances and try again.');
                $this->ensure($value > 0 && $value <= $item['balance_cents'], "applications.$i.amount", 'An allocation must be positive and cannot exceed the current invoice balance. Refresh balances and try again.');
                $applied += $value;
                $applications[] = [...$item, 'amount_cents' => $value, 'remaining_cents' => $item['balance_cents'] - $value];
            }
            $this->ensure($applied <= $amount, 'applications', 'Applied amounts cannot exceed the amount received.');
            $draft = null;
            if (! empty($data['draft_id'])) {
                $draft = CollectionDraft::query()->where('company_id', $company->id)->whereKey($data['draft_id'])->lockForUpdate()->firstOrFail();
            }
            $sequence = DocumentSequence::query()->firstOrCreate(['company_id' => $company->id, 'document_type' => 'collection_receipt'], ['prefix' => 'PR', 'next_number' => 1]);
            $number = $sequence->prefix.'-'.str_pad((string) $sequence->next_number, 6, '0', STR_PAD_LEFT);
            $sequence->increment('next_number');
            $receipt = CollectionReceipt::query()->create([
                'company_id' => $company->id, 'idempotency_key' => $key, 'request_hash' => $hash, 'receipt_number' => $number,
                'customer_key' => $data['customer_key'], 'receipt_date' => $data['receipt_date'],
                'amount_cents' => $amount, 'applied_cents' => $applied, 'unapplied_cents' => $amount - $applied,
                'snapshot' => ['company' => $bootstrap['company'], 'customer' => $customer, 'tenders' => $tenders, 'applications' => $applications, 'remarks' => $data['remarks'] ?? '', 'attachments' => $data['attachments']],
            ]);
            foreach ($applications as $application) {
                DB::table('collection_applications')->insert(['id' => (string) Str::uuid(), 'collection_receipt_id' => $receipt->id, 'demo_sale_id' => $application['id'], 'amount_cents' => $application['amount_cents'], 'created_at' => now(), 'updated_at' => now()]);
            }
            foreach ($tenders as $i => $tender) {
                DB::table('cash_account_movements')->insert(['id' => (string) Str::uuid(), 'company_id' => $company->id, 'cash_account_id' => $tender['account_id'], 'collection_receipt_id' => $receipt->id, 'line_number' => $i + 1, 'payment_method' => $tender['method'], 'reference_number' => $tender['reference'], 'amount_cents' => $tender['amount_cents'], 'movement_date' => $data['receipt_date'], 'created_at' => now(), 'updated_at' => now()]);
            }
            AuditLog::query()->create(['company_id' => $company->id, 'correlation_id' => $key, 'event_type' => 'collection.receipt.posted', 'subject_type' => 'collection_receipt', 'subject_id' => $receipt->id, 'metadata' => ['amount_cents' => $amount, 'applied_cents' => $applied, 'mode' => 'demo'], 'occurred_at' => now()]);
            $draft?->delete();

            return [$receipt, false];
        }, 3);
    }

    public function serialize(CollectionReceipt $receipt): array
    {
        $snapshot = $receipt->snapshot;
        $snapshot['attachments'] = array_map(fn (array $a, int $i): array => ['index' => $i, 'name' => $a['name'], 'mime' => $a['mime']], $snapshot['attachments'], array_keys($snapshot['attachments']));

        return ['id' => $receipt->id, 'receipt_number' => $receipt->receipt_number, 'receipt_date' => $receipt->receipt_date->toDateString(), 'amount_cents' => $receipt->amount_cents, 'applied_cents' => $receipt->applied_cents, 'unapplied_cents' => $receipt->unapplied_cents, 'created_at' => $receipt->created_at->toISOString(), ...$snapshot];
    }

    private function ensure(bool $condition, string $field, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages([$field => $message]);
        }
    }
}
