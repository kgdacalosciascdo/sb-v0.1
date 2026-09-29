<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CollectionReceipt extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'receipt_date' => 'immutable_date', 'amount_cents' => 'integer', 'applied_cents' => 'integer', 'unapplied_cents' => 'integer'];
    }
}
