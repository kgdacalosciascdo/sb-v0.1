import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { PurchaseDialog } from './PurchaseDialog'
import {
  peso,
  purchaseRequest,
  type Overview,
  type PurchaseBootstrap,
  type Supplier,
} from './api'

export function SuppliersPage() {
  const location = useLocation()
  const [data, setData] = useState<PurchaseBootstrap | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(
    () => new URLSearchParams(location.search).get('add') === '1',
  )
  const [name, setName] = useState('')
  const [terms, setTerms] = useState('30')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([
      purchaseRequest<{ data: PurchaseBootstrap }>('bootstrap'),
      purchaseRequest<{ data: Overview }>('overview'),
    ])
      .then(([options, totals]) => {
        if (active) {
          setData(options.data)
          setOverview(totals.data)
        }
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  async function save() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = await purchaseRequest<{ data: Supplier }>('suppliers', {
        method: 'POST',
        body: JSON.stringify({ name, terms_days: Number(terms) }),
      })
      setData((d) =>
        d ? { ...d, suppliers: [...d.suppliers, result.data] } : d,
      )
      setModal(false)
      setName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add supplier.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200 text-[#0c3761] text-[13px] leading-relaxed">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
        <Link to="/purchases" className="hover:text-sky-700 transition">
          Purchases &amp; Suppliers
        </Link>
        <span>›</span>
        <span className="text-slate-700 font-semibold">Suppliers</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0c3761]">
            Suppliers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage purchasing contacts, payment terms, and outstanding balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#087ae6] hover:bg-[#0964c2] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            + Add Supplier
          </button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[#9fd0e2] bg-[#e0f6fd]">
        <div className="relative max-w-sm w-full">
          <input
            aria-label="Search suppliers"
            placeholder="Search suppliers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#507ea1] bg-white px-3 py-1.5 text-xs text-[#0c3761] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159de9]"
          />
        </div>
        <span className="text-xs font-semibold text-[#0c3761]">
          {data ? `${data.suppliers.length} supplier${data.suppliers.length === 1 ? '' : 's'}` : 'Loading…'}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-xs"
        >
          {error}
        </div>
      )}

      {/* Table Section */}
      <section className="rounded-xl border border-[#9fd0e2] bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f0f9ff] border-b border-[#9fd0e2] text-xs font-bold text-[#0c3761]">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4 text-right">Amount Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0f2fe]">
              {data?.suppliers
                .filter((s) =>
                  `${s.name} ${s.code}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((s) => (
                  <tr key={s.id} className="hover:bg-[#f8fcff] transition">
                    <td className="py-3 px-4 font-bold text-[#0c3761]">{s.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{s.code}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.terms_days ? `Net ${s.terms_days}` : 'Due on Receipt'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                      {peso(
                        overview?.suppliers.find((o) => o.id === s.id)
                          ?.outstanding_cents || 0,
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/purchases/history?supplier=${s.id}`}
                        className="px-3 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] font-semibold text-xs shadow-2xs transition inline-block"
                      >
                        Purchase History
                      </Link>
                    </td>
                  </tr>
                ))}
              {data && !data.suppliers.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No suppliers yet. Add a supplier to begin.
                  </td>
                </tr>
              )}
              {!data && !error && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    Loading suppliers…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {modal && (
        <PurchaseDialog
          className="w-[min(380px,calc(100vw-24px))] bg-[#e0f6fd] border-2 border-[#64a1bf] rounded-xl shadow-2xl"
          title="Add Supplier"
          hideHeader
          onClose={() => !busy && setModal(false)}
        >
          <form
            className="p-5 sm:p-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            {/* Seamless Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base sm:text-lg font-bold text-[#0c3761] tracking-tight">
                Add Supplier
              </h2>
              <button
                type="button"
                onClick={() => !busy && setModal(false)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Supplier name
              </label>
              <input
                required
                maxLength={160}
                value={name}
                placeholder="Enter supplier or vendor name"
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#8ec7df] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#087ae6] focus:outline-none focus:ring-1 focus:ring-[#087ae6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Payment terms (days)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={terms}
                required
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-[#8ec7df] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#087ae6] focus:outline-none focus:ring-1 focus:ring-[#087ae6]"
              />
            </div>
            {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="min-w-[100px] px-6 py-2.5 rounded-lg border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-w-[120px] px-6 py-2.5 rounded-lg bg-[#087ae6] hover:bg-[#0964c2] text-xs sm:text-sm font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                + Add Supplier
              </button>
            </div>
          </form>
        </PurchaseDialog>
      )}
    </div>
  )
}
