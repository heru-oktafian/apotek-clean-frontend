import { useState } from 'react';
import { Edit2, Trash2, Plus, Download } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useToast, Input, Select, FormField } from '../../../components/ui';
import { buildApiUrl } from '../../../lib/api/env';
import { useUnitConversions } from '../hooks/useUnitConversions';
import { useUnits } from '../../units/hooks/useUnits';
import { createUnitConversion, updateUnitConversion, deleteUnitConversion } from '../api/unit-conversions-api';
import { ListTablePage, type Column } from '../../../components/ListTablePage';
import { FormModal } from '../../../components/common/FormModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface ConversionRow {
  _index: number;
  id?: number;
  unitId: number;
  convertToUnitId: number;
  conversionValue: number;
  unitName?: string;
  convertToUnitName?: string;
}

export function UnitConversionsPage() {
  const { activeToken } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { conversions, total, perPage, isLoading, loadConversions } = useUnitConversions(activeToken || '');
  const { units } = useUnits(activeToken || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingConversion, setEditingConversion] = useState<ConversionRow | null>(null);
  const [unitId, setUnitId] = useState('');
  const [convertToUnitId, setConvertToUnitId] = useState('');
  const [conversionValue, setConversionValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ConversionRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load ────────────────────────────────────────
  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
    loadConversions(1, s);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingConversion(null);
    setUnitId('');
    setConvertToUnitId('');
    setConversionValue('');
    setModalOpen(true);
  };

  const openEdit = (conv: ConversionRow) => {
    setEditingConversion(conv);
    setUnitId(String(conv.unitId));
    setConvertToUnitId(String(conv.convertToUnitId));
    setConversionValue(String(conv.conversionValue));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!unitId || !convertToUnitId || !conversionValue) {
      toast.addToast('Semua field wajib diisi.', 'error');
      return;
    }
    if (unitId === convertToUnitId) {
      toast.addToast('Satuan asal dan tujuan tidak boleh sama.', 'error');
      return;
    }
    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        unitId: Number(unitId),
        convertToUnitId: Number(convertToUnitId),
        conversionValue: parseFloat(conversionValue),
      };
      if (editingConversion?.id) {
        await updateUnitConversion(activeToken, editingConversion.id, body);
        toast.addToast('Konversi berhasil diperbarui.', 'success');
      } else {
        await createUnitConversion(activeToken, body);
        toast.addToast('Konversi berhasil ditambahkan.', 'success');
      }
      setModalOpen(false);
      loadConversions(page, search);
    } catch {
      toast.addToast('Gagal menyimpan konversi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const handleDelete = (conv: ConversionRow) => setDeleteTarget(conv);
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;
    setIsDeleting(true);
    try {
      await deleteUnitConversion(activeToken, deleteTarget.id);
      toast.addToast('Konversi berhasil dihapus.', 'success');
      setDeleteTarget(null);
      loadConversions(page, search);
    } catch {
      toast.addToast('Gagal menghapus konversi.', 'error');
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
  const dataWithIndex: ConversionRow[] = conversions.map((c, i) => ({ ...c, _index: i }));
  const columns: Column<ConversionRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (_, row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'unitName', header: 'Satuan Asal' },
    { key: 'convertToUnitName', header: 'Satuan Tujuan' },
    {
      key: 'conversionValue',
      header: 'Nilai Konversi',
      align: 'center',
      render: (val) => String(val),
    },
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
        breadcrumbs={['Master', 'Konversi Satuan']}
        subtitle="Kelola Konversi Satuan"
        columns={columns}
        data={dataWithIndex}
        loading={isLoading}
        emptyMessage="Tidak ada data konversi satuan"
        pageSize={perPage}
        currentPage={page}
        totalData={total}
        onPageChange={(p) => { setPage(p); loadConversions(p, search); }}
        onRefresh={() => loadConversions(page, search)}
        toolbarLeft={
          <Input
            placeholder="Cari..."
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
            <button onClick={() => downloadFile('/api/unit-conversions/excel', 'konversi.xlsx')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingConversion ? 'Ubah Konversi' : 'Tambah Konversi'}
        submitLabel={editingConversion ? 'Simpan' : 'Tambahkan'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        size="sm"
      >
        <FormField label="Satuan Asal">
          <Select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <option value="">Pilih satuan...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Satuan Tujuan">
          <Select
            value={convertToUnitId}
            onChange={(e) => setConvertToUnitId(e.target.value)}
          >
            <option value="">Pilih satuan...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Nilai Konversi">
          <Input
            type="number"
            step="0.0001"
            placeholder="Contoh: 1000"
            value={conversionValue}
            onChange={(e) => setConversionValue(e.target.value)}
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Konversi"
        message={`Yakin menghapus konversi ini?`}
        isLoading={isDeleting}
      />
    </>
  );
}
