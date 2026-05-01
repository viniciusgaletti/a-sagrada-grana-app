# PRD — A Sagrada Grana
## Product Requirements Document

**Versão:** 2.0
**Data:** Maio/2026
**Autor:** Vinícius Galetti
**Status:** Final (aprovado para desenvolvimento)

---

## 1. Visão do Produto

### 1.1 Problema

Planilhas de controle financeiro pessoal são funcionais, mas criam fricção no uso diário: navegação lenta, interface sem hierarquia visual, ausência de feedbacks intuitivos e preenchimento manual propenso a erro (ex: somar múltiplos gastos na mesma célula digitando fórmulas). Isso reduz a consistência de uso e, consequentemente, a consciência financeira da pessoa.

### 1.2 Solução

Um aplicativo web de uso pessoal que replica a lógica da planilha com fidelidade total, e elimina as fricções de interface sem adicionar complexidade desnecessária. O princípio central é: **cada campo, cada número e cada tela existe por um motivo financeiro concreto.**

### 1.3 Proposta de Valor

A Sagrada Grana é o único lugar onde o usuário registra e visualiza o impacto financeiro real das suas decisões no presente e no futuro, com a disciplina de uma planilha e a experiência de um produto moderno.

### 1.4 Público-alvo

Uso pessoal do autor. Estrutura pensada para escalar a produto futuro.

---

## 2. Princípios de Design do Produto

**Fidelidade ao modelo mental da planilha.** A lógica de Entrada, Saída, Investimento e Diário não muda. O usuário que vem da planilha não precisa reaprender nada.

**Eficiência no preenchimento diário.** O fluxo de registrar um gasto precisa ter o menor número de toques possível. Sem modais complexos, sem excesso de campos obrigatórios.

**O saldo é a estrela.** Toda interface converge para tornar o saldo atual e o saldo futuro legíveis de imediato.

**Sem integrações, sem automações de dados externos.** O preenchimento manual é intencional: ele mantém o usuário contextualizado sobre seus próprios gastos. O app não conecta com bancos, não importa extratos.

---

## 3. Design System

### 3.1 Tipografia

| Papel | Família | Estilo | Uso |
|---|---|---|---|
| Headline | Instrument Serif (serifada) | Regular e Itálico alternados | Títulos de tela, saldo principal, números de destaque |
| Corpo | DM Sans (sans-serif) | Regular | Labels, campos, descrições, navegação, botões |

Hierarquia intencional: Instrument Serif traz elegância editorial para os números e títulos que importam. A alternância entre regular e itálico cria ritmo visual. DM Sans garante legibilidade máxima em tudo que é funcional.

### 3.2 Tokens de Design (CSS Variables)

