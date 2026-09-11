<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->char('currency_code', 3)->default('PHP');
            $table->string('timezone', 64)->default('Asia/Manila');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('company_memberships', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->uuid('user_id')->comment('Supabase Auth user UUID');
            $table->string('role', 40);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'user_id']);
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('document_sequences', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->string('document_type', 50);
            $table->string('prefix', 24)->default('SAL');
            $table->unsignedBigInteger('next_number')->default(1);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->unique(['company_id', 'document_type']);
        });

        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->uuid('actor_user_id')->nullable();
            $table->uuid('subject_id')->nullable();
            $table->string('event_type', 100);
            $table->string('subject_type', 100);
            $table->uuid('correlation_id');
            $table->json('metadata')->nullable();
            $table->timestampTz('occurred_at')->useCurrent();

            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
            $table->index(['company_id', 'subject_type', 'subject_id']);
            $table->index(['company_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('document_sequences');
        Schema::dropIfExists('company_memberships');
        Schema::dropIfExists('companies');
    }
};
