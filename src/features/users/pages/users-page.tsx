import { useNavigate } from 'react-router-dom';
import { Edit2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUsers } from '../hooks/useUsers';
import { toast, Table, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { useListSearch } from '../../../hooks/useListSearch';
import type { User } from '../types/users';

interface UserWithIndex extends User {
  _index: number;
}

export function UsersPage() {
  const { activeToken, activeBranch } = useAuth();
  const navigate = useNavigate();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadUsers(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { users, total, page, perPage, isLoading, loadUsers } = useUsers(
    activeToken || '',
    activeBranch?.branch_id
  );

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadUsers(page, activeSearch);
  };

  // ── Columns ────────────────────────────────────
  const usersWithIndex: UserWithIndex[] = users.map((user, index) => ({
    ...user,
    _index: index + 1,
  }));

  const columns: TableColumn<UserWithIndex>[] = [
    {
      key: '_index',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => row._index,
    },
    { key: 'username', header: 'Username' },
    { key: 'name', header: 'Nama' },
    { key: 'user_role', header: 'Role' },
    { key: 'status', header: 'Status' },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '100px',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={() => navigate(`/system/users/${row.id}`)}
            className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="list-page">
      {/* Header dengan Search */}
      <div className="list-page__header">
        <ListSearchBar
          value={searchInput}
          onChange={handleSearchInputChange}
          onSearch={handleSearch}
          placeholder="Cari username atau nama..."
          disabled={isLoading}
        />
        <button
          className="list-page__refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="list-page__toolbar">
        <button
          type="button"
          className="list-page__btn-tambah"
          onClick={() => toast.info('Fungsi tambah user belum tersedia.')}
        >
          Tambah +
        </button>
      </div>

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<UserWithIndex>
            columns={columns}
            data={usersWithIndex}
            emptyText="Tidak ada data user"
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadUsers(p, activeSearch)}
      />
    </div>
  );
}
