<?php

use App\Http\API\CreditSaleController;
use App\Http\API\DemoSalesController;
use Illuminate\Support\Facades\Route;

Route::middleware('demo.sales')->prefix('v1/demo')->group(function (): void {
    Route::get('sales', [DemoSalesController::class, 'index']);
    Route::post('sales', [DemoSalesController::class, 'store']);
});

Route::prefix('v1')->group(function (): void {
    Route::middleware(['supabase.auth', 'company.context'])->prefix('sales')->group(function (): void {
        Route::get('credit/bootstrap', [CreditSaleController::class, 'bootstrap']);
        Route::get('{sale}', [CreditSaleController::class, 'show'])->whereUuid('sale');

        Route::post('credit', [CreditSaleController::class, 'store'])
            ->middleware('sales.credit');
    });
});
