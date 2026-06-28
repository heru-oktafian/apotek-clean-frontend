import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../features/auth/auth-context';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="header">
      <button
        className="topbar-hamburger"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search menu..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="user-avatar">
          {profile?.name ? profile?.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
