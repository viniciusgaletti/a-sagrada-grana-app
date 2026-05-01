import { useRef, useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
import type { FixedAccountInput } from '@/services/onboarding.service'

// ─── Design tokens (inline — sem depender de classes Tailwind arbitrárias) ────

const INPUT_BASE = [
  'w-full px-4 py-3 outline-none transition-all duration-150',
  'text-base font-sans',
  'bg-[var(--background)] text-[var(--foreground)]',
  'border rounded-[var(--radius)]',
  'focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0',
].join(' ')

const inputCls = (hasError?: boolean) =>
  `${INPUT_BASE} ${hasError ? 'border-[var(--destructive)]' : 'border-[var(--input)]'}`

/** Input numérico grande — valor em Instrument Serif, centralizado */
const numericInputCls = (hasError?: boolean) =>
  [
    'w-full px-4 py-4 outline-none transition-all duration-150',
    'font-serif text-3xl text-center tracking-tight',
    'bg-[var(--background)] text-[var(--foreground)]',
    'border rounded-[var(--radius)]',
    'focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0',
    hasError ? 'border-[var(--destructive)]' : 'border-[var(--input)]',
  ].join(' ')

const labelCls = 'block text-sm font-medium font-sans mb-2 text-[var(--foreground)]'
const errorCls = 'mt-1.5 text-xs text-[var(--destructive)] font-sans'

/** Shadow tokens from PRD §3.2 */
const CARD_SHADOW = `
  var(--shadow-offset-x, 2px)
  var(--shadow-offset-y, 4px)
  var(--shadow-blur, 16px)
  var(--shadow-spread, 0px)
  color-mix(in srgb, var(--shadow-color, #000) calc(var(--shadow-opacity, 0.12) * 100%), transparent)
`.trim()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className={errorCls}>{msg}</p>
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ─── Progress bar — segmentos com animação suave ──────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-3">
      {/* Segment dots */}
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500 ease-out"
            style={{
              background: i < step ? 'var(--primary)' : 'var(--muted)',
              opacity: i < step ? 1 : 0.45,
            }}
          />
        ))}
      </div>
      {/* Label */}
      <div className="flex justify-between">
        <span className="text-xs font-sans" style={{ color: 'var(--muted-foreground)' }}>
          Etapa {step} de {total}
        </span>
        <span className="text-xs font-sans" style={{ color: 'var(--primary)', fontWeight: 500 }}>
          {Math.round((step / total) * 100)}% completo
        </span>
      </div>
    </div>
  )
}

// ─── Animated step wrapper — fade + slide-in ─────────────────────────────────

function StepWrapper({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [stepKey])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 280ms ease-out, transform 280ms ease-out',
      }}
    >
      {children}
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function PrimaryBtn({
  children,
  onClick,
  disabled,
  id,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  id?: string
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-3.5 px-6 rounded-full text-sm font-medium font-sans
        transition-all duration-150 disabled:opacity-60
        flex items-center justify-center gap-2
        hover:brightness-105 active:scale-[0.98]"
      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
    >
      {children}
    </button>
  )
}

function GhostBtn({
  children,
  onClick,
  id,
}: {
  children: React.ReactNode
  onClick?: () => void
  id?: string
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className="px-5 py-3.5 rounded-full text-sm font-medium font-sans
        transition-all duration-150 flex items-center gap-1
        hover:bg-[var(--muted)] active:scale-[0.98]"
      style={{ color: 'var(--muted-foreground)', background: 'transparent' }}
    >
      {children}
    </button>
  )
}

// ─── Step 1 — Apelido (serif regular) ────────────────────────────────────────

function Step1({
  nickname,
  onChange,
  error,
  onNext,
}: {
  nickname: string
  onChange: (v: string) => void
  error?: string
  onNext: () => void
}) {
  return (
    <StepWrapper stepKey={1}>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2 leading-none">🌿</div>
          {/* Instrument Serif regular */}
          <h2
            className="font-serif text-[2rem] leading-tight"
            style={{ color: 'var(--foreground)', fontStyle: 'normal' }}
          >
            Como posso te chamar?
          </h2>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Seu apelido vai aparecer na tela principal do app.
          </p>
        </div>

        <div>
          <label htmlFor="ob-nickname" className={labelCls}>
            Apelido
          </label>
          <input
            id="ob-nickname"
            type="text"
            autoComplete="nickname"
            placeholder="Ex: Vini, Mari, João"
            value={nickname}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onNext()}
            className={inputCls(!!error)}
            autoFocus
          />
          <FieldError msg={error} />
        </div>

        <PrimaryBtn id="ob-step1-next" onClick={onNext}>
          Continuar
        </PrimaryBtn>
      </div>
    </StepWrapper>
  )
}

