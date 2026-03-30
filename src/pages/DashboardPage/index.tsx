import { useAuthStore, selectUser } from '@features/auth'
import { authApi } from '@features/auth'

const getInitials = (email: string): string => {
  const parts = email.split('@')[0]?.split(/[._-]/) ?? []
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
}

export const DashboardPage = () => {
  const user = useAuthStore(selectUser)

  const handleLogout = async () => {
    await authApi.signOut()
  }

  const initials = user?.email ? getInitials(user.email) : '?'

  return (
    <>
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-accent" />
      </div>

      <main className="page-center">
        <div className="glass-card anim-card" style={{ textAlign: 'center' }}>

          {/* Avatar */}
          <div className="avatar-ring anim-1" aria-hidden="true">
            <span className="avatar-initials">{initials}</span>
          </div>

          {/* Status badge */}
          <div className="anim-2" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <span className="dashboard-status">Sesión activa</span>
          </div>

          {/* Title */}
          <h1 className="card-title anim-2" style={{ marginBottom: '4px' }}>Dashboard</h1>
          <p className="card-subtitle anim-3" style={{ marginBottom: '20px' }}>
            Conectado como
          </p>

          {/* Email pill */}
          <div className="dashboard-email anim-3">
            {user?.email ?? '—'}
          </div>

          {/* Logout */}
          <button
            id="logout-btn"
            className="btn-secondary anim-4"
            onClick={() => { void handleLogout() }}
            style={{ width: '100%' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '8px', verticalAlign: 'middle' }}
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </main>
    </>
  )
}
