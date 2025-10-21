'use client';

import { useEffect, useState } from 'react';
import { supabase, PartidaReforma } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Check, Clock, PlayCircle } from 'lucide-react';

// 🔧 Recalcular presupuesto y avance en reformas
async function actualizarPresupuestoYAvance(reformaId: string) {
  const { data: partidas, error } = await supabase
    .from('planificacion_reforma')
    .select('costo, estado')
    .eq('reforma_id', reformaId);

  if (error) {
    console.error('❌ Error obteniendo partidas:', error);
    return;
  }

  const presupuestoTotal = partidas.reduce((sum, p) => sum + (p.costo || 0), 0);
  const totalPartidas = partidas.length;
  const finalizadas = partidas.filter(p => p.estado === 'finalizado').length;
  const avance = totalPartidas > 0 ? Math.round((finalizadas / totalPartidas) * 100) : 0;

  let estado = 'pendiente';
  if (avance === 100) estado = 'finalizada';
  else if (avance > 0) estado = 'en_proceso';

  const { error: updateError } = await supabase
    .from('reformas')
    .update({
      presupuesto: presupuestoTotal,
      avance: avance,
      estado: estado
    })
    .eq('id', reformaId);

  if (updateError)
    console.error('❌ Error al actualizar reforma:', updateError);
  else
    console.log(`✅ Reforma actualizada: ${presupuestoTotal} € | Avance: ${avance}%`);
}

