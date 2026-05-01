/**
 * Utility functions for A Sagrada Grana.
 * Pure functions only — no Supabase calls, no side effects.
 */

// ─── Currency formatting ──────────────────────────────────────────────────────

/** Format a number as BRL currency, e.g. "R$ 1.234,56" */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

/** Format a number as a compact BRL value, e.g. "1.234,56" */
export function formatDecimal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today as ISO date string, e.g. "2026-05-01" */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Returns the number of days in a given month (1-indexed) */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// ─── Balance helpers ──────────────────────────────────────────────────────────

/**
 * Calculates the daily average expense.
 * @param totalMonthlyVariable Total estimated variable expenses for the month
 */
export function calcDailyAverage(totalMonthlyVariable: number): number {
  return totalMonthlyVariable / 31
}
