import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

interface DashboardTopbarProps {
  onToggleSidebar: () => void
}

export function DashboardTopbar({ onToggleSidebar }: DashboardTopbarProps) {
  const navigate = useNavigate()
  const { activeBranch, profile, logout } = useAuth()

  const branchName = activeBranch?.branch_name || activeBranch?.name || 'Cabang aktif'
  const userName = profile?.name || profile?.username || 'User'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__headline">
        <button type="button" className="topbar-hamburger" onClick={onToggleSidebar} aria-label="Buka menu navigasi">
          <Menu size={22} />
        </button>
        <p className="dashboard-topbar__eyebrow">Cabang aktif</p>
        <h1>{branchName}</h1>
      </div>

      <div className="dashboard-topbar__actions">
        <button type="button" className="ghost-button" onClick={() => navigate('/profile')}>
          Profile
        </button>
        <button
          type="button"
          className="ghost-button ghost-button--danger"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Logout
        </button>
        <div className="avatar-pill" aria-hidden="true">
          {initial}
        </div>
      </div>
    </header>
  )
}
