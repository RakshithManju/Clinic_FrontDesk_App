/**
 * Utility functions for consistent date handling throughout the application
 */

/**
 * Safely parse a date string and return a Date object
 * Returns null if the date is invalid
 */
export function safeParseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Get today's date in YYYY-MM-DD format
 * Uses local timezone to avoid timezone issues
 */
export function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString()
}

/**
 * Parse a YYYY-MM-DD date string into a Date object in local timezone
 * This avoids timezone shift issues that can occur with ISO string parsing
 */
export function parseDateString(dateStr: string): Date | null {
  const [year, month, day] = dateStr.split('-').map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  return new Date(year, month - 1, day)
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if two dates represent the same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * Safely format a date for display
 * Returns "Invalid Date" if the date is invalid
 */
export function formatDateDisplay(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = safeParseDate(dateStr)
  if (!date) return 'Invalid Date'
  return date.toLocaleDateString(undefined, options)
}

/**
 * Safely format a date and time for display
 * Returns "Invalid Date" if the date is invalid
 */
export function formatDateTimeDisplay(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = safeParseDate(dateStr)
  if (!date) return 'Invalid Date'
  return date.toLocaleString(undefined, options)
}

/**
 * Safely get the time portion of a date for display
 * Returns "Invalid Time" if the date is invalid
 */
export function formatTimeDisplay(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  const date = safeParseDate(dateStr)
  if (!date) return 'Invalid Time'
  return date.toLocaleTimeString(undefined, options || { hour: "2-digit", minute: "2-digit" })
}
