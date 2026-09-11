import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  QrCode,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react'
import cartboxIcon from '../../../../assets/svg/cartbox.svg'
import searchIcon from '../../../../assets/svg/search.svg'
import { AddItemModal } from './AddItemModal'
import type { SalesLineItem } from '../types'

interface ItemsServicesCardProps {
  items: SalesLineItem[]
  onAddItem: (item: SalesLineItem) => void
  onUpdateItem: (id: string, updates: Partial<SalesLineItem>) => void
  onDeleteItem: (id: string) => void
}

export const CATALOG_PRODUCTS: Omit<SalesLineItem, 'id' | 'qty' | 'discountPercent' | 'amount'>[] = [
  { code: 'PRD-1001', name: 'Printer - LaserJet Pro', unit: 'unit', unitPrice: 8500.0, taxType: 'VAT' },
  { code: 'PRD-2003', name: 'Toner Cartridge - Bk', unit: 'pc', unitPrice: 2500.0, taxType: 'VAT' },
  { code: 'PRD-2004', name: 'Toner Cartridge - CMY', unit: 'pc', unitPrice: 3000.0, taxType: 'VAT' },
  { code: 'PRD-3001', name: 'Bond Paper - A4', unit: 'ream', unitPrice: 300.0, taxType: 'VAT' },
  { code: 'PRD-3002', name: 'Bond Paper - Legal', unit: 'ream', unitPrice: 350.0, taxType: 'VAT' },
  { code: 'SVC-1001', name: 'Printer Setup & Installation', unit: 'service', unitPrice: 1200.0, taxType: 'VAT' },
  { code: 'PRD-4001', name: 'Receipt Thermal Paper 80mm', unit: 'roll', unitPrice: 75.0, taxType: 'VAT' },
  { code: 'PRD-5001', name: 'Wireless Barcode Scanner', unit: 'unit', unitPrice: 2800.0, taxType: 'VAT' },
  { code: 'PRD-6001', name: 'Heavy Duty Cash Drawer RJ11', unit: 'unit', unitPrice: 3200.0, taxType: 'VAT' },
  { code: 'SVC-2001', name: 'Hardware Maintenance Service', unit: 'service', unitPrice: 1800.0, taxType: 'VAT' },
]

