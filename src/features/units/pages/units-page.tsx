import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, FormField } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useUnits } from '../hooks/useUnits';
import { createUnit, updateUnit, deleteUnit } from '../api/units-api';
import { ListTablePage, type Column } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface UnitRow {
  _index: number;
  id?: number;
  name: string;
  createdAt?: string;
}

export function UnitsPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { units, total, perPage, isLoading, loadUnits } = useUnits(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [unitName, setUnitName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UnitRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadUnits(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingUnit(null);
    setUnitName('');
    setModalOpen(true);
  };

  const openEdit = (unit: UnitRow) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!unitName.trim()) {
      toast.addToast('Nama satuan wajib diisi.', 'error');
      return;
    }
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUnit?.id) {
        await updateUnit(activeToken, editingUnit.id, { name: unitName });
        toast.addToast('Satuan berhasil diperbarui.', 'success');
      } else {
        await createUnit(activeToken, { name: unitName });
        toast.addToast('Satuan berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadUnits(page, search);
    } catch {
      toast.addToast('Gagal menyimpan satuan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (unit: UnitRow) => setDeleteTarget(unit);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteUnit(activeToken, deleteTarget.id);
      toast.addToast('Satuan berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadUnits(page, search);
    } catch {
      toast.addToast('Gagal menghapus satuan.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const downloadFile = async (path: string, defaultName: string) => {
    if (!activeToken) { toast.addToast('Token tidak tersedia.', 'error'); return; }
    try {
      const res = await fetch(buildApiUrl(path), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.addToast('Gagal mengunduh file.', 'error');
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: UnitRow[] = units.map((u, i) => ({ ...u, _index: i }));
  const columns: Column<UnitRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'name', header: 'Nama Satuan' },
    {
      key: 'actions', header: 'Aksi', align: 'center', width: '120px',
      render: (_, row) => (
        <div className="flex justify-center gap-2">
          <button onClick={() => openEdit(row)} className="p-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-900 transition-colors" title="Edit"><Edit2 size={14} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors" title="Hapus"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListTablePage
        breadcrumbs={['Master', 'Satuan']}
        subtitle="Kelola Satuan Produk"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data satuan"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadUnits(p, search); }}
        onRefresh={() => loadUnits(page, search)}
        toolbarLeft={
          <Input
            placeholder="Cari satuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
            className="w-64"
          />
        }
        toolbarRight={
          <div className="flex gap-2">
            <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
              Tambah +
            </button>
            <button onClick={() => downloadFile('/api/units/excel', 'satuan.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
            <button onClick={() => downloadFile('/api/units/pdf', 'satuan.pdf')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              PDF
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUnit ? 'Ubah Satuan' : 'Tambah Satuan'}
        submitLabel={editingUnit ? 'Simpan' : 'Tambahkan'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="sm"
      >
        <FormField label="Nama Satuan">
          <Input
            placeholder="Masukkan nama satuan"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            autoFocus
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Satuan"
        message={`Yakin menghapus satuan "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
