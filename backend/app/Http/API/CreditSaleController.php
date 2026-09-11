<?php

namespace App\Http\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCreditSaleRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\PaymentTerm;
use App\Models\ProductService;
use App\Models\Sale;
use App\Models\Salesperson;
use App\Models\TaxCode;
use App\Services\PostCreditSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreditSaleController extends Controller
{
    public function bootstrap(Request $request): JsonResponse
    {
        $companyId = $request->attributes->get('company')->id;

        return response()->json([
            'data' => [
                'customers' => Customer::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'credit_status', 'credit_limit_amount', 'default_payment_term_id']),
                'branches' => Branch::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name']),
                'salespersons' => Salesperson::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name']),
                'payment_terms' => PaymentTerm::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('net_days')->get(['id', 'code', 'name', 'net_days']),
                'tax_codes' => TaxCode::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'rate_basis_points']),
                'products_services' => ProductService::query()->where('company_id', $companyId)->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type', 'unit_name', 'default_unit_price', 'default_tax_code_id', 'track_inventory']),
            ],
        ]);
    }

    public function store(StoreCreditSaleRequest $request, PostCreditSale $postCreditSale): JsonResponse
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        if (! is_string($idempotencyKey) || ! Str::isUuid($idempotencyKey)) {
            throw ValidationException::withMessages([
                'idempotency_key' => 'An Idempotency-Key request header containing a UUID is required.',
            ]);
        }

        $result = $postCreditSale->handle(
            $request->validated(),
            $request->attributes->get('company'),
            $request->attributes->get('supabase_user')['id'],
            $idempotencyKey,
        );

        return response()->json([
            'data' => $this->serializeSale($result['sale']),
            'meta' => ['idempotent_replay' => $result['replayed']],
        ], $result['replayed'] ? 200 : 201);
    }

    public function show(Request $request, string $sale): JsonResponse
    {
        $record = Sale::query()
            ->where('company_id', $request->attributes->get('company')->id)
            ->whereKey($sale)
            ->with(['lines', 'receivable'])
            ->firstOrFail();

        return response()->json(['data' => $this->serializeSale($record)]);
    }

    private function serializeSale(Sale $sale): array
    {
        return [
            'id' => $sale->id,
            'sale_number' => $sale->sale_number,
            'sale_date' => $sale->sale_date->toDateString(),
            'status' => $sale->status,
            'settlement_intent' => $sale->settlement_intent,
            'customer_id' => $sale->customer_id,
            'branch_id' => $sale->branch_id,
            'salesperson_id' => $sale->salesperson_id,
            'payment_term_id' => $sale->payment_term_id,
            'due_date' => $sale->due_date->toDateString(),
            'currency_code' => $sale->currency_code,
            'remarks' => $sale->remarks,
            'totals' => [
                'subtotal_amount' => $sale->subtotal_amount,
                'discount_total_amount' => $sale->discount_total_amount,
                'tax_total_amount' => $sale->tax_total_amount,
                'total_amount' => $sale->total_amount,
                'receivable_amount' => $sale->receivable_amount,
            ],
            'receivable' => $sale->receivable ? [
                'id' => $sale->receivable->id,
                'original_amount' => $sale->receivable->original_amount,
                'balance_amount' => $sale->receivable->balance_amount,
                'due_date' => $sale->receivable->due_date->toDateString(),
                'due_status' => $sale->receivable->due_status,
                'settlement_status' => $sale->receivable->settlement_status,
            ] : null,
            'lines' => $sale->lines->map(fn ($line) => [
                'id' => $line->id,
                'line_number' => $line->line_number,
                'product_service_id' => $line->product_service_id,
                'tax_code_id' => $line->tax_code_id,
                'product_code' => $line->product_code_snapshot,
                'description' => $line->description_snapshot,
                'unit_name' => $line->unit_name_snapshot,
                'quantity' => $line->quantity,
                'unit_price' => $line->unit_price,
                'discount_basis_points' => $line->discount_basis_points,
                'gross_amount' => $line->gross_amount,
                'discount_amount' => $line->discount_amount,
                'net_amount' => $line->net_amount,
                'tax_rate_basis_points' => $line->tax_rate_basis_points,
                'tax_amount' => $line->tax_amount,
                'line_total_amount' => $line->line_total_amount,
            ])->values(),
        ];
    }
}
