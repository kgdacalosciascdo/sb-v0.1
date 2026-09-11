<?php

use App\Http\API\CreditSaleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware(['supabase.auth', 'company.context'])->prefix('sales')->group(function (): void {
        Route::get('credit/bootstrap', [CreditSaleController::class, 'bootstrap']);
        Route::get('{sale}', [CreditSaleController::class, 'show'])->whereUuid('sale');

        Route::post('credit', [CreditSaleController::class, 'store'])
            ->middleware('sales.credit');
    });
});
