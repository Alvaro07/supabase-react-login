import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { useAuthStore, selectUser } from '@features/auth'
import { authApi } from '@features/auth'

export const DashboardPage = () => {
  const user = useAuthStore(selectUser)

  const handleLogout = async () => {
    await authApi.signOut()
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Card className="w-full md:w-30rem shadow-2">
        <div className="text-center">
          <div className="text-900 text-3xl font-medium mb-2">Dashboard</div>
          <p className="text-600 mb-1">Sesión activa como:</p>
          <p className="text-900 font-medium mb-5">{user?.email}</p>

          <Button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            severity="secondary"
            outlined
            onClick={() => {
              void handleLogout()
            }}
          />
        </div>
      </Card>
    </div>
  )
}
