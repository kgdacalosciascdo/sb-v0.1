# Purchases API and deployment

## Setup and safety

This follows the requested no-login demo integration. Browser requests go to Laravel, which connects to Supabase PostgreSQL using server-only database credentials. All endpoints require `DEMO_SALES_ENABLED=true` and the active company selected by `DEMO_COMPANY_ID`. No Supabase secret is exposed to Vite. These unauthenticated endpoints are for demo data only, including attachments; authenticated tenant authorization remains necessary before real financial use.

The purchase migration and reference seed were applied to this workspace's configured Supabase database on 2026-10-08. No live purchases, payments, or stock quantities were created. New tables have PostgreSQL RLS enabled without public REST policies; Laravel's database role must have appropriate access.

For another database, configure `backend/.env` with its PostgreSQL Session Pooler details, then run locally:

```powershell
cd backend
php artisan config:clear
php artisan migrate --force
php artisan simplebiz:seed-purchases
php artisan migrate:status
```

The seed defaults to `DEMO_COMPANY_ID`; alternatively use `--company=<existing company UUID>`. It creates sample supplier/payment-account options and fills missing costs for the four existing reference catalog products. It does not create a company, replace existing account settings, or post transactions. An empty installation needs the existing company/catalog bootstrap first (`simplebiz:seed-credit-sale --owner=<owner UUID>`); use that company's ID consistently across environments.

Redeploy Render with the updated code and Dockerfile, then Vercel. Retain the existing free-service configuration: no additional worker, disk, paid shell, or paid service was added. Production frontend builds need `VITE_API_BASE_URL=https://simplebiz-one-api.onrender.com`; Render retains `FRONTEND_URL=https://sb-ph.vercel.app`, PostgreSQL credentials, `DEMO_COMPANY_ID`, and `DEMO_SALES_ENABLED=true`. Startup rebuilds Laravel caches. `/up` does not validate the purchase tables; check `/api/v1/demo/purchases/bootstrap` too.

The Docker image now sets PHP `post_max_size=20M` and `upload_max_filesize=10M` for the reference's attachment limit. Local PHP may need the same settings and a server restart. Proof is persisted in database JSON, not Render's ephemeral filesystem: one PNG/JPEG/PDF up to 10 MB, validated by actual MIME and downloaded with attachment disposition.

## Contract

Prefix `/api/v1/demo/purchases`. Responses use `{data: ...}`; list responses include pagination `meta`. JSON POSTs use `Content-Type: application/json` and `Accept: application/json`.

| Method | Suffix | Purpose |
| --- | --- | --- |
| GET | `/bootstrap` | Company, suppliers, actual catalog costs/taxes, compatible payment accounts |
| POST | `/suppliers` | Add supplier with `name`, `terms_days` (0–365) |
| GET / POST | `/drafts` | List/save database drafts; optional `draft_id` updates |
| GET | `/drafts/{uuid}` | Reload complete draft |
| GET / POST | `/` | Paginated history / post purchase |
| GET | `/{uuid}` | Reopen purchase document with current paid/due amounts |
| GET | `/{uuid}/attachments/{index}` | Download purchase proof |
| POST | `/{uuid}/payments` | Apply a later supplier payment |
| POST | `/{uuid}/clear-check` | Explicitly record pending PDC as cleared |
| GET | `/overview` | Purchase KPIs, supplier balances, all open payables, recent purchases |
| GET | `/stock` | Quantity/cost received through purchases and recent stock receipts |
| GET | `/cash` | Collection inflows and supplier outflows by account; supplier payment activity |

Purchase POST example (use UUIDs from bootstrap):