```css
:root {
  --card: #f5f5f4;
  --ring: #6366f1;
  --input: #d6d3d1;
  --muted: #e7e5e4;
  --accent: #f3e5f5;
  --border: #d6d3d1;
  --radius: 1.25rem;
  --chart-1: #6366f1;
  --chart-2: #4f46e5;
  --chart-3: #4338ca;
  --chart-4: #3730a3;
  --chart-5: #312e81;
  --popover: #f5f5f4;
  --primary: #6366f1;
  --sidebar: #d6d3d1;
  --font-serif: Instrument Serif, serif;
  --font-sans: DM Sans, sans-serif;
  --secondary: #d6d3d1;
  --background: #e7e5e4;
  --foreground: #1e293b;
  --destructive: #ef4444;
  --shadow-blur: 10px;
  --shadow-color: hsl(240 4% 60%);
  --sidebar-ring: #6366f1;
  --shadow-spread: 4px;
  --shadow-opacity: 0.18;
  --sidebar-accent: #f3e5f5;
  --sidebar-border: #d6d3d1;
  --card-foreground: #1e293b;
  --shadow-offset-x: 2px;
  --shadow-offset-y: 2px;
  --sidebar-primary: #6366f1;
  --muted-foreground: #6b7280;
  --accent-foreground: #374151;
  --popover-foreground: #1e293b;
  --primary-foreground: #ffffff;
  --sidebar-foreground: #1e293b;
  --secondary-foreground: #4b5563;
  --destructive-foreground: #ffffff;
  --sidebar-accent-foreground: #374151;
  --sidebar-primary-foreground: #ffffff;
}

.dark {
  --card: #2c2825;
  --ring: #818cf8;
  --input: #3a3633;
  --muted: #2c2825;
  --accent: #484441;
  --border: #3a3633;
  --radius: 1.25rem;
  --chart-1: #818cf8;
  --chart-2: #6366f1;
  --chart-3: #4f46e5;
  --chart-4: #4338ca;
  --chart-5: #3730a3;
  --popover: #2c2825;
  --primary: #818cf8;
  --sidebar: #3a3633;
  --secondary: #3a3633;
  --background: #1e1b18;
  --foreground: #e2e8f0;
  --destructive: #ef4444;
  --shadow-color: hsl(0 0% 0%);
  --sidebar-ring: #818cf8;
  --sidebar-accent: #484441;
  --sidebar-border: #3a3633;
  --card-foreground: #e2e8f0;
  --sidebar-primary: #818cf8;
  --muted-foreground: #9ca3af;
  --accent-foreground: #d1d5db;
  --popover-foreground: #e2e8f0;
  --primary-foreground: #1e1b18;
  --sidebar-foreground: #e2e8f0;
  --secondary-foreground: #d1d5db;
  --destructive-foreground: #1e1b18;
  --sidebar-accent-foreground: #d1d5db;
  --sidebar-primary-foreground: #1e1b18;
}
```

### 3.3 Cores por Função

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | `#e7e5e4` | `#1e1b18` | Fundo da página |
| `--card` | `#f5f5f4` | `#2c2825` | Fundo dos cards |
| `--primary` | `#6366f1` | `#818cf8` | Cor principal, CTAs, destaques |
| `--foreground` | `#1e293b` | `#e2e8f0` | Texto principal |
| `--muted-foreground` | `#6b7280` | `#9ca3af` | Texto secundário, labels |
| `--border` | `#d6d3d1` | `#3a3633` | Bordas e divisores |
| `--destructive` | `#ef4444` | `#ef4444` | Performance negativa, erros |

### 3.4 Tokens de Estado Financeiro

Além das variáveis base, o sistema usa classes semânticas para estados financeiros:

- **Performance positiva:** `text-emerald-600` (light) / `text-emerald-400` (dark)
- **Performance negativa:** `text-destructive` (`#ef4444`)
- **Valor estimado:** cor primária com opacidade 35% (`text-primary/35`)
- **Valor confirmado:** cor padrão do foreground

### 3.5 Componentes

- Cards: `rounded-[var(--radius)] bg-card` com sombra suave
- Botões primários: `rounded-full bg-primary text-primary-foreground`
- Inputs: `border-input bg-background rounded-[var(--radius)]`
- Bottom navigation bar fixa no mobile
- Border radius padrão: `1.25rem`

---

## 4. Onboarding

Fluxo exibido apenas na primeira abertura do app. Composto por quatro etapas sequenciais, sem possibilidade de pular. Todas as informações coletadas ficam registradas e editáveis posteriormente na tela de Configurações.

---

### Etapa 1 — Identificação

Campo único:

- **Apelido do usuário** (texto livre, obrigatório)

Usado para personalizar a interface ("Olá, Vini" no topo da tela principal).

---

### Etapa 2 — Saldo Inicial

Campo único:

- **Saldo atual** (valor numérico, obrigatório)

**Instrução exibida para o usuário:**
> "Abra seu banco agora. Se você usa mais de um, some os saldos de todos e insira o total aqui."

**Comportamento técnico:**
O valor inserido é lançado como **Entrada** no dia exato em que o onboarding está sendo preenchido. Exemplo: se o usuário preenche em 01/05/2026 com R$ 2.000, o app registra R$ 2.000 na coluna Entrada do dia 01/05/2026. Esse lançamento alimenta o cálculo do saldo e já impacta o horizonte de saldo imediatamente.

