export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTH_SHORT[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function parseDateString(str: string): Date {
  if (!str) return new Date()
  
  // Format: "DD MMM YYYY" (e.g. "08 Sep 2026")
  const parts = str.trim().split(/\s+/)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const monthIdx = MONTH_SHORT.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase())
    const year = parseInt(parts[2], 10)
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day)
    }
  }

  // Fallback to standard parse
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}
