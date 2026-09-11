<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Customer;
use App\Models\PaymentTerm;
use App\Models\ProductService;
use App\Models\Salesperson;
use App\Models\TaxCode;
use Illuminate\Console\Command;

class SeedCreditSaleDemoData extends Command
{
    protected $signature = 'simplebiz:seed-credit-sale
        {--company-code=XYZ : Unique company code}
        {--company-name=XYZ Enterprise : Display company name}
        {--owner= : Supabase Auth user UUID to grant owner access}';

    protected $description = 'Create the minimum tenant and master data required by the Credit Sale API.';

    public function handle(): int
    {
        $company = Company::query()->firstOrCreate(
            ['code' => $this->option('company-code')],
            ['name' => $this->option('company-name'), 'currency_code' => 'PHP', 'timezone' => 'Asia/Manila', 'is_active' => true],
        );

        $term = PaymentTerm::query()->firstOrCreate(
            ['company_id' => $company->id, 'code' => 'NET30'],
            ['name' => 'Net 30', 'net_days' => 30, 'is_active' => true],
        );

        $vat = TaxCode::query()->firstOrCreate(
            ['company_id' => $company->id, 'code' => 'VAT12'],
            ['name' => 'VAT (12%)', 'rate_basis_points' => 1200, 'is_active' => true],
        );

        Branch::query()->firstOrCreate(
            ['company_id' => $company->id, 'code' => 'MAIN'],
            ['name' => 'Main - Cagayan de Oro', 'is_active' => true],
        );

        Salesperson::query()->firstOrCreate(
            ['company_id' => $company->id, 'code' => 'JUAN-CRUZ'],
            ['name' => 'Juan dela Cruz', 'is_active' => true],
        );

        Customer::query()->firstOrCreate(
            ['company_id' => $company->id, 'code' => 'ABC-TRADING'],
            ['name' => 'ABC Trading Company', 'credit_status' => 'eligible', 'credit_limit_amount' => '500000.00', 'default_payment_term_id' => $term->id, 'is_active' => true],
        );

        foreach ([
            ['PRD-1001', 'Printer - LaserJet Pro', 'unit', '8500.00'],
            ['PRD-2003', 'Printer Cartridge - Bk', 'pc', '2500.00'],
            ['PRD-2004', 'Printer Cartridge - CMY', 'pc', '3000.00'],
            ['PRD-3001', 'Bond Paper - A4', 'ream', '300.00'],
        ] as [$code, $name, $unit, $price]) {
            ProductService::query()->firstOrCreate(
                ['company_id' => $company->id, 'code' => $code],
                ['name' => $name, 'type' => 'product', 'unit_name' => $unit, 'default_unit_price' => $price, 'default_tax_code_id' => $vat->id, 'track_inventory' => true, 'is_active' => true],
            );
        }

        if ($owner = $this->option('owner')) {
            CompanyMembership::query()->firstOrCreate(
                ['company_id' => $company->id, 'user_id' => $owner],
                ['role' => 'owner', 'is_active' => true],
            );
        } else {
            $this->warn('No owner membership was created. Re-run with --owner=<Supabase Auth user UUID> before calling protected endpoints.');
        }

        $this->info("Credit Sale master data is ready for company {$company->name} ({$company->id}).");

        return self::SUCCESS;
    }
}
