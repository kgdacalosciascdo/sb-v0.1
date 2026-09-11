<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCreditSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'uuid'], 'branch_id' => ['required', 'uuid'], 'salesperson_id' => ['nullable', 'uuid'], 'payment_term_id' => ['required', 'uuid'], 'sale_date' => ['required', 'date_format:Y-m-d'], 'remarks' => ['nullable', 'string', 'max:2000'],
            'lines' => ['required', 'array', 'min:1', 'max:100'], 'lines.*.product_service_id' => ['required', 'uuid', 'distinct'], 'lines.*.quantity' => ['required', 'numeric', 'gt:0', 'decimal:0,4'], 'lines.*.unit_price' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'], 'lines.*.tax_code_id' => ['nullable', 'uuid'], 'lines.*.discount_percent' => ['nullable', 'numeric', 'between:0,100', 'decimal:0,2'], 'lines.*.discount_reason' => ['nullable', 'string', 'max:255'],
            'amount_received' => ['nullable', 'numeric', 'in:0,0.0,0.00'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('lines', []) as $index => $line) {
                if ((float) ($line['discount_percent'] ?? 0) > 0 && blank($line['discount_reason'] ?? null)) {
                    $validator->errors()->add("lines.$index.discount_reason", 'A reason is required when a discount is applied.');
                }
            }
        }];
    }
}
