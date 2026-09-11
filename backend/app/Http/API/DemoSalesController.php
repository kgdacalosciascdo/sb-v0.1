<?php

namespace App\Http\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDemoSaleRequest;
use App\Models\DemoSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DemoSalesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->attributes->get('company')->id;

        $sales = DemoSale::query()
            ->where('company_id', $companyId)
            ->latest()
            ->limit(200)
            ->get()
            ->map(fn (DemoSale $sale): array => $this->serializeSale($sale))
            ->values();

        return response()->json(['data' => $sales]);
    }

    public function store(StoreDemoSaleRequest $request): JsonResponse
    {
        $idempotencyKey = $request->header('Idempotency-Key');
        if (! is_string($idempotencyKey) || ! Str::isUuid($idempotencyKey)) {
            throw ValidationException::withMessages([
                'idempotency_key' => 'An Idempotency-Key request header containing a UUID is required.',
            ]);
        }

        $companyId = $request->attributes->get('company')->id;
        $existing = DemoSale::query()
            ->where('company_id', $companyId)
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        if ($existing) {
            return response()->json([
                'data' => $this->serializeSale($existing),
                'meta' => ['idempotent_replay' => true],
            ]);
        }

        $formData = $request->validated('form_data');
        $sale = DemoSale::create([
            'company_id' => $companyId,
            'idempotency_key' => $idempotencyKey,
            'sale_number' => $formData['salesNo'],
            'mode' => $formData['mode'],
            'status' => 'completed',
            'receipt_number' => $this->receiptNumber(),
            'transaction_id' => (string) Str::uuid(),
            'form_data' => $formData,
            'customer' => $request->validated('customer'),
            'calculations' => $request->validated('calculations'),
        ]);

        return response()->json([
            'data' => $this->serializeSale($sale),
            'meta' => ['idempotent_replay' => false],
        ], 201);
    }

    private function serializeSale(DemoSale $sale): array
    {
        $calculations = $this->normalizeCalculations($sale);

        return [
            'id' => $sale->id,
            'transactionId' => $sale->transaction_id,
            'receiptNo' => $sale->receipt_number,
            'saleNo' => $sale->sale_number,
            'mode' => $sale->mode,
            'status' => $sale->status,
            'createdAt' => $sale->created_at?->toISOString(),
            'formData' => $sale->form_data,
            'customer' => $sale->customer,
            'calculations' => $calculations,
        ];
    }

    private function normalizeCalculations(DemoSale $sale): array
    {
        $calculations = $sale->calculations ?? [];
        $items = $sale->form_data['items'] ?? [];
        $totalBeforeDiscount = (float) ($calculations['totalBeforeDiscount'] ?? collect($items)->sum(
            fn (array $item): float => (float) ($item['qty'] ?? 0) * (float) ($item['unitPrice'] ?? 0),
        ));
        $lineDiscounts = (float) ($calculations['lineDiscounts'] ?? collect($items)->sum(function (array $item): float {
            $gross = (float) ($item['qty'] ?? 0) * (float) ($item['unitPrice'] ?? 0);

            return $gross * ((float) ($item['discountPercent'] ?? 0) / 100);
        }));
        $subtotal = (float) ($calculations['subtotal'] ?? ($totalBeforeDiscount - $lineDiscounts));
        $vatAmount = (float) ($calculations['vatAmount'] ?? max(0, (float) ($calculations['totalAmount'] ?? 0) - $subtotal));

        return [
            'totalBeforeDiscount' => $totalBeforeDiscount,
            'lineDiscounts' => $lineDiscounts,
            'subtotal' => $subtotal,
            'vatAmount' => $vatAmount,
            'totalAmount' => (float) ($calculations['totalAmount'] ?? ($subtotal + $vatAmount)),
            'amountReceived' => (float) ($calculations['amountReceived'] ?? 0),
            'outstanding' => (float) ($calculations['outstanding'] ?? 0),
            'change' => (float) ($calculations['change'] ?? 0),
        ];
    }

    private function receiptNumber(): string
    {
        return 'RCP-'.now()->format('Ymd').'-'.Str::upper(Str::random(4));
    }
}
