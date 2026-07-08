import React, { useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface ListTablePageProps<T> {
  // Breadcrumb & Subtitle
  breadcrumbs?: string[];
  subtitle?: React.ReactNode;

  // Data
  columns: Column<T>[];
  data: T[];
  loading?: boolean;

  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalData?: number;
  onPageChange?: (page: number) => void;

  // Actions
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onRefresh?: () => void;

  // Row Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;

  // Custom toolbar right slot (e.g. upload button)
  toolbarRight?: React.ReactNode;

  // Custom render for empty state
  emptyMessage?: string;
}

// ============================================
// HELPER: Format Currency
// ============================================
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// ============================================
// HELPER: Calculate Pagination Range
// ============================================
const calculateRange = (total: number, pageSize: number, currentPage: number) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  return { start, end, totalPages };
};

// ============================================
// COMPONENT: ListTablePage
// ============================================
export function ListTablePage<T extends Record<string, unknown>>({
  breadcrumbs = [],
  subtitle = '',
  columns,
  data,
  loading = false,
  pageSize = 12,
  currentPage = 1,
  totalData = 0,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onExportExcel,
  onExportPDF,
  onRefresh,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  emptyMessage = 'Tidak ada data',
}: ListTablePageProps<T>) {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const totalPages = Math.ceil(totalData / pageSize);
  const { start, end } = calculateRange(totalData, pageSize, currentPage);

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Handle page input submit
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Handle page input blur
  const handlePageInputBlur = () => {
    setPageInput(String(currentPage));
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  // Toggle select row
  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    const isSelected = selectedRows.some(
      (r, i) => JSON.stringify(r) === JSON.stringify(row)
    );
    if (isSelected) {
      onSelectionChange(selectedRows.filter((r) => JSON.stringify(r) !== JSON.stringify(row)));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  // Check if row is selected
  const isRowSelected = (row: T) => {
    return selectedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));
  };

  // Render cell value
  const renderCellValue = (column: Column<T>, row: T, rowIndex: number) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row, rowIndex);
    }
    return String(row[column.key as keyof T] ?? '');
  };

  return (
    <div className="list-table-page">
      {/* Breadcrumb & Subtitle */}
      {(breadcrumbs.length > 0 || subtitle) && (
        <div className="list-table-page__header">
          {breadcrumbs.length > 0 && (
            <p className="list-table-page__breadcrumb">
              {breadcrumbs.join(' > ')}
            </p>
          )}
          {subtitle && <h2 className="list-table-page__subtitle">{subtitle}</h2>}
        </div>
      )}

      {/* Toolbar */}
      <div className="list-table-page__toolbar">
        <div className="list-table-page__toolbar-left">
          {onAdd && (
            <button className="list-table-page__btn list-table-page__btn--primary" onClick={onAdd}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Tambah
            </button>
          )}
        </div>
        <div className="list-table-page__toolbar-right">
          {onExportExcel && (
            <button className="list-table-page__btn list-table-page__btn--secondary" onClick={onExportExcel}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10V12.67C14 13.2 13.57 13.63 13.04 13.65C10.63 13.77 8.18 13.84 5.76 13.79C5.3 13.78 4.84 13.6 4.5 13.26C4.16 12.92 3.98 12.46 3.97 12C3.94 9.58 4 7.12 3.88 4.72C3.87 4.19 4.3 3.76 4.83 3.75C7.24 3.66 9.68 3.58 12.1 3.62C12.64 3.63 13.08 4.06 13.08 4.61V6.94M2 10.5H14M5 7.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Download Excel
            </button>
          )}
          {onExportPDF && (
            <button className="list-table-page__btn list-table-page__btn--secondary" onClick={onExportPDF}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10V12.67C14 13.2 13.57 13.63 13.04 13.65C10.63 13.77 8.18 13.84 5.76 13.79C5.3 13.78 4.84 13.6 4.5 13.26C4.16 12.92 3.98 12.46 3.97 12C3.94 9.58 4 7.12 3.88 4.72C3.87 4.19 4.3 3.76 4.83 3.75C7.24 3.66 9.68 3.58 12.1 3.62C12.64 3.63 13.08 4.06 13.08 4.61V6.94M2 10.5H14M5 7.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Download PDF
            </button>
          )}
          {toolbarRight}
        </div>
      </div>

      {/* Table */}
      <div className="list-table-page__table-wrapper">
        <table className="list-table-page__table">
          <thead>
            <tr>
              {selectable && (
                <th className="list-table-page__th list-table-page__th--checkbox">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="list-table-page__th">No</th>
              {columns.map((col) => (
                <th key={String(col.key)} className="list-table-page__th" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="list-table-page__th">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1) + (onEdit || onDelete ? 1 : 0)} className="list-table-page__td list-table-page__td--loading">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1) + (onEdit || onDelete ? 1 : 0)} className="list-table-page__td list-table-page__td--empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`list-table-page__tr ${isRowSelected(row) ? 'list-table-page__tr--selected' : ''}`}
                >
                  {selectable && (
                    <td className="list-table-page__td list-table-page__td--checkbox">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={() => handleSelectRow(row)}
                      />
                    </td>
                  )}
                  <td className="list-table-page__td">{rowIndex + 1}</td>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="list-table-page__td"
                      style={{ textAlign: col.align }}
                    >
                      {renderCellValue(col, row, rowIndex)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="list-table-page__td list-table-page__td--actions">
                      {onEdit && (
                        <button
                          className="list-table-page__action-btn list-table-page__action-btn--edit"
                          onClick={() => onEdit(row)}
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="list-table-page__action-btn list-table-page__action-btn--delete"
                          onClick={() => onDelete(row)}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalData > 0 && (
        <div className="list-table-page__pagination">
          <span className="list-table-page__pagination-info">
            Showing {start} - {end} of {totalData}
          </span>
          <div className="list-table-page__pagination-controls">
            <button
              className="list-table-page__pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              &lt;
            </button>
            <form onSubmit={handlePageInputSubmit} className="list-table-page__pagination-form">
              <input
                type="text"
                className="list-table-page__pagination-input"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
              />
            </form>
            <button
              className="list-table-page__pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListTablePage;
