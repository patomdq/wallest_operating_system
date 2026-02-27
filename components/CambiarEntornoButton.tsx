'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CambiarEntornoButton() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCambiarEntorno = () => {
    if (!mounted) return;
    
    try {
      // Limpiar entorno seleccionado
      localStorage.removeItem('wos_env');
      // Redirigir al hub
      router.push('/hub');
    } catch (error) {
      console.error('Error cambiando entorno:', error);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleCambiarEntorno}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-wos-card border border-wos-border rounded-lg hover:bg-wos-border transition-colors text-wos-text-muted hover:text-wos-text"
      title="Cambiar entorno"
    >
      <RefreshCw size={16} />
      <span>Cambiar entorno</span>
    </button>
  );
}
