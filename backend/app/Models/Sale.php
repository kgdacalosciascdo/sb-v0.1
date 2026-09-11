<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'sale_number', 'sale_date', 'branch_id', 'customer_id', 'salesperson_id', 'payment_term_id', 'due_date', 'currency_code', 'status', 'settlement_intent', 'remarks', 'subtotal_amount', 'discount_total_amount', 'tax_total_amount', 'total_amount', 'amount_received', 'receivable_amount', 'idempotency_key', 'actor_user_id', 'version', 'posted_at'];

    protected function casts(): array
    {
        return ['sale_date' => 'date', 'due_date' => 'date', 'posted_at' => 'immutable_datetime', 'subtotal_amount' => 'decimal:2', 'discount_total_amount' => 'decimal:2', 'tax_total_amount' => 'decimal:2', 'total_amount' => 'decimal:2', 'amount_received' => 'decimal:2', 'receivable_amount' => 'decimal:2'];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(SaleLine::class)->orderBy('line_number');
    }

    public function receivable(): HasOne
    {
        return $this->hasOne(ReceivableOpenItem::class);
    }
}
