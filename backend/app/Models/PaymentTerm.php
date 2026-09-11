<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PaymentTerm extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'code', 'name', 'net_days', 'is_active'];

    protected function casts(): array
    {
        return ['net_days' => 'integer', 'is_active' => 'boolean'];
    }
}
