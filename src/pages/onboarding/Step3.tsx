import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OnboardingData } from '@/services/onboarding.service'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  data: OnboardingData
  updateData: (d: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  error: string | null
}

const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Mercado',
  'Assinaturas',
  'Vestuário',
  'Educação',
  'Outros',
]

export function Step3({ data, updateData, nextStep, prevStep, error }: Props) {
  const addAccount = () => {
    updateData({
      fixedAccounts: [
        ...data.fixedAccounts,
        { description: '', amount: 0, dueDay: 1, category: '' },
      ],
    })
  }

  const updateAccount = (index: number, field: string, value: any) => {
    const newAccounts = [...data.fixedAccounts]
    newAccounts[index] = { ...newAccounts[index], [field]: value }
    updateData({ fixedAccounts: newAccounts })
  }

  const removeAccount = (index: number) => {
    updateData({ fixedAccounts: data.fixedAccounts.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-medium">
          Cadastre suas despesas recorrentes. Cada uma terá um dia de vencimento.
        </h2>
      </div>

      {error && <p className="text-sm text-center text-destructive">{error}</p>}

      <div className="space-y-4 max-h-[45vh] overflow-y-auto p-1">
        {data.fixedAccounts.map((acc, i) => (
          <div key={i} className="border p-4 rounded-lg space-y-4 relative bg-card">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => removeAccount(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="space-y-2 pr-8">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Aluguel"
                value={acc.description}
                onChange={(e) => updateAccount(i, 'description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={acc.amount || ''}
                  onChange={(e) => updateAccount(i, 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimento (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={acc.dueDay || ''}
                  onChange={(e) => updateAccount(i, 'dueDay', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={acc.category} onValueChange={(v) => updateAccount(i, 'category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={addAccount}>
        <Plus className="h-4 w-4 mr-2" /> Adicionar outra conta
      </Button>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={prevStep}>
          Voltar
        </Button>
        <Button className="flex-1" size="lg" onClick={nextStep}>
          Próximo
        </Button>
      </div>
    </div>
  )
}
