import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="max-w-md w-full space-y-6 text-center">
        <div>
          <h1 className="text-8xl font-serif font-bold text-primary/20">404</h1>
          <h2 className="text-2xl font-serif font-semibold mt-4">Página não encontrada</h2>
          <p className="text-muted-foreground mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <div className="pt-4">
          <Link to={ROUTES.HOME}>
            <Button>Voltar para o Início</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
