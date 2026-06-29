import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, listBranches, normalizeBranch, setBranch } from '../api'
import { useAuth } from '../auth-context'
import type { BranchOption } from '../../../types/api'

export function BranchSelectionPage() {
  const navigate = useNavigate()
  const { preBranchToken, setActiveBranch, setActiveToken, setPreBranchToken, setProfile, logout } = useAuth()
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!preBranchToken) { navigate('/login', { replace: true }); return }
    let cancelled = false
    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        if (!preBranchToken) return; const response = await listBranches(preBranchToken)
        if (!cancelled) setBranches((response.data || []).map(normalizeBranch))
      } catch (caughtError) {
        if (!cancelled) setError(caughtError instanceof Error ? caughtError.message : 'Gagal memuat daftar cabang')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [navigate, preBranchToken])

  const hasBranches = useMemo(() => branches.length > 0, [branches])

  async function handleSelectBranch(branch: BranchOption) {
    if (!preBranchToken) { navigate('/login', { replace: true }); return }
    const branchId = branch.branch_id || branch.id
    if (!branchId) { setError('Data cabang tidak valid.'); return }
    try {
      setError(null)
      setIsSubmittingId(branchId)
      const branchResponse = await setBranch(preBranchToken, branchId)
      const finalToken = branchResponse.data
      setActiveToken(finalToken)
      setActiveBranch(branch)
      setPreBranchToken(null)
      const profileResponse = await getProfile(finalToken)
      setProfile(profileResponse.data)
      navigate('/dashboard', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Gagal memilih cabang')
    } finally {
      setIsSubmittingId(null)
    }
  }

  return (
    <div className="login-shell">
      {/* Left brand panel — same visual language as login */}
      <div className="login-brand">
        <div className="login-brand__inner">
          <div className="login-brand__badge">Ziida</div>
          <h1 className="login-brand__heading">
            Pilih cabang<br />aktif Anda.
          </h1>
          <p className="login-brand__sub">
            Satu akun, banyak cabang. Pilih cabang tempat Anda beroperasi hari ini.
          </p>
          <div className="login-brand__features">
            {[
              { icon: '🏥', text: 'Multi-cabang support' },
              { icon: '🔐', text: 'Token branch-scoped' },
              { icon: '📊', text: 'Data terpisah per cabang' },
            ].map((f) => (
              <div className="login-brand__feature" key={f.text}>
                <span className="login-brand__feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-card__logo">
            <div className="login-form-card__logo-icon">Z</div>
          </div>
          <h2 className="login-form-card__title">Pilih Cabang Apotek</h2>
          <p className="login-form-card__subtitle">
            Satu akun dapat memiliki beberapa cabang. Pilih yang ingin Anda gunakan hari ini.
          </p>

          {error && (
            <div className="form-alert form-alert--error" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading ? (
            <div className="branch-skeleton-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="branch-skeleton">
                  <div className="branch-skeleton__icon" />
                  <div className="branch-skeleton__text">
                    <div className="branch-skeleton__line branch-skeleton__line--title" />
                    <div className="branch-skeleton__line branch-skeleton__line--sub" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasBranches ? (
            <div className="empty-state">
              <div className="empty-state__icon">🏥</div>
              <strong className="empty-state__title">Tidak ada cabang tersedia</strong>
              <p className="empty-state__desc">Akun ini belum memiliki cabang aktif.</p>
              <button
                type="button"
                className="ghost-btn ghost-btn--danger"
                onClick={() => { logout(); navigate('/login', { replace: true }) }}
              >
                Kembali ke login
              </button>
            </div>
          ) : (
            <div className="branch-list">
              {branches.map((branch) => {
                const branchId = branch.branch_id || branch.id || String(Math.random())
                const isSubmitting = isSubmittingId === branchId
                return (
                  <button
                    key={branchId}
                    type="button"
                    className="branch-card"
                    onClick={() => handleSelectBranch(branch)}
                    disabled={Boolean(isSubmittingId)}
                  >
                    <div className="branch-card__icon">🏥</div>
                    <div className="branch-card__body">
                      <strong className="branch-card__name">
                        {branch.branch_name || branch.name || 'Cabang'}
                      </strong>
                    </div>
                    <span className={`branch-card__status ${isSubmitting ? 'branch-card__status--loading' : ''}`}>
                      {isSubmitting ? '...' : 'Pilih'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <p className="login-form-card__footer">
            <button type="button" className="text-link" onClick={() => { logout(); navigate('/login', { replace: true }) }}>
              ← Login dengan akun lain
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
