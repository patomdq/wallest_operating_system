'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { useEffect, useState } from 'react';

export default function SidebarOverlay() {
  const { isOpen, closeSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
      onClick={closeSidebar}
      aria-label="Cerrar menú lateral"
    />
  );
}