import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/services/onboarding.service'

interface Props {
  data: OnboardingData
  updateData: (d: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  error: string | null
}

export function Step4({ data, updateData, nextStep, prevStep, error }: Props) {
  const dailyAverage = (data.variableExpenses || 0) / 31

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-medium">
          Pense em tudo que você gasta de forma variável no mês: mercado, farmácia, lazer, delivery,
          transporte. Some tudo e coloque aqui.
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="variable">Total estimado de gastos variáveis</Label>
          <Input
            id="variable"
            type="number"
            inputMode="decimal"
            value={data.variableExpenses || ''}
            onChange={(e) => updateData({ variableExpenses: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="bg-primary/10 p-4 rounded-lg text-center mt-6">
          <p className="text-sm text-muted-foreground mb-1">Gasto médio diário:</p>
          <p className="text-2xl font-serif font-semibold text-primary">
            R$ {dailyAverage.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" size="lg" onClick={prevStep}>
            Voltar
          </Button>
          <Button className="flex-1" size="lg" onClick={nextStep}>
            Começar
          </Button>
        </div>
      </div>
    </div>
  )
}
