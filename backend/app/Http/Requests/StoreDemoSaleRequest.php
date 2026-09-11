<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDemoSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'form_data' => ['required', 'array'],
            'form_data.mode' => ['required', 'in:cash,credit'],
            'form_data.salesNo' => ['required', 'string', 'max:64'],
            'form_data.salesDate' => ['required', 'string', 'max:32'],
            'form_data.salesperson' => ['nullable', 'string', 'max:255'],
            'form_data.branch' => ['nullable', 'string', 'max:255'],
            'form_data.customerId' => ['nullable', 'string', 'max:128'],
            'form_data.remarks' => ['nullable', 'string', 'max:2000'],
            'form_data.attachments' => ['nullable', 'array'],
            'form_data.items' => ['required', 'array', 'min:1', 'max:100'],
            'form_data.paymentTerms' => ['nullable', 'string', 'max:100'],
            'form_data.dueDate' => ['nullable', 'string', 'max:32'],
            'form_data.receivePaymentNow' => ['nullable', 'boolean'],
            'form_data.paymentMethod' => ['nullable', 'string', 'max:100'],
            'form_data.receivedInAccount' => ['nullable', 'string', 'max:255'],
            'form_data.amountReceived' => ['nullable', 'numeric', 'min:0'],
            'form_data.items.*' => ['required', 'array'],
            'form_data.items.*.id' => ['required', 'string', 'max:128'],
            'form_data.items.*.code' => ['required', 'string', 'max:128'],
            'form_data.items.*.name' => ['required', 'string', 'max:255'],
            'form_data.items.*.qty' => ['required', 'numeric', 'gt:0'],
            'form_data.items.*.unit' => ['required', 'string', 'max:40'],
            'form_data.items.*.unitPrice' => ['required', 'numeric', 'min:0'],
            'form_data.items.*.discountPercent' => ['nullable', 'numeric', 'between:0,100'],
            'form_data.items.*.taxType' => ['required', 'string', 'max:32'],
            'form_data.items.*.amount' => ['required', 'numeric', 'min:0'],
            'customer' => ['nullable', 'array'],
            'calculations' => ['required', 'array'],
            'calculations.totalBeforeDiscount' => ['required', 'numeric', 'min:0'],
            'calculations.lineDiscounts' => ['required', 'numeric', 'min:0'],
            'calculations.subtotal' => ['required', 'numeric', 'min:0'],
            'calculations.vatAmount' => ['required', 'numeric', 'min:0'],
            'calculations.totalAmount' => ['required', 'numeric', 'min:0'],
            'calculations.amountReceived' => ['required', 'numeric', 'min:0'],
            'calculations.outstanding' => ['required', 'numeric', 'min:0'],
            'calculations.change' => ['required', 'numeric', 'min:0'],
        ];
    }
}
