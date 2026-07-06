import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { useToast, Input, Select, Button } from '../../../components/ui'
import { fetchUserById, updateUser } from '../api/users-api'
import type { User } from '../types/users'

export function UserEditFormPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { activeToken } = useAuth()
  const toast = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    if (!activeToken || !userId) return
    setLoading(true)
    try {
      const u = await fetchUserById(activeToken, userId)
      setUser(u)
      setUsername(u.username)
      setName(u.name)
      setRole(u.user_role)
      setStatus(u.status)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat user'
      toast.addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [activeToken, userId, toast])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async () => {
    if (!activeToken || !userId) return
    setSaving(true)
    try {
      const updated = await updateUser(activeToken, userId, {
        username: username.trim(),
        name: name.trim(),
        user_role: role,
        status,
      })
      toast.addToast('User berhasil diperbarui', 'success')
      navigate(`/system/users/${updated.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal update user'
      toast.addToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Memuat...</p>

  return (
    <section className="page-card">
      <div className="page-card__header">
        <h2 className="text-lg font-semibold">Edit User</h2>
      </div>

      <div className="page-card__body space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-2">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-2">Nama</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300">
              <option value="">Pilih role</option>
              <option value="Superadmin">Superadmin</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Kasir">Kasir</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded border border-slate-300">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate(`/system/users/${userId}`)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default UserEditFormPage
