<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PurchasePostdatedCheck extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['check_date' => 'immutable_date', 'amount_cents' => 'integer'];
    }
}
