<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CompanyMembership extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'user_id', 'role', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