export function ItemsServicesCard({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: ItemsServicesCardProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  const filteredCatalog = CATALOG_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectProduct = (product: typeof CATALOG_PRODUCTS[0]) => {
    const existing = items.find((i) => i.code === product.code)
    if (existing) {
      const nextQty = existing.qty + 1
      const raw = nextQty * existing.unitPrice
      const discounted = raw * (1 - (existing.discountPercent || 0) / 100)
      onUpdateItem(existing.id, {
        qty: nextQty,
        amount: discounted,
      })
    } else {
      const newItem: SalesLineItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        code: product.code,
        name: product.name,
        qty: 1,
        unit: product.unit,
        unitPrice: product.unitPrice,
        discountPercent: 0,
        taxType: product.taxType,
        amount: product.unitPrice,
      }
      onAddItem(newItem)
    }
    setSearchQuery('')
    setShowSearchDropdown(false)
  }

  const handleQtyChange = (id: string, qtyStr: string) => {
    const qty = Math.max(1, parseFloat(qtyStr) || 1)
    const item = items.find((i) => i.id === id)
    if (!item) return
    const raw = qty * item.unitPrice
    const disc = raw * ((item.discountPercent || 0) / 100)
    onUpdateItem(id, {
      qty,
      amount: raw - disc,
    })
  }

  const handleUnitPriceChange = (id: string, priceStr: string) => {
    const unitPrice = Math.max(0, parseFloat(priceStr) || 0)
    const item = items.find((i) => i.id === id)
    if (!item) return
    const raw = item.qty * unitPrice
    const disc = raw * ((item.discountPercent || 0) / 100)
    onUpdateItem(id, {
      unitPrice,
      amount: raw - disc,
    })
  }

  const handleDiscChange = (id: string, discStr: string) => {
    const discountPercent = Math.min(100, Math.max(0, parseFloat(discStr) || 0))
    const item = items.find((i) => i.id === id)
    if (!item) return
    const raw = item.qty * item.unitPrice
    const disc = raw * (discountPercent / 100)
    onUpdateItem(id, {
      discountPercent,
      amount: raw - disc,
    })
  }

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode.trim()) return

    const matched = CATALOG_PRODUCTS.find(
      (p) => p.code.toLowerCase() === scannedCode.trim().toLowerCase()
    )

    if (matched) {
      handleSelectProduct(matched)
      setScanMessage(`Added "${matched.name}" successfully!`)
      setScannedCode('')
      setTimeout(() => setScanMessage(null), 2500)
    } else {
      setScanMessage(`Product with barcode "${scannedCode}" not found.`)
      setTimeout(() => setScanMessage(null), 3000)
    }
  }

  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <img src={cartboxIcon} alt="" className="size-7 shrink-0 object-contain" />
          <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Items / Services</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Plus className="size-3.5 text-[#0288d1]" />
            <span>Add Item</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <QrCode className="size-3.5 text-slate-500" />
            <span>Scan</span>
          </button>
        </div>
      </div>

      {/* Items Table with Full Grid Lines - Limited to 4 rows with vertical overflow scroll */}
      <div className="max-h-[240px] overflow-y-auto overflow-x-auto rounded-md border border-[#c8e8f8] bg-white [scrollbar-width:thin] sales-custom-scroll">
        <table className="w-full border-collapse text-left text-xs text-slate-700">
          <thead className="sticky top-0 z-10 bg-[#f2f9fd] shadow-[0_1px_0_0_#c8e8f8]">
            <tr className="border-b border-[#c8e8f8] bg-[#f2f9fd] text-[12px] font-medium text-slate-600">
              <th className="py-2.5 px-2 w-10 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">#</th>
              <th className="py-2.5 px-3 min-w-[200px] border-r border-[#c8e8f8] bg-[#f2f9fd]">Items / Services</th>
              <th className="py-2.5 px-2 w-14 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Qty</th>
              <th className="py-2.5 px-2 w-16 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Unit</th>
              <th className="py-2.5 px-2 w-24 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Unit Price</th>
              <th className="py-2.5 px-2 w-20 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Disc %</th>
              <th className="py-2.5 px-2 w-16 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Tax</th>
              <th className="py-2.5 px-3 w-28 text-center border-r border-[#c8e8f8] bg-[#f2f9fd]">Amount</th>
              <th className="py-2.5 px-2 w-10 text-center bg-[#f2f9fd]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[#c8e8f8] last:border-b-0 hover:bg-sky-50/30 transition-colors">
                {/* # */}
                <td className="py-3 px-2 text-center text-slate-400 text-xs font-medium border-r border-[#c8e8f8]">
                  {idx + 1}
                </td>

                {/* Items / Services */}
                <td className="py-3 px-3 border-r border-[#c8e8f8]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-slate-400 leading-tight">{item.code}</span>
                    <span className="text-xs sm:text-[13.5px] font-bold text-[#134c68] leading-snug">{item.name}</span>
                  </div>
                </td>

                {/* Qty */}
                <td className="py-3 px-1 text-center border-r border-[#c8e8f8]">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                    className="w-full text-center text-xs font-normal text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#0288d1] rounded py-0.5 outline-none"
                  />
                </td>

                {/* Unit */}
                <td className="py-3 px-2 text-center text-slate-500 text-xs border-r border-[#c8e8f8]">
                  {item.unit}
                </td>

                {/* Unit Price */}
                <td className="py-3 px-2 text-center font-normal text-slate-600 text-xs border-r border-[#c8e8f8]">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                    className="w-full text-center text-xs font-normal text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#0288d1] rounded py-0.5 outline-none"
                  />
                </td>

                {/* Disc % */}
                <td className="py-3 px-2 text-center font-normal text-slate-600 text-xs border-r border-[#c8e8f8]">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={item.discountPercent}
                    onChange={(e) => handleDiscChange(item.id, e.target.value)}
                    className="w-full text-center text-xs font-normal text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#0288d1] rounded py-0.5 outline-none"
                  />
                </td>

                {/* Tax */}
                <td className="py-3 px-2 text-center text-slate-500 text-xs border-r border-[#c8e8f8]">
                  {item.taxType}
                </td>

                {/* Amount */}
                <td className="py-3 px-3 text-center font-bold text-[#134c68] text-xs sm:text-[13.5px] border-r border-[#c8e8f8]">
                  {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>

                {/* Delete action */}
                <td className="py-3 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="rounded p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer inline-flex items-center justify-center"
                    title="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="py-9 px-4 text-center bg-white">
                  <div className="flex flex-col items-center justify-center space-y-2.5 max-w-sm mx-auto">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef7fc] border border-[#c8e8f8]">
                      <img src={cartboxIcon} alt="" className="size-6 object-contain opacity-75" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#134c68]">No items or services added yet</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Click <strong className="text-slate-600 font-semibold">+ Add Item</strong> above, use the search bar below, or scan a barcode to add products.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0288d1] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0277bd] active:scale-98 transition cursor-pointer mt-1"
                    >
                      <Plus className="size-3.5" />
                      <span>Add First Item</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Search Bar */}
      <div className="relative pt-1">
        <div className="relative flex items-center">
          <img
            src={searchIcon}
            alt=""
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 object-contain pointer-events-none select-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchDropdown(true)
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search or enter an item, product, or service..."
            className="w-full rounded-full border-[1.5px] border-[#63c4ed] bg-white pl-11 pr-4 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 focus:outline-none transition shadow-2xs"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {showSearchDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSearchDropdown(false)}
            />
            <div className="absolute left-0 right-0 bottom-full mb-1 max-h-56 overflow-y-auto rounded-lg border border-[#63c4ed] bg-white py-1 shadow-xl z-20 sales-custom-scroll">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Products &amp; Services Catalog</span>
                <Sparkles className="size-3 text-sky-500" />
              </div>
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map((product) => (
                  <button
                    key={product.code}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-sky-50 transition flex items-center justify-between cursor-pointer border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {product.code} • Unit: {product.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0288d1]">
                        ₱{product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400">{product.taxType}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-slate-500 text-center">
                  No matching item found in catalog
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md transition-all duration-200"
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowScanModal(false)
            }}
          >
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-[#63c4ed]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="size-5 text-[#0288d1]" />
                  <h3 className="text-sm font-bold text-[#134c68]">Scan Barcode / QR</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleScanSubmit} className="py-4 space-y-3">
                <div className="rounded-lg bg-sky-50/50 p-3 border border-dashed border-[#63c4ed] text-center">
                  <QrCode className="size-12 mx-auto text-sky-500 mb-2 animate-pulse" />
                  <p className="text-xs font-medium text-slate-700">Position barcode scanner or type code below</p>
                  <p className="text-[11px] text-slate-400">e.g. PRD-1001, PRD-2003, PRD-3001</p>
                </div>

                <div>
                  <input
                    type="text"
                    autoFocus
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Enter or scan SKU / Barcode..."
                    className="w-full rounded-lg border-[1.5px] border-[#63c4ed] bg-white px-3 py-2 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20 text-center font-mono font-bold text-sm tracking-wider"
                  />
                </div>

                {scanMessage && (
                  <div
                    className={`rounded p-2 text-xs text-center font-medium ${
                      scanMessage.includes('successfully')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {scanMessage}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#0288d1] py-2 text-xs font-bold text-white hover:bg-[#0277bd] transition cursor-pointer"
                  >
                    Add Scanned Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSelectItem={(product) => {
            handleSelectProduct(product)
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}
