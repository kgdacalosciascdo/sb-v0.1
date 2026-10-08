<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PayableOpenItem extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['due_date' => 'immutable_date', 'original_cents' => 'integer', 'outstanding_cents' => 'integer'];
    }
}
