import { Search, RefreshCw } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface ListSearchBarProps {
  /** Current input value */
  value: string;
  /** Input change handler */
  onChange: (value: string) => void;
  /** Fire search (on Enter or button click) */
  onSearch: () => void;
  /** Clear search and reset */
  onReset: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable all controls */
  disabled?: boolean;
}

/**
 * Standardized search bar for list pages.
 * Matches the exact layout from Abi's spec:
 * 🔍 [ Cari produk... ] [Cari] [🔄 Reset]
 */
export function ListSearchBar({
  value,
  onChange,
  onSearch,
  onReset,
  placeholder = 'Cari...',
  disabled = false,
}: ListSearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        <Search size={14} />
        Cari
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw size={14} />
        Reset
      </button>
    </form>
  );
}
