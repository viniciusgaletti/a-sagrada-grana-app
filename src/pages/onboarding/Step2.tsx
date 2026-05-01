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

export function Step2({ data, updateData, nextStep, prevStep, error }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-medium">
          Abra seu banco agora. Se você usa mais de um, some os saldos de todos e insira o total
          aqui.
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="balance">Saldo atual</Label>
          <Input
            id="balance"
            type="number"
            inputMode="decimal"
            value={data.initialBalance || ''}
            onChange={(e) => updateData({ initialBalance: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
          <p className="text-sm text-muted-foreground">
            Este valor será registrado como Entrada no dia de hoje.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={prevStep}>
            Voltar
          </Button>
          <Button className="flex-1" size="lg" onClick={nextStep}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
