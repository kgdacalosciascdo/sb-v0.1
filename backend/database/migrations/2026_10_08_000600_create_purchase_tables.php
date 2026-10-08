<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products_services', function (Blueprint $table): void {
            $table->decimal('default_purchase_cost', 18, 2)->nullable();
        });
        Schema::create('suppliers', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->string('code', 48);
            $table->string('name');
            $table->unsignedSmallInteger('terms_days')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['company_id', 'code']);
        });
        Schema::create('purchase_drafts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->json('payload');
            $table->timestamps();
        });
        Schema::create('purchases', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->restrictOnDelete();
            $table->string('purchase_number', 64);
            $table->date('purchase_date');
            $table->string('supplier_invoice_number', 120);
            $table->string('invoice_key', 120);
            $table->string('payment_status', 24);
            $table->date('due_date')->nullable();
            $table->unsignedBigInteger('total_cents');
            $table->unsignedBigInteger('paid_cents');
            $table->unsignedBigInteger('due_cents');
            $table->uuid('idempotency_key');
            $table->string('request_hash', 64);
            $table->json('snapshot');
            $table->timestamps();
            $table->unique(['company_id', 'purchase_number']);
            $table->unique(['company_id', 'idempotency_key']);
            $table->unique(['company_id', 'supplier_id', 'invoice_key'], 'purchases_supplier_invoice_unique');
        });
        Schema::create('purchase_lines', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('product_service_id')->constrained('products_services')->restrictOnDelete();
            $table->unsignedSmallInteger('line_number');
            $table->decimal('quantity', 18, 4);
            $table->unsignedBigInteger('unit_cost_cents');
            $table->unsignedBigInteger('gross_cents');
            $table->unsignedBigInteger('discount_cents');
            $table->unsignedBigInteger('net_cents');
            $table->unsignedBigInteger('tax_cents');
            $table->json('snapshot');
            $table->timestamps();
            $table->unique(['purchase_id', 'line_number']);
        });
        Schema::create('payable_open_items', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('supplier_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('purchase_id')->unique()->constrained()->restrictOnDelete();
            $table->date('due_date');
            $table->unsignedBigInteger('original_cents');
            $table->unsignedBigInteger('outstanding_cents');
            $table->string('status', 24)->default('open');
            $table->timestamps();
        });
        Schema::create('supplier_payments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('purchase_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('cash_account_id')->constrained()->restrictOnDelete();
            $table->uuid('idempotency_key');
            $table->string('request_hash', 64);
            $table->string('method', 40);
            $table->string('reference', 120)->nullable();
            $table->date('payment_date');
            $table->unsignedBigInteger('amount_cents');
            $table->json('snapshot');
            $table->timestamps();
            $table->unique(['company_id', 'idempotency_key']);
        });
        Schema::create('purchase_cash_movements', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('cash_account_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('supplier_payment_id')->unique()->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('amount_cents');
            $table->date('movement_date');
            $table->string('direction', 8)->default('out');
            $table->timestamps();
        });
        Schema::create('purchase_postdated_checks', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('purchase_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignUuid('cash_account_id')->constrained()->restrictOnDelete();
            $table->string('check_number', 120);
            $table->foreignUuid('supplier_payment_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->date('check_date');
            $table->unsignedBigInteger('amount_cents');
            $table->string('status', 24)->default('pending');
            $table->timestamps();
        });
        Schema::create('inventory_movements', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('product_service_id')->constrained('products_services')->restrictOnDelete();
            $table->foreignUuid('purchase_line_id')->unique()->constrained()->restrictOnDelete();
            $table->decimal('quantity', 18, 4);
            $table->unsignedBigInteger('cost_cents');
            $table->date('movement_date');
            $table->string('direction', 8)->default('in');
            $table->timestamps();
        });
        if (DB::getDriverName() === 'pgsql') {
            foreach (['suppliers', 'purchase_drafts', 'purchases', 'purchase_lines', 'payable_open_items', 'supplier_payments', 'purchase_cash_movements', 'purchase_postdated_checks', 'inventory_movements'] as $table) {
                DB::statement('ALTER TABLE '.$table.' ENABLE ROW LEVEL SECURITY');
            }
        }
    }

    public function down(): void
    {
        foreach (['inventory_movements', 'purchase_postdated_checks', 'purchase_cash_movements', 'supplier_payments', 'payable_open_items', 'purchase_lines', 'purchases', 'purchase_drafts', 'suppliers'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('products_services', fn (Blueprint $table) => $table->dropColumn('default_purchase_cost'));
    }
};
