'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import SidebarOverlay from './SidebarOverlay';
import ProtectedRoute from './ProtectedRoute';
import EntornoGuard from './EntornoGuard';
import WOSChat from './WOSChat';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isHubPage = pathname === '/hub';
  const isInversorPage = pathname === '/inversores' || pathname.startsWith('/inversores/');

  // Si es la página de login o inversores, mostrar solo el contenido sin layout ni protección
  if (isLoginPage || isInversorPage) {
    return <>{children}</>;
  }

  // Si es la página de hub, proteger pero sin layout
  if (isHubPage) {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    );
  }

  // Para otras páginas, mostrar el layout completo con protección y guard de entorno
  return (
    <ProtectedRoute>
      <EntornoGuard>
        <div className="flex h-screen overflow-hidden relative">
          <Sidebar />

          {/* Overlay para móvil */}
          <SidebarOverlay />

          <div className="flex-1 flex flex-col overflow-hidden">
            <HeaderBar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>

          <WOSChat />
        </div>
      </EntornoGuard>
    </ProtectedRoute>
  );
}
