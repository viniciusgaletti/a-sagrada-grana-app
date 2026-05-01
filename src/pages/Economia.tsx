export default function Economia() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Economia Anual</h1>
        <p className="text-muted-foreground">Acompanhe sua taxa de poupança ao longo do ano.</p>
      </div>

      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-accent/20">
        <p>Dados insuficientes para gerar o relatório anual.</p>
      </div>
    </div>
  )
}
