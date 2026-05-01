import { useState, useEffect, useRef } from 'react'
import { X, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useDiarioPanel } from '@/hooks/useDiarioPanel'
import { getCategories } from '@/services/categories.service'
import type { Category, Transaction } from '@/types'

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDateHeader(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}`
}

type DiarioPanelProps = {
  userId: string | undefined
  date: string | null
  isOpen: boolean
  onClose: () => void
  /** Called when a transaction is added, updated or removed so the parent can refresh its main state */
  onChanges: () => void
}

export function DiarioPanel({ userId, date, isOpen, onClose, onChanges }: DiarioPanelProps) {
  const { transactions, total, isLoading, error, create, update, remove, refetch } = useDiarioPanel(userId, date)
  const [categories, setCategories] = useState<Category[]>([])
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (userId && isOpen) {
      getCategories(userId).then(setCategories).catch(console.error)
    }
  }, [userId, isOpen])

  // Reset form when closed or date changes
  useEffect(() => {
    if (!isOpen) {
      setIsFormOpen(false)
      setEditId(null)
      setFormError(null)
    }
  }, [isOpen, date])

  const handleOpenForm = (tx?: Transaction) => {
    if (tx) {
      setEditId(tx.id)
      setAmount(tx.amount.toString())
      setCategoryId(tx.categoryId || '')
      setDescription(tx.description || '')
    } else {
      setEditId(null)
      setAmount('')
      setCategoryId('')
      setDescription('')
    }
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditId(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const val = parseFloat(amount.replace(',', '.'))
    if (isNaN(val) || val < 0) {
      setFormError('Valor inválido.')
      return
    }

    setIsSaving(true)
    try {
      if (editId) {
        await update(editId, val, categoryId || null, description.trim() || null)
      } else {
        await create(val, categoryId || null, description.trim() || null)
      }
      setIsFormOpen(false)
      onChanges()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este gasto?')) return
    try {
      await remove(id)
      onChanges()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div 
        className="fixed inset-x-0 bottom-0 z-50 bg-[var(--background)] rounded-t-3xl sm:max-w-md sm:mx-auto sm:top-0 sm:right-0 sm:left-auto sm:bottom-0 sm:rounded-none sm:w-full transition-transform animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300 flex flex-col shadow-2xl"
        style={{ maxHeight: '90dvh' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-serif text-2xl" style={{ color: 'var(--foreground)' }}>
            Gastos de {date ? formatDateHeader(date) : ''}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors">
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mb-2 opacity-80" />
              <p className="text-sm text-destructive mb-4">{error}</p>
              <button 
                onClick={refetch}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-primary-foreground"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && isLoading && (
            <div className="space-y-4">
              <div className="h-16 rounded-xl animate-pulse bg-[var(--muted)]" />
              <div className="h-16 rounded-xl animate-pulse bg-[var(--muted)]" />
            </div>
          )}

          {!error && !isLoading && transactions.length === 0 && !isFormOpen && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-sans mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Nenhum gasto registrado neste dia.
              </p>
              <button
                onClick={() => handleOpenForm()}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--primary)] text-primary-foreground flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" /> Adicionar gasto
              </button>
            </div>
          )}

          {!error && !isLoading && transactions.length > 0 && (
            <div className="space-y-3 mb-6">
              {transactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId)
                return (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-2xl animate-in fade-in slide-in-from-bottom-2"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: cat ? `${cat.color}20` : 'var(--muted)' }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ background: cat?.color || 'var(--muted-foreground)' }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-sans font-semibold" style={{ color: 'var(--foreground)' }}>
                          {cat?.name || 'Sem categoria'}
                        </span>
                        {tx.description && (
                          <span className="text-xs font-sans mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            {tx.description}
                          </span>
                        )}
                        {tx.status === 'estimado' && (
                          <span className="text-[10px] font-sans mt-0.5 text-primary/60 uppercase tracking-wider font-semibold">
                            Estimado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-base font-sans font-semibold" style={{ color: 'var(--foreground)' }}>
                        {fmtCurrency(tx.amount)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenForm(tx)} className="p-1 rounded-full hover:bg-[var(--muted)] transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        </button>
                        <button onClick={() => handleDelete(tx.id)} className="p-1 rounded-full hover:bg-[var(--muted)] transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {!isFormOpen && (
                <button
                  onClick={() => handleOpenForm()}
                  className="w-full p-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 hover:bg-[var(--muted)]/40 transition-colors mt-4"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-sans font-medium">Adicionar gasto</span>
                </button>
              )}
            </div>
          )}

          {isFormOpen && (
            <form onSubmit={handleSave} className="p-4 rounded-2xl animate-in slide-in-from-bottom-4" style={{ background: 'var(--card)' }}>
              <h3 className="text-sm font-sans font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                {editId ? 'Editar gasto' : 'Novo gasto'}
              </h3>
              
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-sans mb-1" style={{ color: 'var(--muted-foreground)' }}>Valor</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans rounded-xl outline-none focus:ring-1 bg-transparent"
                    style={{ 
                      color: 'var(--foreground)', 
                      border: '1px solid var(--border)',
                      borderColor: 'var(--input)',
                      '--tw-ring-color': 'var(--primary)'
                    } as any}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans mb-1" style={{ color: 'var(--muted-foreground)' }}>Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans rounded-xl outline-none focus:ring-1 bg-transparent appearance-none"
                    style={{ 
                      color: 'var(--foreground)', 
                      border: '1px solid var(--border)',
                      borderColor: 'var(--input)',
                      '--tw-ring-color': 'var(--primary)'
                    } as any}
                  >
                    <option value="" style={{ color: 'var(--foreground)', background: 'var(--background)' }}>Selecione (opcional)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} style={{ color: 'var(--foreground)', background: 'var(--background)' }}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans mb-1" style={{ color: 'var(--muted-foreground)' }}>Descrição (opcional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans rounded-xl outline-none focus:ring-1 bg-transparent"
                    style={{ 
                      color: 'var(--foreground)', 
                      border: '1px solid var(--border)',
                      borderColor: 'var(--input)',
                      '--tw-ring-color': 'var(--primary)'
                    } as any}
                    placeholder="Ex: Padaria"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[var(--primary)] text-primary-foreground disabled:opacity-50"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)]" style={{ background: 'var(--card)' }}>
          <p className="font-serif italic text-2xl" style={{ color: 'var(--foreground)' }}>
            Total: {fmtCurrency(total)}
          </p>
        </div>
      </div>
    </>
  )
}
