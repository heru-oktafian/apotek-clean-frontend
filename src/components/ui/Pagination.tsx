import { useEffect, useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  hideRefresh?: boolean;
  className?: string;
}

export function Pagination({ page, total, perPage, onPageChange, onRefresh, hideRefresh, className = '' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*$/.test(value)) {
      setPageInput(value);
    }
  };

  const commitPageInput = () => {
    if (!pageInput) {
      setPageInput(String(page));
      return;
    }

    const requestedPage = Number(pageInput);
    if (Number.isNaN(requestedPage)) {
      setPageInput(String(page));
      return;
    }

    const nextPage = Math.min(Math.max(requestedPage, 1), totalPages);
    if (nextPage !== page) {
      onPageChange(nextPage);
    } else {
      setPageInput(String(page));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitPageInput();
    }
  };

  return (
    <div className={`pagination-component ${className}`}>      
      <div className="pagination-component__info">
        {total === 0 ? 'Tidak ada data' : `Menampilkan ${Math.min((page - 1) * perPage + 1, total)}-${Math.min(page * perPage, total)} dari ${total}`}
      </div>
      <div className="pagination-component__controls">
        <button
          type="button"
          className="pagination-component__btn"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          title="Halaman sebelumnya"
        >
          ←
        </button>

        <Input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={handlePageInputChange}
          onBlur={commitPageInput}
          onKeyDown={handleKeyDown}
          className="pagination-component__input"
          aria-label="Halaman"
        />

        <button
          type="button"
          className="pagination-component__btn"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          title="Halaman berikutnya"
        >
          →
        </button>

        {!hideRefresh && onRefresh ? (
          <Button type="button" variant="secondary" className="pagination-component__refresh" onClick={onRefresh}>
            Refresh
          </Button>
        ) : null}
      </div>
    </div>
  );
}
