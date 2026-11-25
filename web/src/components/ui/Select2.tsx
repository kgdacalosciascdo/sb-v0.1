import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface Select2Option {
  value: string
  label: string
  sublabel?: string
  badge?: string
  disabled?: boolean
}

export interface Select2Props {
  id?: string
  name?: string
  value: string
  options: (string | Select2Option)[]
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  clearable?: boolean
  required?: boolean
  error?: boolean
  className?: string
  triggerClassName?: string
  dropdownClassName?: string
  renderOption?: (
    option: Select2Option,
    isSelected: boolean,
    isHighlighted: boolean,
  ) => ReactNode
  autoFocusSearch?: boolean
}

export function Select2({
  id,
  name,
  value,
  options,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search catalog item...',
  disabled = false,
  clearable = false,
  error = false,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  renderOption,
  autoFocusSearch = true,
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Normalize all options into Select2Option shape
  const normalizedOptions: Select2Option[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Filter based on search term
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const matchLabel = opt.label.toLowerCase().includes(term)
    const matchSublabel = opt.sublabel
      ? opt.sublabel.toLowerCase().includes(term)
      : false
    const matchValue = opt.value.toLowerCase().includes(term)
    return matchLabel || matchSublabel || matchValue
  })

  // Open / Close helper
  const openDropdown = useCallback(() => {
    if (disabled) return
    setIsOpen(true)
    setSearchTerm('')
    const selectedIdx = filteredOptions.findIndex((opt) => opt.value === value)
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0)
  }, [disabled, filteredOptions, value])

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }, [])

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen && autoFocusSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoFocusSearch])

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeDropdown])

  // Keep highlighted option in view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll<HTMLButtonElement>('[data-select2-item]')
      const target = items[highlightedIndex]
      if (target) {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Reset highlighted index when filtered items change
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex((prev) => {
        if (filteredOptions.length === 0) return -1
        if (prev < 0 || prev >= filteredOptions.length) return 0
        return prev
      })
    }
  }, [filteredOptions.length, isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openDropdown()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        )
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        )
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          const chosen = filteredOptions[highlightedIndex]
          if (!chosen.disabled) {
            onChange(chosen.value)
            closeDropdown()
            triggerRef.current?.focus()
          }
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        closeDropdown()
        triggerRef.current?.focus()
        break
      }
      case 'Tab': {
        closeDropdown()
        break
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for standard forms */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Select2 Trigger Box */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        className={`w-full flex items-center justify-between rounded-[6px] border bg-white px-3.5 py-2.5 text-[13px] text-slate-800 transition-all outline-none text-left cursor-pointer ${
          disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : error
              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : isOpen
                ? 'border-[#0088cc] shadow-[0_0_0_1px_#0088cc]'
                : 'border-[#5b96b5] hover:border-[#0088cc]'
        } ${triggerClassName}`}
      >
        <span
          className={`truncate ${
            selectedOption && selectedOption.value !== ''
              ? 'text-slate-800 font-normal'
              : 'text-slate-700 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {clearable && selectedOption && selectedOption.value !== '' && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-4 text-slate-700 transition-transform duration-150 stroke-[2.5] ${
              isOpen ? 'rotate-180 text-[#0088cc]' : ''
            }`}
          />
        </div>
      </button>

      {/* Select2 Dropdown Overlay with Top Search Field */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-0.5 z-50 overflow-hidden rounded-[6px] border border-[#a0c4dc] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-in fade-in-50 zoom-in-98 duration-100 ${dropdownClassName}`}
        >
          {/* Search Box inside dropdown */}
          <div className="p-2 pb-1.5 bg-white">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-4 text-[#64748b] pointer-events-none stroke-[2]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-[5px] border border-[#cfdbe6] bg-white pl-8 pr-7 py-1.5 text-[13px] text-slate-800 placeholder:text-[#8c9ba8] focus:border-[#0088cc] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto py-0 divide-y divide-transparent overscroll-contain"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value
                const isHighlighted = idx === highlightedIndex

                if (renderOption) {
                  return (
                    <div
                      key={opt.value}
                      data-select2-item
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange(opt.value)
                          closeDropdown()
                          triggerRef.current?.focus()
                        }
                      }}
                    >
                      {renderOption(opt, isSelected, isHighlighted)}
                    </div>
                  )
                }

                return (
                  <button
                    key={opt.value}
                    data-select2-item
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value)
                        closeDropdown()
                        triggerRef.current?.focus()
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-[13px] transition-colors cursor-pointer select-none leading-normal ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : isHighlighted
                          ? 'bg-[#0070ba] text-white font-normal'
                          : isSelected
                            ? 'bg-[#0070ba] text-white font-normal'
                            : 'text-slate-800 hover:bg-[#0070ba] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ml-2 shrink-0 ${
                          isHighlighted || isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-3.5 py-4 text-center text-xs text-slate-400 italic">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