// ─── Step 2 — Saldo inicial (serif itálico) ───────────────────────────────────

function Step2({
  balance,
  onChange,
  error,
  onNext,
  onBack,
}: {
  balance: number
  onChange: (v: number) => void
  error?: string
  onNext: () => void
  onBack: () => void
}) {
  return (
    <StepWrapper stepKey={2}>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2 leading-none">🏦</div>
          {/* Instrument Serif itálico */}
          <h2
            className="font-serif text-[2rem] leading-tight"
            style={{ color: 'var(--foreground)', fontStyle: 'italic' }}
          >
            Qual é seu saldo atual?
          </h2>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Abra seu banco agora. Se você usa mais de um, some os saldos de todos e insira o total
            aqui.
          </p>
        </div>

        <div>
          <label htmlFor="ob-balance" className={labelCls}>
            Saldo atual (R$)
          </label>
          {/* Grande, centralizado, Instrument Serif */}
          <input
            id="ob-balance"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={balance === 0 ? '' : balance}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && onNext()}
            className={numericInputCls(!!error)}
            autoFocus
          />
          <p className="mt-2 text-xs font-sans" style={{ color: 'var(--muted-foreground)' }}>
            Este valor será registrado como Entrada hoje e aparecerá no seu saldo imediatamente.
          </p>
          <FieldError msg={error} />
        </div>

        <div className="flex gap-3">
          <GhostBtn id="ob-step2-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </GhostBtn>
          <PrimaryBtn id="ob-step2-next" onClick={onNext}>
            Continuar
          </PrimaryBtn>
        </div>
      </div>
    </StepWrapper>
  )
}

// ─── Step 3 — Gastos fixos (serif regular) ────────────────────────────────────