Esse registro é identificado internamente como "Saldo inicial" para diferenciação nos relatórios.

---

### Etapa 3 — Gastos Fixos

O usuário cadastra suas saídas recorrentes. Cada item tem três campos:

| Campo | Tipo | Observação |
|---|---|---|
| Descrição | Texto livre | Ex: "Aluguel", "Academia", "ChatGPT" |
| Valor | Numérico | Valor mensal da despesa |
| Dia de vencimento | Número (1–31) | Dia do mês em que a conta vence |
| Categoria | Seleção | Lista de categorias pré-definidas |

O usuário pode adicionar quantos itens quiser. Botão "Adicionar outra conta" ao final da lista.

**Comportamento técnico:**
Os gastos fixos cadastrados aqui **não são lançados automaticamente** no Diário. Eles alimentam apenas o **Plano de Contas**, que é uma tela de referência visual. O usuário continua lançando manualmente na coluna Saída quando a conta efetivamente sai.

---

### Etapa 4 — Gastos Variáveis do Mês

O usuário informa o total estimado de gastos variáveis para o mês atual. Não é por categoria individual, é um valor único total.

**Instrução exibida para o usuário:**
> "Pense em tudo que você gasta de forma variável no mês: mercado, farmácia, lazer, delivery, transporte. Some tudo e coloque aqui."

Campo:

- **Total estimado de gastos variáveis** (valor numérico, obrigatório)

**Cálculo automático:**

```
Gasto médio diário = Total estimado / 31
```

Exemplo: R$ 3.000 / 31 = R$ 96,77/dia

**Comportamento técnico:**
O valor de R$ 96,77 é pré-populado na coluna **Diário** de todos os dias do mês atual e dos meses futuros. Esse valor representa a estimativa diária de gasto variável e serve como ponto de partida para o usuário ajustar conforme a realidade de cada dia.

**Estado visual dos valores pré-populados:**
Valores gerados automaticamente pelo app (não editados pelo usuário) são exibidos em **cor apagada** (ex: cinza claro ou roxo com baixa opacidade). Quando o usuário edita o valor de um dia, ele assume a **cor padrão confirmada**, indicando que aquele dado reflete a realidade registrada. Essa distinção visual persiste em todos os dias, incluindo dias passados não confirmados.

**Indicador de referência na tela principal:**
O gasto médio diário calculado também aparece como um indicador fixo no topo da tela principal: "Média diária estimada: R$ 96,77". Serve como âncora comportamental para o usuário durante o uso diário.

---

### Fim do Onboarding

Tela de confirmação com resumo do que foi configurado e botão "Começar". O usuário é direcionado para a tela principal (Diário Financeiro) já no dia atual, com o saldo inicial visível.

---

## 5. Funcionalidades Principais

### 5.1 Diário Financeiro (tela principal)

A tela central do app. Exibe o mês atual com os dias listados, cada dia com quatro campos editáveis.

#### Campos por dia

| Campo | Tipo | Comportamento no saldo |
|---|---|---|
| Entrada | Valor numérico | Soma ao saldo |
| Saída | Valor numérico | Deduz do saldo |
| Investimento | Valor numérico | Deduz do saldo |
| Diário | Campo composto | Deduz do saldo (detalhado abaixo) |
| Saldo | Calculado | Não editável. Acumulado contínuo |

#### Campo Diário — comportamento detalhado

O valor exibido na célula é a soma de todas as transações do dia. Ao tocar ou clicar no campo, abre um painel com:

- Lista das transações do dia (valor + categoria)
- Botão para adicionar nova transação
- Total calculado automaticamente
- Opção de editar e excluir cada transação

Ao editar qualquer valor do campo Diário, o estado do dia muda de "estimado" para "confirmado" e a cor atualiza conforme o design system.

#### Fórmula do Saldo

```
Saldo[dia N] = Saldo[dia N-1] + Entrada[N] - Saída[N] - Investimento[N] - Diário[N]

Primeiro dia do histórico:
Saldo[dia 1] = Entrada[1] - Saída[1] - Investimento[1] - Diário[1]

Primeiro dia de cada mês subsequente:
Saldo[dia 1] = Saldo[último dia do mês anterior] + Entrada[1] - Saída[1] - Investimento[1] - Diário[1]
```

