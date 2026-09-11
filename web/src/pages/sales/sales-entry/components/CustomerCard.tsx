import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import humanIcon from '../../../../assets/svg/human.svg'
import type { Customer } from '../types'

interface CustomerCardProps {
  selectedCustomer: Customer | null
  customers: Customer[]
  onSelectCustomer: (customer: Customer | null) => void
}

export function CustomerCard({
  selectedCustomer,
  customers,
  onSelectCustomer,
}: CustomerCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <img src={humanIcon} alt="" className="size-7 shrink-0 object-contain" />
        <h2 className="text-[15px] font-bold text-[#0c3761] tracking-tight">Customer</h2>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Selector */}
        <div className="md:col-span-5 relative">
          <label htmlFor="customerSelect" className="block text-[11.5px] font-medium text-[#5c7a94] mb-1">
            Customer <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="customerSelect"
              type="text"
              value={selectedCustomer ? selectedCustomer.name : searchTerm}
              placeholder="Select customer..."
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (selectedCustomer) onSelectCustomer(null)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-md border-[1.5px] border-[#63c4ed] bg-white px-3 py-2 text-xs text-slate-700 outline-none pr-8 focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1]"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {selectedCustomer ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomer(null)
                    setSearchTerm('')
                  }}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Clear selection"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <ChevronDown className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#63c4ed] bg-white py-1 shadow-lg z-20 sales-custom-scroll">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => {
                        onSelectCustomer(cust)
                        setSearchTerm('')
                        setShowDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-sky-50 transition flex flex-col cursor-pointer border-b border-slate-100 last:border-0"
                    >
                      <span className="font-semibold text-slate-900">{cust.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {cust.code} • Terms: {cust.defaultTerms}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-500 text-center">
                    No matching customer found
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Customer Details (Directly on Blue Panel) */}
        <div className="md:col-span-7 flex flex-col justify-between h-full pl-0 md:pl-2 text-xs">
          {selectedCustomer ? (
            <>
              <div>
                <h3 className="text-[16px] font-bold text-[#0c3761] leading-tight">
                  {selectedCustomer.name}
                </h3>
                <p className="text-[11.5px] font-medium text-[#5c7a94] mt-0.5 mb-2">
                  {selectedCustomer.code}
                </p>

                <table className="text-[11.5px] border-separate border-spacing-y-1">
                  <tbody>
                    <tr>
                      <td className="pr-6 text-[#5c7a94] font-medium whitespace-nowrap">Default Terms:</td>
                      <td className="text-[#0c3761] font-semibold">{selectedCustomer.defaultTerms}</td>
                    </tr>
                    <tr>
                      <td className="pr-6 text-[#5c7a94] font-medium whitespace-nowrap">Credit Limit:</td>
                      <td className="text-[#0c3761] font-semibold">
                        ₱{selectedCustomer.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-6 text-[#5c7a94] font-medium whitespace-nowrap">Available Credit:</td>
                      <td className="text-[#0c3761] font-semibold">
                        ₱{selectedCustomer.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="text-[11px] font-medium text-[#0288d1] hover:underline cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400 text-center">
              <p className="text-xs font-semibold">Walk-in Retail Customer</p>
              <p className="text-[11px] text-slate-400">Due on receipt / Cash sale</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-[#63c4ed]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#134c68]">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2.5 py-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Credit Limit</span>
                <span className="font-bold text-slate-800">
                  ₱{selectedCustomer.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Available Credit</span>
                <span className="font-bold text-emerald-600">
                  ₱{selectedCustomer.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Default Terms</span>
                <span className="font-medium text-slate-800">{selectedCustomer.defaultTerms}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Contact Person</span>
                <span className="font-medium text-slate-800">{selectedCustomer.contactPerson || 'Roberto Gomez'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-slate-800">{selectedCustomer.phone || '+63 (088) 856-7890'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Address</span>
                <span className="font-medium text-slate-800 text-right">{selectedCustomer.address || 'Cagayan de Oro City'}</span>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-lg bg-[#0288d1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0277bd] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
