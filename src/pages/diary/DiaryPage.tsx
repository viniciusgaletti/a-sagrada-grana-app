import { useState, useRef, useEffect, useCallback } from 'react'
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDiary } from '@/hooks/useDiary'
import { useHorizon } from '@/hooks/useHorizon'
import { useAuth } from '@/hooks/useAuth'
import { getMonthTransactions, getSnapshotBefore } from '@/services/transactions.service'
import { calcMonthSummary } from '@/utils/balance'
import { MonthlySummary } from '@/components/diary/MonthlySummary'
import { DiarioPanel } from '@/components/diary/DiarioPanel'
import type { DayData } from '@/hooks/useDiary'
import type { TransactionType } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function fmtInput(value: number): string {
  if (value === 0) return ''
  return value.toFixed(2).replace('.', ',')
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b animate-pulse"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Day number */}
      <div className="w-8 shrink-0">
        <div className="h-5 w-6 rounded" style={{ background: 'var(--muted)' }} />
        <div className="h-3 w-5 rounded mt-1" style={{ background: 'var(--muted)' }} />
      </div>
      {/* Fields */}
      <div className="flex-1 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg" style={{ background: 'var(--muted)' }} />
        ))}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div>
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--destructive) 12%, transparent)' }}
      >
        <AlertCircle className="h-6 w-6" style={{ color: 'var(--destructive)' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          Erro ao carregar o diário
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  )
}

// ─── Inline editable field ────────────────────────────────────────────────────

type FieldProps = {
  value: number
  status?: 'estimado' | 'confirmado'
  isReadonly?: boolean
  label: string
  onCommit: (amount: number) => void
}

