<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DemoSale extends Model
{
    use HasUuids;

    protected $table = 'demo_sales';

    protected $fillable = [
        'id',
        'company_id',
        'idempotency_key',
        'sale_number',
        'mode',
        'status',
        'receipt_number',
        'transaction_id',
        'form_data',
        'customer',
        'calculations',
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'customer' => 'array',
            'calculations' => 'array',
        ];
    }
}
