export default function Home() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Diário Financeiro</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Acompanhe suas movimentações diárias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Empty state placeholders */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Saldo Atual</h3>
          <p className="text-3xl font-serif mt-2">R$ 0,00</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Receitas do Mês</h3>
          <p className="text-3xl font-serif mt-2 text-green-600 dark:text-green-500">R$ 0,00</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Despesas do Mês</h3>
          <p className="text-3xl font-serif mt-2 text-destructive">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}