#### Estado dos valores por dia

| Estado | Cor | Origem |
|---|---|---|
| Estimado | Apagada (cinza claro ou roxo com baixa opacidade) | Gerado automaticamente pelo app |
| Confirmado | Cor padrão da interface | Editado manualmente pelo usuário |

#### Indicador de último registro

No topo da tela: "Último registro: [data e hora da última edição]". Atualizado automaticamente a cada interação.

---

### 5.2 Navegação por Horizonte de Saldo

Navegação horizontal contínua entre meses:

- **Mobile:** swipe com o dedo (touch/drag)
- **Desktop:** scroll horizontal com dois dedos no trackpad

Sem troca de tela. O conteúdo desliza como carrossel contínuo.

#### Meses passados
Dados reais registrados. Valores confirmados em cor padrão, valores estimados nunca confirmados em cor apagada.

#### Mês atual
Tela principal. Editável.

#### Meses futuros
Estrutura de dias vazia, sem dados pré-populados exceto o valor de gasto médio diário (pré-populado em cor apagada). O saldo do primeiro dia futuro parte do saldo final do mês anterior e acumula conforme os dias seguintes. Nenhum dado novo é criado automaticamente além do gasto médio diário.

#### Indicador de posição
Componente no topo exibindo mês e ano visível. Atualiza em tempo real durante a navegação. Quando fora do mês atual, um botão "Voltar para hoje" aparece de forma discreta.

---

### 5.3 Resumo Mensal

Painel colapsável no rodapé de cada mês com as seguintes métricas:

| Métrica | Cálculo |
|---|---|
| Total de Entradas | Soma de todas as entradas do mês |
| Total de Saídas | Soma de todas as saídas do mês |
| Total de Investimentos | Soma de todos os investimentos do mês |
| Total Diário | Soma de todos os gastos diários do mês |
| Saída Total | Saídas + Investimentos + Diário |
| Performance bruta | Entradas - Saída Total |
| Performance de consumo | Entradas - (Saídas + Diário) |
| Taxa de economia | Investimentos / Entradas (%) |

**Performance bruta:** fluxo líquido real incluindo investimentos. Pode ser negativa em meses de alto investimento, o que é matematicamente correto.

**Performance de consumo:** comportamento de gasto real, sem penalizar a disciplina de poupar. É o número que reflete se o usuário viveu dentro ou fora do que ganhou.

Meses com performance negativa recebem destaque visual (cor vermelha ou indicador específico).

---

### 5.4 Painel de Economia Anual

Tela separada. Exibe tabela com os 12 meses do ano selecionado:

| Mês | Entradas | Investimentos | % Guardado |
|---|---|---|---|
| Janeiro | R$ 2.813,53 | R$ 0,00 | 0% |
| Fevereiro | R$ 2.558,06 | R$ 500,00 | 19,5% |
| ... | ... | ... | ... |
| TOTAL | R$ 64.393,56 | R$ 13.278,88 | 20,6% |

Valores puxados automaticamente do Diário Financeiro. Navegação entre anos disponível. Linha de total anual fixada no rodapé.

---

### 5.5 Categorias de Gastos Diários

#### Categorias pré-definidas (padrão do sistema)

- Alimentação
- Transporte
- Saúde e Farmácia
- Lazer e Entretenimento
- Mercado
- Assinaturas e Serviços
- Vestuário
- Educação
- Outros

#### Gerenciamento de categorias

Acessível em Configurações. O usuário pode:

- Renomear qualquer categoria existente
- Criar novas categorias
- Definir cor ou ícone para cada categoria
- Arquivar categorias sem transações vinculadas

Categorias com transações vinculadas não podem ser excluídas, apenas arquivadas.

---

### 5.6 Dashboard de Gastos por Categoria

Tela separada. Foco em visualização, sem edição.

#### Filtros disponíveis

