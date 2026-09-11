<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demo_sales', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->uuid('idempotency_key')->unique();
            $table->string('sale_number', 64);
            $table->string('mode', 16);
            $table->string('status', 24)->default('completed');
            $table->string('receipt_number', 64);
            $table->uuid('transaction_id')->unique();
            $table->json('form_data');
            $table->json('customer')->nullable();
            $table->json('calculations');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_sales');
    }
};
