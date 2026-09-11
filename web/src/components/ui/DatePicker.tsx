import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import calendarIcon from '../../assets/svg/calendar.svg'
import {
  MONTH_NAMES,
  DAY_NAMES,
  formatDisplayDate,
  parseDateString,
} from './dateUtils'

export { formatDisplayDate, parseDateString } from './dateUtils'

interface DatePickerProps {
  id?: string
  value: string
  onChange: (formattedDate: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? parseDateString(value) : null
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date())

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(parseDateString(value))
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    onChange(formatDisplayDate(newDate))
    setIsOpen(false)
  }

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    const today = new Date()
    onChange(formatDisplayDate(today))
    setViewDate(today)
    setIsOpen(false)
  }

  // Calculate calendar grid
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Date Trigger Input */}
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className={`w-full flex items-center justify-between rounded-md border-[1.5px] bg-white px-3 py-2 text-xs transition-all outline-none ${
          disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-[#0288d1] ring-2 ring-[#0288d1]/20'
            : 'border-[#63c4ed] hover:border-[#38b4e7] cursor-pointer'
        }`}
      >
        <span className={`font-medium ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <img src={calendarIcon} alt="" className="size-4 object-contain shrink-0" />
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-lg border border-[#63c4ed] bg-white p-3.5 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-[#0288d1] transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-xs font-bold text-[#0c3761]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-[#0288d1] transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center">
            {DAY_NAMES.map((d) => (
              <span key={d} className="text-[10.5px] font-semibold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month trailing days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayOfWeek + i + 1
              return (
                <div
                  key={`prev-${i}`}
                  className="py-1.5 text-xs text-slate-300 pointer-events-none"
                >
                  {prevDay}
                </div>
              )
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === currentYear &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getDate() === day

              const isToday = isCurrentMonth && today.getDate() === day

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`size-7 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0288d1] text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-sky-100 text-[#0288d1] font-bold border border-[#63c4ed]'
                      : 'text-slate-700 hover:bg-sky-50 hover:text-[#0288d1]'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-semibold text-[#0288d1] hover:underline cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
