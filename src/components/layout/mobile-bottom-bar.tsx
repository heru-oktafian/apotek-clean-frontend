import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronUp,
  LayoutDashboard,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../features/auth/auth-context';
import { getMenus } from '../../features/menu/api/menu-api';
import type { NavGroup } from '../../types/menu';

function buildNavGroups(data: unknown): NavGroup[] {
  if (!Array.isArray(data)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((g) => ({
    ...g,
    items: (g.items ?? []).map((item: { title?: string; url?: string }, idx: number) => ({
      label: item.title ?? '',
      to: item.url ?? '#',
      icon: '',
      apiUrl: item.url ?? '',
    })),
  }));
}

const QUICK_TABS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Penjualan', to: '/sale-pos', icon: ShoppingCart },
  { label: 'Retur Jual', to: '/retur-penjualan', icon: RotateCcw },
];

export function MobileBottomBar() {
  const { activeToken } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [allGroups, setAllGroups] = useState<NavGroup[]>([]);

  useEffect(() => {
    if (!activeToken) return;
    getMenus(activeToken)
      .then((res) => setAllGroups(buildNavGroups(res.data)))
      .catch(() => {});
  }, [activeToken]);

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <>
      <nav className="mobile-bottom-bar">
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
          <span>Lainnya</span>
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
              {allGroups.map((group) => (
                <div key={group.id} className="mobile-bottom-bar__group">
                  <p className="mobile-bottom-bar__group-label">{group.label}</p>
                  {group.items.map((item, idx) => (
                    <Link
                      key={`${item.to}-${idx}`}
                      to={item.to}
                      className={`mobile-bottom-bar__item${isActive(item.to) ? ' active' : ''}`}
                      onClick={() => setShowMore(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}