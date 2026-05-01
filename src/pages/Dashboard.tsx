export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-semibold tracking-tight">
          Dashboard de Categorias
        </h1>
        <p className="text-muted-foreground">Visualize seus gastos e receitas por categoria.</p>
      </div>

      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-accent/20">
        <p>Nenhuma categoria cadastrada ainda.</p>
      </div>
    </div>
  )
}
