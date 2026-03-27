import { useEffect } from 'react'
import { supabase } from '@shared/lib/supabase'
import { useAuthStore } from './authStore'

export const useSession = () => {
  const setSession = useAuthStore((state) => state.setSession)
  const setLoading = useAuthStore((state) => state.setLoading)
  const reset = useAuthStore((state) => state.reset)

  useEffect(() => {
    // Función async definida dentro del efecto — patrón correcto
    // useEffect no puede ser async directamente porque debe devolver
    // undefined o una función de cleanup, nunca una Promise
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch (error) {
        // Si falla la recuperación de sesión, reseteamos el store
        // para evitar un estado inconsistente — la app arranca limpia
        console.error('Error initializing session:', error)
        reset()
      } finally {
        // finally garantiza que isLoading pasa a false siempre,
        // tanto si hay sesión como si hay error — sin esto la app
        // podría quedarse en estado de carga indefinidamente
        setLoading(false)
      }
    }

    // void le dice al linter que la Promise es intencionalmente
    // no awaited — el manejo real del error está en el try/catch
    void initSession()

    // Listener que mantiene el store sincronizado con Supabase
    // en tiempo real durante toda la vida de la app:
    // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
      } else {
        // Sin sesión — limpiamos el usuario y sesión
        setSession(null)
      }
    })

    // Cleanup — cancelar la suscripción cuando el componente
    // que monta este hook se desmonta, evitando memory leaks
    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, reset])
}
