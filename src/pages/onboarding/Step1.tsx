import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { OnboardingData } from '@/services/onboarding.service'

interface Props {
  data: OnboardingData
  updateData: (d: Partial<OnboardingData>) => void
  nextStep: () => void
  error: string | null
}

export function Step1({ data, updateData, nextStep, error }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-serif font-semibold">
          Como você gostaria de ser chamado no app?
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">Seu apelido</Label>
          <Input
            id="nickname"
            value={data.nickname}
            onChange={(e) => updateData({ nickname: e.target.value })}
            placeholder="Ex: João"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button className="w-full" size="lg" onClick={nextStep}>
          Próximo
        </Button>
      </div>
    </div>
  )
}