function InlineField({ value, status, isReadonly, label, onCommit }: FieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    if (isReadonly) return
    setDraft(value === 0 ? '' : String(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const parsed = parseFloat(draft.replace(',', '.'))
    const next = isNaN(parsed) || parsed < 0 ? 0 : parsed
    setEditing(false)
    if (next !== value) onCommit(next)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Tab') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  const isEstimated = status === 'estimado'

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={draft}
        placeholder="--"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label={label}
        className="w-full px-2 py-1.5 text-right text-xs font-sans rounded-lg outline-none bg-transparent focus:ring-1 focus:border"
        style={{
          color: 'var(--foreground)',
          borderColor: 'var(--input)',
          '--tw-ring-color': 'var(--input)',
        } as React.CSSProperties}
      />
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={startEdit}
      disabled={isReadonly}
      className={`w-full px-2 py-1.5 text-right text-xs font-sans rounded-lg transition-colors border border-transparent ${
        isEstimated ? 'text-primary/35' : ''
      }`}
      style={{
        background: value > 0 ? 'color-mix(in srgb, var(--muted) 60%, transparent)' : 'transparent',
        color: !isEstimated
          ? value > 0
            ? 'var(--foreground)'
            : 'var(--muted-foreground)'
          : undefined,
        cursor: isReadonly ? 'default' : 'pointer',
      }}
    >
      {value > 0 ? fmtInput(value) : isReadonly ? '—' : '--'}
    </button>
  )
}

// ─── Day row ──────────────────────────────────────────────────────────────────

type DayRowProps = {
  day: DayData
  onUpdate: (date: string, type: TransactionType, amount: number) => void
  onOpenDiario: (date: string) => void
}

function DayRow({ day, onUpdate, onOpenDiario }: DayRowProps) {
  const isPositive = day.balance >= 0

  // Find status of single-type transactions for colour coding
  const txByType = (type: TransactionType) =>
    day.transactions.find((tx) => tx.type === type)

  return (
    <div
      className="group flex items-center gap-2 px-3 py-3 mb-2 mx-3 shadow-sm transition-colors hover:bg-[var(--muted)]/40"
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        borderLeft: day.isToday ? '2px solid var(--primary)' : '2px solid transparent',
      }}
    >
      {/* Day number + weekday */}
      <div className={`w-9 shrink-0 text-center ${day.isFuture ? 'opacity-60' : ''}`}>
        <div
          className="text-sm font-semibold font-sans leading-none"
          style={{ color: day.isToday ? 'var(--primary)' : 'var(--foreground)' }}
        >
          {day.dayNumber}
        </div>
        <div className="text-[10px] font-sans font-normal mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          {day.weekday}
        </div>
      </div>

      {/* Fields grid */}
      <div className="flex-1 grid grid-cols-5 gap-1">
        {/* Entrada */}
        <InlineField
          value={day.entrada}
          status={txByType('entrada')?.status}
          label={`Entrada dia ${day.dayNumber}`}
          onCommit={(v) => onUpdate(day.date, 'entrada', v)}
        />

        {/* Saída */}
        <InlineField
          value={day.saida}
          status={txByType('saida')?.status}
          label={`Saída dia ${day.dayNumber}`}
          onCommit={(v) => onUpdate(day.date, 'saida', v)}
        />

        {/* Investimento */}
        <InlineField
          value={day.investimento}
          status={txByType('investimento')?.status}
          label={`Investimento dia ${day.dayNumber}`}
          onCommit={(v) => onUpdate(day.date, 'investimento', v)}
        />

        {/* Diário — read-only sum, clicável para painel futuro */}
        <button
          type="button"
          aria-label={`Diário dia ${day.dayNumber}`}
          onClick={() => onOpenDiario(day.date)}
          className={`w-full px-2 py-1.5 text-right text-xs font-sans rounded-lg transition-colors border border-transparent hover:bg-[var(--accent)] ${
            txByType('diario')?.status === 'estimado' ? 'text-primary/35' : ''
          }`}
          style={{
            background: day.diario > 0 ? 'color-mix(in srgb, var(--muted) 60%, transparent)' : 'transparent',
            color: txByType('diario')?.status !== 'estimado'
              ? day.diario > 0
                ? 'var(--foreground)'
                : 'var(--muted-foreground)'
              : undefined,
          }}
          title="Abrir detalhamento do dia"
        >
          {day.diario > 0 ? fmtInput(day.diario) : '--'}
        </button>

        {/* Saldo — calculado, não editável */}
        <div
          className={`w-full px-2 py-1.5 text-right text-xs font-sans font-semibold rounded-lg ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          }`}
          style={{
            background: 'transparent',
          }}
        >
          {fmtInput(Math.abs(day.balance))}
          {day.balance < 0 && <span className="ml-0.5 text-[9px]">−</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Column headers ───────────────────────────────────────────────────────────

function ColumnHeaders() {
  const cols = ['Entrada', 'Saída', 'Invest.', 'Diário', 'Saldo']
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mx-3 mb-2 sticky top-[var(--header-h,56px)] z-10 rounded-2xl"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="w-9 shrink-0" />
      <div className="flex-1 grid grid-cols-5 gap-1">
        {cols.map((col) => (
          <div
            key={col}
            className="text-right text-[10px] font-medium uppercase tracking-wide px-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {col}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DiaryHeader({
  year,
  month,
  todayBalance,
  lastEdit,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onGoToday,
}: {
  year: number
  month: number
  todayBalance: number | null
  lastEdit: string | null
  isCurrentMonth: boolean
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToday: () => void
}) {
  const isPositive = (todayBalance ?? 0) >= 0

  return (
    <div
      className="px-4 pt-5 pb-4"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Month + year */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <button onClick={onPrevMonth} className="p-1 rounded-full hover:bg-[var(--muted)] transition-colors">
            <ChevronLeft className="w-6 h-6 text-[var(--muted-foreground)]" />
          </button>
          <h1
            className="font-serif text-2xl leading-none flex items-baseline gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            {MONTH_NAMES[month - 1]}
            <span className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              {year}
            </span>
          </h1>
          <button onClick={onNextMonth} className="p-1 rounded-full hover:bg-[var(--muted)] transition-colors">
            <ChevronRight className="w-6 h-6 text-[var(--muted-foreground)]" />
          </button>
        </div>
      </div>

      {/* Last edit timestamp */}
      <div className="flex justify-between items-center mt-1">
        {!isCurrentMonth ? (
          <button
            onClick={onGoToday}
            className="text-xs font-medium text-[var(--primary)] hover:underline transition-all"
          >
            Voltar para Hoje
          </button>
        ) : (
          <div /> /* Spacer */
        )}

        {lastEdit && (
          <span className="text-[10px] font-sans font-normal" style={{ color: 'var(--muted-foreground)' }}>
            Último registro: {lastEdit}
          </span>
        )}
      </div>

      {/* Today's balance */}
      {todayBalance !== null && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest font-sans font-medium mb-0.5"
            style={{ color: 'var(--muted-foreground)' }}>
            Saldo hoje
          </p>
          <p
            className={`font-serif italic text-6xl leading-none ${
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
            }`}
          >
            {fmtCurrency(todayBalance)}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── DiaryPage ────────────────────────────────────────────────────────────────

export default function DiaryPage() {
  const { visibleYear: year, visibleMonth: month, isCurrentMonth, goToPrevMonth, goToNextMonth, goToToday } = useHorizon()
  const { user } = useAuth()

  const diary = useDiary(year, month)
  const { days, isLoading, error, refetch, transactions, snapshotBalance } = diary

  const summary = calcMonthSummary(snapshotBalance, transactions)

  // Animation & Panel states
  const [animClass, setAnimClass] = useState('translate-x-0 opacity-100')
  const [selectedDiarioDate, setSelectedDiarioDate] = useState<string | null>(null)

  const handleNext = useCallback(() => {
    setAnimClass('-translate-x-6 opacity-0')
    setTimeout(() => {
      goToNextMonth()
      setAnimClass('translate-x-6 opacity-0')
      setTimeout(() => setAnimClass('translate-x-0 opacity-100'), 50)
    }, 150)
  }, [goToNextMonth])

  const handlePrev = useCallback(() => {
    setAnimClass('translate-x-6 opacity-0')
    setTimeout(() => {
      goToPrevMonth()
      setAnimClass('-translate-x-6 opacity-0')
      setTimeout(() => setAnimClass('translate-x-0 opacity-100'), 50)
    }, 150)
  }, [goToPrevMonth])

  const handleGoToday = useCallback(() => {
    setAnimClass('translate-y-4 opacity-0')
    setTimeout(() => {
      goToToday()
      setAnimClass('-translate-y-4 opacity-0')
      setTimeout(() => setAnimClass('translate-x-0 opacity-100'), 50)
    }, 150)
  }, [goToToday])

  // Prefetch adjacent months
  useEffect(() => {
    if (!user) return
    const nextM = month === 12 ? 1 : month + 1
    const nextY = month === 12 ? year + 1 : year
    const prevM = month === 1 ? 12 : month - 1
    const prevY = month === 1 ? year - 1 : year

    getMonthTransactions(user.id, nextY, nextM).catch(() => {})
    getSnapshotBefore(user.id, nextY, nextM).catch(() => {})
    getMonthTransactions(user.id, prevY, prevM).catch(() => {})
    getSnapshotBefore(user.id, prevY, prevM).catch(() => {})
  }, [year, month, user])

  // Wheel tracking
  const wheelAccumulator = useRef(0)
  const wheelTimeout = useRef<number | null>(null)
  
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      wheelAccumulator.current += e.deltaX
      if (wheelTimeout.current) window.clearTimeout(wheelTimeout.current)
      
      if (wheelAccumulator.current > 80) {
        handleNext()
        wheelAccumulator.current = 0
      } else if (wheelAccumulator.current < -80) {
        handlePrev()
        wheelAccumulator.current = 0
      } else {
        wheelTimeout.current = window.setTimeout(() => {
          wheelAccumulator.current = 0
        }, 150)
      }
    }
  }

  // Touch tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX.current
    const deltaY = currentY - touchStartY.current

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) handlePrev()
      else handleNext()
      touchStartX.current = null
      touchStartY.current = null
    }
  }

  const handleTouchEnd = () => {
    touchStartX.current = null
    touchStartY.current = null
  }

  // Today's balance from computed days
  const todayISO = new Date().toISOString().split('T')[0]
  const todayDay = days.find((d) => d.date === todayISO)
  const todayBalance = todayDay?.balance ?? null

  // Scroll today into view on load
  const todayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isLoading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isLoading])

  if (error) {
    return (
      <div style={{ background: 'var(--background)', minHeight: '100dvh' }}>
        <DiaryHeader 
          year={year} 
          month={month} 
          todayBalance={null} 
          lastEdit={diary.lastEdit ?? null} 
          isCurrentMonth={isCurrentMonth}
          onPrevMonth={handlePrev}
          onNextMonth={handleNext}
          onGoToday={handleGoToday}
        />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div 
      style={{ background: 'var(--background)', minHeight: '100dvh', overflowX: 'hidden' }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fixed header */}
      <DiaryHeader
        year={year}
        month={month}
        todayBalance={todayBalance}
        lastEdit={diary.lastEdit}
        isCurrentMonth={isCurrentMonth}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onGoToday={handleGoToday}
      />

      {/* Column labels */}
      <ColumnHeaders />

      {/* Days list */}
      <div className={`pt-2 transition-all duration-300 ease-in-out ${animClass}`} style={{ background: 'var(--background)' }}>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          days.map((day) => (
            <div key={day.date} ref={day.isToday ? todayRef : undefined}>
              <DayRow
                day={day}
                onUpdate={diary.updateField}
                onOpenDiario={setSelectedDiarioDate}
              />
            </div>
          ))
        )}
      </div>

      {/* Monthly Summary */}
      {!isLoading && !error && (
        <MonthlySummary summary={summary} year={year} month={month} />
      )}

      {/* Diario Panel */}
      <DiarioPanel 
        userId={user?.id}
        date={selectedDiarioDate}
        isOpen={!!selectedDiarioDate}
        onClose={() => setSelectedDiarioDate(null)}
        onChanges={refetch}
      />

      {/* Bottom padding for mobile nav */}
      <div className="h-8" />
    </div>
  )
}
