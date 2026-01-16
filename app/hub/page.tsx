'use client';

import { useRouter } from 'next/navigation';
import { Building2, Wrench, Handshake } from 'lucide-react';

export default function HubPage() {
  const router = useRouter();

  const entornos = [
    {
      id: 'wallest',
      nombre: 'WALLEST',
      descripcion: 'Gestión financiera y activos',
      icon: Building2,
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800',
      path: '/wallest',
    },
    {
      id: 'renova',
      nombre: 'RENOVA',
      descripcion: 'Reformas y proyectos',
      icon: Wrench,
      color: 'from-orange-500 to-orange-700',
      hoverColor: 'hover:from-orange-600 hover:to-orange-800',
      path: '/renova',
    },
    {
      id: 'nexo',
      nombre: 'NEXO',
      descripcion: 'Comercialización y ventas',
      icon: Handshake,
      color: 'from-green-500 to-green-700',
      hoverColor: 'hover:from-green-600 hover:to-green-800',
      path: '/nexo',
    },
  ];

  const handleEntornoClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-wos-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-wos-text mb-4">
            Wallest Operating System
          </h1>
          <p className="text-lg md:text-xl text-wos-text-muted">
            Selecciona un entorno para continuar
          </p>
        </div>

        {/* Grid de entornos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {entornos.map((entorno) => {
            const Icon = entorno.icon;
            return (
              <button
                key={entorno.id}
                onClick={() => handleEntornoClick(entorno.path)}
                className={`
                  group relative overflow-hidden
                  bg-gradient-to-br ${entorno.color} ${entorno.hoverColor}
                  rounded-2xl p-8 md:p-10
                  transition-all duration-300
                  transform hover:scale-105 hover:shadow-2xl
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-wos-bg focus:ring-blue-500
                `}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <Icon size={48} className="text-white" strokeWidth={2} />
                  </div>

                  {/* Nombre */}
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
                    {entorno.nombre}
                  </h2>

                  {/* Descripción */}
                  <p className="text-base md:text-lg text-white/90">
                    {entorno.descripcion}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span>Entrar</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-wos-text-muted">
            WOS 1.0 - Desarrollado por{' '}
            <span className="font-medium text-blue-500">Berciamedia</span> para{' '}
            <span className="font-medium text-blue-500">Hasu SL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
