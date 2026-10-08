# Purchases & Suppliers — implementation handoff

Updated: 2026-10-08. Owner: Kyle. Coordination: read `docs/jhonel.md` (empty) and `docs/jhonel-md/purchases.md`; neither was changed. Jhonel's landing card layout, drag order, collapse behavior, icons, and existing shell were retained.

## 2026-10-08 follow-up — loading and transient request failures

- Supplier Payables now displays “Fetching supplier balances…” until the balance read completes; history/counts also distinguish loading, failure, filtered-empty and confirmed-empty states. Failed reads show a retryable error, never a false zero balance.
- Balance/history/options reads resolve independently, so slow bootstrap cannot hide a loaded credit purchase. Payables does not fetch unused paginated history; supplier filters do not refetch all balances. Refresh / Retry reloads data after errors or changes.
- API helper shares simultaneous identical GET requests, including StrictMode mounts and multiple purchase panels. There is no completed-response cache, so navigation after posting gets fresh balances. Read-only 429s receive bounded retries (up to three attempts), honoring readable Retry-After values up to 60 seconds; network/CORS failures receive one delayed read retry. Writes are never automatically retried.
- Landing cards and live supplier panels no longer display empty-state messages/zero placeholders while their reads are pending or have failed.
- Production bootstrap was checked read-only: HTTP 200 and correct `Access-Control-Allow-Origin: https://sb-ph.vercel.app`. The supplied screenshot showed a transient 429 without that header; its exact upstream source was not reproduced. No CORS wildcard, auth bypass, database edits or backend throttle removal was made.
- Browser regression now covers delayed balances, independent bootstrap latency, GET deduplication, 429 recovery and failed-read/manual retry. Build and targeted lint pass. Redeploy Vercel to activate the frontend fix; no migration is required.

## Pages and interaction

- `/purchases`: live purchase totals, attention counts and recent records replace three mock cards. Action cards open cash/credit purchase entry or supplier payables. History, supplier ledger, receipt and overdue links connect to live data.
- `/purchases/entry`: reference-style two-column pale-blue purchase form with readable navy text, supplier/date/invoice information, editable line quantities/costs/discounts/taxes, searchable database catalog, notes and proof, preview/print and database drafts.
- Payment variants: Paid in Full, Partially Paid, Pay Later; method-compatible accounts, noncash references, paid/due summary, locked same-day Check date, optional pending PDC for Pay Later. No payment/stock effects during preview/draft.
- `/purchases/history`: paginated purchase records, supplier/text filters, reopened printable details/receipt and later supplier payment.
- `/purchases/payables`: current supplier obligations and payment actions, explicit PDC clearing. `?overdue=1` filters overdue records.
- `/purchases/suppliers`: database supplier directory, terms, balances and filtered purchase histories; Add Supplier. Master Registries' Manage Suppliers/Add Supplier now lead here.
- The shared sidebar labels are now Sales & Customers and Purchases & Suppliers. No sidebar redesign.

Page entrance matches the existing light transition; live landing amounts use the shared count-up hook. Responsive layout stacks the payment area; item/register tables scroll within their own containers instead of stretching the mobile page.

## Backend and database

API controller: `backend/app/Http/API/PurchaseController.php`. Requests in `app/Http/Requests`, models in `app/Models`, orchestration in `app/Services`, routes in `routes/api.php`. No module folders added. See [API and deployment contract](../../backend/docs/PURCHASES_API.md).

Migration `2026_10_08_000600_create_purchase_tables` adds suppliers, drafts, purchases/lines, payable open items, supplier payments, outgoing cash movements, pending checks and inventory receipts; catalog gains default purchase cost. Applied to configured Supabase with RLS. `simplebiz:seed-purchases` adds reference options only: no live transaction/stock/opening-balance fixtures.

Posting is integer-cent calculated, tenant-scoped, transactional, duplicate-invoice checked and idempotent. Stock receipt, supplier payable, immediate payment, cash outflow and audit are linked. Payment retries do not duplicate ledger entries. A future PDC stays pending until explicitly cleared on/after its date, never in the future.

Dashboard receives live purchase/payable summary; Payments exposes real supplier obligations; Inventory exposes received quantities/cost; Cash Accounts exposes actual recorded collection inflow/supplier outflow. These panels do not pretend to be full bank balances or complete on-hand stock. Original sales/collection flows remain unchanged.

## Verification / rollout

Backend feature tests cover reference totals, payment modes, stock/cash effects, scoped references, duplicate invoices/idempotency, subsequent settlement, pending checks, drafts/proof and full rollback. Isolated browser regression covers totals, all payment variants, check date/PDC, preview, draft reload, mobile layout, failed-save retry, history documents, supplier payment and cross-system navigation. Build and changed-file lint pass; whole-project lint still has 10 unrelated DatePicker/Sales errors.

Database changes and seed are already applied to the current Supabase database. Render and Vercel code deployment remains required; frontend API base URL must be present at build time. The Dockerfile increases the JSON post limit for 10 MB proof files. No paid Render resources were added.

No login rollout was added, per the existing scope. Public company demo endpoints are for test data only. Orders, returns/debit memos, reversals, supplier editing/deactivation, approvals, opening balances, complete inventory/GL accounting and authenticated tenant access remain deferred.

## Collaboration / merge hotspots

Shared files: frontend router, sidebar navigation labels, Purchases landing/actions/ledger links, Dashboard action/page, Payments action/page, Inventory/Cash Account page maps, Master Registries supplier links, package script and `docs/kyle.md`; backend API routes, ProductService model and Dockerfile. Preserve these functional destinations when merging Jhonel's card/UI changes. New page code is isolated in `web/src/pages/purchases/purchase-entry/`; old mock card components remain available and were not deleted. No changes to Jhonel documentation or Home page.
