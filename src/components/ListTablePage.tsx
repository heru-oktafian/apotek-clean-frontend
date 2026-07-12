import React, { useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from './ui';

// ============================================
// TYPES
// ============================================

export interface Column<T extends object> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface ListTablePageProps<T extends object> {
  // Breadcrumb & Subtitle
  breadcrumbs?: string[];
  subtitle?: React.ReactNode;

  // Data
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;

  // Toolbar
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;

  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalData?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;

  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
}

// ============================================
// HELPERS
// ============================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const calculateRange = (total: number, pageSize: number, currentPage: number) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  return { start, end, totalPages };
};

// ============================================
// COMPONENT: ListTablePage
// ============================================
export function ListTablePage<T extends object>({
  breadcrumbs = [],
  subtitle = '',
  columns,
  data,
  loading = false,
  emptyMessage = 'Tidak ada data',
  toolbarLeft,
  toolbarRight,
  pageSize = 12,
  currentPage = 1,
  totalData = 0,
  onPageChange,
  onRefresh,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
}: ListTablePageProps<T>) {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const totalPages = Math.ceil(totalData / pageSize);
  const { start, end } = calculateRange(totalData, pageSize, currentPage);

  // Page input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Selection helpers
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedRows.length === data.length ? [] : [...data]);
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    const isSelected = selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));
    onSelectionChange(
      isSelected
        ? selectedRows.filter((r) => JSON.stringify(r) !== JSON.stringify(row))
        : [...selectedRows, row]
    );
  };

  const isRowSelected = (row: T) =>
    selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));

  // Cell value
  const renderCellValue = (column: Column<T>, row: T, rowIndex: number) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row, rowIndex);
    }
    return String(row[column.key as keyof T] ?? '');
  };

  const colSpan =
    columns.length +
    (selectable ? 1 : 0) +
    1 + // No column
    (onSelectionChange ? 0 : 0); // Edit/Delete handled by page

  return (
    <div className="list-table-page">
      {/* Header */}
      {(breadcrumbs.length > 0 || subtitle) && (
        <div className="list-table-page__header">
          {breadcrumbs.length > 0 && (
            <p className="list-table-page__breadcrumb">{breadcrumbs.join(' > ')}</p>
          )}
          {subtitle && <h2 className="list-table-page__subtitle">{subtitle}</h2>}
        </div>
      )}

      {/* Toolbar */}
      <div className="list-table-page__toolbar">
        <div className="list-table-page__toolbar-left">{toolbarLeft}</div>
        <div className="list-table-page__toolbar-right">{toolbarRight}</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-12">
                No
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={colSpan + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-sm text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-slate-50 transition-colors ${
                    isRowSelected(row) ? 'bg-primary/5' : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={isRowSelected(row)}
                        onChange={() => handleSelectRow(row)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-slate-500 text-center">
                    {rowIndex + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm text-slate-700 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {renderCellValue(col, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalData > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl">
          <span className="text-xs text-slate-500">
            Menampilkan {start}–{end} dari {totalData}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              ‹
            </button>
            <form onSubmit={handlePageInputSubmit} className="flex items-center">
              <input
                type="text"
                className="w-14 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={() => setPageInput(String(currentPage))}
              />
            </form>
            <span className="text-xs text-slate-400">/ {totalPages}</span>
            <button
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              ›
            </button>
            {onRefresh && (
              <button
                className="ml-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                onClick={onRefresh}
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
