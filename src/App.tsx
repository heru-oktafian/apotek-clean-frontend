import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './features/auth/auth-context';
import { LoginPage } from './features/auth/pages/login-page';
import { BranchSelectionPage } from './features/auth/pages/branch-selection-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { SalePosPage } from './pages/SalePosPage';
import { ReturPenjualanPage } from './pages/ReturPenjualanPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/select-branch" element={<BranchSelectionPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="sale-pos" element={<SalePosPage />} />
                <Route path="retur-penjualan" element={<ReturPenjualanPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
