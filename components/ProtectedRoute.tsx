'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // Si no está autenticado y no está en login, redirigir
        if (!session && pathname !== '/login') {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

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
