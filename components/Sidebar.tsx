'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard, Building2, Wrench, Users,
  ChevronDown, ChevronRight, Home, FileText,
  DollarSign, UserCircle, Calculator, FolderKanban,
  HardDrive, Hammer, Package, ShoppingCart,
  UserPlus, TrendingUp, FileSignature, Calendar,
} from 'lucide-react';

type SubItem = { title: string; path: string; icon: any };
type MenuItem = {
  title: string;
  icon: any;
  path: string;
  area?: 'wallest' | 'renova' | 'nexo';
  subItems?: SubItem[];
};

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    title: 'WALLest', icon: Building2, path: '/wallest', area: 'wallest',
    subItems: [
      { title: 'Activos Inmobiliarios',       path: '/wallest/activos',        icon: Home },
      { title: 'Administración',              path: '/wallest/administracion', icon: FileText },
      { title: 'Organizador',                 path: '/wallest/organizador',    icon: Calendar },
      { title: 'Finanzas',                    path: '/wallest/finanzas',       icon: DollarSign },
      { title: 'Recursos Humanos',            path: '/wallest/rrhh',           icon: UserCircle },
      { title: 'Calculadora de Rentabilidad', path: '/wallest/calculadora',    icon: Calculator },
      { title: 'Gestor de Macroproyectos',    path: '/wallest/macroproyectos', icon: FolderKanban },
      { title: 'Documentos',                  path: '/wallest/documentos',     icon: HardDrive },
    ],
  },
  {
    title: 'RENOVA', icon: Wrench, path: '/renova', area: 'renova',
    subItems: [
      { title: 'Reformas',           path: '/renova/reformas',     icon: Hammer },
      { title: 'Planificador',       path: '/renova/planificador', icon: FileText },
      { title: 'Proveedores',        path: '/renova/proveedores',  icon: ShoppingCart },
      { title: 'Stock / Materiales', path: '/renova/materiales',   icon: Package },
    ],
  },
  {
    title: 'NEXO', icon: Users, path: '/nexo', area: 'nexo',
    subItems: [
      { title: 'CRM de Leads',      path: '/nexo/leads',            icon: UserPlus },
      { title: 'Comercialización',  path: '/nexo/comercializacion', icon: TrendingUp },
      { title: 'Transacciones',     path: '/nexo/transacciones',    icon: DollarSign },
      { title: 'Contratos',         path: '/nexo/contratos',        icon: FileSignature },
    ],
  },
];

// Todos usan naranja de marca — sin azul
const areaAccent: Record<string, string> = {
  wallest: '#F15A29',
  renova:  '#F15A29',
  nexo:    '#22c55e',
};

function getActiveArea(pathname: string) {
  if (pathname.startsWith('/wallest')) return 'wallest';
  if (pathname.startsWith('/renova'))  return 'renova';
  if (pathname.startsWith('/nexo'))    return 'nexo';
  return null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useSidebar();
  const [openMenus, setOpenMenus] = useState<string[]>(['WALLest', 'RENOVA', 'NEXO']);
  const activeArea = getActiveArea(pathname);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(i => i !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`bg-wos-sidebar border-r border-wos-border flex flex-col h-screen overflow-hidden sidebar-transition z-50 ${
        isOpen ? 'w-64 md:w-64 fixed md:relative' : 'w-0 md:w-0'
      } md:static`}
    >
      <div className={`${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'} transition-opacity duration-300 flex flex-col h-full overflow-y-auto w-64`}>

        {/* ── Header ─────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-wos-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F15A29, #c44a20)' }}
            >
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-wos-text">WOS 2.0</h1>
              <p className="text-[10px] tracking-wide text-wos-text-subtle">
                Wallest by Hasu
              </p>
            </div>
          </div>

          {/* Badge área activa — naranja siempre */}
          {activeArea && (
            <div
              className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{ background: '#F15A2920' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: areaAccent[activeArea] }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: areaAccent[activeArea] }}
              >
                {activeArea}
              </span>
            </div>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const accent = item.area ? areaAccent[item.area] : '#F15A29';
            const isAreaActive = item.path !== '/' && pathname.startsWith(item.path);
            const isAreaOpen = openMenus.includes(item.title);
            const isDashboard = item.path === '/';

            return (
              <div key={item.title}>
                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive(item.path) && isDashboard ? 'var(--wos-nav-hover)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--wos-nav-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background =
                    isActive(item.path) && isDashboard ? 'var(--wos-nav-hover)' : 'transparent'}
                  onClick={() => {
                    router.push(item.path);
                    if (item.subItems) toggleMenu(item.title);
                  }}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <item.icon
                      size={16}
                      style={{ color: isAreaActive ? accent : 'var(--wos-text)' }}
                      className="flex-shrink-0"
                    />
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: isAreaActive ? accent : 'var(--wos-text)' }}
                    >
                      {item.title}
                    </span>
                  </div>
                  {item.subItems && (
                    <span style={{ color: 'var(--wos-text-subtle)' }}>
                      {isAreaOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                  )}
                </div>

                {/* Subitems */}
                {item.subItems && isAreaOpen && (
                  <div className="ml-3 mt-0.5 mb-1 border-l pl-3 space-y-0.5" style={{ borderColor: 'var(--wos-border)' }}>
                    {item.subItems.map((sub) => {
                      const subActive = isActive(sub.path);
                      return (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all duration-150"
                          style={{
                            color: subActive ? accent : 'var(--wos-text)',
                            background: subActive ? 'var(--wos-nav-hover)' : 'transparent',
                            borderLeft: subActive ? `2px solid ${accent}` : '2px solid transparent',
                          }}
                          onMouseEnter={e => {
                            if (!subActive) (e.currentTarget as HTMLElement).style.background = 'var(--wos-nav-hover)';
                          }}
                          onMouseLeave={e => {
                            if (!subActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          <sub.icon
                            size={13}
                            style={{ color: subActive ? accent : 'var(--wos-text)' }}
                            className="flex-shrink-0"
                          />
                          <span>{sub.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-wos-border">
          <p className="text-[10px] text-center tracking-widest uppercase text-wos-text-subtle">v2.0</p>
        </div>
      </div>
    </aside>
  );
}
