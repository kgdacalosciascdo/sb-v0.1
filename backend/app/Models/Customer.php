<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'code', 'name', 'credit_status', 'credit_limit_amount', 'default_payment_term_id', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'credit_limit_amount' => 'decimal:2'];
    }
}
