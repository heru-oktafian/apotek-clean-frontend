import { useAuth } from '../../auth/auth-context'

export function ProfilePage() {
  const { profile, activeBranch } = useAuth()

  return (
    <section className="page-card">
      <div className="page-card__header">
        <h1>Profile</h1>
        <p>Ringkasan user aktif dan cabang yang sedang dipakai oleh frontend.</p>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <span>Nama</span>
          <strong>{profile?.name || '-'}</strong>
        </div>
        <div className="profile-item">
          <span>Username</span>
          <strong>{profile?.username || '-'}</strong>
        </div>
        <div className="profile-item">
          <span>Role</span>
          <strong>{profile?.user_role || '-'}</strong>
        </div>
        <div className="profile-item">
          <span>Cabang aktif</span>
          <strong>{activeBranch?.branch_name || activeBranch?.name || '-'}</strong>
        </div>
      </div>
    </section>
  )
}
