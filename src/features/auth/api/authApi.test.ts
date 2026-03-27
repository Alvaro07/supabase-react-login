import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@shared/lib/test/server'
import { authApi } from './authApi'

// URL base de Supabase — la cogemos del entorno
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

describe('authApi', () => {
  describe('signIn', () => {
    it('devuelve data sin error cuando las credenciales son correctas', async () => {
      // Definimos el handler para esta petición concreta
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: 9999999999,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'user-id',
              aud: 'authenticated',
              role: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: '2023-01-01T00:00:00Z',
              app_metadata: {},
              user_metadata: {},
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          })
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeUndefined()
    })

    it('devuelve error mapeado cuando las credenciales son incorrectas', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'Invalid login credentials' },
            { status: 400 },
          )
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      // Verificamos que el mensaje está traducido
      expect(result.error?.message).toBe('Email o contraseña incorrectos')
    })

    it('devuelve mensaje genérico para errores no mapeados', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error: 'server_error', error_description: 'Something unexpected' },
            { status: 500 },
          )
        }),
      )

      const result = await authApi.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error?.message).toBe('Ha ocurrido un error. Inténtalo de nuevo')
    })
  })

  describe('signOut', () => {
    it('devuelve data sin error al cerrar sesión correctamente', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return new HttpResponse(null, { status: 204 })
        }),
      )

      const result = await authApi.signOut()

      expect(result.error).toBeNull()
    })
  })
})
