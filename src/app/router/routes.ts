export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '*',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
