import { Link } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Onboarding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <PiggyBank className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-semibold">Sagrada Grana</h1>
          <p className="text-muted-foreground text-lg">
            Sua jornada para a paz financeira começa aqui. Organize, planeje e prospere.
          </p>
        </div>

        <div className="pt-8">
          <Link to="/">
            <Button size="lg" className="w-full">
              Começar Agora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
