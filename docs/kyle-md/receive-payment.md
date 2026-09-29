# 2026-09-29 — Receive Payment / Collections & Receipts

## Scope and coordination

### Readability follow-up

Increased labels, inputs, table rows, summaries, and receipt text to predominantly 12–13px, with bold section headings/totals and darker slate/navy colors aligned with Sales. Preserved the panel arrangement and sidebar; slightly increased control/row heights to accommodate the text. Frontend build and isolated desktop/mobile browser regression passed. No backend or database changes.

Implemented the Receive Payment page from the supplied reference, its Laravel API, and Supabase PostgreSQL storage. Preserved the existing sidebar, navbar, shell, Home, Dashboard, and Collections landing layout. Only the Receive Payment / Receipt History destinations changed in Jhonel's action-card component.

Read `docs/jhonel.md` (currently empty) and `docs/jhonel-md/collections.md`; neither was modified. Existing changes in `docs/kyle.md` were preserved. No new backend Modules folders were added.

MDS-300 informed the separation of receiving money from applying it to invoices, split tenders, unapplied customer credit, immutable posted receipt snapshots, atomic cash movements/applications/audit, and side-effect-free drafts. This is intentionally integrated with the currently deployed **demo sales** flow, not a replacement of the authenticated credit-sale service.

## Frontend

- `/collections/receive-payment`: customer selection, date, generated receipt number, outstanding amount, amount received, multiple tender rows, compatible receiving accounts, references, allocation checkboxes and editable amounts, due-date ordering, Auto Apply, Clear, live payment summary, remarks, and proof attachments.
- Footer: Cancel, Load Draft, Save as Draft, Preview Receipt, Post & Issue Receipt.
- Customer Ledger opens current open balances. Add New Customer creates a master customer without inventing an opening balance.
- `/collections/receipts`: paginated posted receipts; reopens the immutable receipt/details and supports printing and proof download.
- Page-specific CSS reproduces the reference's pale-blue panels, blue borders, compact tables, left-hand form and right-hand summary. Mobile stacks the panels and scrolls tables inside their own containers. No sidebar changes.
- Existing `VITE_API_BASE_URL` behavior is retained. Vite proxies relative `/api` calls locally; Vercel uses the configured Render origin.
- Repeated clicks are blocked while posting. An uncertain network retry retains its request body and UUID idempotency key for the mounted page. After a browser refresh/navigation during an uncertain submission, check Receipt History before entering another payment.

Files: `web/src/pages/collections/receive-payment/*`, `web/src/app/router/index.tsx`, `web/src/pages/collections/components/CollectionsActionCards.tsx`. Playwright is a dev dependency; `web/scripts/receive-payment.smoke.mjs` contains isolated browser regressions.

## Backend and database

- Controller: `backend/app/Http/API/CollectionReceiptController.php`.
- Validation: `backend/app/Http/Requests/ReceivePaymentRequest.php`.
- Posting/bootstrap service: `backend/app/Services/ReceiveCustomerPayment.php`.
- Models: `CashAccount`, `CollectionDraft`, `CollectionReceipt` under `backend/app/Models`.
- API definitions remain in `backend/routes/api.php` under `/api/v1/demo/collections`.
- Migration `2026_09_29_000500_create_collection_receipt_tables.php`: `cash_accounts`, `collection_drafts`, `collection_receipts`, `collection_applications`, `cash_account_movements`.
- New PostgreSQL tables enable RLS with no public policies. Laravel connects with the server database role; browser Supabase credentials are not used.
- Amounts are integer cents; posting verifies positive amounts, tender totals, account compatibility, non-cash references, allocation totals, current invoice balances, company/customer ownership, and unique application lines.
- Company-level transaction lock serializes receipt numbering and allocations. Receipt + applications + cash movements + audit + draft consumption commit together. Retries with identical key/body replay; different bodies using that key conflict.
- Original sale snapshots remain unchanged. Current collection balances are original demo-sale outstanding minus posted collection applications.
- PNG/JPG/PDF proof files are MIME-checked and stored in the database as base64, not on Render's ephemeral disk. Limits: three files, 2 MB each, 3 MB combined; downloaded as attachments with `nosniff`.

## Supabase changes applied

The configured database was verified to be Supabase PostgreSQL. Applied the migration successfully (batch 3) and ran the repeatable collection account setup for the configured demo company. Created BDO Checking, Cash on Hand, and GCash Wallet account options, without opening balances. No sample sales, receipts, or collection payments were inserted into the live database.

Live local-Laravel-to-Supabase bootstrap returned HTTP 200, 2 customer identities, 1 open balance, and 3 accounts at validation time. Render and Vercel have **not** been deployed by this task.

## Validation

- `cd backend; php artisan test`: 17 tests / 90 assertions passed (12 new collection tests).
- `php vendor/bin/pint --dirty --test`: passed.
- `php artisan route:list --path=collections`: 9 routes registered.
- `php artisan migrate:status`: all migrations applied.
- `cd web; npm run build`: passed; existing large-bundle warning remains.
- Targeted ESLint for new pages, action cards, and router: passed.
- `npm run test:receive-payment`: passed desktop and 375px mobile, no page-level horizontal overflow, auto-apply, preview without writes, draft reload, stable idempotency key after network failure, post receipt, and history reopening. API responses are intercepted: no browser-test writes to Supabase.
- Full `npm run lint`: 10 pre-existing errors in DatePicker and sales-entry components; unrelated files left unchanged.
- Required Boost bootstrap was attempted but failed because the local PHP lacks ZIP/unzip support. Removed the incomplete dependency change; composer files remain unchanged.

## Deployment / next developer

See `backend/docs/RECEIVE_PAYMENTS_API.md`. The configured Supabase schema is already prepared; deploy the backend commit on Render and frontend commit on Vercel. Ensure both use the same Supabase database and the existing `DEMO_COMPANY_ID`. No new environment secrets or paid Render resources are required.

Potential merge conflicts: router imports/routes, the two action-card route strings, `backend/routes/api.php`, `web/package.json` and lockfile, and Kyle's handoff. Feature-specific files are isolated. Preserve Jhonel's layout work when merging.

## Intentional limits

- No login/authentication rollout: demo endpoints are shared and unauthenticated. They are **not safe for real customer financial data or private proof documents**; enable proper authenticated tenant access before real business use. RLS does not make the public Laravel demo API private.
- Allocates existing `demo_sales`, not the separate authenticated `receivable_open_items` ledger. Demo snapshot customer IDs (`sale:*`) and master IDs (`master:*`) are kept distinct even when display names match; never merge financial records by name.
- Unapplied credit is recorded on the receipt. Later credit allocation, receipt reversal/voiding, bank reconciliation, cheque clearing, remittance, and a full historical customer ledger are outside this page's implementation.
- Existing Collections landing KPI/demo charts and the Cash Accounts landing UI were not converted to live data. Cash-account movement records are persisted for future integration.
- Printed document is a payment acknowledgment, not a claim of tax/legal invoice compliance.
