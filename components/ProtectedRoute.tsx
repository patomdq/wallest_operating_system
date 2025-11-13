'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir a login
    // Excepto si ya está en la página de login
    if (!loading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-wos-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-wos-accent border-t-transparent"></div>
          <p className="text-wos-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar contenido (se está redirigiendo)
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  // Usuario autenticado o en página de login
  return <>{children}</>;
}
