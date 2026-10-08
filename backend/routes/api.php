<?php

use App\Http\API\CollectionReceiptController;
use App\Http\API\CreditSaleController;
use App\Http\API\DemoSalesController;
use App\Http\API\PurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware('demo.sales')->prefix('v1/demo')->group(function (): void {
    Route::get('sales', [DemoSalesController::class, 'index']);
    Route::post('sales', [DemoSalesController::class, 'store']);
    Route::prefix('purchases')->group(function (): void {
        Route::get('bootstrap', [PurchaseController::class, 'bootstrap']);
        Route::get('overview', [PurchaseController::class, 'overview']);
        Route::get('stock', [PurchaseController::class, 'stock']);
        Route::get('cash', [PurchaseController::class, 'cash']);
        Route::get('drafts', [PurchaseController::class, 'drafts']);
        Route::post('drafts', [PurchaseController::class, 'saveDraft'])->name('purchases.drafts.store');
        Route::get('drafts/{draft}', [PurchaseController::class, 'draft'])->whereUuid('draft');
        Route::post('suppliers', [PurchaseController::class, 'supplier']);
        Route::get('/', [PurchaseController::class, 'index']);
        Route::post('/', [PurchaseController::class, 'store']);
        Route::get('{purchase}', [PurchaseController::class, 'show'])->whereUuid('purchase');
        Route::post('{purchase}/payments', [PurchaseController::class, 'payment'])->whereUuid('purchase');
        Route::post('{purchase}/clear-check', [PurchaseController::class, 'clearCheck'])->whereUuid('purchase');
        Route::get('{purchase}/attachments/{index}', [PurchaseController::class, 'attachment'])->whereUuid('purchase')->whereNumber('index');
    });
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
