import { useState } from 'react'
import { X } from 'lucide-react'
import cartboxIcon from '../../../assets/svg/cartbox.svg'
import { Select2 } from '../../../components/ui/Select2'
import { PurchaseDialog } from './PurchaseDialog'
import {
  calculate,
  intendedUses,
  peso,
  type IntendedUse,
  type Product,
  type PurchaseBootstrap,
  type PurchaseItem,
} from './api'

export function PurchaseLineDialog({
  data,
  initial,
  editing,
  useOnly,
  partial,
  onSave,
  onClose,
  onRemove,
}: {
  data: PurchaseBootstrap
  initial?: PurchaseItem
  editing: boolean
  useOnly: boolean
  partial: boolean
  onSave: (line: PurchaseItem) => void
  onClose: () => void
  onRemove?: () => void
}) {
  const fromProduct = (product?: Product): PurchaseItem => ({
    product_id: product?.id || '',
    quantity: '1',
    unit_cost: product?.cost || '0',
    discount_percent: '0',
    tax_id: product?.tax_id || null,
    intended_use: 'sale',
    received_quantity: '0',
  })
  const [item, setItem] = useState(() => initial || fromProduct())
  const product = data.products.find((p) => p.id === item.product_id)
  const amount = calculate([item], data).lines[0].net_cents
  const patch = (values: Partial<PurchaseItem>) =>
    setItem((previous) => ({ ...previous, ...values }))

  return (
    <PurchaseDialog
      title="Line Item Details"
      onClose={onClose}
      hideHeader
      className="w-[min(430px,calc(100vw-24px))] bg-[#e0f6fd] border-2 border-[#5b96b5] rounded-xl shadow-2xl"
    >
      <form
        className="p-6 sm:p-7 space-y-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          if (product) onSave(item)
        }}
      >
        {/* Seamless Header with cartbox icon and close button */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <img
              src={cartboxIcon}
              alt=""
              className="w-7 h-7 max-w-[28px] max-h-[28px] object-contain shrink-0"
            />
            <h2 className="text-lg font-bold text-[#0a335c] tracking-tight">
              Line Item Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Row 1: Item ID */}
        <div>
          <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
            Item ID
          </label>
          {editing ? (
            <input
              value={product?.code || ''}
              readOnly
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-medium focus:outline-none"
            />
          ) : (
            <Select2
              id="line-item-product"
              value={item.product_id}
              onChange={(productId) =>
                setItem(
                  fromProduct(data.products.find((p) => p.id === productId)),
                )
              }
              placeholder="Choose a catalog item"
              searchPlaceholder="Search catalog item..."
              triggerClassName="h-10.5 rounded-[6px] border-[#0088cc] text-[13.5px] bg-white font-normal text-slate-800"
              options={[
                { value: '', label: 'Choose a catalog item' },
                ...data.products.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                })),
              ]}
            />
          )}
        </div>

        {/* Row 2: Item Name */}
        <div>
          <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
            Item Name
          </label>
          <input
            value={product?.name || ''}
            readOnly
            placeholder="Printer - LaserJet Pro"
            className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-medium focus:outline-none"
          />
        </div>

        {/* Row 3: Quantity & Unit */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              required
              min="0.0001"
              max="10000"
              step="0.0001"
              disabled={useOnly}
              value={item.quantity}
              onChange={(e) => patch({ quantity: e.target.value })}
              className="w-28 sm:w-32 h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-mono focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Unit
            </label>
            <input
              value={product?.unit || 'unit'}
              readOnly
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-[#d9eff8] px-4 text-sm text-[#48718e] font-medium cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        {/* Row 4: Unit Cost & Discount (%) */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Unit Cost
            </label>
            <input
              type="number"
              required
              min="0"
              max="99999999.99"
              step="0.01"
              disabled={useOnly}
              value={item.unit_cost}
              onChange={(e) => patch({ unit_cost: e.target.value })}
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-mono focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Discount (%)
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              disabled={useOnly}
              value={item.discount_percent}
              onChange={(e) => patch({ discount_percent: e.target.value })}
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-mono focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            />
          </div>
        </div>

        {/* Row 5: Tax & Amount */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Tax
            </label>
            <select
              disabled={useOnly}
              value={item.tax_id || ''}
              onChange={(e) => patch({ tax_id: e.target.value || null })}
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-[#d9eff8] px-3.5 text-sm text-slate-800 focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            >
              <option value="">None</option>
              {data.taxes.map((tax) => (
                <option key={tax.id} value={tax.id}>
                  {tax.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Amount
            </label>
            <input
              value={peso(amount).replace('₱', '').trim()}
              readOnly
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-[#d9eff8] px-4 text-sm text-slate-800 font-mono font-medium cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        {/* Qty Received (only when receiving is partial) */}
        {partial && !useOnly && (
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Qty Received
            </label>
            <input
              type="number"
              required
              min="0"
              max={item.quantity}
              step="0.0001"
              value={item.received_quantity ?? '0'}
              onChange={(e) => patch({ received_quantity: e.target.value })}
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-4 text-sm text-slate-800 font-mono focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            />
          </div>
        )}

        {/* Intended Use (only shown when explicitly opened via "Change Intended Use") */}
        {useOnly && (
          <div>
            <label className="block text-xs font-semibold text-[#48718e] mb-1.5">
              Intended Use
            </label>
            <select
              value={item.intended_use || 'sale'}
              onChange={(e) =>
                patch({ intended_use: e.target.value as IntendedUse })
              }
              className="w-full h-11 rounded-lg border border-[#5b96b5] bg-white px-3.5 text-sm text-slate-800 focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2]"
            >
              {Object.entries(intendedUses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons & Link */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[120px] h-11 px-7 rounded-lg border border-[#94a3b8] bg-[#f8fafc] hover:bg-white text-sm font-semibold text-[#0f172a] shadow-xs transition cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!product}
              className="min-w-[135px] h-11 px-7 rounded-lg bg-[#0070d2] hover:bg-[#005fb2] text-sm font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {editing ? 'Update Item' : '+ Add Item'}
            </button>
          </div>

          {/* Remove Line Item */}
          {onRemove && (
            <div className="pt-2 text-left">
              <button
                type="button"
                className="text-xs font-semibold text-[#1e293b] hover:text-rose-600 transition cursor-pointer"
                onClick={onRemove}
              >
                [ Remove Line Item ]
              </button>
            </div>
          )}
        </div>
      </form>
    </PurchaseDialog>
  )
}
