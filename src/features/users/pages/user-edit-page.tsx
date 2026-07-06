import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { useToast, Table, Button, type TableColumn } from '../../../components/ui'
import { fetchUserBranchAccess, fetchUserById, removeUserBranchAccess } from '../api/users-api'
import type { User, UserBranchAccess } from '../types/users'

export function UserEditPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { activeToken } = useAuth()
  const toast = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [branchAccess, setBranchAccess] = useState<UserBranchAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!activeToken || !userId) return

    setLoading(true)
    setError(null)

    try {
      const [userDetail, accessList] = await Promise.all([
        fetchUserById(activeToken, userId),
        fetchUserBranchAccess(activeToken, userId),
      ])

      setUser(userDetail)
      setBranchAccess(accessList)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data user'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [activeToken, userId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleRemoveAccess = async (accessId: string) => {
    if (!activeToken || !userId) return

    setSaving(true)
    try {
      await removeUserBranchAccess(activeToken, userId, accessId)
      toast.addToast('Akses branch berhasil dihapus.', 'success')
      await loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus akses branch'
      toast.addToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const columns: TableColumn<UserBranchAccess>[] = [
    { key: 'branch_id', header: 'Branch ID' },
    { key: 'branch_name', header: 'Nama Branch' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (row) => (
          <Button variant="danger" size="sm" onClick={() => handleRemoveAccess(row.id)} disabled={saving}>
            <Trash2 size={14} />
            <span>Hapus</span>
          </Button>
        ),
    },
  ]

  return (
    <section className="page-card">
      <div className="page-card__header">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-[150px_1fr] gap-y-3 items-start text-left">
              <div className="text-sm font-semibold text-emerald-700">Username</div>
              <div className="text-sm">: {user?.username || '-'}</div>

              <div className="text-sm font-semibold text-emerald-700">Nama</div>
              <div className="text-sm">: {user?.name || '-'}</div>

              <div className="text-sm font-semibold text-emerald-700">Role</div>
              <div className="text-sm">: {user?.user_role || '-'}</div>

              <div className="text-sm font-semibold text-emerald-700">Status</div>
              <div className="text-sm">: {user?.status || '-'}</div>
            </div>

            <div className="mt-4 text-left">
                      <div className="mt-4 flex items-center gap-3">
                        <Button onClick={() => navigate('/system/users')} disabled={saving} className="bg-yellow-400 text-black hover:bg-yellow-500">
                          Kembali
                        </Button>

                        <button
                          type="button"
                          className="units-page__btn-tambah"
                          onClick={() => navigate(`/system/users/${userId}/edit`)}
                          disabled={saving}
                        >
                          Update
                        </button>
                      </div>
            </div>
          </div>

          <div className="w-36 h-36 rounded-xl border border-emerald-200 flex items-center justify-center">
            {/* avatar placeholder */}
            <div className="w-28 h-28 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card__body space-y-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        ) : null}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <Table
            columns={columns}
            data={branchAccess}
            className="border-none"
            emptyText={loading ? 'Memuat akses branch...' : 'Belum ada branch access'}
          />
        </div>
      </div>
    </section>
  )
}
