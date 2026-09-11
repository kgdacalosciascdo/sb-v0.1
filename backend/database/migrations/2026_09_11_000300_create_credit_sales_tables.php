<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('sale_number', 64);
            $table->date('sale_date');
            $table->uuid('branch_id');
            $table->uuid('customer_id');
            $table->uuid('salesperson_id')->nullable();
            $table->uuid('payment_term_id');
            $table->date('due_date');
            $table->char('currency_code', 3);
            $table->string('status', 24)->default('posted');
            $table->string('settlement_intent', 24)->default('credit');
            $table->text('remarks')->nullable();
            $table->decimal('subtotal_amount', 18, 2);
            $table->decimal('discount_total_amount', 18, 2)->default(0);
            $table->decimal('tax_total_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2);
            $table->decimal('amount_received', 18, 2)->default(0);
            $table->decimal('receivable_amount', 18, 2);
            $table->uuid('idempotency_key');
            $table->uuid('actor_user_id');
            $table->unsignedInteger('version')->default(1);
            $table->timestampTz('posted_at');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->restrictOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->restrictOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->restrictOnDelete();
            $table->foreign('salesperson_id')->references('id')->on('salespersons')->nullOnDelete();
            $table->foreign('payment_term_id')->references('id')->on('payment_terms')->restrictOnDelete();
            $table->unique(['company_id', 'sale_number']);
            $table->unique(['company_id', 'idempotency_key']);
            $table->index(['company_id', 'customer_id', 'sale_date']);
        });

        Schema::create('sale_lines', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('sale_id');
            $table->unsignedSmallInteger('line_number');
            $table->uuid('product_service_id');
            $table->uuid('tax_code_id')->nullable();
            $table->string('product_code_snapshot', 64);
            $table->string('description_snapshot');
            $table->string('unit_name_snapshot', 40);
            $table->decimal('quantity', 18, 4);
            $table->decimal('unit_price', 18, 2);
            $table->unsignedInteger('discount_basis_points')->default(0);
            $table->decimal('gross_amount', 18, 2);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('net_amount', 18, 2);
            $table->unsignedInteger('tax_rate_basis_points')->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('line_total_amount', 18, 2);
            $table->timestamps();

            $table->foreign('sale_id')->references('id')->on('sales')->cascadeOnDelete();
            $table->foreign('product_service_id')->references('id')->on('products_services')->restrictOnDelete();
            $table->foreign('tax_code_id')->references('id')->on('tax_codes')->nullOnDelete();
            $table->unique(['sale_id', 'line_number']);
        });

        Schema::create('receivable_open_items', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->uuid('sale_id')->unique();
            $table->uuid('customer_id');
            $table->char('currency_code', 3);
            $table->decimal('original_amount', 18, 2);
            $table->decimal('balance_amount', 18, 2);
            $table->date('due_date');
            $table->string('due_status', 24);
            $table->string('settlement_status', 24)->default('open');
            $table->timestampTz('posted_at');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->restrictOnDelete();
            $table->foreign('sale_id')->references('id')->on('sales')->restrictOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->restrictOnDelete();
            $table->index(['company_id', 'customer_id', 'settlement_status']);
            $table->index(['company_id', 'due_status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receivable_open_items');
        Schema::dropIfExists('sale_lines');
        Schema::dropIfExists('sales');
    }
};