function Step3({
  accounts,
  onChange,
  errors,
  onNext,
  onBack,
}: {
  accounts: FixedAccountInput[]
  onChange: (v: FixedAccountInput[]) => void
  errors: Record<string, string>
  onNext: () => void
  onBack: () => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  function addItem() {
    onChange([...accounts, { description: '', amount: 0, dueDay: 1, type: 'saida' }])
    // Scroll to bottom after adding
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  function removeItem(idx: number) {
    onChange(accounts.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, patch: Partial<FixedAccountInput>) {
    const next = accounts.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    onChange(next)
  }

  const fieldErr = (idx: number, field: string) => errors[`fixedAccounts.${idx}.${field}`]

  return (
    <StepWrapper stepKey={3}>
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2 leading-none">📋</div>
          {/* Instrument Serif regular */}
          <h2
            className="font-serif text-[2rem] leading-tight"
            style={{ color: 'var(--foreground)', fontStyle: 'normal' }}
          >
            Gastos fixos
          </h2>
          <p className="text-sm font-sans" style={{ color: 'var(--muted-foreground)' }}>
            Cadastre despesas e receitas recorrentes.{' '}
            <strong className="font-medium" style={{ color: 'var(--foreground)' }}>
              Pode pular
            </strong>{' '}
            se preferir fazer depois.
          </p>
        </div>

        {/* List */}
        <div ref={listRef} className="space-y-3 max-h-[38vh] overflow-y-auto pr-0.5">
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="rounded-[var(--radius)] p-4 space-y-3 relative"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Remove */}
              <button
                type="button"
                id={`ob-remove-account-${idx}`}
                onClick={() => removeItem(idx)}
                className="absolute top-3 right-3 p-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color: 'var(--destructive)' }}
                aria-label="Remover item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Tipo toggle */}
              <div>
                <label className={labelCls}>Tipo</label>
                <div className="flex gap-2">
                  {(['entrada', 'saida'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateItem(idx, { type: t })}
                      className="flex-1 py-2 text-xs rounded-full font-medium font-sans transition-all duration-150"
                      style={
                        acc.type === t
                          ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                          : {
                              background: 'var(--background)',
                              border: '1px solid var(--border)',
                              color: 'var(--muted-foreground)',
                            }
                      }
                    >
                      {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className={labelCls}>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Salário"
                  value={acc.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className={inputCls(!!fieldErr(idx, 'description'))}
                />
                <FieldError msg={fieldErr(idx, 'description')} />
              </div>

              {/* Valor + Dia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Valor (R$)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={acc.amount || ''}
                    onChange={(e) => updateItem(idx, { amount: parseFloat(e.target.value) || 0 })}
                    className={inputCls(!!fieldErr(idx, 'amount'))}
                  />
                  <FieldError msg={fieldErr(idx, 'amount')} />
                </div>
                <div>
                  <label className={labelCls}>Dia (1–31)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="31"
                    placeholder="1"
                    value={acc.dueDay || ''}
                    onChange={(e) => updateItem(idx, { dueDay: parseInt(e.target.value) || 1 })}
                    className={inputCls(!!fieldErr(idx, 'dueDay'))}
                  />
                  <FieldError msg={fieldErr(idx, 'dueDay')} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add button */}
        <button
          id="ob-add-account"
          type="button"
          onClick={addItem}
          className="w-full py-3 rounded-[var(--radius)] text-sm font-medium font-sans
            flex items-center justify-center gap-2
            transition-all duration-150 hover:opacity-80"
          style={{
            border: '1.5px dashed var(--border)',
            color: 'var(--primary)',
            background: 'transparent',
          }}
        >
          <Plus className="h-4 w-4" />
          Adicionar conta fixa
        </button>

        <div className="flex gap-3">
          <GhostBtn id="ob-step3-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </GhostBtn>
          <PrimaryBtn id="ob-step3-next" onClick={onNext}>
            Continuar
          </PrimaryBtn>
        </div>
      </div>
    </StepWrapper>
  )
}

// ─── Step 4 — Gastos variáveis (serif itálico) ────────────────────────────────

function Step4({
  variableExpenses,
  dailyAverage,
  onChange,
  error,
  isLoading,
  onSubmit,
  onBack,
}: {
  variableExpenses: number
  dailyAverage: number
  onChange: (v: number) => void
  error?: string
  isLoading: boolean
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <StepWrapper stepKey={4}>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2 leading-none">📊</div>
          {/* Instrument Serif itálico */}
          <h2
            className="font-serif text-[2rem] leading-tight"
            style={{ color: 'var(--foreground)', fontStyle: 'italic' }}
          >
            Gastos variáveis do mês
          </h2>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Mercado, farmácia, lazer, delivery, transporte. Some tudo e coloque aqui.
          </p>
        </div>

        <div>
          <label htmlFor="ob-variable" className={labelCls}>
            Total estimado de gastos variáveis (R$)
          </label>
          {/* Grande, centralizado, Instrument Serif */}
          <input
            id="ob-variable"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={variableExpenses === 0 ? '' : variableExpenses}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={numericInputCls(!!error)}
            autoFocus
          />
          <FieldError msg={error} />
        </div>

        {/* Daily average preview — var(--accent) card */}
        <div
          className="rounded-[var(--radius)] p-5 text-center"
          style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}
        >
          <p
            className="text-xs font-medium font-sans uppercase tracking-widest mb-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Gasto médio diário estimado
          </p>
          {/* Instrument Serif itálico, var(--primary) */}
          <p
            className="font-serif text-4xl leading-none transition-all duration-300"
            style={{ color: 'var(--primary)', fontStyle: 'italic' }}
          >
            {formatBRL(dailyAverage)}
          </p>
          <p className="text-xs font-sans mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Pré-populado como estimativa nos próximos 12 meses
          </p>
        </div>

        <div className="flex gap-3">
          <GhostBtn id="ob-step4-back" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </GhostBtn>
          <PrimaryBtn id="ob-step4-submit" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              'Começar 🚀'
            )}
          </PrimaryBtn>
        </div>
      </div>
    </StepWrapper>
  )
}

// ─── OnboardingPage ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const {
    currentStep,
    data,
    updateData,
    stepErrors,
    isLoading,
    error,
    dailyAverage,
    goNext,
    goBack,
    completeOnboarding,
  } = useOnboarding()

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 py-8"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar step={currentStep} total={4} />
        </div>

        {/* Step card */}
        <div
          className="rounded-[var(--radius)] p-7 overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: CARD_SHADOW,
          }}
        >
          {currentStep === 1 && (
            <Step1
              nickname={data.nickname}
              onChange={(v) => updateData({ nickname: v })}
              error={stepErrors['nickname']}
              onNext={goNext}
            />
          )}

          {currentStep === 2 && (
            <Step2
              balance={data.initialBalance}
              onChange={(v) => updateData({ initialBalance: v })}
              error={stepErrors['initialBalance']}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <Step3
              accounts={data.fixedAccounts}
              onChange={(v) => updateData({ fixedAccounts: v })}
              errors={stepErrors}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === 4 && (
            <Step4
              variableExpenses={data.variableExpenses}
              dailyAverage={dailyAverage}
              onChange={(v) => updateData({ variableExpenses: v })}
              error={stepErrors['variableExpenses']}
              isLoading={isLoading}
              onSubmit={completeOnboarding}
              onBack={goBack}
            />
          )}

          {/* Global error */}
          {error && (
            <p
              className="mt-5 text-sm text-center font-sans px-4 py-2.5 rounded-xl"
              style={{
                color: 'var(--destructive)',
                background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
