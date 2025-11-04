'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  Building2,
  Wrench,
  Users,
  ChevronDown,
  ChevronRight,
  Home,
  FileText,
  DollarSign,
  UserCircle,
  Calculator,
  FolderKanban,
  HardDrive,
  Hammer,
  Package,
  ShoppingCart,
  UserPlus,
  TrendingUp,
  FileSignature,
  Calendar,
} from 'lucide-react';

type MenuItem = {
  title: string;
  icon: any;
  path: string;
  subItems?: { title: string; path: string; icon: any }[];
};

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'WALLest',
    icon: Building2,
    path: '/wallest',
    subItems: [
      { title: 'Activos Inmobiliarios', path: '/wallest/activos', icon: Home },
      { title: 'Administración', path: '/wallest/administracion', icon: FileText },
      { title: 'Organizador', path: '/wallest/organizador', icon: Calendar },
      { title: 'Finanzas', path: '/wallest/finanzas', icon: DollarSign },
      { title: 'Recursos Humanos', path: '/wallest/rrhh', icon: UserCircle },
      { title: 'Calculadora de Rentabilidad', path: '/wallest/calculadora', icon: Calculator },
      { title: 'Gestor de Macroproyectos', path: '/wallest/macroproyectos', icon: FolderKanban },
      { title: 'Documentos', path: '/wallest/documentos', icon: HardDrive },
    ],
  },
  {
    title: 'RENOVA',
    icon: Wrench,
    path: '/renova',
    subItems: [
      { title: 'Reformas', path: '/renova/reformas', icon: Hammer },
      { title: 'Planificador', path: '/renova/planificador', icon: FileText },
      { title: 'Proveedores', path: '/renova/proveedores', icon: ShoppingCart },
      { title: 'Stock / Materiales', path: '/renova/materiales', icon: Package },
    ],
  },
  {
    title: 'NEXO',
    icon: Users,
    path: '/nexo',
    subItems: [
      { title: 'CRM de Leads', path: '/nexo/leads', icon: UserPlus },
      { title: 'Comercialización', path: '/nexo/comercializacion', icon: TrendingUp },
      { title: 'Transacciones', path: '/nexo/transacciones', icon: DollarSign },
      { title: 'Contratos', path: '/nexo/contratos', icon: FileSignature },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const [openMenus, setOpenMenus] = useState<string[]>(['WALLest', 'RENOVA', 'NEXO']);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-wos-sidebar border-r border-wos-border flex flex-col h-screen overflow-hidden sidebar-transition z-50 ${
        isOpen 
          ? 'w-64 md:w-64 fixed md:relative' 
          : 'w-0 md:w-0'
      } md:static`}
    >
      <div className={`${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'} transition-opacity duration-300 flex flex-col h-full overflow-y-auto w-64`}>
      {/* Header */}
      <div className="p-6 border-b border-wos-border">
        <h1 className="text-xl font-bold text-wos-accent">WOS 1.0</h1>
        <p className="text-xs text-wos-text-muted mt-1">Wallest Operating System</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.title}>
            {/* Main menu item */}
            <button
              onClick={() => item.subItems && toggleMenu(item.title)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-smooth ${
                isActive(item.path) && !item.subItems
                  ? 'bg-wos-card text-wos-accent'
                  : 'text-wos-text-muted hover:bg-wos-card hover:text-wos-text'
              }`}
            >
              <Link
                href={item.subItems ? '#' : item.path}
                className="flex items-center gap-3 flex-1"
                onClick={(e) => item.subItems && e.preventDefault()}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
              {item.subItems && (
                <div>
                  {openMenus.includes(item.title) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              )}
            </button>

            {/* Submenu items */}
            {item.subItems && openMenus.includes(item.title) && (
              <div className="ml-4 mt-1 space-y-1 border-l border-wos-border pl-3">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    href={subItem.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth ${
                      isActive(subItem.path)
                        ? 'bg-wos-card text-wos-accent'
                        : 'text-wos-text-muted hover:bg-wos-card hover:text-wos-text'
                    }`}
                  >
                    <subItem.icon size={16} />
                    <span>{subItem.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

        {/* Footer */}
        <div className="p-4 border-t border-wos-border">
          <p className="text-xs text-wos-text-muted text-center">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
