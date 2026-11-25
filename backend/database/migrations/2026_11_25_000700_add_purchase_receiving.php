<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_lines', function (Blueprint $table): void {
            $table->decimal('received_quantity', 18, 4)->nullable();
        });
        Schema::table('inventory_movements', function (Blueprint $table): void {
            $table->dropUnique(['purchase_line_id']);
            $table->index('purchase_line_id');
        });
        Schema::create('purchase_expense_movements', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('company_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('purchase_line_id')->constrained()->restrictOnDelete();
            $table->date('received_on');
            $table->decimal('quantity', 18, 4);
            $table->unsignedBigInteger('cost_cents');
            $table->string('intended_use', 24);
        });
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE purchase_expense_movements ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        // Multiple receipts cannot be represented by the former unique index.
        if (DB::table('inventory_movements')->groupBy('purchase_line_id')->havingRaw('COUNT(*) > 1')->exists()
            || DB::table('purchase_lines')->whereNotNull('received_quantity')->exists()) {
            throw new RuntimeException('Purchase receiving data exists. Restore from a pre-migration backup to roll back.');
        }
        Schema::dropIfExists('purchase_expense_movements');
        Schema::table('inventory_movements', fn (Blueprint $table) => $table->dropIndex(['purchase_line_id']));
        Schema::table('inventory_movements', fn (Blueprint $table) => $table->unique('purchase_line_id'));
        Schema::table('purchase_lines', fn (Blueprint $table) => $table->dropColumn('received_quantity'));
    }
};
