import { useState, useCallback, useEffect } from 'react';

interface UseListSearchOptions {
  onSearch: (search: string, page: number) => void;
  /** Called when page should reset to 1 */
  onResetPage?: () => void;
  /** Minimum characters before search fires (default: 0 = no minimum) */
  minChars?: number;
  /** Debounce ms for search input (default: 0 = no debounce) */
  debounceMs?: number;
}

interface UseListSearchReturn {
  /** Current input value */
  searchInput: string;
  /** Controlled input change handler */
  handleSearchInputChange: (value: string) => void;
  /** Called on form submit — fires search if valid */
  handleSearch: () => void;
  /** Clears input and resets to page 1 */
  handleReset: () => void;
  /** Replace current search value from outside (e.g. clear from parent) */
  setSearchInput: (value: string) => void;
}

/**
 * Manages search input state and logic for list pages.
 * Does NOT call API directly — delegates to `onSearch(page, search)`.
 *
 * Usage:
 * ```tsx
 * const { searchInput, handleSearchInputChange, handleSearch, handleReset } = useListSearch({
 *   onSearch: (search) => loadProducts(1, search),
 * });
 * ```
 */
export function useListSearch({
  onSearch,
  onResetPage,
  minChars = 0,
  debounceMs = 0,
}: UseListSearchOptions): UseListSearchReturn {
  const [searchInput, setSearchInput] = useState('');

  // Optional debounce timer
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);

    if (debounceMs > 0) {
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        const normalized = value.trim().toLowerCase();
        if (normalized.length >= minChars) {
          onSearch(normalized, 1);
          onResetPage?.();
        }
      }, debounceMs);
      setDebounceTimer(timer);
    }
  }, [debounceMs, debounceTimer, minChars, onSearch, onResetPage]);

  const handleSearch = useCallback(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const normalized = searchInput.trim().toLowerCase();
    if (normalized.length >= minChars) {
      onSearch(normalized, 1);
      onResetPage?.();
    }
  }, [debounceMs, debounceTimer, minChars, onSearch, onResetPage, searchInput]);

  const handleReset = useCallback(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setSearchInput('');
    onSearch('', 1);
    onResetPage?.();
  }, [debounceTimer, onSearch, onResetPage]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  return {
    searchInput,
    handleSearchInputChange,
    handleSearch,
    handleReset,
    setSearchInput,
  };
}
