<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 32);
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'code']);
        });

        Schema::create('payment_terms', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 32);
            $table->string('name');
            $table->unsignedSmallInteger('net_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'code']);
        });

        Schema::create('tax_codes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 32);
            $table->string('name');
            $table->unsignedInteger('rate_basis_points')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'code']);
        });

        Schema::create('customers', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 48);
            $table->string('name');
            $table->string('credit_status', 24)->default('eligible');
            $table->decimal('credit_limit_amount', 18, 2)->nullable();
            $table->uuid('default_payment_term_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->foreign('default_payment_term_id')->references('id')->on('payment_terms')->nullOnDelete();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'credit_status', 'is_active']);
        });

        Schema::create('salespersons', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 48);
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'code']);
        });

        Schema::create('products_services', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('code', 64);
            $table->string('name');
            $table->string('type', 16)->default('product');
            $table->string('unit_name', 40);
            $table->decimal('default_unit_price', 18, 2);
            $table->uuid('default_tax_code_id')->nullable();
            $table->boolean('track_inventory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->foreign('default_tax_code_id')->references('id')->on('tax_codes')->nullOnDelete();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products_services');
        Schema::dropIfExists('salespersons');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('tax_codes');
        Schema::dropIfExists('payment_terms');
        Schema::dropIfExists('branches');
    }
};
