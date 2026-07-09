import { useState, useEffect, useCallback } from 'react';

export interface UseListSearchOptions {
  initialValue?: string;
  debounceMs?: number;
  onSearch?: (query: string) => void;
}

export interface UseListSearchReturn {
  searchValue: string;
  setSearchValue: (v: string) => void;
  debouncedValue: string;
}

export function useListSearch(options: UseListSearchOptions = {}): UseListSearchReturn {
  const {
    initialValue = '',
    debounceMs = 300,
  } = options;

  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs]);

  return { searchValue, setSearchValue, debouncedValue };
}
