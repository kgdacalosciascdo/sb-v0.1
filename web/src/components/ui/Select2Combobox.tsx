import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

export interface Select2Option {
  value: string
  label: string
  sublabel?: string
  badge?: string
}

interface Select2ComboboxProps {
  id?: string
  value: string
  options: (string | Select2Option)[]
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
  clearable?: boolean
  className?: string
  searchPlaceholder?: string
  required?: boolean
}

export function Select2Combobox({
  id,
  value,
  options,
  placeholder = 'Select an option...',
  onChange,
  disabled = false,
  clearable = false,
  className = '',
  searchPlaceholder = 'Search...',
}: Select2ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Normalize options to Select2Option format
  const normalizedOptions: Select2Option[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  const filteredOptions = normalizedOptions.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Box (Select2 look) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setSearchTerm('')
          }
        }}
        className={`w-full flex items-center justify-between rounded-md border-[1.5px] bg-white px-3 py-2 text-xs transition-all text-left outline-none ${disabled
          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
          : isOpen
            ? 'border-[#0288d1] ring-2 ring-[#0288d1]/20'
            : 'border-[#63c4ed] hover:border-[#38b4e7] cursor-pointer'
          }`}
      >
        <span className={`truncate font-medium ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Clear"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0288d1]' : ''
              }`}
          />
        </div>
      </button>

      {/* Select2 Dropdown Overlay with Top Search Field */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-lg border border-[#63c4ed] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Box Header */}
          <div className="p-2 border-b border-slate-100 bg-[#f8fbfe]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-[#8fd7f5] bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto py-1 sales-custom-scroll">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition cursor-pointer ${isSelected
                      ? 'bg-[#e3f4fd] text-[#0288d1] font-semibold'
                      : 'text-slate-700 hover:bg-sky-50/70 hover:text-slate-900'
                      }`}
                  >
                    <div className="flex flex-col pr-2">
                      <span className="font-medium leading-tight">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-slate-400 mt-0.5">{opt.sublabel}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="size-4 text-[#0288d1]" />}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
