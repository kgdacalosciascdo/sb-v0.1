<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TaxCode extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'code', 'name', 'rate_basis_points', 'is_active'];

    protected function casts(): array
    {
        return ['rate_basis_points' => 'integer', 'is_active' => 'boolean'];
    }
}
