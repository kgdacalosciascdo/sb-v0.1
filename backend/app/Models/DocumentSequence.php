<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DocumentSequence extends Model
{
    use HasUuids;

    protected $fillable = ['id', 'company_id', 'document_type', 'prefix', 'next_number'];
}
