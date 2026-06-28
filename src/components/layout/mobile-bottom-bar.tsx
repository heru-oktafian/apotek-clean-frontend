import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronUp,
  LayoutDashboard,
  RotateCcw,
  ShoppingCart,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../features/auth/auth-context';
import { useMenu } from '../../features/menu/hooks/useMenu';
import type { NavGroup } from '../../types/menu';
import { ITEM_ICON_MAP, GROUP_ICON_MAP } from './app-sidebar';

// ═══════════════════════════════════════════════════════════════════════════
// Mobile Bottom Navigation Bar
// ═══════════════════════════════════════════════════════════════════════════
// Bottom tab bar untuk mobile dengan quick access ke 3 menu utama:
// [Dashboard] [Penjualan] [Retur Jual] [Pharma P.O.S ▼]
//
// Fitur "Pharma P.O.S ▼":
// - Tombol expand untuk akses menu lengkap
// - Drawer modal dengan seluruh menu dari API
//
// Data Source:
// - Menu utama dari useMenu(activeToken) hook (cache di sessionStorage)
// - Fallback: Jika fetch gagal, scrape menu dari sidebar DOM
// - Fallback berguna jika API error/timeout
// ═══════════════════════════════════════════════════════════════════════════

const QUICK_TABS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Penjualan', to: '/sale-pos', icon: ShoppingCart },
  { label: 'Retur Jual', to: '/retur-penjualan', icon: RotateCcw },
];

export function MobileBottomBar() {
  const { activeToken } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [fallbackGroups, setFallbackGroups] = useState<NavGroup[]>([]);
  const { navGroups: allGroups } = useMenu(activeToken);
  const menuGroups = allGroups.length > 0 ? allGroups : fallbackGroups;

  // DOM fallback: if menu API fails or returns empty, try to read sidebar DOM
  useEffect(() => {
    if (allGroups.length > 0 || fallbackGroups.length > 0) return;
    const sidebar = document.querySelector('.app-sidebar__nav');
    if (!sidebar) return;
    try {
      const groups: NavGroup[] = [];
      const groupElements = Array.from(sidebar.querySelectorAll('.sidebar-group')) as HTMLElement[];
      groupElements.forEach((gEl, gi) => {
        const headerEl = gEl.querySelector('.sidebar-group__header') || gEl.querySelector('.sidebar-group__label');
        const label = headerEl ? (headerEl.textContent || '').trim() : `Group ${gi + 1}`;
        const items: any[] = [];
        const links = Array.from(gEl.querySelectorAll('a.sidebar-link')) as HTMLAnchorElement[];
        links.forEach((a) => {
          const text = (a.textContent || '').trim();
          const href = a.getAttribute('href') || '#';
          items.push({ label: text, to: href, icon: '', apiUrl: href });
        });
        if (label || items.length) {
          groups.push({ id: label.toLowerCase().replace(/\s+/g, '_') || String(gi), label, icon: '', items });
        }
      });
      if (groups.length) setFallbackGroups(groups);
    } catch (e) {
      // ignore
    }
  }, [allGroups, fallbackGroups.length]);

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <nav className="mobile-bottom-bar" data-debug="mobile-bottom-bar">
        {QUICK_TABS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`mobile-bottom-bar__tab${isActive(to) ? ' active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
        <button
          className={`mobile-bottom-bar__tab${showMore ? ' active' : ''}`}
          onClick={() => setShowMore((v) => !v)}
          type="button"
        >
          <ChevronUp size={20} className={showMore ? 'rotate-180' : ''} />
          <span>Pharma P.O.S</span>
        </button>
      </nav>

      {showMore && (
        <div className="mobile-bottom-bar__overlay" onClick={() => setShowMore(false)}>
          <div className="mobile-bottom-bar__drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-bottom-bar__drawer-header">
              <span>Menu Lengkap</span>
              <button type="button" onClick={() => setShowMore(false)}>✕</button>
            </div>
            <div className="mobile-bottom-bar__drawer-body">
              {(() => {
                const dash = menuGroups.find(g => g.id.toLowerCase() === 'dashboard' || g.label.toLowerCase() === 'dashboard');
                const others = menuGroups.filter(g => !(g.id.toLowerCase() === 'dashboard' || g.label.toLowerCase() === 'dashboard'));
                return (
                  <>
                    {dash && (
                      <div className="mobile-bottom-bar__dashboard-single" key="dashboard-single">
                        {dash.items.map((item, idx) => {
                          const key = (item.label || '').toLowerCase();
                          const Icon = (ITEM_ICON_MAP as any)[key] ?? Settings;
                          return (
                            <Link key={`dash-${idx}`} to={item.to} className={`mobile-bottom-bar__item${isActive(item.to) ? ' active' : ''}`} onClick={() => setShowMore(false)}>
                              <Icon size={16} className="mobile-bottom-bar__item-icon" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {others.map((group) => {
                      const gKey = (group.id || group.label || '').toLowerCase().replace(/\s+/g, '_');
                      const GroupIcon = (GROUP_ICON_MAP as any)[gKey] ?? Settings;
                      return (
                        <div key={group.id} className="mobile-bottom-bar__group">
                          <div className="mobile-bottom-bar__group-header">
                            <GroupIcon size={16} className="mobile-bottom-bar__group-icon" />
                            <p className="mobile-bottom-bar__group-label">{group.label}</p>
                          </div>
                          {group.items.map((item, idx) => {
                            const key = (item.label || '').toLowerCase();
                            const Icon = (ITEM_ICON_MAP as any)[key] ?? Settings;
                            return (
                              <Link
                                key={`${item.to}-${idx}`}
                                to={item.to}
                                className={`mobile-bottom-bar__item${isActive(item.to) ? ' active' : ''}`}
                                onClick={() => setShowMore(false)}
                              >
                                <Icon size={16} className="mobile-bottom-bar__item-icon" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}