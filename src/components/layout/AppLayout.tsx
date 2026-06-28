import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { MobileBottomBar } from './mobile-bottom-bar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' sidebar-overlay--open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — always rendered, mobile state controlled via CSS class */}
      <AppSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main body */}
      <div className="app-body">
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <MobileBottomBar />
    </div>
  );
}
