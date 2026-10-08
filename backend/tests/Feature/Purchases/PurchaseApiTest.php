<?php

namespace Tests\Feature\Purchases;

use App\Models\CashAccount;
use App\Models\Company;
use App\Models\ProductService;
use App\Models\Supplier;
use App\Models\TaxCode;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class PurchaseApiTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Supplier $supplier;

    private CashAccount $account;

    private array $items;

    private string $url = '/api/v1/demo/purchases';

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::create(['code' => 'XYZ', 'name' => 'XYZ Enterprise', 'is_active' => true, 'timezone' => 'Asia/Manila', 'currency_code' => 'PHP']);
        config(['simplebiz.demo_sales_enabled' => true, 'simplebiz.demo_company_id' => $this->company->id]);
        $this->supplier = Supplier::create(['company_id' => $this->company->id, 'code' => 'ABC', 'name' => 'ABC Trading Company', 'terms_days' => 30, 'is_active' => true]);
        $this->account = CashAccount::create(['company_id' => $this->company->id, 'code' => 'BDO', 'name' => 'BDO Checking', 'payment_methods' => ['Cash', 'Bank Transfer', 'Cheque']]);
        $tax = TaxCode::create(['company_id' => $this->company->id, 'code' => 'VAT12', 'name' => 'VAT (12%)', 'rate_basis_points' => 1200, 'is_active' => true]);
        $this->items = [];
        foreach ([['PRD-1001', 'Printer - LaserJet Pro', '1', '8500.00', '0'], ['PRD-2003', 'Toner Cartridge - Bk', '2', '2500.00', '5'], ['PRD-2004', 'Toner Cartridge - CMY', '1', '3000.00', '0'], ['PRD-3001', 'Bond Paper - A4', '4', '300.00', '0']] as [$code, $name, $qty, $cost, $discount]) {
            $product = ProductService::create(['company_id' => $this->company->id, 'code' => $code, 'name' => $name, 'type' => 'product', 'unit_name' => 'unit', 'default_unit_price' => $cost, 'default_purchase_cost' => $cost, 'default_tax_code_id' => $tax->id, 'track_inventory' => true, 'is_active' => true]);
            $this->items[] = ['product_id' => $product->id, 'quantity' => $qty, 'unit_cost' => $cost, 'discount_percent' => $discount, 'tax_id' => $tax->id];
        }
    }

    private function payload(string $mode = 'full'): array
    {
        return ['supplier_id' => $this->supplier->id, 'purchase_date' => '2026-10-08', 'invoice_number' => '123456890', 'items' => $this->items, 'payment_mode' => $mode, 'payment_method' => 'Bank Transfer', 'cash_account_id' => $this->account->id, 'amount_paid' => $mode === 'full' ? '19544.00' : ($mode === 'partial' ? '10000.00' : '0.00'), 'due_date' => $mode === 'full' ? null : '2026-11-08', 'reference' => 'TRX-123', 'pdc' => null, 'notes' => 'Received items', 'attachments' => []];
    }

    private function postPurchase(array $data, ?string $key = null)
    {
        return $this->postJson($this->url, $data, ['Idempotency-Key' => $key ?: (string) Str::uuid()]);
    }

    public function test_reference_totals_full_payment_inventory_and_cash_are_persisted(): void
    {
        $result = $this->postPurchase($this->payload())->assertCreated()->assertJsonPath('data.purchase_number', 'PUR-000001')->assertJsonPath('data.total_cents', 1954400)->assertJsonPath('data.totals.gross_cents', 1770000)->assertJsonPath('data.totals.discount_cents', 25000)->assertJsonPath('data.totals.tax_cents', 209400)->assertJsonPath('data.due_cents', 0);
        $id = $result->json('data.id');
        $this->assertDatabaseCount('purchase_lines', 4);
        $this->assertDatabaseCount('inventory_movements', 4);
        $this->assertDatabaseHas('purchase_cash_movements', ['amount_cents' => 1954400, 'direction' => 'out']);
        $this->assertDatabaseHas('payable_open_items', ['purchase_id' => $id, 'outstanding_cents' => 0, 'status' => 'settled']);
        $this->getJson($this->url.'/'.$id)->assertOk()->assertJsonPath('data.invoice_number', '123456890');
        $this->getJson($this->url)->assertJsonPath('meta.total', 1);
        $this->getJson($this->url.'/stock')->assertJsonCount(4, 'data.items');
        $this->getJson($this->url.'/cash')->assertJsonPath('data.accounts.0.paid_cents', 1954400)->assertJsonCount(1, 'data.payments');
        $this->getJson($this->url.'/overview')->assertJsonPath('data.outstanding_cents', 0);
    }

    public function test_partial_payment_creates_correct_supplier_balance(): void
    {
        $this->postPurchase($this->payload('partial'))->assertCreated()->assertJsonPath('data.paid_cents', 1000000)->assertJsonPath('data.due_cents', 954400);
        $this->getJson($this->url.'/overview')->assertJsonPath('data.outstanding_cents', 954400)->assertJsonPath('data.suppliers.0.outstanding_cents', 954400)->assertJsonCount(1, 'data.payables');
    }

    public function test_pay_later_creates_obligation_without_cash_movement(): void
    {
        $this->postPurchase($this->payload('later'))->assertCreated()->assertJsonPath('data.paid_cents', 0)->assertJsonPath('data.due_cents', 1954400);
        $this->assertDatabaseCount('supplier_payments', 0);
        $this->assertDatabaseCount('purchase_cash_movements', 0);
        $this->assertDatabaseCount('inventory_movements', 4);
    }

    public function test_idempotency_duplicate_invoice_and_changed_request(): void
    {
        $key = (string) Str::uuid();
        $this->postPurchase($this->payload(), $key)->assertCreated();
        $this->postPurchase($this->payload(), $key)->assertOk()->assertJsonPath('meta.idempotent_replay', true);
        $data = $this->payload();
        $data['notes'] = 'changed';
        $this->postPurchase($data, $key)->assertConflict();
        $data['invoice_number'] = ' 123456890 ';
        $this->postPurchase($data)->assertUnprocessable();
        $this->assertDatabaseCount('purchases', 1);
        $this->assertDatabaseCount('inventory_movements', 4);
        $this->assertDatabaseCount('supplier_payments', 1);
    }

    public function test_backend_recalculates_and_rejects_payment_and_line_errors(): void
    {
        $data = $this->payload();
        $data['amount_paid'] = '1.00';
        $data['total_cents'] = 100;
        $this->postPurchase($data)->assertUnprocessable();
        $data = $this->payload('partial');
        $data['amount_paid'] = '19544.00';
        $this->postPurchase($data)->assertUnprocessable();
        $data = $this->payload('later');
        $data['due_date'] = null;
        $this->postPurchase($data)->assertUnprocessable();
        $data = $this->payload();
        $data['items'][0]['quantity'] = '-1';
        $this->postPurchase($data)->assertUnprocessable();
        $data['items'][0]['quantity'] = '1';
        $data['items'][0]['discount_percent'] = '101';
        $this->postPurchase($data)->assertUnprocessable();
        $this->assertDatabaseCount('purchases', 0);
    }

    public function test_foreign_supplier_product_tax_account_and_read_are_rejected(): void
    {
        $other = Company::create(['code' => 'OTHER', 'name' => 'Other', 'is_active' => true]);
        $foreignSupplier = Supplier::create(['company_id' => $other->id, 'name' => 'Other supplier', 'code' => 'SUP']);
        $data = $this->payload();
        $data['supplier_id'] = $foreignSupplier->id;
        $this->postPurchase($data)->assertUnprocessable();
        $data = $this->payload();
        $data['items'][0]['product_id'] = (string) Str::uuid();
        $this->postPurchase($data)->assertUnprocessable();
        $data = $this->payload();
        $data['items'][0]['tax_id'] = (string) Str::uuid();
        $this->postPurchase($data)->assertUnprocessable();
        $foreignAccount = CashAccount::create(['company_id' => $other->id, 'name' => 'Other bank', 'code' => 'BANK', 'payment_methods' => ['Bank Transfer']]);
        $data = $this->payload();
        $data['cash_account_id'] = $foreignAccount->id;
        $this->postPurchase($data)->assertUnprocessable();
        $posted = $this->postPurchase($this->payload())->assertCreated();
        config(['simplebiz.demo_company_id' => $other->id]);
        $this->getJson($this->url.'/'.$posted->json('data.id'))->assertNotFound();
        $this->getJson($this->url.'/overview')->assertJsonPath('data.outstanding_cents', 0)->assertJsonCount(0, 'data.recent');
    }

    public function test_later_supplier_payments_settle_balance_and_retries_are_safe(): void
    {
        $id = $this->postPurchase($this->payload('partial'))->json('data.id');
        $payment = ['method' => 'Bank Transfer', 'cash_account_id' => $this->account->id, 'reference' => 'FINAL', 'payment_date' => '2026-10-09', 'amount' => '9544.00'];
        $key = (string) Str::uuid();
        $this->postJson($this->url.'/'.$id.'/payments', $payment, ['Idempotency-Key' => $key])->assertCreated()->assertJsonPath('data.due_cents', 0);
        $this->postJson($this->url.'/'.$id.'/payments', $payment, ['Idempotency-Key' => $key])->assertOk();
        $this->postJson($this->url.'/'.$id.'/payments', $payment, ['Idempotency-Key' => (string) Str::uuid()])->assertUnprocessable();
        $this->assertDatabaseCount('supplier_payments', 2);
        $this->getJson($this->url.'/cash')->assertJsonPath('data.accounts.0.paid_cents', 1954400);
        $this->getJson($this->url.'/overview')->assertJsonCount(0, 'data.payables');
    }

    public function test_future_check_is_pending_and_clearing_records_payment_once(): void
    {
        $data = $this->payload('later');
        $data['pdc'] = ['account_id' => $this->account->id, 'check_number' => 'PDC-123', 'check_date' => '2026-11-08', 'amount' => '19544.00'];
        $id = $this->postPurchase($data)->assertCreated()->assertJsonPath('data.due_cents', 1954400)->json('data.id');
        $this->assertDatabaseCount('supplier_payments', 0);
        $this->postJson($this->url.'/'.$id.'/clear-check', ['cleared_date' => '2026-10-08'], ['Idempotency-Key' => (string) Str::uuid()])->assertUnprocessable();
        $key = (string) Str::uuid();
        $this->travelTo(Carbon::parse('2026-10-08 12:00:00'));
        $this->postJson($this->url.'/'.$id.'/clear-check', ['cleared_date' => '2026-11-08'], ['Idempotency-Key' => $key])->assertUnprocessable();
        $this->travelTo(Carbon::parse('2026-11-08 12:00:00'));
        $this->postJson($this->url.'/'.$id.'/clear-check', ['cleared_date' => '2026-11-08'], ['Idempotency-Key' => $key])->assertOk()->assertJsonPath('data.due_cents', 0)->assertJsonPath('data.postdated_check.status', 'cleared');
        $this->postJson($this->url.'/'.$id.'/clear-check', ['cleared_date' => '2026-11-08'], ['Idempotency-Key' => $key])->assertOk();
        $this->assertDatabaseCount('supplier_payments', 1);
        $this->assertDatabaseCount('purchase_cash_movements', 1);
    }

    public function test_cash_check_modes_and_incompatible_account(): void
    {
        $data = $this->payload();
        $data['payment_method'] = 'Cash';
        $data['reference'] = '';
        $this->postPurchase($data)->assertCreated();
        $data['invoice_number'] = 'SECOND';
        $data['payment_method'] = 'Check';
        $data['reference'] = 'CHK-123';
        $this->postPurchase($data)->assertCreated()->assertJsonPath('data.payment.check_date', '2026-10-08');
        $data['invoice_number'] = 'THIRD';
        $data['payment_method'] = 'E-Wallet';
        $this->postPurchase($data)->assertUnprocessable();
    }

    public function test_pay_later_accepts_omitted_paid_now_fields(): void
    {
        $data = $this->payload('later');
        unset($data['payment_method'], $data['cash_account_id'], $data['reference']);
        $this->postPurchase($data)->assertCreated()->assertJsonPath('data.due_cents', 1954400);
        $this->assertDatabaseCount('supplier_payments', 0);
    }

    public function test_draft_reload_consumption_and_attachment_validation(): void
    {
        $data = $this->payload();
        $data['attachments'] = [['name' => 'proof.png', 'mime' => 'image/png', 'content' => 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=']];
        $draft = $this->postJson($this->url.'/drafts', $data)->assertOk()->json('data.id');
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->getJson($this->url.'/drafts/'.$draft)->assertJsonPath('data.invoice_number', '123456890');
        $this->getJson($this->url.'/drafts')->assertJsonCount(1, 'data');
        $data['draft_id'] = $draft;
        $id = $this->postPurchase($data)->assertCreated()->assertJsonMissingPath('data.attachments.0.content')->json('data.id');
        $this->assertDatabaseCount('purchase_drafts', 0);
        $this->get($this->url.'/'.$id.'/attachments/0')->assertOk()->assertHeader('content-type', 'image/png');
        $data['attachments'][0]['content'] = base64_encode('<script>alert(1)</script>');
        $this->postPurchase($data)->assertUnprocessable();
    }

    public function test_failure_rolls_back_all_cross_module_effects(): void
    {
        DB::statement('DROP TABLE audit_logs');
        $this->postPurchase($this->payload())->assertStatus(500);
        foreach (['purchases', 'purchase_lines', 'payable_open_items', 'supplier_payments', 'inventory_movements', 'purchase_cash_movements', 'document_sequences'] as $table) {
            $this->assertDatabaseCount($table, 0);
        }
    }

    public function test_demo_toggle_bootstrap_supplier_creation_and_incomplete_draft(): void
    {
        $this->getJson($this->url.'/bootstrap')->assertOk()->assertJsonCount(4, 'data.products');
        $this->postJson($this->url.'/suppliers', ['name' => 'Another Supplier', 'terms_days' => 15])->assertCreated();
        $data = $this->payload();
        $data['supplier_id'] = null;
        $data['invoice_number'] = null;
        $data['items'] = [];
        $this->postJson($this->url.'/drafts', $data)->assertOk();
        $this->postJson($this->url, $this->payload())->assertUnprocessable();
        config(['simplebiz.demo_sales_enabled' => false]);
        $this->getJson($this->url.'/bootstrap')->assertNotFound();
    }
}
