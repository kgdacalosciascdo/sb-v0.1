<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ReceivableOpenItem extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'sale_id', 'customer_id', 'currency_code', 'original_amount', 'balance_amount', 'due_date', 'due_status', 'settlement_status', 'posted_at'];

    protected function casts(): array
    {
        return ['original_amount' => 'decimal:2', 'balance_amount' => 'decimal:2', 'due_date' => 'date', 'posted_at' => 'immutable_datetime'];
    }
}
