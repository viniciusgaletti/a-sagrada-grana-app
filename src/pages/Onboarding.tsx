import { useOnboarding } from '@/hooks/use-onboarding'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Step1 } from './onboarding/Step1'
import { Step2 } from './onboarding/Step2'
import { Step3 } from './onboarding/Step3'
import { Step4 } from './onboarding/Step4'
import { Step5 } from './onboarding/Step5'
import { PiggyBank } from 'lucide-react'

export default function Onboarding() {
  const { step, data, updateData, nextStep, prevStep, submit, error, loading } = useOnboarding()

  const progress = (step / 5) * 100

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8 animate-fade-in-down">
          <div className="bg-primary/10 p-4 rounded-full">
            <PiggyBank className="h-10 w-10 text-primary" />
          </div>
        </div>

        <Card className="w-full shadow-xl border-muted/50 overflow-hidden">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
              <span>Passo {step} de 5</span>
              <span>{Math.round(progress)}% Completo</span>
            </div>
            <Progress value={progress} className="h-2 transition-all duration-500 ease-in-out" />
          </CardHeader>
          <CardContent className="pt-2 pb-8">
            {step === 1 && (
              <Step1 data={data} updateData={updateData} nextStep={nextStep} error={error} />
            )}
            {step === 2 && (
              <Step2
                data={data}
                updateData={updateData}
                nextStep={nextStep}
                prevStep={prevStep}
                error={error}
              />
            )}
            {step === 3 && (
              <Step3
                data={data}
                updateData={updateData}
                nextStep={nextStep}
                prevStep={prevStep}
                error={error}
              />
            )}
            {step === 4 && (
              <Step4
                data={data}
                updateData={updateData}
                nextStep={nextStep}
                prevStep={prevStep}
                error={error}
              />
            )}
            {step === 5 && (
              <Step5 data={data} prevStep={prevStep} submit={submit} loading={loading} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
