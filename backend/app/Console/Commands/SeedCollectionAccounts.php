<?php

namespace App\Console\Commands;

use App\Models\CashAccount;
use App\Models\Company;
use Illuminate\Console\Command;

class SeedCollectionAccounts extends Command
{
    protected $signature = 'simplebiz:seed-collection-accounts {--company= : Company UUID; defaults to DEMO_COMPANY_ID}';

    protected $description = 'Create demo collection cash accounts without changing balances or existing accounts.';

    public function handle(): int
    {
        $company = Company::query()->where('id', $this->option('company') ?: config('simplebiz.demo_company_id'))->where('is_active', true)->first();
        if (! $company) {
            $this->error('Set DEMO_COMPANY_ID to an existing active company or supply --company=<UUID>.');

            return self::FAILURE;
        }
        foreach ([['BDO-CHECKING', 'BDO Checking', ['Bank Transfer', 'Cheque']], ['CASH-DRAWER', 'Cash on Hand', ['Cash']], ['GCASH', 'GCash Wallet', ['E-Wallet']]] as [$code, $name, $methods]) {
            CashAccount::query()->firstOrCreate(['company_id' => $company->id, 'code' => $code], ['name' => $name, 'payment_methods' => $methods]);
        }
        $this->info('Collection accounts are ready. No opening balances or transactions were created.');

        return self::SUCCESS;
    }
}
