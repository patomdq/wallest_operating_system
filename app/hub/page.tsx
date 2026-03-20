'use client';

import { useRouter } from 'next/navigation';
import { Building2, Wrench, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const entornos = [
  {
    id: 'wallest',
    nombre: 'WALLEST',
    descripcion: 'Gestión financiera y activos',
    icon: Building2,
    bgColor: '#1e40af',
    bgHover: '#1d4ed8',
    path: '/wallest',
    tag: 'Finanzas · Activos · Admin',
  },
  {
    id: 'renova',
    nombre: 'RENOVA',
    descripcion: 'Reformas y proyectos',
    icon: Wrench,
    bgColor: '#ea580c',
    bgHover: '#c2410c',
    path: '/renova',
    tag: 'Obras · Planificador · Stock',
  },
  {
    id: 'nexo',
    nombre: 'NEXO',
    descripcion: 'Comercialización y ventas',
    icon: Users,
    bgColor: '#16a34a',
    bgHover: '#15803d',
    path: '/nexo',
    tag: 'Leads · CRM · Transacciones',
  },
];

export default function HubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  const handleEntornoClick = (entornoId: string, path: string) => {
    if (!mounted) return;
    try {
      localStorage.setItem('wos_env', entornoId.toUpperCase());
      router.push(path);
    } catch (error) {
      console.error('Error guardando entorno:', error);
    }
  };

  const firstName = userEmail?.split('@')[0].split('.')[0];
  const displayName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-wos-bg">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F15A29, #c44a20)' }}
          >
            <span className="text-white font-black text-lg">W</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-wos-text mb-3">
          {displayName
            ? <>Bienvenido, <span style={{ color: '#F15A29' }}>{displayName}</span></>
            : 'Bienvenido'
          }
        </h1>

        <p className="text-base text-wos-text-subtle">
          Selecciona el área de trabajo para continuar
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {entornos.map((entorno) => {
          const Icon = entorno.icon;
          const isHovered = hoveredId === entorno.id;

          return (
            <button
              key={entorno.id}
              onClick={() => handleEntornoClick(entorno.id, entorno.path)}
              onMouseEnter={() => setHoveredId(entorno.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative overflow-hidden rounded-2xl text-left focus:outline-none"
              style={{
                background: isHovered ? entorno.bgHover : entorno.bgColor,
                transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                boxShadow: isHovered
                  ? `0 20px 50px ${entorno.bgColor}60`
                  : `0 4px 20px ${entorno.bgColor}40`,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Shine */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }}
              />

              <div className="relative z-10 p-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon size={28} color="#ffffff" strokeWidth={1.8} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
                  {entorno.nombre}
                </h2>

                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {entorno.descripcion}
                </p>

                <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {entorno.tag}
                </p>

                <div
                  className="flex items-center gap-2 text-white font-semibold text-sm"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateX(0)' : 'translateX(-6px)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Entrar</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs" style={{ color: '#333' }}>
          WOS 2.0 · <span style={{ color: '#555' }}>Wallest by Hasu Activos Inmobiliarios SL</span>
        </p>
      </div>
    </div>
  );
}
