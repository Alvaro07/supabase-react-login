import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { ROUTES } from '@app/router/routes'
import type { LoginCredentials } from '../api/authApi'

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true)
    setError(null)

    const result = await authApi.signIn(credentials)

    if (result.error) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    await navigate(ROUTES.DASHBOARD, { replace: true })
    setIsLoading(false)
  }

  return {
    login,
    isLoading,
    error,
    clearError: () => {
      setError(null)
    },
  }
}
