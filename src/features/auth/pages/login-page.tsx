import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, listBranches, login, normalizeBranch, setBranch } from '../api'
import { useAuth } from '../auth-context'

export function LoginPage() {
  const navigate = useNavigate()
  const { setActiveBranch, setActiveToken, setPreBranchToken, setProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const loginResponse = await login(username, password)
      const preToken = loginResponse.data
      setPreBranchToken(preToken)
      const branchesResponse = await listBranches(preToken)
      const branches = (branchesResponse.data || []).map(normalizeBranch)
      if (branches.length === 0) throw new Error('Tidak ada cabang yang tersedia untuk akun ini.')
      if (branches.length === 1) {
        const selectedBranch = branches[0]
        const branchId = selectedBranch.branch_id || selectedBranch.id
        if (!branchId) throw new Error('Data cabang tidak valid.')
        const branchResponse = await setBranch(preToken, branchId)
        const finalToken = branchResponse.data
        setActiveToken(finalToken)
        setActiveBranch(selectedBranch)
        const profileResponse = await getProfile(finalToken)
        setProfile(profileResponse.data)
        navigate('/dashboard', { replace: true })
        return
      }
      navigate('/select-branch', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Gagal login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-brand__inner">
          <div className="login-brand__badge">Ziida</div>
          <h1 className="login-brand__heading">
            Frontend baru untuk<br />operasional apotek.
          </h1>
          <p className="login-brand__sub">
            Mantap, clean, dan branch-aware. Auth 2 tahap tetap aktif dari backend apotek-clean.
          </p>
          <div className="login-brand__features">
            {[
              { icon: '💊', text: 'Master data lengkap' },
              { icon: '📊', text: 'Dashboard real-time' },
              { icon: '🔒', text: 'Branch-aware auth' },
            ].map((f) => (
              <div className="login-brand__feature" key={f.text}>
                <span className="login-brand__feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-card__logo">
            <div className="login-form-card__logo-icon">Z</div>
          </div>
          <h2 className="login-form-card__title">Selamat datang</h2>
          <p className="login-form-card__subtitle">Masuk ke akun Anda untuk melanjutkan.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ketik username Anda"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Kata sandi</label>
              <div className="input-adornment">
                <input
                  id="password"
                  className="form-input form-input--adorned-end"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-adornment__action"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="form-alert form-alert--error" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-login__loading">
                  <span className="btn-login__spinner" />
                  Memproses...
                </span>
              ) : (
                'Masuk ke akun'
              )}
            </button>
          </form>

          <p className="login-form-card__footer">
            Frontend fondasi awal · branch-aware auth aktif
          </p>
        </div>
      </div>
    </div>
  )
}
