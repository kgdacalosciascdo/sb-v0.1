import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

type DirectoryTab = 'businesses' | 'products' | 'services'

const SAMPLE_CATEGORIES = [
  'Food & Beverages',
  'Packaging & Supplies',
  'Retail & Wholesale',
  'Logistics & Courier',
  'Professional Services',
  'IT & Creative',
  'Healthcare & Wellness',
]

export function BusinessDirectoryCard() {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('businesses')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Perform directory search
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#5ec5f5] bg-[#a6e5fc] p-4 shadow-xs transition hover:shadow-sm">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Search aria-hidden="true" className="size-4 text-[#00a2e8]" />
          <h2 className="text-[14px] font-bold text-[#084869]">Business Directory</h2>
        </div>
        <p className="mt-0.5 text-xs text-[#0d557a]">
          Find businesses, products, and services in the SimpleBIZ community.
        </p>
      </div>

      {/* Tabs */}
      <div className="my-2.5 flex items-center justify-center gap-4 text-xs font-semibold text-[#0b4e72] sm:gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('businesses')}
          className={`transition ${
            activeTab === 'businesses'
              ? 'text-[#00a2e8] underline underline-offset-4'
              : 'text-[#0b4e72] hover:text-[#084869]'
          }`}
        >
          Businesses
        </button>
        <span className="text-[#64caf9]">|</span>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`transition ${
            activeTab === 'products'
              ? 'text-[#00a2e8] underline underline-offset-4'
              : 'text-[#0b4e72] hover:text-[#084869]'
          }`}
        >
          Products
        </button>
        <span className="text-[#64caf9]">|</span>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`transition ${
            activeTab === 'services'
              ? 'text-[#00a2e8] underline underline-offset-4'
              : 'text-[#0b4e72] hover:text-[#084869]'
          }`}
        >
          Services
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mx-auto w-full max-w-md">
        <div className="flex items-center rounded-full border border-[#7ad5fa] bg-white p-1 pl-4 pr-1.5 shadow-xs transition focus-within:border-[#00a2e8] focus-within:ring-2 focus-within:ring-[#00a2e8]/20">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedCategory
                ? `Search in ${selectedCategory}...`
                : `Search ${activeTab}...`
            }
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-[#00a2e8] px-4 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0288d1] active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      {/* Categories Toggle */}
      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => setShowCategories((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b4e72] transition hover:text-[#084869]"
        >
          <span>Categories</span>
          <ChevronDown
            className={`size-3 transition-transform duration-200 ${
              showCategories ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showCategories && (
          <div className="mt-2 flex flex-wrap justify-center gap-1 rounded-lg border border-[#7ad5fa] bg-white/80 p-2 backdrop-blur-xs">
            {SAMPLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat ? null : cat))
                }
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-[#00a2e8] text-white'
                    : 'bg-white text-[#0b4e72] hover:bg-sky-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
