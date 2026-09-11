# Credit Sale API

The Credit Sale API is a backend-only implementation of the Sales & Receivables ownership in MDS-200. It posts a credit sale and creates exactly one linked receivable open item. It does not receive money, create a payment receipt, or alter a cash account; those remain MDS-300 and MDS-700 responsibilities.

## Authentication and company context

Every endpoint requires:

- `Authorization: Bearer <Supabase user access token>`
- `X-Company-Id: <company UUID>`

The API verifies the access token through Supabase Auth, then requires an active `company_memberships` record. `owner`, `sales_manager`, and `sales_user` can post Credit Sales.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/sales/credit/bootstrap` | Returns company-scoped customers, products/services, tax codes, terms, branches, and salespersons for the form. |
| `POST` | `/api/v1/sales/credit` | Posts a Credit Sale and creates a Receivable Open Item. |
| `GET` | `/api/v1/sales/{sale}` | Retrieves a company-scoped Credit Sale, its immutable line snapshots, and receivable. |

## Post a Credit Sale

`POST /api/v1/sales/credit` also requires a UUID `Idempotency-Key` header. Repeating the same request with the same key returns the original sale rather than posting it again.

```json
{
  "customer_id": "customer-uuid",
  "branch_id": "branch-uuid",
  "salesperson_id": "salesperson-uuid",
  "payment_term_id": "payment-term-uuid",
  "sale_date": "2026-09-11",
  "remarks": "Delivery before noon.",
  "amount_received": "0.00",
  "lines": [
    {
      "product_service_id": "product-uuid",
      "quantity": "2",
      "unit_price": "2500.00",
      "discount_percent": "5.00",
      "discount_reason": "Volume discount",
      "tax_code_id": "tax-code-uuid"
    }
  ]
}
```

The server does not trust client totals, due dates, or price overrides. It derives totals from the active product/tax masters, calculates the due date from the selected term, checks credit eligibility and available limit, uses PHP cent-based arithmetic, creates the document number atomically, then commits the Sale, Sale Lines, Receivable Open Item, and audit record in one transaction.

`amount_received` must be zero. A non-zero amount is a partial-payment/cash flow and requires the future MDS-300 Collections & Receipts integration.

## Local bootstrap data

After migrating, create the company, an owner membership, and the UI's sample registry values:

```powershell
php artisan simplebiz:seed-credit-sale --owner=<Supabase-Auth-user-UUID>
```

The command prints the generated Company UUID. Use it as `X-Company-Id`.
