'use client';

import { Menu, LogOut } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import CambiarEntornoButton from './CambiarEntornoButton';

const titleMap: Record<string, string> = {
  'wallest':          'Wallest',
  'activos':          'Activos Inmobiliarios',
  'administracion':   'Administración',
  'organizador':      'Organizador',
  'finanzas':         'Finanzas',
  'rrhh':             'Recursos Humanos',
  'calculadora':      'Calculadora de Rentabilidad',
  'macroproyectos':   'Gestor de Macroproyectos',
  'documentos':       'Documentos',
  'renova':           'Renova',
  'reformas':         'Reformas',
  'planificador':     'Planificador',
  'proveedores':      'Proveedores',
  'materiales':       'Stock / Materiales',
  'nexo':             'Nexo',
  'leads':            'CRM de Leads',
  'comercializacion': 'Comercialización',
  'transacciones':    'Transacciones',
  'contratos':        'Contratos',
};

const areaConfig: Record<string, { color: string; label: string }> = {
  wallest: { color: '#3b82f6', label: 'WALLEST' },
  renova:  { color: '#F15A29', label: 'RENOVA' },
  nexo:    { color: '#22c55e', label: 'NEXO' },
};

function getPageInfo(pathname: string) {
  if (pathname === '/') return { title: 'Dashboard General', subtitle: '', area: null };
  const segments = pathname.split('/').filter(Boolean);
  const area = segments[0];
  const section = segments[1];
  const title = section ? (titleMap[section] || section) : (titleMap[area] || area);
  const subtitle = titleMap[area] ? `${titleMap[area]} · Wallest by Hasu` : 'WOS 2.0';
  return { title, subtitle, area: areaConfig[area] || null };
}

export default function HeaderBar() {
  const { toggleSidebar, isOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle, area } = getPageInfo(pathname);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  const handleSignOut = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  return (
    <header
      className="border-b border-wos-border px-4 flex items-center min-h-[56px] gap-3"
      style={{ background: '#111111' }}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="hamburger-menu p-1.5 rounded-lg transition-all flex-shrink-0"
        style={{ background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1e1e1e'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        aria-label="Toggle menú"
      >
        <Menu size={18} color="#ffffff" />
      </button>

      {/* Badge área + título */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {area && (
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest flex-shrink-0"
            style={{ background: area.color + '20', color: area.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: area.color }} />
            {area.label}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold text-white truncate leading-tight">
            {title}
          </h1>
          {subtitle && pathname !== '/' && (
            <p className="text-[11px] hidden md:block leading-tight" style={{ color: '#888' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <CambiarEntornoButton />

        {userEmail && (
          <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-wos-border">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: '#F15A29', color: '#ffffff' }}
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-[12px] text-white leading-tight truncate max-w-[160px]">{userEmail}</p>
              <p className="text-[10px] leading-tight" style={{ color: '#888' }}>Usuario</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-lg transition-all group ml-1"
          style={{ background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1e1e1e'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          title="Cerrar sesión"
        >
          <LogOut size={16} color="#888" />
        </button>
      </div>
    </header>
  );
}
