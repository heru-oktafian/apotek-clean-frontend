import { useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppSidebar } from '../components/layout/app-sidebar'
import { DashboardTopbar } from '../components/layout/dashboard-topbar'
import { MobileBottomBar } from '../components/layout/mobile-bottom-bar'
import { PagePlaceholder } from '../components/common/page-placeholder'
import { GlobalErrorBoundary } from '../components/common/global-error-boundary'
import { AuthProvider, useAuth } from '../features/auth/auth-context'
import { useTokenValidation } from '../features/auth/hooks/useTokenValidation'
import { LoginPage } from '../features/auth/pages/login-page'
import { BranchSelectionPage } from '../features/auth/pages/branch-selection-page'
import { DashboardPage } from '../features/dashboard/pages/dashboard-page'
import { ProfilePage } from '../features/shared/pages/profile-page'
import { SalePosPage } from '../pages/SalePosPage'
import { ReturPenjualanPage } from '../pages/ReturPenjualanPage'

function AuthGate() {
  const { activeToken, preBranchToken } = useAuth()

  if (activeToken) {
    return <Navigate to="/dashboard" replace />
  }

  if (preBranchToken) {
    return <Navigate to="/select-branch" replace />
  }

  return <Outlet />
}

function ProtectedRoute() {
  const { activeToken } = useAuth()
  const { isValid, isLoading } = useTokenValidation()

  if (!activeToken) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    // Validasi token sedang berlangsung, tampilkan loading atau placeholder
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Validating session...</p>
      </div>
    )
  }

  if (!isValid) {
    // Token expired atau invalid, akan di-redirect ke login oleh logout()
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      <AppSidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="dashboard-shell__content">
        <DashboardTopbar onToggleSidebar={() => setMobileSidebarOpen((current) => !current)} />
        <main className="dashboard-shell__main" onClick={() => mobileSidebarOpen && setMobileSidebarOpen(false)}>
          <Outlet />
        </main>
        <MobileBottomBar />
      </div>
    </div>
  )
}

function RootRedirect() {
  const { activeToken, preBranchToken } = useAuth()

  if (activeToken) return <Navigate to="/dashboard" replace />
  if (preBranchToken) return <Navigate to="/select-branch" replace />
  return <Navigate to="/login" replace />
}

export function AppRouter() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<AuthGate />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/select-branch" element={<BranchSelectionPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sale-pos" element={<SalePosPage />} />
            <Route path="/retur-penjualan" element={<ReturPenjualanPage />} />
            <Route
              path="/master/member-categories"
              element={<PagePlaceholder title="Kategori Member" description="Halaman ini akan menjadi list berpaging dengan search mengikuti backend aktif." />}
            />
            <Route path="/master/members" element={<PagePlaceholder title="Member" description="Fondasi halaman member akan memakai server-side pagination dan search dari backend." />} />
            <Route path="/master/product-categories" element={<PagePlaceholder title="Kategori Produk" description="Halaman kategori produk akan mengikuti pola master data backend yang sudah ada." />} />
            <Route path="/master/units" element={<PagePlaceholder title="Satuan" description="Halaman satuan akan dibuat dengan tabel berpaging dan modal form bertahap." />} />
            <Route path="/master/unit-conversions" element={<PagePlaceholder title="Konversi Satuan" description="Halaman konversi satuan akan memakai combo produk dan list berpaging dari backend aktif." />} />
            <Route path="/master/supplier-categories" element={<PagePlaceholder title="Kategori Supplier" description="Halaman kategori supplier akan mengikuti kontrak pagination master data aktif." />} />
            <Route path="/master/suppliers" element={<PagePlaceholder title="Supplier" description="Halaman supplier akan memakai search dan pagination server-side." />} />
            <Route path="/master/products" element={<PagePlaceholder title="Produk" description="Halaman produk akan menjadi salah satu prioritas utama karena sudah punya list, detail, export, dan label." />} />
            <Route path="/transactions/purchases" element={<PagePlaceholder title="Pembelian" description="Halaman pembelian akan fokus dulu pada list, filter bulan, detail, dan export." />} />
            <Route path="/transactions/sales" element={<PagePlaceholder title="Penjualan" description="Halaman penjualan akan memakai list berpaging, filter bulan, detail, dan item transaksi." />} />
            <Route path="/transactions/duplicate-receipts" element={<PagePlaceholder title="Duplicate Receipt" description="Halaman ini tetap diperlakukan sebagai domain transaksi terpisah dari sale." />} />
            <Route path="/transactions/buy-returns" element={<PagePlaceholder title="Retur Pembelian" description="Halaman retur pembelian akan fokus pada list/detail lebih dulu karena kontraknya legacy-hati-hati." />} />
            <Route path="/transactions/sale-returns" element={<PagePlaceholder title="Retur Penjualan" description="Halaman retur penjualan akan fokus pada list/detail/export di tahap awal." />} />
            <Route path="/transactions/expenses" element={<PagePlaceholder title="Pengeluaran" description="Halaman pengeluaran akan menjadi kandidat awal mutation karena payload relatif aman." />} />
            <Route path="/transactions/another-incomes" element={<PagePlaceholder title="Pendapatan Lain" description="Halaman pendapatan lain akan mengikuti pola transaksi ringan backend aktif." />} />
            <Route path="/transactions/first-stocks" element={<PagePlaceholder title="First Stock" description="Halaman first stock akan mendukung list, detail item, dan workflow stok bertahap." />} />
            <Route path="/reports/daily-assets" element={<PagePlaceholder title="Daily Assets" description="Halaman daily assets akan memakai response pagination nested dari backend aktif." />} />
            <Route path="/system/users" element={<PagePlaceholder title="Users" description="Halaman user memakai bentuk pagination custom top-level, jadi akan dibuat adapter khusus." />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GlobalErrorBoundary>
  )
}
