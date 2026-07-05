import { useState, useEffect } from 'react';
import { Edit2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useUnitConversions } from '../hooks/useUnitConversions';
import {
  createUnitConversion,
  updateUnitConversion,
  deleteUnitConversion,
  fetchProductsCombo,
  fetchUnitsCombo,
  type UnitConversionPayload,
} from '../api/unit-conversions-api';
import { useToast, Table, Modal, Button, Input, Pagination, type TableColumn } from '../../../components/ui';
import type { UnitConversion } from '../types/unit-conversions';
import type { ProductCombo, UnitCombo } from '../types/unit-conversions';

interface UnitConversionWithIndex extends UnitConversion {
  _index?: number;
}

interface UnitConversionEditable extends UnitConversion {
  init_id?: string | number;
  initId?: string | number;
  final_id?: string | number;
  finalId?: string | number;
}

interface UnitConversionFormData {
  product_id: number | string;
  from_unit_id: number | string;
  to_unit_id: number | string;
  conversion_value: number | string;
}

export function UnitConversionsPage() {
  const { activeToken } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [products, setProducts] = useState<ProductCombo[]>([]);
  const [units, setUnits] = useState<UnitCombo[]>([]);
  const [comboLoading, setComboLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingConversion, setEditingConversion] = useState<UnitConversion | null>(null);
  const [formData, setFormData] = useState<UnitConversionFormData>({
    product_id: '',
    from_unit_id: '',
    to_unit_id: '',
    conversion_value: 1,
  });
  const [formErrors, setFormErrors] = useState<Partial<UnitConversionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UnitConversion | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { unitConversions, total, page, perPage, isLoading, loadUnitConversions } =
    useUnitConversions(activeToken || '');

  // Load combo data
  useEffect(() => {
    if (!activeToken) return;

    const loadCombos = async () => {
      setComboLoading(true);
      try {
        const [productsResponse, unitsResponse] = await Promise.allSettled([
          fetchProductsCombo(activeToken, {}),
          fetchUnitsCombo(activeToken, {}),
        ]);

        const extractArray = (payload: any) => {
          if (!payload) return [];
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload.data)) return payload.data;
          if (Array.isArray(payload.items)) return payload.items;
          if (Array.isArray(payload.data?.items)) return payload.data.items;
          if (Array.isArray(payload.results)) return payload.results;
          return [];
        };

        // Parse products (tolerant to various response shapes)
        const pPayload = productsResponse.status === 'fulfilled' ? (productsResponse.value as any) : null;
        const pData = extractArray(pPayload) as any[];
        const normalizedProducts = pData
          .map((item: any) => {
            const src = item?.product ?? item;
            const id = src?.id ?? src?.product_id ?? src?.value ?? 0;
            const nama = src?.nama ?? src?.name ?? src?.product_name ?? src?.label ?? src?.text ?? '';
            return { id, nama };
          })
          .filter((it) => it && (it.id || it.id === 0) && String(it.nama || '').trim() !== '');
        console.debug('UnitConversions: loaded products combo', { raw: pPayload, normalized: normalizedProducts });
        setProducts(normalizedProducts);
        if (!normalizedProducts.length) console.warn('UnitConversions: products combo is empty after normalization', { raw: pPayload });

        // Parse units (tolerant to various response shapes)
        const uPayload = unitsResponse.status === 'fulfilled' ? (unitsResponse.value as any) : null;
        const uData = extractArray(uPayload) as any[];
        const normalizedUnits = uData
          .map((item: any) => {
            const src = item?.unit ?? item;
            const id = src?.id ?? src?.unit_id ?? src?.value ?? 0;
            const nama = src?.nama ?? src?.name ?? src?.unit_name ?? src?.label ?? src?.text ?? '';
            return { id, nama };
          })
          .filter((it) => it && (it.id || it.id === 0) && String(it.nama || '').trim() !== '');
        console.debug('UnitConversions: loaded units combo', { raw: uPayload, normalized: normalizedUnits });
        setUnits(normalizedUnits);
        if (!normalizedUnits.length) console.warn('UnitConversions: units combo is empty after normalization', { raw: uPayload });
      } catch (err) {
        console.error('Error loading combo data:', err);
        setProducts([]);
        setUnits([]);
      } finally {
        setComboLoading(false);
      }
    };

    loadCombos();
  }, [activeToken]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const normalized = value.trim();
    if (!normalized) {
      setActiveSearch('');
      loadUnitConversions(1, '');
      return;
    }

    if (normalized.length >= 3) {
      setActiveSearch(normalized);
      loadUnitConversions(1, normalized);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = searchQuery.trim();
    setActiveSearch(normalized);
    loadUnitConversions(1, normalized);
  };

  const handleRefresh = () => {
    loadUnitConversions(page, activeSearch);
  };

  const openAddConversion = () => {
    setEditingConversion(null);
    setFormData({
      product_id: '',
      from_unit_id: '',
      to_unit_id: '',
      conversion_value: 1,
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const openEditConversion = (conversion: UnitConversionEditable) => {
    setEditingConversion(conversion);
    // Try to resolve product and unit ids against loaded combos
    const resolveProductId = (conv: UnitConversion) => {
      // prefer explicit id
      if (conv.product_id) return String(conv.product_id);
      // try product_name -> find in products
      if (conv.product_name) {
        const p = products.find((x) => String(x.nama ?? x.name ?? '').toLowerCase() === String(conv.product_name).toLowerCase());
        if (p) return String(p.id);
      }
      // try other fields
      for (const p of products) {
        const vals = [p.id, p.nama, p.name].map((v) => String(v || '').toLowerCase());
        if (vals.includes(String(conv.product_id ?? '').toLowerCase()) || vals.includes(String(conv.product_name ?? '').toLowerCase())) return String(p.id);
      }
      return '';
    };

    const resolveUnitId = (convField: any) => {
      if (!convField) return '';
      // convField may be id or name depending on API
      const v = String(convField);
      // direct id match
      const direct = units.find((u) => String(u.id) === v);
      if (direct) return String(direct.id);
      // match by name
      const byName = units.find((u) => String(u.nama ?? u.name ?? '').toLowerCase() === v.toLowerCase());
      if (byName) return String(byName.id);
      // try matching where unit contains v
      const contains = units.find((u) => String(u.nama ?? u.name ?? '').toLowerCase().includes(v.toLowerCase()));
      if (contains) return String(contains.id);
      return '';
    };

    setFormData({
      product_id: resolveProductId(conversion),
      from_unit_id: resolveUnitId(conversion.from_unit_id ?? conversion.from_unit_name ?? conversion.init_id ?? conversion.initId),
      to_unit_id: resolveUnitId(conversion.to_unit_id ?? conversion.to_unit_name ?? conversion.final_id ?? conversion.finalId),
      conversion_value: conversion.conversion_value ?? conversion.value_conv ?? 1,
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const closeAddConversion = () => {
    setIsAddOpen(false);
    setEditingConversion(null);
    setFormData({
      product_id: '',
      from_unit_id: '',
      to_unit_id: '',
      conversion_value: 1,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<UnitConversionFormData> = {};

    if (!formData.product_id) {
      errors.product_id = 'Produk wajib dipilih' as any;
    }
    if (!formData.from_unit_id) {
      errors.from_unit_id = 'Satuan asal wajib dipilih' as any;
    }
    if (!formData.to_unit_id) {
      errors.to_unit_id = 'Satuan tujuan wajib dipilih' as any;
    }
    if (formData.from_unit_id === formData.to_unit_id) {
      errors.to_unit_id = 'Satuan tujuan harus berbeda dari satuan asal' as any;
    }
    if (!formData.conversion_value || Number(formData.conversion_value) <= 0) {
      errors.conversion_value = 'Nilai konversi harus lebih besar dari 0' as any;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.addToast('Periksa kembali form Anda.', 'error');
      return;
    }

    if (!activeToken) {
      toast.addToast('Token tidak tersedia, login ulang.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects keys: product_id, init_id, final_id, value_conv
      const body: UnitConversionPayload = {
        product_id: String(formData.product_id),
        init_id: String(formData.from_unit_id),
        final_id: String(formData.to_unit_id),
        value_conv: Number(formData.conversion_value),
      };

      console.debug('UnitConversions: submit body', body);
      if (editingConversion?.id) {
        await updateUnitConversion(activeToken, editingConversion.id, body);
        toast.addToast('Konversi satuan berhasil diperbarui.', 'success');
      } else {
        await createUnitConversion(activeToken, body);
        toast.addToast('Konversi satuan berhasil ditambahkan.', 'success');
      }

      closeAddConversion();
      loadUnitConversions(1, activeSearch);
    } catch (error) {
      console.error('UnitConversions: save error', error);
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan konversi satuan. Coba lagi.';
      toast.addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (conversion: UnitConversion) => {
    setDeleteTarget(conversion);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !activeToken) return;

    try {
      await deleteUnitConversion(activeToken, deleteTarget.id);
      toast.addToast('Konversi satuan berhasil dihapus.', 'success');
      closeDeleteConfirm();
      loadUnitConversions(1, activeSearch);
    } catch (error) {
      console.error(error);
      toast.addToast('Gagal menghapus konversi satuan.', 'error');
    }
  };

  const getProductName = (id?: string | number) => {
    if (!id) return '-';
    const sid = String(id);
    // direct id match
    let found = products.find((p) => String(p.id) === sid);
    if (found) return found.nama ?? found.name ?? '-';

    // match by name/code fields
    found = products.find((p) => {
      const name = String(p.nama ?? p.name ?? '').toLowerCase();
      return name && sid.toLowerCase() === name;
    });
    if (found) return found.nama ?? found.name ?? '-';

    // fallback to try matching by product_name on row (if id was actually name)
    return '-';
  };

  const getUnitName = (id?: string | number) => {
    if (!id) return '-';
    const sid = String(id);
    let found = units.find((u) => String(u.id) === sid);
    if (found) return found.nama ?? found.name ?? '-';

    // match by name/code
    found = units.find((u) => {
      const name = String(u.nama ?? u.name ?? '').toLowerCase();
      return name && sid.toLowerCase() === name;
    });
    if (found) return found.nama ?? found.name ?? '-';

    return '-';
  };

  const columns: TableColumn<UnitConversionWithIndex>[] = [
    {
      key: 'no',
      header: 'No',
      render: (row) => {
        const index = row._index ?? 0;
        return index + 1 + (page - 1) * perPage;
      },
    },
    {
      key: 'product_name',
      header: 'Produk',
      render: (row) => row.product_name ?? getProductName(row.product_id),
    },
    {
      key: 'from_unit_name',
      header: 'Satuan Asal',
      render: (row) => row.from_unit_name ?? getUnitName(row.from_unit_id),
    },
    {
      key: 'to_unit_name',
      header: 'Satuan Tujuan',
      render: (row) => row.to_unit_name ?? getUnitName(row.to_unit_id),
    },
    {
      key: 'conversion_value',
      header: 'Konversi',
      render: (row) => row.conversion_value ?? '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={() => openEditConversion(row)}
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

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(page * perPage, total);

  const dataWithIndex: UnitConversionWithIndex[] = unitConversions.map((conv, index) => ({
    ...conv,
    _index: index,
  }));

  return (
    <div className="unit-conversions-page">
      {/* Header dengan Search dan Refresh */}
      <div className="unit-conversions-page__header">
        <div className="unit-conversions-page__search-group">
          <form className="unit-conversions-page__search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Cari..."
              className="unit-conversions-page__search-input"
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
            <button
              className="unit-conversions-page__search-btn"
              type="submit"
              disabled={isLoading}
              title="Cari"
            >
              <Search size={14} />
              Cari
            </button>
          </form>
          <button
            className="unit-conversions-page__refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar - Tombol Tambah */}
      <div className="unit-conversions-page__toolbar">
        <button type="button" className="unit-conversions-page__btn-tambah" onClick={openAddConversion}>
          Tambah +
        </button>
      </div>

      {/* debug panel removed */}

      {/* Table */}
      <div className="unit-conversions-page__table-wrapper">
        {isLoading ? (
          <div className="unit-conversions-page__loading">
            Memuat data...
          </div>
        ) : (
          <Table<UnitConversionWithIndex>
            columns={columns}
            data={dataWithIndex}
            emptyText="Tidak ada data konversi satuan"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={isAddOpen}
        onClose={closeAddConversion}
        title={editingConversion ? 'Ubah Konversi Satuan' : 'Tambah Konversi Satuan'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <select
              value={String(formData.product_id)}
              onChange={(e) => {
                  setFormData({ ...formData, product_id: e.target.value });
                if (formErrors.product_id) setFormErrors({ ...formErrors, product_id: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Produk"
              disabled={comboLoading}
            >
              <option value="">Pilih Produk</option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nama ?? p.name}
                </option>
              ))}
            </select>
            {formErrors.product_id && <p className="text-sm text-red-600 mt-1">{formErrors.product_id as string}</p>}
          </div>

          <div>
            <select
              value={String(formData.from_unit_id)}
              onChange={(e) => {
                setFormData({ ...formData, from_unit_id: e.target.value });
                if (formErrors.from_unit_id) setFormErrors({ ...formErrors, from_unit_id: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Satuan Asal"
              disabled={comboLoading}
            >
              <option value="">Pilih Satuan Asal</option>
              {units.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.nama ?? u.name}
                </option>
              ))}
            </select>
            {formErrors.from_unit_id && <p className="text-sm text-red-600 mt-1">{formErrors.from_unit_id as string}</p>}
          </div>

          <div>
            <select
              value={String(formData.to_unit_id)}
              onChange={(e) => {
                setFormData({ ...formData, to_unit_id: e.target.value });
                if (formErrors.to_unit_id) setFormErrors({ ...formErrors, to_unit_id: undefined });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Satuan Tujuan"
              disabled={comboLoading}
            >
              <option value="">Pilih Satuan Tujuan</option>
              {units.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.nama ?? u.name}
                </option>
              ))}
            </select>
            {formErrors.to_unit_id && <p className="text-sm text-red-600 mt-1">{formErrors.to_unit_id as string}</p>}
          </div>

          <div>
            <Input
              placeholder="Nilai Konversi"
              type="number"
              min="0"
              step="any"
              value={String(formData.conversion_value)}
              onChange={(e) => {
                setFormData({ ...formData, conversion_value: e.target.value });
                if (formErrors.conversion_value) setFormErrors({ ...formErrors, conversion_value: undefined });
              }}
              aria-label="Nilai Konversi"
            />
            {formErrors.conversion_value && <p className="text-sm text-red-600 mt-1">{formErrors.conversion_value as string}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeAddConversion}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className={editingConversion ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-green-600 hover:bg-green-700 text-white'}
            >
              {isSubmitting ? 'Memproses...' : editingConversion ? 'Simpan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title="Hapus Konversi Satuan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Yakin ingin menghapus konversi satuan <strong>{deleteTarget?.product_name ?? deleteTarget?.id}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDeleteConfirm}>Batal</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete}>Hapus</Button>
          </div>
        </div>
      </Modal>

      <Pagination
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={(nextPage) => loadUnitConversions(nextPage, activeSearch)}
      />
    </div>
  );
}
