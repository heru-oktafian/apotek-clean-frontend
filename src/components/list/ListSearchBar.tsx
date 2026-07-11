import { Search } from 'lucide-react';

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ListSearchBar({
  value,
  onChange,
  onSearch,
  disabled,
  isLoading,
  placeholder = 'Cari...',
}: ListSearchBarProps) {
  return (
    <div className="products-page__search-group">
      <form
        className="products-page__search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <input
          type="text"
          className="products-page__search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button
          className="products-page__search-btn"
          type="submit"
          disabled={disabled || isLoading}
          title="Cari"
        >
          <Search size={14} />
          <span>Cari</span>
        </button>
      </form>
    </div>
  );
}
