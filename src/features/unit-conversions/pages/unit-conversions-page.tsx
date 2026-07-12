import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUnitConversions } from '../hooks/useUnitConversions';
import { useUnits } from '../../units/hooks/useUnits';
import { createUnitConversion, updateUnitConversion, deleteUnitConversion } from '../api/unit-conversions-api';
import { buildApiUrl } from '../../../lib/api/env';
import { toast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import { ListSearchBar } from '../../../components/list/ListSearchBar';
import { ActionToolbar } from '../../../components/list/ActionToolbar';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useListSearch } from '../../../hooks/useListSearch';

interface ConversionRow {
  _index?: number;
  id?: number;
  from_unit_id?: number;
  to_unit_id?: number;
  from_unit_name?: string;
  to_unit_name?: string;
  conversion_value?: number;
}

interface ConversionFormData {
  unitId: string;
  convertToUnitId: string;
  conversionValue: string;
}

export function UnitConversionsPage() {
  const { activeToken } = useAuth();

  // Search
  const { searchInput, handleSearchInputChange, handleSearch } = useListSearch({
    onSearch: (_search) => loadUnitConversions(1, _search),
  });
  const activeSearch = searchInput.trim().toLowerCase();

  const { unitConversions, total, page, perPage, isLoading, loadUnitConversions } = useUnitConversions(activeToken || '');
  const { units } = useUnits(activeToken || '');

  // Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingConversion, setEditingConversion] = useState<ConversionRow | null>(null);
  const [formData, setFormData] = useState<ConversionFormData>({
    unitId: '',
    convertToUnitId: '',
    conversionValue: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ConversionFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ConversionRow | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download state
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // ── Refresh ──────────────────────────────────────
  const handleRefresh = () => {
    loadUnitConversions(page, activeSearch);
  };

  // ── Add / Edit ─────────────────────────────────
  const openAdd = () => {
    setEditingConversion(null);
    setFormData({ unitId: '', convertToUnitId: '', conversionValue: '' });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const openEdit = (conv: ConversionRow) => {
    setEditingConversion(conv);
    setFormData({
      unitId: String(conv.from_unit_id ?? ''),
      convertToUnitId: String(conv.to_unit_id ?? ''),
      conversionValue: String(conv.conversion_value ?? ''),
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingConversion(null);
    setIsEditOpen(false);
    setFormData({ unitId: '', convertToUnitId: '', conversionValue: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof ConversionFormData, string>> = {};
    if (!formData.unitId) errors.unitId = 'Satuan asal wajib dipilih';
    if (!formData.convertToUnitId) errors.convertToUnitId = 'Satuan tujuan wajib dipilih';
    if (!formData.conversionValue) errors.conversionValue = 'Nilai konversi wajib diisi';
    if (formData.unitId && formData.convertToUnitId && formData.unitId === formData.convertToUnitId) {
      errors.convertToUnitId = 'Satuan asal dan tujuan tidak boleh sama';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Periksa kembali form konversi.');
      return;
    }
    if (!activeToken) {
      toast.error('Token tidak tersedia, login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        product_id: '',
        init_id: Number(formData.unitId),
        final_id: Number(formData.convertToUnitId),
        value_conv: Number(formData.conversionValue),
      };
      if (editingConversion?.id) {
        await updateUnitConversion(activeToken, editingConversion.id, body);
        toast.success('Konversi berhasil diperbarui.');
      } else {
        await createUnitConversion(activeToken, body);
        toast.success('Konversi berhasil ditambahkan.');
      }
      closeEdit();
      loadUnitConversions(1, activeSearch);
    } catch {
      toast.error('Gagal menyimpan konversi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────
  const openDeleteConfirm = (conv: ConversionRow) => {
    setDeleteTarget(conv);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    setIsDeleting(true);
    try {
      await deleteUnitConversion(activeToken, deleteTarget.id);
      toast.success('Konversi berhasil dihapus.');
      closeDeleteConfirm();
      loadUnitConversions(page, activeSearch);
    } catch {
      toast.error('Gagal menghapus konversi.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Download ────────────────────────────────────
  const handleDownloadExcel = async () => {
    if (!activeToken) { toast.error('Token tidak tersedia.'); return; }
    setIsDownloadingExcel(true);
    try {
      const res = await fetch(buildApiUrl('/api/unit-conversions/excel'), {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: '*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'konversi.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengunduh Excel.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  // ── Columns ────────────────────────────────────
  const dataWithIndex: ConversionRow[] = unitConversions.map((c: any, i: number) => ({ ...c, _index: i }));
  const columns: TableColumn<ConversionRow>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      width: '60px',
      render: (row) => (row._index ?? 0) + 1 + (page - 1) * perPage,
    },
    { key: 'from_unit_name', header: 'Satuan Asal' },
    { key: 'to_unit_name', header: 'Satuan Tujuan' },
    {
      key: 'conversion_value',
      header: 'Nilai Konversi',
      align: 'center',
      render: (row) => row.conversion_value,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '120px',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => openDeleteConfirm(row)}
            className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={14} />
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
          placeholder="Cari konversi..."
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
      <ActionToolbar
        addLabel="Tambah"
        onAddClick={openAdd}
        showExportExcel
        onExportExcel={handleDownloadExcel}
        isLoading={isLoading || isDownloadingExcel}
      />

      {/* Table */}
      <div className="list-page__table-wrapper">
        {isLoading ? (
          <div className="list-page__loading">Memuat data...</div>
        ) : (
          <Table<ConversionRow>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data konversi satuan"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Konversi"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin menghapus konversi <strong>{deleteTarget?.from_unit_name} → {deleteTarget?.to_unit_name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit / Add Modal */}
      <Modal
        open={isEditOpen}
        onClose={closeEdit}
        title={editingConversion ? 'Ubah Konversi' : 'Tambah Konversi'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Satuan Asal</label>
              <select
                value={formData.unitId}
                onChange={(e) => {
                  setFormData({ ...formData, unitId: e.target.value });
                  if (formErrors.unitId) setFormErrors({ ...formErrors, unitId: undefined });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Pilih satuan...</option>
                {units.map((u) => (
                  <option key={u.id} value={String(u.id)}>{u.name}</option>
                ))}
              </select>
              {formErrors.unitId && <p className="text-sm text-red-600 mt-1">{formErrors.unitId}</p>}
            </div>
            <div>
              <label className="block text-left text-xs text-slate-600 mb-1">Satuan Tujuan</label>
              <select
                value={formData.convertToUnitId}
                onChange={(e) => {
                  setFormData({ ...formData, convertToUnitId: e.target.value });
                  if (formErrors.convertToUnitId) setFormErrors({ ...formErrors, convertToUnitId: undefined });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Pilih satuan...</option>
                {units.map((u) => (
                  <option key={u.id} value={String(u.id)}>{u.name}</option>
                ))}
              </select>
              {formErrors.convertToUnitId && <p className="text-sm text-red-600 mt-1">{formErrors.convertToUnitId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-left text-xs text-slate-600 mb-1">Nilai Konversi</label>
            <Input
              type="number"
              step="0.0001"
              placeholder="Contoh: 1000"
              value={formData.conversionValue}
              onChange={(e) => {
                setFormData({ ...formData, conversionValue: e.target.value });
                if (formErrors.conversionValue) setFormErrors({ ...formErrors, conversionValue: undefined });
              }}
              aria-label="Nilai konversi"
            />
            {formErrors.conversionValue && <p className="text-sm text-red-600 mt-1">{formErrors.conversionValue}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeEdit}>Batal</Button>
            <Button
              type="submit"
              variant={editingConversion ? 'outline' : 'primary'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : editingConversion ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(p) => loadUnitConversions(p, activeSearch)}
      />
    </div>
  );
}