- Período: mês específico, últimos 3 meses, últimos 6 meses, ano completo, intervalo customizado

#### Visualizações

**Distribuição por categoria:** gráfico de rosca ou barras horizontais com percentual e valor absoluto de cada categoria.

**Evolução mensal por categoria:** gráfico de linhas ou barras empilhadas mostrando a evolução ao longo dos meses selecionados.

**Tabela de detalhes:** lista de todas as transações do período com data, valor, categoria e descrição opcional.

**Comparativo com média:** gasto do mês atual vs. média dos últimos 3 meses por categoria. Indicador visual de acima ou abaixo da média.

**Nota:** apenas transações com status "confirmado" entram nos relatórios do dashboard. Valores estimados não confirmados são excluídos para garantir a confiabilidade dos dados analíticos.

---

### 5.7 Plano de Contas

Tela de referência das obrigações financeiras fixas cadastradas no onboarding. Editável a qualquer momento.

#### Entradas fixas

| Campo | Tipo |
|---|---|
| Descrição | Texto |
| Valor | Numérico |
| Dia de recebimento | Número (1–31) |
| Ativo/inativo | Toggle |

#### Saídas fixas

| Campo | Tipo |
|---|---|
| Descrição | Texto |
| Valor | Numérico |
| Dia de vencimento | Número (1–31) |
| Categoria | Seleção |
| Ativo/inativo | Toggle |

#### Totais calculados

- Total de entradas fixas mensais
- Total de saídas fixas mensais
- Saldo fixo estimado (entradas - saídas)

O Plano de Contas é referência visual. Não pré-popula o Diário automaticamente.

---

### 5.8 Reserva de Emergência

Tela de cálculo automático baseada nos dados reais registrados. Usa apenas transações com status "confirmado".

#### Cálculo

```
Saída Líquida[mês] = Saída Total[mês] - Investimentos[mês]

Média Saída Líquida = AVERAGE(meses selecionados com dados confirmados)

Reserva 3 meses  = Média × 3
Reserva 6 meses  = Média × 6
Reserva 12 meses = Média × 12
```

#### Exibição

- Média mensal atual de gastos líquidos
- Cards com as três metas (3, 6 e 12 meses)
- Seletor do período de cálculo: últimos 3 meses, 6 meses, 12 meses, ou desde o início

---

## 6. Telas do Sistema

| Tela | Rota sugerida | Descrição |
|---|---|---|
| Onboarding | `/onboarding` | Fluxo inicial de 4 etapas |
| Diário Financeiro | `/` | Tela principal, mês atual |
| Dashboard de Categorias | `/dashboard` | Visualização de gastos por categoria |
| Economia Anual | `/economia` | Painel de poupança anual |
| Plano de Contas | `/contas` | Referência de fixos (editável) |
| Reserva de Emergência | `/reserva` | Cálculo da reserva |
| Configurações | `/configuracoes` | Categorias, apelido, gasto médio diário, exportação |

---

## 7. Requisitos Técnicos

### 7.1 Plataforma

- Aplicação web responsiva, mobile-first
- Funciona em desktop e mobile via browser
- Sem necessidade de app nativo instalado
- Desenvolvida via vibecoding com Claude Code

### 7.2 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Estilização | Tailwind CSS |
| Backend | Supabase (banco de dados, autenticação e storage) |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth (email/senha ou magic link) |
| Deploy | A definir (Vercel ou Netlify recomendado) |

O Supabase está presente desde a v1. Isso garante que os dados do usuário não ficam presos no browser, permite acesso de múltiplos dispositivos e prepara a base para uma eventual evolução do produto para multi-usuário sem reescrever a arquitetura.

### 7.3 Modelo de Dados (visão de alto nível)

As seguintes entidades são necessárias para suportar todas as funcionalidades descritas neste PRD:

**users** — perfil do usuário (apelido, gasto médio diário configurado no onboarding)

**transactions** — cada lançamento individual no Diário. Campos essenciais: user_id, date, type (entrada / saida / investimento / diario), amount, status (estimado / confirmado), category_id (nullable, apenas para type=diario), description (opcional)

