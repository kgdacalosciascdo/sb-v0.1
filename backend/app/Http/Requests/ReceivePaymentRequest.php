<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReceivePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Tenant is resolved by demo.sales; no new login flow.
    }

    public function rules(): array
    {
        $money = ['required', 'numeric', 'min:0', 'max:999999999.99', 'decimal:0,2'];

        return [
            'draft_id' => ['nullable', 'uuid'],
            'customer_key' => ['required', 'string', 'max:160'],
            'receipt_date' => ['required', 'date_format:Y-m-d'],
            'amount' => $money,
            'remarks' => ['nullable', 'string', 'max:2000'],
            'tenders' => ['required', 'array', 'min:1', 'max:10'],
            'tenders.*' => ['array:method,account_id,reference,amount'],
            'tenders.*.method' => ['required', Rule::in(['Cash', 'Bank Transfer', 'Cheque', 'E-Wallet'])],
            'tenders.*.account_id' => ['required', 'uuid'],
            'tenders.*.reference' => ['nullable', 'string', 'max:120'],
            'tenders.*.amount' => $money,
            'applications' => ['present', 'array', 'max:200'],
            'applications.*' => ['array:sale_id,amount'],
            'applications.*.sale_id' => ['required', 'uuid', 'distinct'],
            'applications.*.amount' => $money,
            'attachments' => ['present', 'array', 'max:3'],
            'attachments.*' => ['array:name,mime,content'],
            'attachments.*.name' => ['required', 'string', 'max:160', 'regex:/^[^\\\\\/\x00-\x1f]+$/u'],
            'attachments.*.mime' => ['required', Rule::in(['image/png', 'image/jpeg', 'application/pdf'])],
            'attachments.*.content' => ['required', 'string', 'max:2796204'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $total = 0;
            foreach ($this->input('attachments', []) as $i => $attachment) {
                $bytes = base64_decode($attachment['content'], true);
                $size = $bytes === false ? 0 : strlen($bytes);
                $total += $size;
                if ($size === 0 || $size > 2 * 1024 * 1024 || (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes) !== $attachment['mime']) {
                    $validator->errors()->add("attachments.$i", 'Proof must be a valid PNG, JPG, or PDF, no larger than 2 MB.');
                }
            }
            if ($total > 3 * 1024 * 1024) {
                $validator->errors()->add('attachments', 'Attachments must total no more than 3 MB.');
            }
        });
    }
}
