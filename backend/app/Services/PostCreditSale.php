<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Customer;
use App\Models\DocumentSequence;
use App\Models\PaymentTerm;
use App\Models\ProductService;
use App\Models\ReceivableOpenItem;
use App\Models\Sale;
use App\Models\SaleLine;
use App\Models\Salesperson;
use App\Models\TaxCode;
use App\Support\Money;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostCreditSale
{
    /** @return array{sale: Sale, replayed: bool} */
    public function handle(array $input, Company $company, string $actorUserId, string $idempotencyKey): array
    {
        if ($sale = $this->existing($company->id, $idempotencyKey)) {
            return ['sale' => $sale, 'replayed' => true];
        }

        try {
            return DB::transaction(function () use ($input, $company, $actorUserId, $idempotencyKey): array {
                // One company lock makes sequence allocation and credit-limit checking safe under concurrent posts.
                $company = Company::query()->lockForUpdate()->findOrFail($company->id);
                if ($sale = $this->existing($company->id, $idempotencyKey)) {
                    return ['sale' => $sale, 'replayed' => true];
                }

                $customer = Customer::query()->where('company_id', $company->id)->whereKey($input['customer_id'])->where('is_active', true)->lockForUpdate()->first();
                if (! $customer || $customer->credit_status !== 'eligible') {
                    throw ValidationException::withMessages(['customer_id' => 'The selected customer is not eligible for a credit sale.']);
                }

                $branch = Branch::query()->where('company_id', $company->id)->whereKey($input['branch_id'])->where('is_active', true)->first();
                $term = PaymentTerm::query()->where('company_id', $company->id)->whereKey($input['payment_term_id'])->where('is_active', true)->first();
                if (! $branch || ! $term) {
                    throw ValidationException::withMessages(['selection' => 'The selected branch or payment term is unavailable.']);
                }
                if (! empty($input['salesperson_id']) && ! Salesperson::query()->where('company_id', $company->id)->whereKey($input['salesperson_id'])->where('is_active', true)->exists()) {
                    throw ValidationException::withMessages(['salesperson_id' => 'The selected salesperson is unavailable.']);
                }

                $productIds = collect($input['lines'])->pluck('product_service_id')->all();
                $products = ProductService::query()->where('company_id', $company->id)->where('is_active', true)->whereIn('id', $productIds)->get()->keyBy('id');
                if ($products->count() !== count($productIds)) {
                    throw ValidationException::withMessages(['lines' => 'One or more products or services are unavailable.']);
                }

                $taxIds = array_unique([...collect($input['lines'])->pluck('tax_code_id')->filter()->all(), ...$products->pluck('default_tax_code_id')->filter()->all()]);
                $taxCodes = TaxCode::query()->where('company_id', $company->id)->where('is_active', true)->whereIn('id', $taxIds)->get()->keyBy('id');
                $subtotal = $discountTotal = $taxTotal = 0;
                $calculatedLines = [];

                foreach ($input['lines'] as $index => $line) {
                    $product = $products->get($line['product_service_id']);
                    $unitPrice = Money::cents($product->default_unit_price);
                    if (array_key_exists('unit_price', $line) && $line['unit_price'] !== null && Money::cents($line['unit_price']) !== $unitPrice) {
                        throw ValidationException::withMessages(["lines.$index.unit_price" => 'Price overrides are not enabled for credit sales.']);
                    }
                    $taxCodeId = $line['tax_code_id'] ?? $product->default_tax_code_id;
                    $taxCode = $taxCodeId ? $taxCodes->get($taxCodeId) : null;
                    if ($taxCodeId && ! $taxCode) {
                        throw ValidationException::withMessages(["lines.$index.tax_code_id" => 'The selected tax code is unavailable.']);
                    }
                    $quantity = Money::quantity($line['quantity']);
                    $discountBasisPoints = Money::basisPoints($line['discount_percent'] ?? 0);
                    $gross = Money::divideAndRound($quantity * $unitPrice, 10_000);
                    $discount = Money::divideAndRound($gross * $discountBasisPoints, 10_000);
                    $net = $gross - $discount;
                    $taxRate = $taxCode?->rate_basis_points ?? 0;
                    $tax = Money::divideAndRound($net * $taxRate, 10_000);
                    $subtotal += $gross;
                    $discountTotal += $discount;
                    $taxTotal += $tax;
                    $calculatedLines[] = compact('product', 'taxCodeId', 'quantity', 'unitPrice', 'discountBasisPoints', 'gross', 'discount', 'net', 'taxRate', 'tax');
                }

                $total = $subtotal - $discountTotal + $taxTotal;
                $openBalance = ReceivableOpenItem::query()->where('company_id', $company->id)->where('customer_id', $customer->id)->whereIn('settlement_status', ['open', 'partial'])->lockForUpdate()->get()->sum(fn (ReceivableOpenItem $item): int => Money::cents($item->balance_amount));
                if ($customer->credit_limit_amount !== null && $openBalance + $total > Money::cents($customer->credit_limit_amount)) {
                    throw ValidationException::withMessages(['customer_id' => 'This sale exceeds the customer credit limit.']);
                }

                $dueDate = CarbonImmutable::parse($input['sale_date'])->addDays($term->net_days)->toDateString();
                $sale = Sale::create([
                    'company_id' => $company->id, 'sale_number' => $this->nextNumber($company->id), 'sale_date' => $input['sale_date'], 'branch_id' => $branch->id, 'customer_id' => $customer->id, 'salesperson_id' => $input['salesperson_id'] ?? null, 'payment_term_id' => $term->id, 'due_date' => $dueDate, 'currency_code' => $company->currency_code, 'status' => 'posted', 'settlement_intent' => 'credit', 'remarks' => $input['remarks'] ?? null,
                    'subtotal_amount' => Money::decimal($subtotal), 'discount_total_amount' => Money::decimal($discountTotal), 'tax_total_amount' => Money::decimal($taxTotal), 'total_amount' => Money::decimal($total), 'amount_received' => '0.00', 'receivable_amount' => Money::decimal($total), 'idempotency_key' => $idempotencyKey, 'actor_user_id' => $actorUserId, 'posted_at' => now(),
                ]);

                foreach ($calculatedLines as $index => $line) {
                    SaleLine::create([
                        'sale_id' => $sale->id, 'line_number' => $index + 1, 'product_service_id' => $line['product']->id, 'tax_code_id' => $line['taxCodeId'], 'product_code_snapshot' => $line['product']->code, 'description_snapshot' => $line['product']->name, 'unit_name_snapshot' => $line['product']->unit_name, 'quantity' => number_format($line['quantity'] / 10_000, 4, '.', ''), 'unit_price' => Money::decimal($line['unitPrice']), 'discount_basis_points' => $line['discountBasisPoints'], 'gross_amount' => Money::decimal($line['gross']), 'discount_amount' => Money::decimal($line['discount']), 'net_amount' => Money::decimal($line['net']), 'tax_rate_basis_points' => $line['taxRate'], 'tax_amount' => Money::decimal($line['tax']), 'line_total_amount' => Money::decimal($line['net'] + $line['tax']),
                    ]);
                }

                ReceivableOpenItem::create([
                    'company_id' => $company->id, 'sale_id' => $sale->id, 'customer_id' => $customer->id, 'currency_code' => $company->currency_code, 'original_amount' => Money::decimal($total), 'balance_amount' => Money::decimal($total), 'due_date' => $dueDate, 'due_status' => $this->dueStatus($dueDate), 'settlement_status' => 'open', 'posted_at' => now(),
                ]);
                AuditLog::create([
                    'company_id' => $company->id, 'actor_user_id' => $actorUserId, 'subject_id' => $sale->id, 'event_type' => 'sales.credit_sale_posted.v1', 'subject_type' => Sale::class, 'correlation_id' => $idempotencyKey, 'metadata' => ['sale_number' => $sale->sale_number, 'total_amount' => Money::decimal($total), 'line_count' => count($calculatedLines)], 'occurred_at' => now(),
                ]);

                return ['sale' => $sale->load(['lines', 'receivable']), 'replayed' => false];
            }, 3);
        } catch (QueryException $exception) {
            if ($sale = $this->existing($company->id, $idempotencyKey)) {
                return ['sale' => $sale, 'replayed' => true];
            }
            throw $exception;
        }
    }

    private function existing(string $companyId, string $idempotencyKey): ?Sale
    {
        return Sale::query()->where('company_id', $companyId)->where('idempotency_key', $idempotencyKey)->with(['lines', 'receivable'])->first();
    }

    private function nextNumber(string $companyId): string
    {
        $sequence = DocumentSequence::query()->where('company_id', $companyId)->where('document_type', 'credit_sale')->lockForUpdate()->first();
        if (! $sequence) {
            $sequence = DocumentSequence::create(['company_id' => $companyId, 'document_type' => 'credit_sale', 'prefix' => 'SAL', 'next_number' => 1]);
        }
        $number = $sequence->next_number;
        $sequence->increment('next_number');

        return $sequence->prefix.'-'.str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }

    private function dueStatus(string $dueDate): string
    {
        $due = CarbonImmutable::parse($dueDate)->startOfDay();
        $today = now()->startOfDay();

        return $due->isBefore($today) ? 'overdue' : ($due->isSameDay($today) ? 'due_today' : 'not_due');
    }
}
