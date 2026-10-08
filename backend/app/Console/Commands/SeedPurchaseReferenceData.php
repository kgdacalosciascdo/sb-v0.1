<?php

namespace App\Console\Commands;

use App\Models\CashAccount;
use App\Models\Company;
use App\Models\ProductService;
use App\Models\Supplier;
use Illuminate\Console\Command;

class SeedPurchaseReferenceData extends Command
{
    protected $signature = 'simplebiz:seed-purchases {--company= : Company UUID; defaults to DEMO_COMPANY_ID}';

    protected $description = 'Set up demo suppliers, purchase costs, and receiving/payment account options without posting transactions.';

    public function handle(): int
    {
        $company = Company::query()->whereKey($this->option('company') ?: config('simplebiz.demo_company_id'))->where('is_active', true)->first();
        if (! $company) {
            $this->error('Set DEMO_COMPANY_ID to an existing active company.');

            return self::FAILURE;
        }
        Supplier::query()->firstOrCreate(['company_id' => $company->id, 'code' => 'ABC-TRADING'], ['name' => 'ABC Trading Company', 'terms_days' => 30, 'is_active' => true]);
        foreach (['PRD-1001' => '8500.00', 'PRD-2003' => '2500.00', 'PRD-2004' => '3000.00', 'PRD-3001' => '300.00'] as $code => $cost) {
            ProductService::query()->where('company_id', $company->id)->where('code', $code)->whereNull('default_purchase_cost')->update(['default_purchase_cost' => $cost]);
        }
        foreach ([['CASH-VAULT', 'Cash in Vault [CV-001]', ['Cash']], ['CREDIT-CARD', 'Business Credit Card', ['Credit Card']]] as [$code, $name, $methods]) {
            CashAccount::query()->firstOrCreate(['company_id' => $company->id, 'code' => $code], ['name' => $name, 'payment_methods' => $methods, 'is_active' => true]);
        }
        $this->call('simplebiz:seed-collection-accounts', ['--company' => $company->id]);
        $this->info('Purchase reference data is ready. No purchases, stock quantities, payments, or opening balances were created.');

        return self::SUCCESS;
    }
}
