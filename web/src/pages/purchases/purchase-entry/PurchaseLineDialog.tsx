import { useState } from 'react'
import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
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
    <PaymentDialog
      title="Line Item Details"
      onClose={onClose}
      className="purchase-dialog pe-dialog pe-line-dialog"
    >
      <form
        className="pe-line-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (product) onSave(item)
        }}
      >
        <label>
          Item ID
          {editing ? (
            <input value={product?.code || ''} readOnly />
          ) : (
            <select
              required
              value={item.product_id}
              onChange={(event) =>
                setItem(
                  fromProduct(
                    data.products.find((p) => p.id === event.target.value),
                  ),
                )
              }
            >
              <option value="">Choose a catalog item</option>
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          Item Name
          <input value={product?.name || ''} readOnly />
        </label>
        <div className="pe-line-fields">
          <label>
            Quantity
            <input
              type="number"
              required
              min="0.0001"
              max="10000"
              step="0.0001"
              disabled={useOnly}
              value={item.quantity}
              onChange={(e) => patch({ quantity: e.target.value })}
            />
          </label>
          <label>
            Unit
            <input value={product?.unit || ''} readOnly />
          </label>
          <label>
            Unit Cost
            <input
              type="number"
              required
              min="0"
              max="99999999.99"
              step="0.01"
              disabled={useOnly}
              value={item.unit_cost}
              onChange={(e) => patch({ unit_cost: e.target.value })}
            />
          </label>
          <label>
            Discount (%)
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              disabled={useOnly}
              value={item.discount_percent}
              onChange={(e) => patch({ discount_percent: e.target.value })}
            />
          </label>
          <label>
            Tax
            <select
              disabled={useOnly}
              value={item.tax_id || ''}
              onChange={(e) => patch({ tax_id: e.target.value || null })}
            >
              <option value="">None</option>
              {data.taxes.map((tax) => (
                <option key={tax.id} value={tax.id}>
                  {tax.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input value={peso(amount)} readOnly />
          </label>
        </div>
        {partial && !useOnly && (
          <label>
            Qty Received
            <input
              type="number"
              required
              min="0"
              max={item.quantity}
              step="0.0001"
              value={item.received_quantity ?? '0'}
              onChange={(e) => patch({ received_quantity: e.target.value })}
            />
          </label>
        )}
        <label>
          Intended Use
          <select
            value={item.intended_use || 'sale'}
            onChange={(e) =>
              patch({ intended_use: e.target.value as IntendedUse })
            }
          >
            {Object.entries(intendedUses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="collection-dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={!product}>
            {editing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
        {onRemove && (
          <button type="button" className="pe-remove-link" onClick={onRemove}>
            Remove Line Item
          </button>
        )}
      </form>
    </PaymentDialog>
  )
}
