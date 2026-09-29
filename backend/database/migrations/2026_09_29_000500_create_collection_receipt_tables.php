<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_accounts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->string('code', 40);
            $table->string('name');
            $table->json('payment_methods');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['company_id', 'code']);
        });
        Schema::create('collection_drafts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->json('payload');
            $table->timestamps();
            $table->index(['company_id', 'updated_at']);
        });
        Schema::create('collection_receipts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->uuid('idempotency_key');
            $table->string('request_hash', 64);
            $table->string('receipt_number', 64);
            $table->string('customer_key', 160);
            $table->date('receipt_date');
            $table->unsignedBigInteger('amount_cents');
            $table->unsignedBigInteger('applied_cents');
            $table->unsignedBigInteger('unapplied_cents');
            $table->json('snapshot');
            $table->timestamps();
            $table->unique(['company_id', 'idempotency_key']);
            $table->unique(['company_id', 'receipt_number']);
            $table->index(['company_id', 'customer_key']);
        });
        Schema::create('collection_applications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('collection_receipt_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('demo_sale_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('amount_cents');
            $table->timestamps();
            $table->unique(['collection_receipt_id', 'demo_sale_id']);
        });
        Schema::create('cash_account_movements', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('cash_account_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('collection_receipt_id')->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('line_number');
            $table->string('payment_method', 40);
            $table->string('reference_number', 120)->nullable();
            $table->unsignedBigInteger('amount_cents');
            $table->date('movement_date');
            $table->timestamps();
            $table->unique(['collection_receipt_id', 'line_number']);
        });
        // Access is through Laravel, not Supabase's public REST API.
        if (DB::getDriverName() === 'pgsql') {
            foreach (['cash_accounts', 'collection_drafts', 'collection_receipts', 'collection_applications', 'cash_account_movements'] as $table) {
                DB::statement('ALTER TABLE '.$table.' ENABLE ROW LEVEL SECURITY');
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_account_movements');
        Schema::dropIfExists('collection_applications');
        Schema::dropIfExists('collection_receipts');
        Schema::dropIfExists('collection_drafts');
        Schema::dropIfExists('cash_accounts');
    }
};
