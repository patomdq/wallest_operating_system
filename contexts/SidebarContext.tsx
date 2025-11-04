'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  // Mantener el estado del sidebar en localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('wos-sidebar-open');
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    } else {
      // En dispositivos móviles, cerrar sidebar por defecto
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setIsOpen(false);
        localStorage.setItem('wos-sidebar-open', JSON.stringify(false));
      }
    }
  }, []);

  // Manejar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && isOpen) {
        // En móvil, cerrar sidebar automáticamente si está abierto
        setIsOpen(false);
        localStorage.setItem('wos-sidebar-open', JSON.stringify(false));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('wos-sidebar-open', JSON.stringify(newState));
  };

  const closeSidebar = () => {
    setIsOpen(false);
    localStorage.setItem('wos-sidebar-open', JSON.stringify(false));
  };

  const openSidebar = () => {
    setIsOpen(true);
    localStorage.setItem('wos-sidebar-open', JSON.stringify(true));
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}