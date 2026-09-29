<?php

namespace Tests\Feature\Collections;

use App\Models\CashAccount;
use App\Models\CollectionReceipt;
use App\Models\Company;
use App\Models\DemoSale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReceivePaymentTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private CashAccount $account;

    private DemoSale $sale;

    private string $url = '/api/v1/demo/collections';

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::create(['code' => 'XYZ', 'name' => 'XYZ Enterprise', 'currency_code' => 'PHP', 'timezone' => 'Asia/Manila', 'is_active' => true]);
        config(['simplebiz.demo_sales_enabled' => true, 'simplebiz.demo_company_id' => $this->company->id]);
        $this->account = CashAccount::create(['company_id' => $this->company->id, 'code' => 'BDO', 'name' => 'BDO Checking', 'payment_methods' => ['Bank Transfer', 'Cash']]);
        $this->sale = $this->sale($this->company->id);
    }

    private function sale(string $companyId, string $customerId = 'cust-1', string $amount = '10000.00'): DemoSale
    {
        return DemoSale::create(['company_id' => $companyId, 'idempotency_key' => (string) Str::uuid(), 'sale_number' => 'INV-'.Str::random(6), 'mode' => 'credit', 'status' => 'completed', 'receipt_number' => 'RCP-TEST', 'transaction_id' => (string) Str::uuid(), 'form_data' => ['salesDate' => '2026-09-01', 'dueDate' => '2026-09-30'], 'customer' => ['id' => $customerId, 'name' => 'ABC Trading Company', 'code' => 'ABC'], 'calculations' => ['totalAmount' => $amount, 'amountReceived' => 0, 'outstanding' => $amount]]);
    }

    private function payload(string $amount = '5000.00'): array
    {
        return ['customer_key' => 'sale:cust-1', 'receipt_date' => '2026-09-29', 'amount' => $amount, 'remarks' => 'Payment proof', 'tenders' => [['method' => 'Bank Transfer', 'account_id' => $this->account->id, 'reference' => 'TRX-829104', 'amount' => $amount]], 'applications' => [['sale_id' => $this->sale->id, 'amount' => $amount]], 'attachments' => []];
    }

    private function postPayment(array $payload, ?string $key = null)
    {
        return $this->postJson($this->url.'/receipts', $payload, ['Idempotency-Key' => $key ?? (string) Str::uuid()]);
    }

    public function test_bootstrap_returns_actual_balances_and_active_accounts(): void
    {
        $this->getJson($this->url.'/bootstrap')->assertOk()->assertJsonPath('data.open_items.0.balance_cents', 1000000)->assertJsonPath('data.accounts.0.name', 'BDO Checking');
    }

    public function test_post_partial_payment_updates_balances_and_cash_movement_atomically(): void
    {
        $response = $this->postPayment($this->payload())->assertCreated()->assertJsonPath('data.receipt_number', 'PR-000001')->assertJsonPath('data.applied_cents', 500000)->assertJsonPath('data.unapplied_cents', 0);
        $id = $response->json('data.id');
        $this->assertDatabaseHas('cash_account_movements', ['collection_receipt_id' => $id, 'amount_cents' => 500000]);
        $this->assertDatabaseHas('audit_logs', ['subject_id' => $id, 'event_type' => 'collection.receipt.posted']);
        $this->getJson($this->url.'/bootstrap')->assertJsonPath('data.open_items.0.balance_cents', 500000);
        $this->getJson($this->url.'/receipts/'.$id)->assertOk()->assertJsonPath('data.customer.name', 'ABC Trading Company');
        $this->getJson($this->url.'/receipts')->assertJsonPath('meta.total', 1);
        $this->assertEquals('10000.00', $this->sale->fresh()->calculations['outstanding']); // Original sale receipt stays immutable.
    }

    public function test_idempotent_retry_does_not_double_apply_and_changed_request_conflicts(): void
    {
        $key = (string) Str::uuid();
        $this->postPayment($this->payload(), $key)->assertCreated();
        $this->postPayment($this->payload(), $key)->assertOk()->assertJsonPath('meta.idempotent_replay', true);
        $this->postPayment($this->payload('4000.00'), $key)->assertConflict();
        $this->assertDatabaseCount('collection_receipts', 1);
        $this->assertDatabaseCount('cash_account_movements', 1);
    }

    public function test_rejects_overallocation_and_stale_balances_without_side_effects(): void
    {
        $this->postPayment($this->payload('11000.00'))->assertUnprocessable();
        $this->assertDatabaseCount('collection_receipts', 0);
        $this->assertDatabaseCount('document_sequences', 0);
        $this->postPayment($this->payload('8000.00'))->assertCreated();
        $this->postPayment($this->payload('5000.00'))->assertUnprocessable();
        $this->assertDatabaseCount('collection_receipts', 1);
        $this->assertDatabaseCount('cash_account_movements', 1);
    }

    public function test_split_tenders_and_unapplied_customer_credit(): void
    {
        $payload = $this->payload('12000.00');
        $payload['applications'][0]['amount'] = '10000.00';
        $payload['tenders'][0]['amount'] = '11000.00';
        $payload['tenders'][] = ['method' => 'Cash', 'account_id' => $this->account->id, 'reference' => '', 'amount' => '1000.00'];
        $this->postPayment($payload)->assertCreated()->assertJsonPath('data.unapplied_cents', 200000);
        $this->assertDatabaseCount('cash_account_movements', 2);
        $this->getJson($this->url.'/bootstrap')->assertJsonCount(0, 'data.open_items');
    }

    public function test_rejects_wrong_tender_totals_missing_reference_and_invalid_decimals(): void
    {
        $payload = $this->payload();
        $payload['tenders'][0]['amount'] = '4999.99';
        $this->postPayment($payload)->assertUnprocessable();
        $payload = $this->payload();
        $payload['tenders'][0]['reference'] = '';
        $this->postPayment($payload)->assertUnprocessable();
        $payload = $this->payload('1.001');
        $this->postPayment($payload)->assertUnprocessable();
        $this->assertDatabaseCount('collection_receipts', 0);
    }

    public function test_rejects_foreign_company_sales_accounts_and_receipts(): void
    {
        $other = Company::create(['code' => 'OTHER', 'name' => 'Other', 'is_active' => true]);
        $sale = $this->sale($other->id);
        $payload = $this->payload();
        $payload['applications'][0]['sale_id'] = $sale->id;
        $this->postPayment($payload)->assertUnprocessable();
        $foreignAccount = CashAccount::create(['company_id' => $other->id, 'code' => 'BANK', 'name' => 'Bank', 'payment_methods' => ['Bank Transfer']]);
        $payload = $this->payload();
        $payload['tenders'][0]['account_id'] = $foreignAccount->id;
        $this->postPayment($payload)->assertUnprocessable();
        $posted = $this->postPayment($this->payload())->assertCreated();
        config(['simplebiz.demo_company_id' => $other->id]);
        $this->getJson($this->url.'/receipts/'.$posted->json('data.id'))->assertNotFound();
        $this->getJson($this->url.'/receipts')->assertJsonPath('meta.total', 0);
    }

    public function test_cannot_allocate_another_customers_invoice_or_duplicate_lines(): void
    {
        $sale = $this->sale($this->company->id, 'cust-2');
        $payload = $this->payload();
        $payload['applications'][0]['sale_id'] = $sale->id;
        $this->postPayment($payload)->assertUnprocessable();
        $payload = $this->payload();
        $payload['applications'][] = $payload['applications'][0];
        $this->postPayment($payload)->assertUnprocessable();
    }

    public function test_draft_survives_reload_without_posting_and_is_consumed_once(): void
    {
        $draft = $this->postJson($this->url.'/drafts', $this->payload())->assertOk()->json('data.id');
        $this->assertDatabaseCount('collection_receipts', 0);
        $this->assertDatabaseCount('cash_account_movements', 0);
        $this->getJson($this->url.'/drafts/'.$draft)->assertOk()->assertJsonPath('data.amount', '5000.00');
        $this->getJson($this->url.'/drafts')->assertJsonCount(1, 'data');
        $payload = [...$this->payload(), 'draft_id' => $draft];
        $this->postPayment($payload)->assertCreated();
        $this->assertDatabaseCount('collection_drafts', 0);
        $this->postPayment($payload)->assertNotFound();
        $this->assertDatabaseCount('collection_receipts', 1);
    }

    public function test_advance_for_new_customer_and_attachment_storage(): void
    {
        $customer = $this->postJson($this->url.'/customers', ['name' => 'New Customer'])->assertCreated()->json('data.key');
        $payload = $this->payload('200.00');
        $payload['customer_key'] = $customer;
        $payload['applications'] = [];
        $payload['attachments'] = [['name' => 'proof.png', 'mime' => 'image/png', 'content' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=']];
        $id = $this->postPayment($payload)->assertCreated()->assertJsonPath('data.unapplied_cents', 20000)->assertJsonMissingPath('data.attachments.0.content')->json('data.id');
        $this->get($this->url.'/receipts/'.$id.'/attachments/0')->assertOk()->assertHeader('content-type', 'image/png');
        $payload['attachments'][0]['content'] = base64_encode('<script>alert(1)</script>');
        $this->postPayment($payload)->assertUnprocessable();
    }

    public function test_disabled_demo_api_and_invalid_idempotency_key(): void
    {
        $this->postJson($this->url.'/receipts', $this->payload())->assertUnprocessable();
        config(['simplebiz.demo_sales_enabled' => false]);
        $this->getJson($this->url.'/bootstrap')->assertNotFound();
    }

    public function test_database_failure_rolls_back_receipt_applications_sequence_and_cash(): void
    {
        DB::statement('DROP TABLE audit_logs');
        $this->postPayment($this->payload())->assertStatus(500);
        $this->assertEquals(0, CollectionReceipt::count());
        $this->assertDatabaseCount('collection_applications', 0);
        $this->assertDatabaseCount('cash_account_movements', 0);
        $this->assertDatabaseCount('document_sequences', 0);
    }
}
