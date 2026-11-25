import { useRef, useState } from 'react'
import {
  Building2,
  FileText,
  Package,
  Printer,
  X,
} from 'lucide-react'
import { PurchaseDialog } from './PurchaseDialog'
import {
  intendedUses,
  peso,
  PurchaseApiError,
  purchaseRequest,
  purchasesEndpoint,
  receivingLabels,
  today,
  type PurchaseRecord,
} from './api'

function Calendar3DIcon({ className = 'size-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="calShadow" x="-10%" y="0%" width="120%" height="125%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.22" />
        </filter>
        <linearGradient id="calRed" x1="14" y1="5" x2="14" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="30%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Calendar Base Sheet */}
      <rect x="2.5" y="5.5" width="23" height="20" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" filter="url(#calShadow)" />
      {/* Red Header Bar */}
      <path d="M2.5 8.5C2.5 6.84315 3.84315 5.5 5.5 5.5H22.5C24.1569 5.5 25.5 6.84315 25.5 8.5V11.5H2.5V8.5Z" fill="url(#calRed)" />
      {/* 2 Spiral Rings */}
      <rect x="6.5" y="2.5" width="2.5" height="5" rx="1.25" fill="url(#ringGrad)" stroke="#475569" strokeWidth="0.5" />
      <rect x="19" y="2.5" width="2.5" height="5" rx="1.25" fill="url(#ringGrad)" stroke="#475569" strokeWidth="0.5" />
      {/* Mini Grid of Date Dots / Squares */}
      {/* Row 1 */}
      <rect x="5.5" y="14" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="9.5" y="14" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="13.5" y="14" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="17.5" y="14" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="21.5" y="14" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      {/* Row 2 */}
      <rect x="5.5" y="17.5" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="9.5" y="17.5" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="13.5" y="17.5" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="17.5" y="17.5" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="21.5" y="17.5" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      {/* Row 3 */}
      <rect x="5.5" y="21" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="9.5" y="21" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="13.5" y="21" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="17.5" y="21" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
      <rect x="21.5" y="21" width="2.2" height="1.8" rx="0.3" fill="#94a3b8" />
    </svg>
  )
}

function Bank3DIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bankRoof" x1="16" y1="3" x2="16" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="bankPillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="bankBase" x1="16" y1="23" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="bankShadow" x="-10%" y="0%" width="120%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Base Steps */}
      <rect x="2" y="26" width="28" height="3" rx="0.75" fill="url(#bankBase)" filter="url(#bankShadow)" />
      <rect x="3.5" y="23" width="25" height="3" rx="0.5" fill="#94a3b8" />
      <rect x="4" y="23" width="24" height="1.8" fill="#e2e8f0" />
      {/* 4 Columns */}
      <rect x="5.5" y="11" width="3.5" height="12" rx="0.5" fill="url(#bankPillar)" />
      <rect x="11.5" y="11" width="3.5" height="12" rx="0.5" fill="url(#bankPillar)" />
      <rect x="17" y="11" width="3.5" height="12" rx="0.5" fill="url(#bankPillar)" />
      <rect x="23" y="11" width="3.5" height="12" rx="0.5" fill="url(#bankPillar)" />
      {/* Architrave Beam */}
      <rect x="3.5" y="9" width="25" height="2.5" rx="0.5" fill="#94a3b8" />
      <rect x="4" y="9" width="24" height="1.5" fill="#f8fafc" />
      {/* Pediment (Triangle Roof) */}
      <polygon points="16,3 2,10 30,10" fill="url(#bankRoof)" filter="url(#bankShadow)" />
      <polygon points="16,4.5 4,9.5 28,9.5" fill="#ffffff" opacity="0.5" />
    </svg>
  )
}

