'use client';

import { Menu, LogOut } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard General WOS';
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const titleMap: { [key: string]: string } = {
    'wallest': 'Wallest',
    'activos': 'Activos Inmobiliarios',
    'administracion': 'Administración',
    'organizador': 'Organizador',
    'finanzas': 'Finanzas',
    'rrhh': 'Recursos Humanos',
    'calculadora': 'Calculadora de Rentabilidad',
    'macroproyectos': 'Gestor de Macroproyectos',
    'documentos': 'Documentos',
    'renova': 'Renova',
    'reformas': 'Reformas',
    'planificador': 'Planificador',
    'proveedores': 'Proveedores',
    'materiales': 'Stock / Materiales',
    'finanzas-proyecto': 'Finanzas de Proyecto',
    'nexo': 'Nexo',
    'leads': 'CRM de Leads',
    'comercializacion': 'Comercialización',
    'transacciones': 'Transacciones',
    'contratos': 'Contratos'
  };

  // Construir título basado en los segmentos
  const titles = pathSegments.map(segment => titleMap[segment] || segment)
    .filter(Boolean);
  
  return titles.length > 0 ? titles.join(' • ') : 'Wallest Operating System';
};

export default function HeaderBar() {
  const { toggleSidebar, isOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    
    getUser();
  }, []);

  const handleSignOut = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  return (
    <header className="bg-wos-card border-b border-wos-border px-4 py-3 flex items-center min-h-[60px]">
      <button
        onClick={toggleSidebar}
        className="hamburger-menu p-2 rounded-lg hover:bg-wos-bg transition-all duration-200"
        aria-label={isOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
        title={isOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
      >
        <Menu size={20} className="text-wos-text-muted hover:text-wos-accent transition-colors duration-200" />
      </button>
      
      <div className="ml-4 flex-1">
        <h1 className="text-lg font-semibold text-wos-accent truncate">
          {pageTitle}
        </h1>
        {pageTitle !== 'Dashboard General WOS' && (
          <p className="text-xs text-wos-text-muted">Wallest Operating System</p>
        )}
      </div>

      {/* Usuario y cerrar sesión */}
      <div className="flex items-center space-x-3">
        {userEmail && (
          <div className="hidden md:block text-right">
            <p className="text-sm text-wos-text">{userEmail}</p>
            <p className="text-xs text-wos-text-muted">Usuario</p>
          </div>
        )}
        
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-wos-bg transition-all duration-200 group"
          title="Cerrar sesión"
        >
          <LogOut size={20} className="text-wos-text-muted group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </header>
  );
}