'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import SidebarOverlay from './SidebarOverlay';
import ProtectedRoute from './ProtectedRoute';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Si es la página de login, mostrar solo el contenido sin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Para otras páginas, mostrar el layout completo con protección
  return (
    <ProtectedRoute>
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
      </div>
    </ProtectedRoute>
  );
}
