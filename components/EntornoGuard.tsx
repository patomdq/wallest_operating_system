'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function EntornoGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Esperar a que el componente esté montado
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Rutas que NO requieren entorno seleccionado
    const publicRoutes = ['/login', '/hub'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (isPublicRoute) {
      setIsChecking(false);
      return;
    }

    // Verificar si hay entorno seleccionado
    try {
      const selectedEnv = localStorage.getItem('wos_env');

      if (!selectedEnv) {
        // No hay entorno seleccionado, redirigir a hub
        router.push('/hub');
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking entorno:', error);
      setIsChecking(false);
    }
  }, [mounted, pathname, router]);

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen bg-wos-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-wos-accent border-t-transparent"></div>
          <p className="text-wos-text-muted">Verificando entorno...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
