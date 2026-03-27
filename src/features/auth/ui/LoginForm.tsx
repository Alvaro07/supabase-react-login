import { useState } from 'react'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { classNames } from 'primereact/utils'
import { useLogin } from '../model/useLogin'
import type { LoginCredentials } from '../api/authApi'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export const LoginForm = () => {
  const { login, isLoading, error, clearError } = useLogin()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Validación local antes de llamar a la API
  // Evita llamadas innecesarias a Supabase con datos inválidos
  const validate = (): boolean => {
    const errors: FormErrors = {}

    if (!form.email) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'El email no tiene un formato válido'
    }

    if (!form.password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validate()) return

    const credentials: LoginCredentials = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    }

    await login(credentials)
  }

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

    // Limpia el error del campo cuando el usuario empieza a corregir
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Card className="w-full md:w-25rem shadow-2">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-900 text-3xl font-medium mb-2">Bienvenido</div>
          <span className="text-600">Inicia sesión para continuar</span>
        </div>

        {/* Error global de la API */}
        {error && <Message severity="error" text={error} className="w-full mb-4" />}

        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          noValidate
        >
          {/* Campo email */}
          <div className="field mb-4">
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="tu@email.com"
              className={classNames('w-full', {
                'p-invalid': !!formErrors.email,
              })}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {formErrors.email && <small className="p-error mt-1 block">{formErrors.email}</small>}
          </div>

          {/* Campo password */}
          <div className="field mb-5">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              Contraseña
            </label>
            <Password
              inputId="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Tu contraseña"
              className={classNames('w-full', {
                'p-invalid': !!formErrors.password,
              })}
              inputClassName="w-full"
              disabled={isLoading}
              feedback={false}
              toggleMask
              autoComplete="current-password"
            />
            {formErrors.password && (
              <small className="p-error mt-1 block">{formErrors.password}</small>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            label={isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          />
        </form>
      </Card>
    </div>
  )
}
