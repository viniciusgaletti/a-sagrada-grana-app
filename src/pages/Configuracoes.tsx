export default function Configuracoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Ajuste suas preferências de aplicativo.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <h3 className="font-medium">Perfil</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus dados pessoais</p>
            </div>
            <button className="text-sm text-primary hover:underline">Editar</button>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <h3 className="font-medium">Notificações</h3>
              <p className="text-sm text-muted-foreground">Configure os alertas recebidos</p>
            </div>
            <button className="text-sm text-primary hover:underline">Configurar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
