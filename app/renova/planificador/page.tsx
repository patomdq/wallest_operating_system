'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FileText, ArrowRight } from 'lucide-react';

export default function PlanificadorIndexPage() {
  const router = useRouter();
  const [reformas, setReformas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReformas();
  }, []);

  const loadReformas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando reformas:', error);
    } else {
      setReformas(data || []);
    }
    setLoading(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-gray-500/20 text-gray-300';
      case 'en_proceso':
        return 'bg-blue-500/20 text-blue-300';
      case 'finalizada':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wos-bg text-wos-text p-6">
        <div className="text-center py-12">
          <div className="text-wos-text-muted">Cargando reformas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wos-bg text-wos-text p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">
          Planificador de Reformas
        </h1>
        <p className="text-wos-text-muted">
          Selecciona una reforma para gestionar su planificador detallado
        </p>
      </div>

      {reformas.length === 0 ? (
        <div className="text-center py-12 bg-wos-bg-secondary border border-wos-border rounded-lg">
          <FileText size={48} className="mx-auto mb-4 text-wos-text-muted" />
          <p className="text-wos-text-muted mb-4">
            No hay reformas registradas
          </p>
          <button
            onClick={() => router.push('/renova/reformas')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-smooth"
          >
            Ir a Reformas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reformas.map((reforma) => (
            <div
              key={reforma.id}
              className="bg-wos-bg-secondary border border-wos-border rounded-lg p-4 hover:border-wos-accent transition-smooth cursor-pointer"
              onClick={() => router.push(`/renova/planificador/${reforma.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-wos-text mb-1">
                    {reforma.nombre}
                  </h3>
                  <p className="text-sm text-wos-text-muted">
                    {reforma.inmuebles?.nombre || 'Sin inmueble'}
                  </p>
                </div>
                <ArrowRight size={20} className="text-wos-accent" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wos-text-muted">Estado:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                      reforma.estado
                    )}`}
                  >
                    {reforma.estado}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wos-text-muted">Avance:</span>
                  <span className="text-sm font-medium text-wos-accent">
                    {reforma.avance || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wos-text-muted">Presupuesto:</span>
                  <span className="text-sm font-bold text-wos-accent">
                    {reforma.presupuesto?.toLocaleString('es-ES') || '0'} €
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-wos-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-wos-text-muted">
                    Gestionar planificador
                  </span>
                  <FileText size={16} className="text-wos-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
