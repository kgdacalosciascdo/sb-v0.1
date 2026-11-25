<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
    public function lines(): HasMany
    {
        return $this->hasMany(PurchaseLine::class);
    }

    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'purchase_date' => 'immutable_date', 'due_date' => 'immutable_date', 'total_cents' => 'integer', 'paid_cents' => 'integer', 'due_cents' => 'integer'];
    }
}
