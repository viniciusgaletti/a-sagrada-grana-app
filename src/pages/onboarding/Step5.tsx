import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/services/onboarding.service'
import { Loader2 } from 'lucide-react'

interface Props {
  data: OnboardingData
  prevStep: () => void
  submit: () => void
  loading: boolean
}

export function Step5({ data, prevStep, submit, loading }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-semibold text-primary">Tudo Certo!</h2>
        <p className="text-muted-foreground">Confirme seus dados para começar</p>
      </div>

      <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-muted-foreground text-sm">Apelido</span>
            <span className="font-medium">{data.nickname}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-muted-foreground text-sm">Saldo inicial</span>
            <span className="font-medium">
              R$ {data.initialBalance.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-muted-foreground text-sm">Gastos fixos</span>
            <span className="font-medium">{data.fixedAccounts.length} contas cadastradas</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground text-sm">Gasto médio diário</span>
            <span className="font-semibold text-primary">
              R$ {data.dailyAverageExpense.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={prevStep} disabled={loading}>
          Voltar
        </Button>
        <Button className="flex-1" size="lg" onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Começar
        </Button>
      </div>
    </div>
  )
}
