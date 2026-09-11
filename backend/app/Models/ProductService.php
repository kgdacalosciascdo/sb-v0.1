<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductService extends Model
{
    use HasUuids;

    protected $table = 'products_services';

    protected $fillable = ['id', 'company_id', 'code', 'name', 'type', 'unit_name', 'default_unit_price', 'default_tax_code_id', 'track_inventory', 'is_active'];

    protected function casts(): array
    {
        return ['default_unit_price' => 'decimal:2', 'track_inventory' => 'boolean', 'is_active' => 'boolean'];
    }
}
