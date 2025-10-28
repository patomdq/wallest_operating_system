'use client';

import { X, Bell } from 'lucide-react';
import { EventoGlobal } from '@/lib/supabase';

type Props = {
  notificaciones: EventoGlobal[];
  onCerrar: (id: string) => void;
};

export default function NotificacionesRecordatorio({ notificaciones, onCerrar }: Props) {
  if (notificaciones.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notificaciones.map(evento => {
        const fechaInicio = new Date(evento.fecha_inicio);
        const tiempoRestante = Math.round((fechaInicio.getTime() - new Date().getTime()) / 60000);
        
        return (
          <div
            key={evento.id}
            className="bg-wos-card border-2 border-wos-accent rounded-lg p-4 shadow-lg animate-slide-in"
            style={{
              animation: 'slideIn 0.3s ease-out, pulse 2s infinite'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-wos-accent rounded-full p-2">
                  <Bell size={20} className="text-wos-bg" />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-wos-accent mb-1">
                  Recordatorio de Evento
                </h4>
                <p className="text-wos-text font-medium mb-2">
                  {evento.titulo}
                </p>
                <p className="text-sm text-wos-text-muted">
                  Comienza en {tiempoRestante} minuto{tiempoRestante !== 1 ? 's' : ''}
                </p>
                {evento.descripcion && (
                  <p className="text-xs text-wos-text-muted mt-1 line-clamp-2">
                    {evento.descripcion}
                  </p>
                )}
                <p className="text-xs text-wos-text-muted mt-2">
                  {fechaInicio.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <button
                onClick={() => onCerrar(evento.id)}
                className="flex-shrink-0 text-wos-text-muted hover:text-wos-text transition-smooth"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
        }
      `}</style>
    </div>
  );
}
