<?php

namespace Tests\Feature\Sales;

use App\Models\Branch;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Customer;
use App\Models\PaymentTerm;
use App\Models\ProductService;
use App\Models\TaxCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class CreditSaleApiTest extends TestCase
{
    use RefreshDatabase;

    private string $userId;

    private Company $company;

    private Customer $customer;

    private Branch $branch;

    private PaymentTerm $term;

    private TaxCode $taxCode;

    private ProductService $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userId = (string) Str::uuid();
        config(['supabase.url' => 'https://example.supabase.co', 'supabase.publishable_key' => 'test-key']);
        Http::fake(['https://example.supabase.co/auth/v1/user' => Http::response(['id' => $this->userId, 'email' => 'owner@example.test'])]);

        $this->company = Company::create(['code' => 'XYZ', 'name' => 'XYZ Enterprise', 'currency_code' => 'PHP', 'timezone' => 'Asia/Manila']);
        CompanyMembership::create(['company_id' => $this->company->id, 'user_id' => $this->userId, 'role' => 'owner', 'is_active' => true]);
        $this->term = PaymentTerm::create(['company_id' => $this->company->id, 'code' => 'NET30', 'name' => 'Net 30', 'net_days' => 30, 'is_active' => true]);
        $this->taxCode = TaxCode::create(['company_id' => $this->company->id, 'code' => 'VAT12', 'name' => 'VAT', 'rate_basis_points' => 1200, 'is_active' => true]);
        $this->branch = Branch::create(['company_id' => $this->company->id, 'code' => 'MAIN', 'name' => 'Main', 'is_active' => true]);
        $this->customer = Customer::create(['company_id' => $this->company->id, 'code' => 'ABC', 'name' => 'ABC Trading', 'credit_status' => 'eligible', 'credit_limit_amount' => '100000.00', 'default_payment_term_id' => $this->term->id, 'is_active' => true]);
        $this->product = ProductService::create(['company_id' => $this->company->id, 'code' => 'PRD-2003', 'name' => 'Printer Cartridge - Bk', 'type' => 'product', 'unit_name' => 'pc', 'default_unit_price' => '2500.00', 'default_tax_code_id' => $this->taxCode->id, 'track_inventory' => true, 'is_active' => true]);
    }

    public function test_it_posts_a_credit_sale_and_creates_one_receivable(): void
    {
        $idempotencyKey = (string) Str::uuid();

        $response = $this->postJson('/api/v1/sales/credit', $this->payload(), $this->headers($idempotencyKey));

        $response->assertCreated()
            ->assertJsonPath('data.sale_number', 'SAL-000001')
            ->assertJsonPath('data.due_date', '2026-10-11')
            ->assertJsonPath('data.totals.total_amount', '5320.00')
            ->assertJsonPath('data.receivable.balance_amount', '5320.00')
            ->assertJsonPath('meta.idempotent_replay', false);

        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('sale_lines', 1);
        $this->assertDatabaseCount('receivable_open_items', 1);
        $this->assertDatabaseCount('audit_logs', 1);
    }

    public function test_it_returns_the_original_sale_for_an_idempotent_retry(): void
    {
        $idempotencyKey = (string) Str::uuid();

        $this->postJson('/api/v1/sales/credit', $this->payload(), $this->headers($idempotencyKey))->assertCreated();
        $this->postJson('/api/v1/sales/credit', $this->payload(), $this->headers($idempotencyKey))
            ->assertOk()
            ->assertJsonPath('meta.idempotent_replay', true)
            ->assertJsonPath('data.sale_number', 'SAL-000001');

        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('receivable_open_items', 1);
    }

    public function test_it_rejects_a_sale_that_exceeds_the_credit_limit(): void
    {
        $this->customer->update(['credit_limit_amount' => '100.00']);

        $this->postJson('/api/v1/sales/credit', $this->payload(), $this->headers((string) Str::uuid()))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('customer_id');

        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('receivable_open_items', 0);
    }

    private function payload(): array
    {
        return [
            'customer_id' => $this->customer->id,
            'branch_id' => $this->branch->id,
            'payment_term_id' => $this->term->id,
            'sale_date' => '2026-09-11',
            'remarks' => 'Credit sale test',
            'amount_received' => '0.00',
            'lines' => [[
                'product_service_id' => $this->product->id,
                'quantity' => '2',
                'unit_price' => '2500.00',
                'tax_code_id' => $this->taxCode->id,
                'discount_percent' => '5.00',
                'discount_reason' => 'Volume discount',
            ]],
        ];
    }

    private function headers(string $idempotencyKey): array
    {
        return [
            'Authorization' => 'Bearer test-access-token',
            'X-Company-Id' => $this->company->id,
            'Idempotency-Key' => $idempotencyKey,
        ];
    }
}
