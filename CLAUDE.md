# A Sagrada Grana

App web de gestão financeira pessoal. O usuário registra entradas, saídas, investimentos e gastos diários manualmente, sem integrações bancárias. O preenchimento manual é intencional.

Leia @docs/PRD_a_sagrada_grana.md antes de implementar qualquer funcionalidade.
O schema do banco está em @docs/schema_supabase.sql.

## Stack

- React + Vite + TypeScript (strict)
- Tailwind CSS
- Supabase (PostgreSQL + Auth)

## Estrutura

```
src/
  components/   # componentes reutilizáveis
    ui/         # Button, Card, Input, etc.
    layout/     # Shell, BottomNav, Header
  pages/        # uma pasta por rota
  hooks/        # custom hooks
  services/     # todo acesso ao Supabase fica aqui
  types/        # tipos TypeScript do domínio
  utils/        # funções puras (balance.ts, format.ts)
docs/
  PRD_a_sagrada_grana.md
  schema_supabase.sql
```

## Como rodar

```bash
pnpm install
pnpm dev          # desenvolvimento
pnpm build        # build de produção
pnpm typecheck    # verificar tipos
```

## Design System

Tipografia:
- Headlines e números de destaque: Instrument Serif (regular e itálico alternados)
- Corpo e UI: DM Sans

CSS variables completas estão no PRD seção 3.2. As mais usadas:
- --primary: #6366f1 (light) / #818cf8 (dark)
- --background: #e7e5e4 (light) / #1e1b18 (dark)
- --card: #f5f5f4 (light) / #2c2825 (dark)
- --foreground: #1e293b (light) / #e2e8f0 (dark)
- --radius: 1.25rem

Estados financeiros:
- Valor estimado: text-primary/35 (opacidade 35%)
- Valor confirmado: cor padrão do foreground
- Performance positiva: text-emerald-600 (light) / text-emerald-400 (dark)
- Performance negativa: var(--destructive) #ef4444

## Regras críticas de negócio

**NUNCA armazene saldo calculado.** O saldo é sempre derivado das transactions + monthly_snapshots. Use a função `get_balance_at_date(user_id, date)` do Supabase.

**NUNCA acesse o Supabase fora de `src/services/`.** Componentes e hooks chamam apenas funções de services.

**Transactions com `status='estimado'` são excluídas de todos os cálculos analíticos** (dashboard, reserva de emergência). Apenas `status='confirmado'` entra nos relatórios.

**O Plano de Contas não pré-popula o Diário.** É referência visual apenas.

## Ordem de desenvolvimento

Siga essa sequência sem pular etapas:

1. Setup (Vite + React + Tailwind + Supabase client)
2. Autenticação
3. Onboarding (4 etapas)
4. Diário Financeiro + cálculo de saldo
5. Navegação por horizonte (swipe mobile + trackpad desktop)
6. Resumo mensal
7. Campo Diário com detalhamento por transação e categorias
8. Plano de Contas
9. Painel de Economia Anual
10. Dashboard de categorias
11. Reserva de Emergência
12. Configurações