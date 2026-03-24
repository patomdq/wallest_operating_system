'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, PartidaReformaDetallada, Reforma } from '@/lib/supabase';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Clock, PlayCircle, Check } from 'lucide-react';
import ItemsTable from '@/components/ItemsTable';

export default function PlanificadorReformaPage() {
  const params = useParams();
  const router = useRouter();
  const reformaId = params.reforma_id as string;

  const [reforma, setReforma] = useState<Reforma | null>(null);
  const [partidas, setPartidas] = useState<PartidaReformaDetallada[]>([]);
  const [expandedPartida, setExpandedPartida] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'otros' as 'obra' | 'materiales' | 'mobiliario' | 'electro' | 'decoracion' | 'otros',
  });

  useEffect(() => {
    if (reformaId) {
      loadReforma();
      loadPartidas();
    }
  }, [reformaId]);

  const loadReforma = async () => {
    const { data, error } = await supabase
      .from('reformas')
      .select('*')
      .eq('id', reformaId)
      .single();

    if (error) {
      console.error('❌ Error cargando reforma:', error);
    } else {
      setReforma(data);
    }
  };

  const loadPartidas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partidas_reforma_detalladas')
      .select('*')
      .eq('reforma_id', reformaId)
      .order('orden', { ascending: true });

    if (error) {
      console.error('❌ Error cargando partidas:', error);
    } else {
      setPartidas(data || []);
    }
    setLoading(false);
  };

  const handleAddPartida = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre de la partida es obligatorio');
      return;
    }

    const maxOrden = partidas.length > 0 ? Math.max(...partidas.map((p) => p.orden)) : 0;

    const { error } = await supabase.from('partidas_reforma_detalladas').insert({
      reforma_id: reformaId,
      nombre: formData.nombre,
      categoria: formData.categoria,
      estado: 'pendiente',
      orden: maxOrden + 1,
    });

    if (error) {
      console.error('❌ Error agregando partida:', error);
      alert('Error al agregar partida');
    } else {
      console.log('✅ Partida agregada');
      setShowAddForm(false);
      setFormData({ nombre: '', categoria: 'otros' });
      loadPartidas();
      loadReforma(); // Actualizar totales
    }
  };

  const handleCambiarEstado = async (partidaId: string, nuevoEstado: 'pendiente' | 'en_curso' | 'ok') => {
    const { error } = await supabase
      .from('partidas_reforma_detalladas')
      .update({ estado: nuevoEstado })
      .eq('id', partidaId);

    if (error) {
      console.error('❌ Error actualizando estado:', error);
    } else {
      console.log(`✅ Estado actualizado a: ${nuevoEstado}`);
      // Dar tiempo para que los triggers actualicen la DB
      setTimeout(() => {
        loadPartidas();
        loadReforma();
      }, 500);
    }
  };

  const handleDeletePartida = async (partidaId: string) => {
    if (!confirm('¿Eliminar esta partida y todos sus ítems?')) return;

    const { error } = await supabase
      .from('partidas_reforma_detalladas')
      .delete()
      .eq('id', partidaId);

    if (error) {
      console.error('❌ Error eliminando partida:', error);
      alert('Error al eliminar partida');
    } else {
      console.log('✅ Partida eliminada');
      loadPartidas();
      loadReforma();
    }
  };

  const togglePartida = (partidaId: string) => {
    setExpandedPartida(expandedPartida === partidaId ? null : partidaId);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
      case 'en_curso':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'ok':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_curso':
        return 'En curso';
      case 'ok':
        return 'Completado';
      default:
        return estado;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'obra':
        return 'bg-orange-500/20 text-orange-300';
      case 'materiales':
        return 'bg-purple-500/20 text-purple-300';
      case 'mobiliario':
        return 'bg-blue-500/20 text-blue-300';
      case 'electro':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'decoracion':
        return 'bg-pink-500/20 text-pink-300';
      case 'otros':
        return 'bg-gray-500/20 text-gray-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wos-bg text-wos-text p-6">
        <div className="text-center py-12">
          <div className="text-wos-text-muted">Cargando planificador...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wos-bg text-wos-text p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/renova/reformas')}
          className="flex items-center gap-2 text-wos-text-muted hover:text-wos-accent transition-smooth mb-4"
        >
          <ArrowLeft size={20} />
          Volver a Reformas
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-wos-accent mb-2">
              Planificador de Reforma
            </h1>
            {reforma && (
              <div className="space-y-1">
                <p className="text-lg text-wos-text">{reforma.nombre}</p>
                <div className="flex gap-4 text-sm text-wos-text-muted">
                  <span>Estado: <span className="text-wos-accent">{reforma.estado}</span></span>
                  <span>Avance: <span className="text-wos-accent">{reforma.avance}%</span></span>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-wos-text-muted mb-1">Presupuesto Total</div>
            <div className="text-3xl font-bold text-wos-accent">
              {reforma?.presupuesto?.toLocaleString('es-ES') || '0'} €
            </div>
          </div>
        </div>
      </div>

      {/* Botón agregar partida */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-smooth"
        >
          <Plus size={18} />
          Agregar partida personalizada
        </button>
      </div>

      {/* Formulario agregar partida */}
      {showAddForm && (
        <div className="bg-wos-bg-secondary border border-wos-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-wos-text mb-3">Nueva partida</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre de la partida *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            />
            <select
              value={formData.categoria}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoria: e.target.value as any,
                })
              }
              className="px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:border-blue-500 focus:outline-none"
            >
              <option value="obra">Obra</option>
              <option value="materiales">Materiales</option>
              <option value="mobiliario">Mobiliario</option>
              <option value="electro">Electrodomésticos</option>
              <option value="decoracion">Decoración</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddPartida}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-smooth"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ nombre: '', categoria: 'otros' });
              }}
              className="px-4 py-2 bg-wos-bg-secondary hover:bg-wos-bg-secondary/80 text-wos-text-muted rounded-lg transition-smooth"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de partidas */}
      <div className="space-y-4">
        {partidas.map((partida) => (
          <div
            key={partida.id}
            className="bg-wos-bg-secondary border border-wos-border rounded-lg overflow-hidden"
          >
            {/* Header de partida */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => togglePartida(partida.id)}
                  className="p-2 hover:bg-wos-bg rounded-lg transition-smooth"
                >
                  {expandedPartida === partida.id ? (
                    <ChevronUp size={20} className="text-wos-accent" />
                  ) : (
                    <ChevronDown size={20} className="text-wos-text-muted" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-wos-text">{partida.nombre}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getCategoriaColor(
                        partida.categoria
                      )}`}
                    >
                      {partida.categoria}
                    </span>
                  </div>
                  <div className="text-sm text-wos-text-muted">
                    {partida.notas || 'Sin notas'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Estado */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCambiarEstado(partida.id, 'pendiente')}
                    className={`p-2 rounded-lg border transition-smooth ${
                      partida.estado === 'pendiente'
                        ? getEstadoColor('pendiente')
                        : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-gray-500/30'
                    }`}
                    title="Marcar como pendiente"
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(partida.id, 'en_curso')}
                    className={`p-2 rounded-lg border transition-smooth ${
                      partida.estado === 'en_curso'
                        ? getEstadoColor('en_curso')
                        : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-blue-500/30'
                    }`}
                    title="Marcar como en curso"
                  >
                    <PlayCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(partida.id, 'ok')}
                    className={`p-2 rounded-lg border transition-smooth ${
                      partida.estado === 'ok'
                        ? getEstadoColor('ok')
                        : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-green-500/30'
                    }`}
                    title="Marcar como completado"
                  >
                    <Check size={14} />
                  </button>
                </div>
                {/* Total */}
                <div className="text-right min-w-[120px]">
                  <div className="text-xs text-wos-text-muted">Total</div>
                  <div className="text-xl font-bold text-wos-accent">
                    {partida.total_calculado.toLocaleString('es-ES')} €
                  </div>
                </div>
                {/* Eliminar */}
                <button
                  onClick={() => handleDeletePartida(partida.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                  title="Eliminar partida"
                >
                  <span className="text-red-500">🗑️</span>
                </button>
              </div>
            </div>

            {/* Detalle de ítems (expandible) */}
            {expandedPartida === partida.id && (
              <div className="border-t border-wos-border p-4 bg-wos-bg">
                <ItemsTable
                  partidaReformaId={partida.id}
                />
              </div>
            )}
          </div>
        ))}

        {partidas.length === 0 && (
          <div className="text-center py-12 bg-wos-bg-secondary border border-wos-border rounded-lg">
            <p className="text-wos-text-muted mb-4">
              No hay partidas en esta reforma. Agrega una partida para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