export function PurchaseDocument({
  record: initialRecord,
  preview = false,
  onClose,
  onReceived,
}: {
  record: PurchaseRecord
  preview?: boolean
  onClose: () => void
  onReceived?: (record: PurchaseRecord) => void
}) {
  const [updatedRecord, setUpdatedRecord] = useState<PurchaseRecord | null>(
    null,
  )
  const record = updatedRecord || initialRecord
  const [receiving, setReceiving] = useState(false)
  const [date, setDate] = useState(today)
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const pending = useRef<{ key: string; body: string } | null>(null)
  const outstanding = record.totals.lines.flatMap((line) => {
    const remaining =
      (Math.round(Number(line.quantity) * 10000) -
        Math.round(Number(line.received_quantity ?? line.quantity) * 10000)) /
      10000
    return line.line_id && remaining > 0
      ? [{ id: line.line_id, name: line.name, remaining }]
      : []
  })

  async function receive() {
    if (busy) return
    const items = outstanding
      .filter((line) => Number(quantities[line.id]) > 0)
      .map((line) => ({ line_id: line.id, quantity: quantities[line.id] }))
    if (!pending.current && !items.length) {
      setError('Enter at least one quantity received.')
      return
    }
    pending.current ??= {
      key: crypto.randomUUID(),
      body: JSON.stringify({ received_on: date, items }),
    }
    setBusy(true)
    setError('')
    try {
      const { data } = await purchaseRequest<{ data: PurchaseRecord }>(
        `${record.id}/receiving`,
        {
          method: 'POST',
          body: pending.current.body,
          headers: { 'Idempotency-Key': pending.current.key },
        },
      )
      pending.current = null
      setRetrying(false)
      setUpdatedRecord(data)
      setReceiving(false)
      setQuantities({})
      onReceived?.(data)
    } catch (e) {
      if (
        e instanceof PurchaseApiError &&
        [422, 404, 403, 429].includes(e.status)
      )
        pending.current = null
      setRetrying(!!pending.current)
      setError(
        e instanceof Error ? e.message : 'Unable to record the delivery.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <PurchaseDialog
      className="w-[min(720px,calc(100vw-24px))] p-0 rounded-[9px] border-[1.5px] border-[#256bb2] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden"
      title={preview ? 'Preview Purchase' : 'Purchase Details'}
      hideHeader
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      {/* On-screen Desktop Window (hidden when printing) */}
      <div className="flex flex-col bg-white text-[#0c3761] select-none text-[12.5px] leading-relaxed print:hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#3580cb] via-[#246bb5] to-[#175294] border-b border-[#134479] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          <div className="flex items-center gap-2">
            <FileText className="size-4.5 text-white shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
            <span className="text-[14.5px] sm:text-[15px] font-bold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              {preview ? 'Preview Purchase' : `Purchase Details — ${record.purchase_number}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="size-[24px] rounded-[3px] border border-[#ff9999]/60 bg-gradient-to-b from-[#e54545] via-[#cf2222] to-[#991111] hover:brightness-110 active:brightness-95 flex items-center justify-center shadow-xs transition cursor-pointer"
          >
            <X className="size-3 text-white stroke-[2.8] drop-shadow-xs" />
          </button>
        </div>

        {/* Company Header Banner with 3D Building & Sky Wave */}
        <div className="bg-gradient-to-r from-white via-[#f3f9fe] to-[#cbe7f8] px-5 sm:px-6 py-4 border-b border-[#e1eff8] flex items-center gap-4">
          <div className="size-14 sm:size-16 rounded-xl bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] border border-[#7dd3fc] shadow-sm flex items-center justify-center shrink-0">
            <Building2 className="size-8 sm:size-9 text-[#0288d1] drop-shadow-xs" />
          </div>
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#0c3761] tracking-tight leading-tight">
              {record.company?.name || 'XYZ Enterprise'}
            </h3>
            <p className="text-[12.5px] font-bold text-[#0288d1] tracking-wide mt-0.5">
              {preview ? 'PREVIEW – NOT SAVED' : 'PURCHASE RECORD'}
            </p>
            <p className="text-[11.5px] font-medium text-slate-500">
              {preview ? '[Assigned when saved]' : record.purchase_number}
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Supplier & Purchase Date Box */}
          <div className="rounded-[6px] border border-[#c5d9e8] bg-gradient-to-b from-[#fafdff] to-[#edf5fa] px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shadow-2xs">
            {/* Left side: Supplier & Invoice */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal w-14 shrink-0">Supplier:</span>
                <strong className="text-[13.5px] sm:text-[14px] font-bold text-[#0c315e] leading-none">
                  {record.supplier.name}
                </strong>
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal w-14 shrink-0">Invoice:</span>
                <span className="text-[12.5px] sm:text-[13px] text-slate-700 leading-none">
                  {record.invoice_number || '—'}
                </span>
              </div>
            </div>

            {/* Right side: Divider & Calendar with Purchase Date */}
            <div className="flex items-center">
              <div className="h-8 w-[1px] bg-[#cfdbe6] mx-4 sm:mx-6 shrink-0" />

              <div className="flex items-center gap-3 shrink-0">
                <Calendar3DIcon className="size-7 sm:size-7.5 shrink-0 drop-shadow-2xs" />
                <div className="leading-tight">
                  <span className="block text-[11.5px] sm:text-[12px] text-slate-500 font-normal">Purchase Date:</span>
                  <span className="block text-[13.5px] sm:text-[14px] font-bold text-[#0c315e] tracking-tight">
                    {record.purchase_date}
                  </span>
                  {record.due_date && (
                    <span className="block text-[11px] text-slate-500 font-medium">Due: {record.due_date}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Receiving status */}
          <p className="text-[12.5px] font-bold text-[#0c3761] px-0.5">
            Receiving: <span className="font-semibold text-slate-700">{receivingLabels[record.receiving_mode || 'all']}</span>
          </p>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-[4px] border border-[#9fc1dc] shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-b from-[#ddecfa] to-[#cbe2f7] text-[#0c3761] border-b border-[#9fc1dc] text-[12px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-center">Received</th>
                  <th className="py-2.5 px-3">Intended Use</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-2 text-center">Discount</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2edf5] bg-white">
                {record.totals.lines.map((l, i) => (
                  <tr key={i} className="hover:bg-[#f8fcff] transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-[4px] border border-[#b8d5e8] bg-[#f0f9ff] flex items-center justify-center shrink-0">
                          <Package className="size-4.5 text-[#0288d1]" />
                        </div>
                        <div>
                          <strong className="block font-bold text-[#0c3761] text-[12.5px]">{l.name}</strong>
                          <small className="text-[11px] text-slate-500">{l.code} · {l.unit}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-700">{l.quantity}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-700">{l.received_quantity ?? l.quantity}</td>
                    <td className="py-2.5 px-3 text-slate-700">{intendedUses[l.intended_use || 'sale']}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">{peso(centsValue(l.unit_cost))}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">{l.discount_percent}%</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0c3761]">{peso(l.net_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Middle Row: Payment Info / Notes on Left, Totals Box on Right */}
          <div className="flex flex-col sm:flex-row items-end sm:items-stretch justify-between gap-4 pt-1">
            {/* Left Column: Notes, attachments, and at the bottom: Initial payment */}
            <div className="w-full sm:flex-1 flex flex-col justify-end space-y-2.5 pb-0.5">
              {record.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <strong className="text-[#0c3761]">Notes:</strong> {record.notes}
                </p>
              )}

              {!!record.attachments.length && (
                <div className="space-y-1">
                  <span className="font-bold text-[11.5px] text-[#0c3761]">Attachment:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {record.attachments.map((a) =>
                      preview ? (
                        <span
                          key={a.index}
                          className="inline-block px-2.5 py-0.5 rounded bg-[#e0f6fd] border border-[#9fd0e2] text-xs text-[#0c3761]"
                        >
                          {a.name}
                        </span>
                      ) : (
                        <a
                          key={a.index}
                          href={`${purchasesEndpoint}/${record.id}/attachments/${a.index}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-2.5 py-0.5 rounded bg-[#e0f6fd] hover:bg-[#bae6fd] border border-[#9fd0e2] text-xs text-[#0369a1] font-medium transition"
                        >
                          {a.name}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              )}

              {record.payment.method && (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Bank3DIcon className="size-6 shrink-0 drop-shadow-xs" />
                  <span className="text-[12.5px] text-slate-600">
                    Initial payment:{' '}
                    <strong className="font-bold text-[#155ca2]">{record.payment.method}</strong>
                    {record.payment.reference ? ` · ${record.payment.reference}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Totals Box */}
            <div className="w-full sm:w-[285px] rounded-[6px] border border-[#b8d5e8] bg-gradient-to-b from-[#f9fcff] to-[#f0f6fa] p-3 text-xs space-y-1.5 shadow-2xs shrink-0">
              <div className="flex justify-between">
                <span className="text-slate-600">Total before discount</span>
                <span className="font-mono font-medium text-slate-800">{peso(record.totals.gross_cents)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span className="text-slate-600">Line discounts</span>
                <span className="font-mono font-medium">-{peso(record.totals.discount_cents)}</span>
              </div>
              <div className="border-t border-[#d5e5f2] pt-1 flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-mono font-medium text-slate-800">{peso(record.totals.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-mono font-medium text-slate-800">{peso(record.totals.tax_cents)}</span>
              </div>
              <div className="bg-[#d9ecfa] p-1.5 rounded-[3px] flex justify-between items-center font-bold text-[#0c3761] text-[13px]">
                <span>Total purchase</span>
                <span className="font-mono">{peso(record.total_cents)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span className="text-slate-600">Amount paid</span>
                <span className="font-mono font-bold">{peso(record.paid_cents)}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-semibold">
                <span className="text-slate-600">Amount due</span>
                <span className="font-mono font-bold">{peso(record.due_cents)}</span>
              </div>
            </div>
          </div>

          {/* Full-width Preview Banner below BOTH columns */}
          {preview ? (
            <div className="w-full rounded-[6px] border border-[#a2d2ea] bg-gradient-to-r from-[#e8f5fc] via-[#edf7fd] to-[#e4f3fb] px-4 py-2.5 flex items-center gap-2.5 text-[12px] sm:text-[12.5px] text-[#0277bd] shadow-2xs">
              <div className="size-4.5 rounded-full bg-gradient-to-b from-[#29b6f6] to-[#0288d1] flex items-center justify-center text-white shrink-0 shadow-[0_1px_2px_rgba(2,136,209,0.35)]">
                <span className="font-serif font-bold italic text-[11px] leading-none select-none">i</span>
              </div>
              <span className="italic font-medium">Preview only. No transaction has been saved.</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic px-1">
              Saved purchase record. Supplier invoice and payment evidence are retained separately.
            </div>
          )}

          {/* Delivery form if receiving enabled */}
          {receiving && (
            <form
              className="p-4 space-y-3 border border-[#b8d5e8] bg-[#f8fafc] rounded-lg mt-3"
              onSubmit={(e) => {
                e.preventDefault()
                void receive()
              }}
            >
              <h4 className="font-bold text-xs text-[#0c3761]">Record Delivery</h4>
              {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
              <fieldset disabled={busy || retrying} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Receiving date
                  </label>
                  <input
                    type="date"
                    required
                    min={record.purchase_date}
                    max={today()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
                  />
                </div>
                {outstanding.map((line) => (
                  <div key={line.id}>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                      {line.name} ({line.remaining} outstanding)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={line.remaining}
                      step="0.0001"
                      value={quantities[line.id] || ''}
                      onChange={(e) =>
                        setQuantities({ ...quantities, [line.id]: e.target.value })
                      }
                      className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
                    />
                  </div>
                ))}
              </fieldset>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy || retrying}
                  onClick={() => setReceiving(false)}
                  className="px-3.5 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#087ae6] hover:bg-[#0964c2] text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                  disabled={busy}
                >
                  {busy ? 'Saving…' : retrying ? 'Retry Delivery' : 'Save Delivery'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Window Bottom Shelf with Close and Print buttons */}
        <div className="h-13 w-full border-t border-[#d8e3ed] bg-gradient-to-b from-[#f2f5f8] to-[#e4e9ef] px-5 py-2.5 flex items-center justify-end gap-2.5">
          {!preview && outstanding.length > 0 && !receiving && (
            <button
              type="button"
              className="px-4 py-1.5 rounded-[4px] border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer mr-auto"
              onClick={() => {
                setReceiving(true)
                setError('')
              }}
            >
              Record Delivery
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="min-w-[90px] px-5 py-1.5 rounded-[4px] border border-[#8a8a8a] bg-gradient-to-b from-[#ffffff] via-[#f1f1f1] to-[#e4e4e4] hover:from-[#fcfcfc] hover:to-[#dadada] text-xs font-semibold text-[#111827] shadow-[0_1px_1px_rgba(0,0,0,0.12)] transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-w-[90px] px-5 py-1.5 rounded-[4px] border border-[#1b5fa7] bg-gradient-to-b from-[#2576c9] via-[#1a64b2] to-[#134f90] hover:from-[#3285de] hover:to-[#175ca5] text-xs font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer className="size-3.5 text-white stroke-[2.2]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Thermal Purchase Slip (Visible ONLY upon printing, exact replica of reference image) */}
      <div className="hidden print:block w-[330px] max-w-[330px] mx-auto p-4 bg-white text-black font-mono text-[11.5px] leading-relaxed select-none">
        {/* Header */}
        <div className="text-center pb-1">
          <h1 className="text-[17px] font-black tracking-wide text-black uppercase font-sans">
            {record.company?.name || 'XYZ ENTERPRISE'}
          </h1>
          <h2 className="text-[12.5px] font-bold tracking-wider text-black mt-0.5 font-sans">
            PURCHASE SLIP
          </h2>
          <div className="mt-1.5 flex justify-center">
            <span className="inline-block bg-black text-white text-[10.5px] font-bold px-3 py-0.5 tracking-wider uppercase font-sans">
              {preview ? 'PREVIEW - NOT SAVED' : 'PURCHASE SLIP'}
            </span>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* Transaction Details */}
        <div className="grid grid-cols-[85px_12px_1fr] text-[11.5px] leading-relaxed">
          <span>Date</span>
          <span>:</span>
          <span className="font-sans">{formatReceiptDate(record.purchase_date)}</span>
          <span>Supplier</span>
          <span>:</span>
          <span className="font-bold font-sans">{record.supplier.name}</span>
          <span>Invoice No.</span>
          <span>:</span>
          <span className="font-sans">{record.invoice_number || '—'}</span>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_45px_85px] text-[11px] font-bold uppercase tracking-wider pb-1 border-b border-black font-sans">
          <span>ITEM</span>
          <span className="text-center">QTY</span>
          <span className="text-right">AMOUNT</span>
        </div>

        {/* Items List */}
        <div className="divide-y divide-transparent">
          {record.totals.lines.map((line, i) => (
            <div key={i} className="pt-2">
              <div className="grid grid-cols-[1fr_45px_85px] text-[11.5px] font-bold font-sans">
                <span className="truncate pr-1">{line.name}</span>
                <span className="text-center">{line.quantity}</span>
                <span className="text-right font-mono font-bold">{peso(line.net_cents)}</span>
              </div>
              <div className="text-[10px] text-neutral-800 font-sans">
                {line.code} {line.unit ? `/ ${line.unit}` : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* Subtotals & Taxes */}
        <div className="grid grid-cols-[95px_12px_1fr] text-[11.5px] leading-relaxed">
          <span>Subtotal</span>
          <span>:</span>
          <span className="text-right font-mono">{peso(record.totals.gross_cents)}</span>
          {record.totals.discount_cents > 0 && (
            <>
              <span>Line Discounts</span>
              <span>:</span>
              <span className="text-right font-mono">-{peso(record.totals.discount_cents)}</span>
            </>
          )}
          <span>VAT (12%)</span>
          <span>:</span>
          <span className="text-right font-mono">{peso(record.totals.tax_cents)}</span>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* TOTAL PURCHASE Highlighted Bar */}
        <div className="bg-[#e5e5e5] px-2 py-1.5 flex items-center justify-between font-black font-sans my-1 text-black">
          <span className="text-[12.5px] font-extrabold tracking-tight">TOTAL PURCHASE :</span>
          <span className="text-[15px] font-mono font-black">{peso(record.total_cents)}</span>
        </div>

        {/* Amount Paid & Due */}
        <div className="grid grid-cols-[95px_12px_1fr] text-[11.5px] leading-relaxed pt-1.5">
          <span>Amount Paid</span>
          <span>:</span>
          <span className="text-right font-mono font-bold">{peso(record.paid_cents)}</span>
          <span>Amount Due</span>
          <span>:</span>
          <span className="text-right font-mono font-bold">{peso(record.due_cents)}</span>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* Payment & Receiving Details */}
        <div className="grid grid-cols-[85px_12px_1fr] text-[11.5px] leading-relaxed font-sans">
          <span>Payment</span>
          <span>:</span>
          <span>{record.payment.method || 'Pay Later'}{record.payment.reference ? ` (${record.payment.reference})` : ''}</span>
          <span>Receiving</span>
          <span>:</span>
          <span>{receivingLabels[record.receiving_mode || 'all']}</span>
        </div>

        {/* Dashed Separator */}
        <div className="border-t border-dashed border-black my-2.5" />

        {/* Footer Note */}
        <p className="text-[10px] italic text-center pt-1 font-sans text-neutral-800">
          {preview
            ? 'Preview only — Not an official receipt.'
            : 'Thank you for your business!'}
        </p>
      </div>
    </PurchaseDialog>
  )
}

function formatReceiptDate(iso: string) {
  try {
    const parts = iso.split('-').map(Number)
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const date = new Date(parts[0], parts[1] - 1, parts[2])
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  } catch {
    // fallback
  }
  return iso
}

function centsValue(value: string) {
  return Math.round(Number(value) * 100)
}
