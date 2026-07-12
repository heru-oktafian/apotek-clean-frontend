import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { useUsers } from '../hooks/useUsers'
import { useToast, Table, Button, Input, Pagination, type TableColumn } from '../../../components/ui'
import type { User } from '../types/users'

interface UserWithIndex extends User {
  _index: number
}

export function UsersPage() {
  const { activeToken, activeBranch } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')

  const { users, total, page, perPage, isLoading, loadUsers } = useUsers(activeToken || '', activeBranch?.branch_id)

  const usersWithIndex: UserWithIndex[] = users.map((user, index) => ({
    ...user,
    _index: index + 1,
  }))

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const normalized = searchQuery.trim()
    setActiveSearch(normalized)
    loadUsers(1, normalized)
  }

  const handleRefresh = () => {
    loadUsers(page, activeSearch)
  }

  const handlePageChange = (nextPage: number) => {
    loadUsers(nextPage, activeSearch)
  }

  const columns: TableColumn<UserWithIndex>[] = [
    { key: '_index', header: 'No' },
    { key: 'username', header: 'Username' },
    { key: 'name', header: 'Nama' },
    { key: 'user_role', header: 'Role' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/system/users/${row.id}`)}
            className="inline-flex items-center justify-center p-2 rounded bg-amber-500 text-slate-900 hover:bg-amber-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <section className="page-card">
      <div className="units-page">
        <div className="list-page__header">
          <div className="list-page__search-group">
            <form className="list-page__search-form" onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Cari username atau nama..."
                value={searchQuery}
                onChange={handleSearchInput}
                aria-label="Cari user"
                className="list-page__search-input"
              />
              <button className="list-page__search-btn" type="submit">
                <Search size={14} />
                Cari
              </button>
            </form>
            <button type="button" className="list-page__refresh-btn" onClick={handleRefresh} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="list-page__toolbar">
          <button
            type="button"
            className="list-page__btn-tambah"
            onClick={() => toast.addToast('Fungsi tambah user belum tersedia.', 'info')}
          >
            Tambah +
          </button>
        </div>

        <div className="list-page__table-wrapper">
          <Table columns={columns} data={usersWithIndex} emptyText={isLoading ? 'Memuat user...' : 'Tidak ada user'} />
        </div>

        <Pagination page={page} total={total} perPage={perPage} onPageChange={handlePageChange} onRefresh={handleRefresh} />
      </div>
    </section>
  )
}