```json
{
  "supplier_id": "<supplier UUID>",
  "purchase_date": "2026-10-08",
  "invoice_number": "123456890",
  "items": [
    {"product_id": "<product UUID>", "quantity": "1", "unit_cost": "8500.00", "discount_percent": "0", "tax_id": "<tax UUID>"}
  ],
  "payment_mode": "partial",
  "payment_method": "Bank Transfer",
  "cash_account_id": "<account UUID>",
  "amount_paid": "5000.00",
  "due_date": "2026-11-08",
  "reference": "TRX-123",
  "pdc": null,
  "notes": "Received goods",
  "attachments": []
}
```

Modes are `full`, `partial`, `later`. Full must equal the server-calculated total; partial must be positive and less than total; later must be zero. Due dates are mandatory for outstanding amounts. Methods: `Cash`, `Bank Transfer`, `Check`, `E-Wallet`, `Credit Card`; existing account compatibility uses `Cheque` for Check. Non-cash methods require a reference/check number.

Paid-now Check uses the purchase date as its read-only check date. Pay Later may instead include `pdc: {account_id, check_number, check_date, amount}` with a future check date and amount no greater than the payable. PDC creation does not pay the invoice or move money. Clearing requires `{cleared_date: "YYYY-MM-DD"}`, no earlier than the check date and no later than company-local today. Clearing is explicit, not automatic.

Subsequent payment POST uses `{method, cash_account_id, reference, payment_date, amount}` and cannot exceed the current outstanding balance. Attachments use `{name, mime, content}` with raw base64 content, without a data-URL prefix.

Purchase/payment/check-clearing POSTs require a UUID `Idempotency-Key` header. Same purchase/payment key and normalized validated payload replay without duplicate effects; changed payload reuse returns 409. Clearing an already-cleared PDC makes no second movement. Validation returns 422; foreign-company lookups return 404. Keep an uncertain submission's original body/key when retrying. Drafts can be incomplete and never post ledger effects.

## Posting and system integration

One transaction locks the company, checks active tenant-owned references, rejects duplicate supplier invoices (trimmed/case-insensitive), recalculates totals in integer cents, allocates a `PUR-000001` number, persists immutable document snapshots and normalized lines, creates the supplier obligation, records immediate payment/outgoing cash, receives tracked-product stock, appends audit evidence, and consumes the draft. Any failure rolls all effects back. Quantity precision is four decimals; cost and percentage precision is two decimals. Supplied totals are never trusted. VAT is tax-exclusive on the discounted line amount: the reference's 17,700 gross − 250 discount + 2,094 tax = 19,544 total.

Later payments update payable and purchase balance projections while preserving original line/payment snapshots. Inventory cost excludes tax and includes line discounts. Services/non-stock catalog entries do not receive stock. The inventory page explicitly shows purchase receipts, not complete on-hand inventory: existing demo sales do not issue stock. Cash page shows recorded movement net, not a bank balance with opening balances. Credit Card is the existing demo payment-account convention, not a complete card liability ledger. No automatic expense classification or general-ledger double entry is implied.

Frontend paths: `/purchases/entry`, `/purchases/history`, `/purchases/payables`, `/purchases/payables?overdue=1`, `/purchases/suppliers`. Live purchase cards replace landing mock totals/activity; Dashboard, Payments, Inventory, Cash Accounts and Master Registries link to these records. Existing unrelated cards remain their established mock UI; the added panels identify the live subset.

Purchase orders, returns/debit memos, void/reversal workflows, approvals, landed cost, multiwarehouse transfers, full stock valuation, opening balances, supplier edit/delete, accounting exports, and authentication remain separate work, not silently implemented by posting purchases.

## Checks

```powershell
cd backend
php artisan test
vendor/bin/pint --dirty
php artisan route:list --path=purchases
cd ../web
npm ci
npx playwright install chromium
npm run build
npm run test:purchases
npm run test:receive-payment
```

PHP tests use in-memory SQLite through `phpunit.xml`; browser tests intercept requests and do not touch Supabase. Targeted lint passes for the changed files. Repository-wide lint still reports 10 existing errors in DatePicker and Sales. Build succeeds with the existing large-chunk advisory.
