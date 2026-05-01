import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export type MonthSummaryData = {
  totalEntradas: number
  totalSaidas: number
  totalInvestimentos: number
  totalDiario: number
  saidaTotal: number
  performanceBruta: number
  performanceConsumo: number
  taxaEconomia: number
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function SummaryRow({
  label,
  value,
  subLabel,
  isPerformance,
}: {
  label: string
  value: number
  subLabel?: string
  isPerformance?: boolean
}) {
  const isPositive = value >= 0
  let colorClass = 'text-[var(--foreground)]'
  if (isPerformance) {
    colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
      <div className="flex flex-col">
        <span
          className="text-sm font-sans font-normal"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {label}
        </span>
        {subLabel && (
          <span
            className="text-[10px] font-sans font-normal opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {subLabel}
          </span>
        )}
      </div>
      <span className={`text-base font-sans font-semibold ${colorClass}`}>
        {fmtCurrency(value)}
      </span>
    </div>
  )
}

export function MonthlySummary({
  summary,
  year,
  month,
}: {
  summary: MonthSummaryData
  year: number
  month: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="mx-4 mt-6 mb-8 rounded-2xl shadow-sm transition-all duration-300"
      style={{ background: 'var(--card)' }}
    >
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-4 flex items-center justify-between text-sm font-sans font-medium hover:bg-[var(--muted)]/40 rounded-2xl transition-colors"
      >
        <span style={{ color: 'var(--foreground)' }}>Ver resumo do mês</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-5 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <h2 className="font-serif text-2xl mb-4" style={{ color: 'var(--foreground)' }}>
            Resumo de {MONTH_NAMES[month - 1]}{' '}
            <span style={{ color: 'var(--muted-foreground)' }}>{year}</span>
          </h2>

          <div className="flex flex-col mb-4">
            <SummaryRow label="Total Entradas" value={summary.totalEntradas} />
            <SummaryRow label="Total Saídas" value={summary.totalSaidas} />
            <SummaryRow label="Total Investimentos" value={summary.totalInvestimentos} />
            <SummaryRow label="Total Diário" value={summary.totalDiario} />
            <SummaryRow label="Saída Total" value={summary.saidaTotal} />
            <SummaryRow
              label="Performance Bruta"
              value={summary.performanceBruta}
              subLabel="inclui investimentos"
              isPerformance
            />
            <SummaryRow
              label="Performance de Consumo"
              value={summary.performanceConsumo}
              subLabel="apenas gastos reais"
              isPerformance
            />
          </div>

          {/* Taxa de Economia */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-sm font-sans font-normal"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Taxa de Economia
              </span>
              <span
                className="text-base font-sans font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                {summary.taxaEconomia.toFixed(1)}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--muted)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, summary.taxaEconomia))}%`,
                  background: 'var(--primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
