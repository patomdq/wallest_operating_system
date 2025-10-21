'use client';

import { useEffect, useState } from 'react';
import { supabase, PartidaReforma } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Check, Clock, PlayCircle } from 'lucide-react';

/** Recalcula presupuesto y avance de la reforma en base a sus partidas */
async function actualizarPresupuestoYAvance(reformaId: string) {
  const { data: partidas, error } = await supabase
    .from('planificacion_reforma')
    .select('costo, estado')
    .eq('reforma_id', reformaId);

  if (error) {
    console.error('❌ Error obteniendo partidas:', error);
    return;
  }

  const presupuestoTotal = (partidas || []).reduce((sum, p) => sum + (p.costo || 0), 0);
  const totalPartidas = partidas?.length ?? 0;
  const finalizadas = (partidas || []).filter((p) => p.estado === 'finalizado').length;
  const avance = totalPartidas > 0 ? Math.round((finalizadas / totalPartidas) * 100) : 0;

  let estado = 'pendiente';
  if (avance === 100) estado = 'finalizada';
  else if (avance > 0) estado = 'en_proceso';

  const { error: updateError } = await supabase
    .from('reformas')
    .update({ presupuesto: presupuestoTotal, avance, estado })
    .eq('id', reformaId);

  if (updateError) console.error('❌ Error al actualizar reforma:', updateError);
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
    const { data, error } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre)')
      .order('created_at', { ascending: false });
    if (!error && data) setReformas(data);
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

  const handleCambiarEstado = async (
    id: string,
    nuevoEstado: 'pendiente' | 'en_proceso' | 'finalizado'
  ) => {
    await supabase.from('planificacion_reforma').update({ estado: nuevoEstado }).eq('id', id);
    await actualizarPresupuestoYAvance(reformaSeleccionada);
    await loadPartidas();
    await loadReformaInfo();
  };

  const totales = {
    costo: partidas.reduce((sum, p) => sum + (p.costo || 0), 0),
    tiempo: partidas.reduce((sum, p) => sum + (p.tiempo_dias || 0), 0),
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'finalizado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'en_proceso':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-wos-accent mb-6">Planificador de Reformas</h1>

      {/* Selector de Reforma */}
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

      {reformaSeleccionada && reformaInfo && (
        <>
          {/* Cabecera de la reforma */}
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

          {/* Formulario (mostrar/ocultar) */}
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
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Profesional</label>
                  <input
                    type="text"
                    value={formData.profesional}
                    onChange={(e) => setFormData({ ...formData, profesional: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Costo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Tiempo (días)</label>
                  <input
                    type="number"
                    value={formData.tiempo_dias}
                    onChange={(e) => setFormData({ ...formData, tiempo_dias: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as 'pendiente' | 'en_proceso' | 'finalizado',
                      })
                    }
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg">
                    Guardar
                  </button>
                  <button type="button" onClick={resetForm} className="bg-wos-border text-wos-text px-6 py-2 rounded-lg">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Botón Nueva Partida */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg"
            >
              <Plus size={20} />
              Nueva Partida
            </button>
          </div>

          {/* Tabla de Partidas */}
          <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-wos-bg border-b border-wos-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Partida</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Profesional</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Costo</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Tiempo</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Estado</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map((p) => (
                    <tr key={p.id} className="border-b border-wos-border hover:bg-wos-bg transition-smooth">
                      <td className="px-6 py-4 text-wos-text font-medium">{p.partida}</td>
                      <td className="px-6 py-4 text-wos-text-muted">{p.profesional || '-'}</td>
                      <td className="px-6 py-4 text-wos-text">€{p.costo?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-wos-text-muted">{p.tiempo_dias || '0'} días</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCambiarEstado(p.id, 'pendiente')}
                            className={`p-2 rounded-lg border transition-smooth ${
                              p.estado === 'pendiente'
                                ? getEstadoColor('pendiente')
                                : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-yellow-500/30'
                            }`}
                            title="Marcar como pendiente"
                          >
                            <Clock size={14} />
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(p.id, 'en_proceso')}
                            className={`p-2 rounded-lg border transition-smooth ${
                              p.estado === 'en_proceso'
                                ? getEstadoColor('en_proceso')
                                : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-blue-500/30'
                            }`}
                            title="Marcar como en proceso"
                          >
                            <PlayCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(p.id, 'finalizado')}
                            className={`p-2 rounded-lg border transition-smooth ${
                              p.estado === 'finalizado'
                                ? getEstadoColor('finalizado')
                                : 'bg-wos-bg border-wos-border text-wos-text-muted hover:border-green-500/30'
                            }`}
                            title="Marcar como finalizado"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-smooth"
                          title="Editar"
                        >
                          <Edit2 size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth ml-2"
                          title="Eliminar"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {partidas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-wos-text-muted">
                        No hay partidas registradas para esta reforma
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}