/**
 * @module shared/pages/profile-page
 * @description
 * Halaman profil user yang sedang login (profile page).
 * Menampilkan informasi singkat user aktif dan branch yang sedang dipakai.
 *
 * Data yang ditampilkan:
 * - Nama lengkap
 * - Username
 * - Role (Superadmin, Admin, Staff, Kasir)
 * - Branch/cabang aktif
 *
 * Ini halaman sederhana — fokus ke display info, bukan edit.
 * Kalau butuh edit profile, bikin separate page.
 *
 * @see useAuth - context untuk ambil profile dan active branch
 */
import { useAuth } from '../../auth/auth-context'

/**
 * Halaman profil user aktif.
 *
 * Layout: `page-card`
 * - Header: judul "Profile" + deskripsi singkat
 * - Body: grid info (nama, username, role, branch aktif)
 */
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
