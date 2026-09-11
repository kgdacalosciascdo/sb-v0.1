import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { SalesLineItem } from '../types'

export const SAMPLE_PRODUCTS: Omit<SalesLineItem, 'id' | 'qty' | 'discountPercent' | 'amount'>[] = [
  { code: 'PRD-1001', name: 'Printer - LaserJet Pro', unit: 'unit', unitPrice: 8500.0, taxType: 'VAT' },
  { code: 'PRD-2003', name: 'Toner Cartridge - Bk', unit: 'pc', unitPrice: 2500.0, taxType: 'VAT' },
  { code: 'PRD-2004', name: 'Toner Cartridge - CMY', unit: 'pc', unitPrice: 3000.0, taxType: 'VAT' },
  { code: 'PRD-3001', name: 'Bond Paper - A4', unit: 'ream', unitPrice: 300.0, taxType: 'VAT' },
  { code: 'PRD-3002', name: 'Bond Paper - Legal', unit: 'ream', unitPrice: 350.0, taxType: 'VAT' },
  { code: 'SVC-1001', name: 'Printer Setup & Installation', unit: 'service', unitPrice: 1200.0, taxType: 'VAT' },
]

interface AddItemModalProps {
  onClose: () => void
  onSelectItem: (product: typeof SAMPLE_PRODUCTS[0]) => void
}

export function AddItemModal({ onClose, onSelectItem }: AddItemModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = SAMPLE_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md transition-all duration-200"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal Dialog Card */}
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-[17px] font-bold text-[#0c3761] tracking-tight">
            Add Item / Service
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Field */}
        <div className="pt-2 pb-4">
          <label htmlFor="productSearch" className="block text-[11.5px] font-medium text-slate-500 mb-1.5">
            Search by name or product code
          </label>
          <input
            id="productSearch"
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Try toner or PRD-1001"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20"
          />
        </div>

        {/* Product Items List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 pr-1 sales-custom-scroll">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.code}
                className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
              >
                {/* Left: Product Name & Code */}
                <div>
                  <h3 className="text-[14px] font-bold text-[#0c3761] leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.code} · {product.unit}
                  </p>
                </div>

                {/* Right: Add Price Button */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectItem(product)
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-sky-50 hover:border-[#0288d1] hover:text-[#0288d1] transition cursor-pointer shrink-0"
                >
                  <span>+</span>
                  <span>₱{product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No products found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-100 mt-2">
          <p className="text-[11px] text-slate-400">
            Prices exclude VAT. Each selection adds a separate editable line.
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