**categories** — categorias de gastos diários. Campos: user_id, name, color, icon, archived

**fixed_accounts** — Plano de Contas. Campos: user_id, description, amount, due_day, type (entrada / saida), category_id, active

O saldo nunca é armazenado diretamente. É sempre calculado dinamicamente a partir das transactions, em ordem cronológica, desde o primeiro registro.

### 7.4 Gestos e Interação

- Swipe horizontal para navegar entre meses (mobile, touch)
- Scroll horizontal com dois dedos via trackpad (desktop)
- Tap para abrir o painel de transações do Diário
- `inputmode="decimal"` em todos os campos numéricos

### 7.5 Performance

- Carregamento instantâneo da tela principal
- Cálculo de saldo em tempo real sem delay perceptível durante edição
- Navegação entre meses sem recarregamento de página

---

## 8. Fora do Escopo (MVP)

- Importação de extratos bancários
- Integração com Open Finance
- Múltiplos usuários ou contas compartilhadas
- Metas financeiras automatizadas
- Notificações push
- Sincronização em nuvem
- Relatórios em PDF
- Suporte a múltiplas moedas

---

## 9. Critérios de Sucesso

O produto está funcionando corretamente quando:

- O saldo do dia reflete com precisão todas as transações registradas desde o primeiro dia do histórico
- Navegar 12 meses para frente ou para trás é fluido e sem bugs de cálculo
- Registrar um gasto diário com categoria leva menos de 10 segundos
- O Painel de Economia exibe os mesmos números que a planilha original para os meses já registrados
- Os dados persistem após fechar e reabrir o browser
- Valores estimados e confirmados são distinguíveis visualmente em qualquer tela

---

## 10. Decisões de Produto Registradas

| Decisão | Justificativa |
|---|---|
| Investimento como coluna separada | Viabiliza Performance bruta e Performance de consumo de forma independente, além de alimentar a taxa de economia real |
| Meses futuros sem pré-população exceto gasto médio diário | O gasto médio diário é a base do modelo financeiro. Meses futuros partem do saldo atual real |
| Categorias pré-definidas editáveis, não livres | Garante consistência dos dados para o dashboard. Categorias livres geram ruído nos relatórios |
| Sem backend no MVP | Reduz complexidade, elimina dependência de infraestrutura e mantém o dado privado |
| Campo Diário com detalhamento por transação mas exibição como soma | Resolve a fricção de digitar fórmulas na planilha sem mudar o modelo mental de "um número por dia" |
| Performance em dois números, bruta e de consumo | A planilha original mistura os dois, gerando leituras distorcidas em meses de alto investimento |
| Saldo inicial do onboarding lançado como Entrada no dia do preenchimento | Garante que o horizonte de saldo seja real desde o primeiro uso |
| Gastos fixos do onboarding vão apenas para o Plano de Contas, não para o Diário | Pré-população automática de saídas fixas criaria registros que o usuário precisaria corrigir quando valores mudam ou contas são canceladas |
| Gasto médio diário pré-populado no campo Diário em cor apagada | O usuário tem um ponto de partida realista para cada dia, mas é incentivado a confirmar o valor real. Valores não confirmados são excluídos dos relatórios analíticos |
| Valores estimados excluídos do dashboard | Relatórios baseados em dados não confirmados não refletem a realidade e comprometem a confiabilidade da análise |
| Onboarding obrigatório sem possibilidade de pular | O saldo inicial, os fixos e o gasto médio são necessários para que qualquer cálculo do app faça sentido desde o primeiro uso |
| Edição do saldo inicial feita diretamente na célula de Entrada do dia em que foi registrado | Não existe campo especial em Configurações para isso. O lançamento de saldo inicial é uma Entrada como qualquer outra, editável pelo Diário Financeiro na data original |
| Backend Supabase presente desde a v1 | Garante acesso multi-dispositivo, elimina risco de perda de dados do browser e prepara a arquitetura para evolução futura sem reescrita |

---

*Documento final aprovado para desenvolvimento — A Sagrada Grana*