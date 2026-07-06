import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { useLocation, useNavigate } from 'react-router-dom'

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Header dengan Breadcrumb Dinamis
// ═══════════════════════════════════════════════════════════════════════════
// Menampilkan: [Branch Name] → [Current Page Title]
//
// Page title diambil dari URL pathname dengan mapping table:
// - /dashboard → Dashboard
// - /sale-pos → Penjualan
// - /master/products → Produk
// - dst (lihat pageTitles object di bawah)
//
// Mobile (<720px):
// - Header bisa flex-wrap ke 2 baris
// - Tombol hanya tampil sebagai ikon (teks di-hide dengan CSS)
// - Ukuran font diperkecil untuk hemat ruang
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardTopbarProps {
  onToggleSidebar: () => void
}

// Mapping URL pathname → User-friendly page title
// Jika pathname tidak ada di sini, fallback ke capitalize last segment
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sale-pos': 'Penjualan',
  '/retur-penjualan': 'Retur Penjualan',
  '/profile': 'Profile',
  '/master/member-categories': 'Kategori Member',
  '/master/members': 'Member',
  '/master/product-categories': 'Kategori Produk',
  '/master/products': 'Produk',
  '/master/satuan': 'Satuan',
  '/master/unit-conversions': 'Konversi Satuan',
  '/master/supplier-categories': 'Kategori Supplier',
  '/master/suppliers': 'Supplier',
  '/transactions/purchases': 'Pembelian',
  '/transactions/sales': 'Penjualan',
  '/transactions/duplicate-receipts': 'Duplicate Receipt',
  '/transactions/buy-returns': 'Retur Pembelian',
  '/transactions/sale-returns': 'Retur Penjualan',
  '/transactions/expenses': 'Pengeluaran',
  '/transactions/another-incomes': 'Pendapatan Lain',
  '/transactions/first-stocks': 'First Stock',
  '/reports/daily-assets': 'Daily Assets',
  '/system/users': 'Users',
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  // If the path is a user detail (e.g. /system/users/123), show Users → Otoritas
  if (/^\/system\/users\/[^\/]+$/.test(pathname)) return 'Users → Otoritas'
  if (pathname.startsWith('/system/users/')) return 'Users'
  const segments = pathname.split('/').filter(Boolean)
  if (!segments.length) return 'Dashboard'
  return segments
    .slice(-1)[0]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export function DashboardTopbar({ onToggleSidebar }: DashboardTopbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeBranch, profile, logout } = useAuth()

  const branchName = activeBranch?.branch_name || activeBranch?.name || 'Cabang aktif'
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__headline">
        <h1>
          {branchName}
          <span className="dashboard-topbar__breadcrumb">→ {pageTitle}</span>
        </h1>
      </div>

      <div className="dashboard-topbar__actions">
        <button type="button" className="ghost-button dashboard-topbar__action-button" onClick={() => navigate('/profile')}>
          <User size={16} />
          <span>Profile</span>
        </button>
        <button
          type="button"
          className="ghost-button ghost-button--danger dashboard-topbar__action-button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
