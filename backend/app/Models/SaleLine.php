<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SaleLine extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'sale_id', 'line_number', 'product_service_id', 'tax_code_id', 'product_code_snapshot', 'description_snapshot', 'unit_name_snapshot', 'quantity', 'unit_price', 'discount_basis_points', 'gross_amount', 'discount_amount', 'net_amount', 'tax_rate_basis_points', 'tax_amount', 'line_total_amount'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:4', 'unit_price' => 'decimal:2', 'gross_amount' => 'decimal:2', 'discount_amount' => 'decimal:2', 'net_amount' => 'decimal:2', 'tax_amount' => 'decimal:2'];
    }
}
