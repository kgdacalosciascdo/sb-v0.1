<?php

use App\Http\API\CollectionReceiptController;
use App\Http\API\CreditSaleController;
use App\Http\API\DemoSalesController;
use Illuminate\Support\Facades\Route;

Route::middleware('demo.sales')->prefix('v1/demo')->group(function (): void {
    Route::get('sales', [DemoSalesController::class, 'index']);
    Route::post('sales', [DemoSalesController::class, 'store']);
    Route::prefix('collections')->group(function (): void {
        Route::get('bootstrap', [CollectionReceiptController::class, 'bootstrap']);
        Route::get('receipts', [CollectionReceiptController::class, 'index']);
        Route::post('receipts', [CollectionReceiptController::class, 'store'])->middleware('throttle:30,1');
        Route::get('receipts/{receipt}', [CollectionReceiptController::class, 'show'])->whereUuid('receipt');
        Route::get('receipts/{receipt}/attachments/{index}', [CollectionReceiptController::class, 'attachment'])->whereUuid('receipt')->whereNumber('index');
        Route::get('drafts', [CollectionReceiptController::class, 'drafts']);
        Route::get('drafts/{draft}', [CollectionReceiptController::class, 'draft'])->whereUuid('draft');
        Route::post('drafts', [CollectionReceiptController::class, 'saveDraft'])->middleware('throttle:30,1');
        Route::post('customers', [CollectionReceiptController::class, 'createCustomer'])->middleware('throttle:30,1');
    });
});

Route::prefix('v1')->group(function (): void {
    Route::middleware(['supabase.auth', 'company.context'])->prefix('sales')->group(function (): void {
        Route::get('credit/bootstrap', [CreditSaleController::class, 'bootstrap']);
        Route::get('{sale}', [CreditSaleController::class, 'show'])->whereUuid('sale');

        Route::post('credit', [CreditSaleController::class, 'store'])
            ->middleware('sales.credit');
    });
});
