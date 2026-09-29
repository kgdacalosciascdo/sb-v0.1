# Receive Payment API and deployment

## Environment and safety

This feature follows the existing no-login **demo** sales integration. Every endpoint is scoped to the active company identified by `DEMO_COMPANY_ID` and requires `DEMO_SALES_ENABLED=true`. These are public demo APIs, not authenticated financial endpoints. Use test data only. Do not upload private proof documents before authenticated tenant authorization is implemented.

Browser traffic goes to Laravel on Render; Laravel uses its existing Supabase PostgreSQL connection. No Supabase secret belongs in a `VITE_*` variable. The new database tables enable PostgreSQL RLS without anonymous/authenticated REST policies. The server database role must be able to access them.

## Setup

Run locally against the intended Supabase database using `backend/.env` (not against a new empty SQLite database):

```powershell
cd backend
php artisan config:clear
php artisan migrate --force
php artisan simplebiz:seed-collection-accounts
php artisan migrate:status
```

The migration and account setup were already run successfully against this workspace's configured Supabase database on 2026-09-29. Re-running is safe. The account command creates sample receiving accounts without opening balances; it never overwrites existing accounts. `--company=<UUID>` explicitly chooses another existing active company.

Deploy the code to Render, then Vercel. Keep `VITE_API_BASE_URL=https://simplebiz-one-api.onrender.com` in the frontend production build, and the existing `FRONTEND_URL=https://sb-ph.vercel.app`, database connection, `DEMO_COMPANY_ID`, and `DEMO_SALES_ENABLED` on Render. No paid shell, worker, disk, or pre-deploy service is added. The startup script already rebuilds Laravel's route/config caches.

If someone else deploys against a different database, they must run the migration and seed command against that database as well. The `/up` health endpoint alone does not verify these tables.

## Endpoints

Prefix: `/api/v1/demo/collections`. Send `Accept: application/json`; JSON POSTs additionally use `Content-Type: application/json`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/bootstrap` | Company, customer identities, open demo-sale balances, active accounts, payment methods |
| POST | `/customers` | Create master customer with `{"name":"Customer name"}`; no opening balance |
| GET | `/drafts` | Saved draft summaries |
| GET | `/drafts/{uuid}` | Load complete draft payload |
| POST | `/drafts` | Save/update a draft; optional `draft_id` |
| GET | `/receipts?page=1` | Receipt summaries, 25 per page, pagination metadata |
| GET | `/receipts/{uuid}` | Immutable posted receipt and allocation details |
| POST | `/receipts` | Validate and post; requires UUID `Idempotency-Key` |
| GET | `/receipts/{uuid}/attachments/{index}` | Download a stored proof document |

Receipt/draft JSON shape (replace placeholder IDs with values returned by bootstrap):

```json
{
  "customer_key": "sale:cust-1",
  "receipt_date": "2026-09-29",
  "amount": "25000.00",
  "remarks": "September settlement",
  "tenders": [
    {"method": "Bank Transfer", "account_id": "<account UUID>", "reference": "TRX-829104", "amount": "25000.00"}
  ],
  "applications": [
    {"sale_id": "<demo sale UUID>", "amount": "25000.00"}
  ],
  "attachments": []
}
```

Attachments contain `name`, `mime`, and raw base64 `content` (no data-URL prefix). MIME types: `image/png`, `image/jpeg`, `application/pdf`; 2 MB/file, three files, 3 MB total. They are retained in Supabase database JSON rather than ephemeral Render storage. Download responses force attachment disposition.

Drafts accept incomplete/zero amounts but require a customer key, date, and structurally valid tender rows. They have no financial effect. Posting enforces all business validations and consumes an optional draft in the same transaction.

Successful posting returns `201` with `{data: receipt, meta: {idempotent_replay: false}}`; retrying the same key and exact payload returns `200` with the same receipt. Changed payload/key reuse returns `409`; validation failures return `422`; out-of-company record lookups return `404`. Preserve a submission's UUID and body after an uncertain network failure.

## Balances and transaction guarantees

The source is the currently deployed sales page's `demo_sales`. Initial outstanding less persisted collection applications gives the current open balance. Receipts snapshot customer, company, tenders, documents, allocations, remarks, and proof. They do not rewrite the original sale receipt. Fully settled invoices disappear from the open-balances list.

One database transaction locks the company, validates current balances/account compatibility/tender totals, issues the next `PR-000001` sequence number, saves the receipt and application rows, records incoming cash-account movements, writes audit evidence, and removes a consumed draft. All money calculations use integer cents. A failure rolls back everything; parallel submissions cannot both spend the same invoice balance through this service.

Unallocated money is recorded as customer credit; it does not reduce an invoice until allocated. Applying that credit later and reversing a posted receipt are not part of this version. Newly added master customers can receive an advance, but are not automatically merged into existing demo customers with the same name.

## Checks

```powershell
cd backend
php artisan test
php artisan route:list --path=collections
cd ../web
npm ci
npx playwright install chromium
npm run test:receive-payment
npm run build
```

Browser regression starts an isolated Vite server and intercepts collection requests; it never posts to the live database. PHP tests use in-memory SQLite through `phpunit.xml`. Keep those testing connection overrides in place.
