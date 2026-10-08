<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $draft = $this->routeIs('purchases.drafts.store');
        $money = ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'];

        return [
            'draft_id' => ['nullable', 'uuid'],
            'supplier_id' => [$draft ? 'nullable' : 'required', 'uuid'],
            'purchase_date' => ['required', 'date_format:Y-m-d'],
            'invoice_number' => [$draft ? 'nullable' : 'required', 'string', 'max:120', 'regex:/\S/u'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['present', 'array', 'max:100', $draft ? 'min:0' : 'min:1'],
            'items.*' => ['array:product_id,quantity,unit_cost,discount_percent,tax_id'],
            'items.*.product_id' => ['required', 'uuid'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0', 'max:10000', 'decimal:0,4'],
            'items.*.unit_cost' => $money,
            'items.*.discount_percent' => ['required', 'numeric', 'min:0', 'max:100', 'decimal:0,2'],
            'items.*.tax_id' => ['nullable', 'uuid'],
            'payment_mode' => ['required', Rule::in(['full', 'partial', 'later'])],
            'payment_method' => ['nullable', Rule::in(['Cash', 'Bank Transfer', 'Check', 'E-Wallet', 'Credit Card'])],
            'cash_account_id' => ['nullable', 'uuid'],
            'amount_paid' => $money,
            'due_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:purchase_date'],
            'reference' => ['nullable', 'string', 'max:120'],
            'pdc' => ['nullable', 'array:account_id,check_number,check_date,amount'],
            'pdc.account_id' => ['required_with:pdc', 'uuid'],
            'pdc.check_number' => ['required_with:pdc', 'string', 'max:120', 'regex:/\S/u'],
            'pdc.check_date' => ['required_with:pdc', 'date_format:Y-m-d', 'after:purchase_date'],
            'pdc.amount' => ['required_with:pdc', 'numeric', 'gt:0', 'max:99999999.99', 'decimal:0,2'],
            'attachments' => ['present', 'array', 'max:1'],
            'attachments.*' => ['array:name,mime,content'],
            'attachments.*.name' => ['required', 'string', 'max:160', 'regex:/^[^\\\\\/\x00-\x1f]+$/u'],
            'attachments.*.mime' => ['required', Rule::in(['image/png', 'image/jpeg', 'application/pdf'])],
            'attachments.*.content' => ['required', 'string', 'max:13981016'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            foreach ($this->input('attachments', []) as $i => $file) {
                $bytes = base64_decode($file['content'], true);
                if ($bytes === false || strlen($bytes) === 0 || strlen($bytes) > 10 * 1024 * 1024 || (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes) !== $file['mime']) {
                    $validator->errors()->add("attachments.$i", 'Attach a valid PNG, JPG, or PDF no larger than 10 MB.');
                }
            }
        });
    }
}
