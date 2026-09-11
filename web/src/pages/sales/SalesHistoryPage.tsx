import { Fragment, useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, ReceiptText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useSalesStore, type LocalSaleRecord } from '../../stores/useSalesStore'
import { buildSalesPayload, type SalesApiResponse } from './sales-entry/api/salesApi'
import { fetchSalesFromDatabase } from './sales-entry/api/demoSalesApi'
import { SalesReceiptModal } from './sales-entry/components/SalesReceiptModal'

function money(value: number): string {
  return `PHP ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function createLocalResponse(sale: LocalSaleRecord): SalesApiResponse {
  const payload = buildSalesPayload(sale.formData, sale.customer, sale.calculations)

  return {
    status: 'success',
    message: 'Sale loaded from this browser.',
    receipt_no: sale.receiptNo,
    transaction_id: sale.transactionId,
    data: {
      ...payload,
      id: sale.id,
      receipt_no: sale.receiptNo,
      status: sale.status,
      created_at: sale.createdAt,
    },
  }
}

export function SalesHistoryPage() {
  const navigate = useNavigate()
  const sales = useSalesStore((state) => state.sales)
  const setSales = useSalesStore((state) => state.setSales)
  const [selectedSale, setSelectedSale] = useState<LocalSaleRecord | null>(null)
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    fetchSalesFromDatabase()
      .then((records) => {
        if (isMounted) {
          setSales(records)
          setLoadError(null)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load sales history.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [setSales])

  return (
    <div className="w-full space-y-4 pb-6 animate-sales-header">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <ReceiptText className="size-9 text-[#0288d1]" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Sales History</h1>
            <p className="text-xs text-slate-600 sm:text-[13px]">Cash and Credit Sale records saved in Supabase.</p>
          </div>
        </div>
        <Link to="/sales" className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50">
          <ArrowLeft className="size-3.5" />
          Back to Sales
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-[#72bee9] bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Completed Transactions</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">{sales.length} saved record{sales.length === 1 ? '' : 's'}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Supabase database</span>
        </div>

        {isLoading ? (
          <div className="px-4 py-12 text-center text-xs text-slate-500">Loading sales from Supabase...</div>
        ) : loadError ? (
          <div className="px-4 py-12 text-center text-xs text-rose-600">{loadError}</div>
        ) : sales.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs text-slate-500">No completed sales have been saved yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Sale No.</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => {
                  const isExpanded = expandedSaleId === sale.id

                  return (
                    <Fragment key={sale.id}>
                      <tr className="transition hover:bg-sky-50/40">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(sale.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">{sale.saleNo}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${sale.mode === 'cash' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}>{sale.mode}</span></td>
                        <td className="px-4 py-3 text-slate-700">{sale.customer?.name || 'Walk-in Retail Customer'}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">{money(sale.calculations.totalAmount)}</td>
                        <td className="px-4 py-3 text-right"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Saved in DB</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)} aria-expanded={isExpanded} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                              {isExpanded ? 'Hide Details' : 'Details'}
                            </button>
                            <button type="button" onClick={() => setSelectedSale(sale)} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-[#0288d1] transition hover:bg-sky-50">
                              <ReceiptText className="size-3.5" />
                              View Receipt
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-sky-50/40">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                              <div className="rounded-lg border border-sky-100 bg-white p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <h3 className="text-xs font-bold text-slate-900">Sale Items</h3>
                                  <span className="font-mono text-[10px] text-slate-400">{sale.receiptNo}</span>
                                </div>
                                <div className="space-y-2">
                                  {sale.formData.items.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 text-[11px] last:border-0 last:pb-0">
                                      <div><p className="font-semibold text-slate-800">{item.name}</p><p className="text-slate-500">{item.code} · {item.qty} {item.unit} × {money(item.unitPrice)} · Discount {item.discountPercent}%</p></div>
                                      <span className="whitespace-nowrap font-mono font-semibold text-slate-800">{money(item.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="rounded-lg border border-sky-100 bg-white p-3">
                                  <h3 className="mb-2 text-xs font-bold text-slate-900">Transaction Details</h3>
                                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                                    <dt className="text-slate-500">Transaction ID</dt><dd className="truncate text-right font-mono text-slate-700">{sale.transactionId}</dd>
                                    <dt className="text-slate-500">Salesperson</dt><dd className="text-right text-slate-700">{sale.formData.salesperson}</dd>
                                    <dt className="text-slate-500">Branch</dt><dd className="text-right text-slate-700">{sale.formData.branch}</dd>
                                    <dt className="text-slate-500">Payment Method</dt><dd className="text-right text-slate-700">{sale.formData.paymentMethod}</dd>
                                    <dt className="text-slate-500">Received In</dt><dd className="text-right text-slate-700">{sale.formData.receivedInAccount}</dd>
                                    {sale.mode === 'credit' && <><dt className="text-slate-500">Payment Terms</dt><dd className="text-right text-slate-700">{sale.formData.paymentTerms}</dd></>}
                                  </dl>
                                </div>
                                <div className="rounded-lg border border-sky-100 bg-white p-3">
                                  <h3 className="mb-2 text-xs font-bold text-slate-900">Totals &amp; Payment</h3>
                                  <dl className="space-y-1.5 text-[11px]">
                                    <div className="flex justify-between text-slate-600"><dt>Subtotal</dt><dd className="font-mono">{money(sale.calculations.subtotal)}</dd></div>
                                    <div className="flex justify-between text-slate-600"><dt>Discounts</dt><dd className="font-mono">{money(sale.calculations.lineDiscounts)}</dd></div>
                                    <div className="flex justify-between text-slate-600"><dt>VAT</dt><dd className="font-mono">{money(sale.calculations.vatAmount)}</dd></div>
                                    <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold text-slate-900"><dt>Total</dt><dd className="font-mono">{money(sale.calculations.totalAmount)}</dd></div>
                                    <div className="flex justify-between text-slate-600"><dt>Amount received</dt><dd className="font-mono">{money(sale.calculations.amountReceived)}</dd></div>
                                    <div className="flex justify-between text-slate-600"><dt>{sale.calculations.change > 0 ? 'Change' : 'Outstanding'}</dt><dd className="font-mono">{money(sale.calculations.change > 0 ? sale.calculations.change : sale.calculations.outstanding)}</dd></div>
                                  </dl>
                                </div>
                              </div>
                            </div>
                            {sale.formData.remarks && <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] text-slate-600"><span className="font-semibold text-slate-800">Remarks:</span> {sale.formData.remarks}</p>}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSale && (
        <SalesReceiptModal
          formData={selectedSale.formData}
          selectedCustomer={selectedSale.customer}
          calculations={selectedSale.calculations}
          apiResponse={createLocalResponse(selectedSale)}
          onClose={() => setSelectedSale(null)}
          onNewSale={() => {
            setSelectedSale(null)
            navigate(`/sales/entry?mode=${selectedSale.mode}`)
          }}
        />
      )}
    </div>
  )
}