export default function PlanificadorPage() {
  const [partidas, setPartidas] = useState<PartidaReforma[]>([]);
  const [reformas, setReformas] = useState<any[]>([]);
  const [reformaSeleccionada, setReformaSeleccionada] = useState('');
  const [reformaInfo, setReformaInfo] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partida: '',
    profesional: '',
    costo: '',
    tiempo_dias: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente' as 'pendiente' | 'en_proceso' | 'finalizado',
  });

  useEffect(() => {
    loadReformas();
  }, []);

  useEffect(() => {
    if (reformaSeleccionada) {
      loadPartidas();
      loadReformaInfo();
    }
  }, [reformaSeleccionada]);

  const loadReformas = async () => {
    const { data } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre)')
      .order('created_at', { ascending: false });
    if (data) setReformas(data);
  };

  const loadReformaInfo = async () => {
    const { data } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre)')
      .eq('id', reformaSeleccionada)
      .single();
    if (data) setReformaInfo(data);
  };

  const loadPartidas = async () => {
    const { data } = await supabase
      .from('planificacion_reforma')
      .select('*')
      .eq('reforma_id', reformaSeleccionada)
      .order('created_at', { ascending: true });
    if (data) {
      setPartidas(data);
      await actualizarPresupuestoYAvance(reformaSeleccionada);
      await loadReformaInfo();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      reforma_id: reformaSeleccionada,
      partida: formData.partida,
      profesional: formData.profesional || null,
      costo: formData.costo ? parseFloat(formData.costo) : null,
      tiempo_dias: formData.tiempo_dias ? parseInt(formData.tiempo_dias) : null,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_fin: formData.fecha_fin || null,
      estado: formData.estado,
    };

    if (editingId) {
      await supabase.from('planificacion_reforma').update(dataToSave).eq('id', editingId);
    } else {
      await supabase.from('planificacion_reforma').insert([dataToSave]);
    }

    await actualizarPresupuestoYAvance(reformaSeleccionada);
    resetForm();
    await loadPartidas();
    await loadReformaInfo();
  };

  const resetForm = () => {
    setFormData({
      partida: '',
      profesional: '',
      costo: '',
      tiempo_dias: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'pendiente',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (partida: PartidaReforma) => {
    setFormData({
      partida: partida.partida,
      profesional: partida.profesional || '',
      costo: partida.costo?.toString() || '',
      tiempo_dias: partida.tiempo_dias?.toString() || '',
      fecha_inicio: partida.fecha_inicio || '',
      fecha_fin: partida.fecha_fin || '',
      estado: partida.estado,
    });
    setEditingId(partida.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta partida?')) {
      await supabase.from('planificacion_reforma').delete().eq('id', id);
      await actualizarPresupuestoYAvance(reformaSeleccionada);
      await loadPartidas();
      await loadReformaInfo();
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: 'pendiente' | 'en_proceso' | 'finalizado') => {
    await supabase.from('planificacion_reforma').update({ estado: nuevoEstado }).eq('id', id);
    await actualizarPresupuestoYAvance(reformaSeleccionada);
    await loadPartidas();
    await loadReformaInfo();
  };

  const totales = {
    costo: partidas.reduce((sum, p) => sum + (p.costo || 0), 0),
    tiempo: partidas.reduce((sum, p) => sum + (p.tiempo_dias || 0), 0),
  };

  const estadisticas = {
    total: partidas.length,
    pendientes: partidas.filter((p) => p.estado === 'pendiente').length,
    en_proceso: partidas.filter((p) => p.estado === 'en_proceso').length,
    finalizadas: partidas.filter((p) => p.estado === 'finalizado').length,
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'finalizado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'en_proceso': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Planificador de Reformas</h1>
        <p className="text-wos-text-muted">Gestión de partidas · Cálculo automático de presupuesto y avance</p>
      </div>

      <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-6">
        <label className="block text-sm text-wos-text-muted mb-2">Seleccionar Reforma</label>
        <select
          value={reformaSeleccionada}
          onChange={(e) => setReformaSeleccionada(e.target.value)}
          className="w-full max-w-md bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
        >
          <option value="">Seleccionar reforma</option>
          {reformas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} {r.inmuebles?.nombre && `- ${r.inmuebles.nombre}`}
            </option>
          ))}
        </select>
      </div>

      {!reformaSeleccionada && (
        <div className="text-center py-12 text-wos-text-muted">
          Selecciona una reforma para gestionar sus partidas
        </div>
      )}

      {reformaSeleccionada && (
        <>
          {reformaInfo && (
            <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-wos-accent mb-4">{reformaInfo.nombre}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-wos-text-muted mb-1">Presupuesto Total</p>
                  <p className="text-2xl font-bold text-wos-accent">
                    €{reformaInfo.presupuesto?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-wos-text-muted mb-1">Avance</p>
                  <p className="text-2xl font-bold text-wos-accent">{reformaInfo.avance || 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-wos-text-muted mb-1">Estado</p>
                  <p className="text-lg font-semibold text-wos-text capitalize">{reformaInfo.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-wos-text-muted mb-1">Tiempo Total</p>
                  <p className="text-2xl font-bold text-wos-accent">{totales.tiempo}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
{/* Botón Nueva Partida */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
            >
              <Plus size={20} />
              Nueva Partida
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-wos-accent">
                {editingId ? 'Editar Partida' : 'Nueva Partida'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Partida *</label>
                  <input
                    type="text"
                    required
                    value={formData.partida}
                    onChange={(e) => setFormData({ ...formData, partida: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                    placeholder="Ej: Fontanería, Electricidad..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Profesional</label>
                  <input
                    type="text"
                    value={formData.profesional}
                    onChange={(e) => setFormData({ ...formData, profesional: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                    placeholder="Nombre del profesional"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Costo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Tiempo (días)</label>
                  <input
                    type="number"
                    value={formData.tiempo_dias}
                    onChange={(e) => setFormData({ ...formData, tiempo_dias: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:opacity-80 transition-smooth"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de Partidas */}
          <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-wos-bg border-b border-wos-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Partida
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Profesional
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Costo
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Tiempo
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Estado
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((p) => (
                    <tr key={p.id} className="border-b border-wos-border hover:bg-wos-bg transition-smooth">
                      <td className="px-6 py-4 text-wos-text font-medium">{p.partida}</td>
                      <td className="px-6 py-4 text-wos-text-muted">{p.profesional || '-'}</td>
                      <td className="px-6 py-4 text-wos-text">
                        €{p.costo?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 text-wos-text-muted">
                        {p.tiempo_dias || '0'} días
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getEstadoColor(p.estado)}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(p)} className="text-blue-400 hover:underline mr-3">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {partidas.length === 0 && (
                <div className="text-center py-12 text-wos-text-muted">
                  No hay partidas registradas para esta reforma
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
    </div>
  );
}