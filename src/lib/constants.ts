import { Home, LayoutDashboard, PiggyBank, Wallet, Settings, ShieldAlert } from 'lucide-react'

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ECONOMIA: '/economia',
  CONTAS: '/contas',
  CONFIGURACOES: '/configuracoes',
  ONBOARDING: '/onboarding',
  RESERVA: '/reserva',
} as const

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Diário', icon: Home },
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.ECONOMIA, label: 'Economia', icon: PiggyBank },
  { path: ROUTES.CONTAS, label: 'Contas', icon: Wallet },
  { path: ROUTES.CONFIGURACOES, label: 'Config.', icon: Settings },
]

export const SECONDARY_NAV_ITEMS = [
  { path: ROUTES.RESERVA, label: 'Reserva de Emergência', icon: ShieldAlert },
]

export const ERROR_MESSAGES = {
  DEFAULT: 'Ocorreu um erro inesperado.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  NOT_FOUND: 'Recurso não encontrado.',
  UNAUTHORIZED: 'Você não tem permissão para acessar esta página.',
} as const
