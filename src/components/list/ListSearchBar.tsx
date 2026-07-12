import { Search } from 'lucide-react';

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ListSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Cari...',
  disabled = false,
}: ListSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <div className="list-page__search-group">
      <form className="list-page__search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="list-page__search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={placeholder}
        />
        <button
          type="submit"
          className="list-page__search-btn"
          disabled={disabled}
        >
          <Search size={14} />
        </button>
      </form>
    </div>
  );
}
