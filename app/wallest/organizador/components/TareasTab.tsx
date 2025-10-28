'use client';

import { useEffect, useState } from 'react';
import { supabase, TareaGlobal } from '@/lib/supabase';
import { Plus, X, Edit2, Trash2, Calendar as CalendarIcon, Filter } from 'lucide-react';

type Estado = 'Pendiente' | 'En curso' | 'Completada';
type Prioridad = 'Alta' | 'Media' | 'Baja';

export default function TareasTab() {
  const [tareas, setTareas] = useState<TareaGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarea, setEditingTarea] = useState<TareaGlobal | null>(null);
  const [draggedTarea, setDraggedTarea] = useState<TareaGlobal | null>(null);

  // Filtros
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | 'todas'>('todas');
  const [filtroFecha, setFiltroFecha] = useState<'todas' | 'vencidas' | 'proximas'>('todas');

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media' as Prioridad,
    fecha_limite: '',
    estado: 'Pendiente' as Estado,
  });

  useEffect(() => {
    loadTareas();
  }, []);

  const loadTareas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tareas_globales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTareas(data || []);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tareaData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        prioridad: formData.prioridad,
        fecha_limite: formData.fecha_limite,
        estado: formData.estado,
      };

      if (editingTarea) {
        const { error } = await supabase
          .from('tareas_globales')
          .update(tareaData)
          .eq('id', editingTarea.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tareas_globales')
          .insert([tareaData]);

        if (error) throw error;
      }

      loadTareas();
      closeModal();
    } catch (error) {
      console.error('Error guardando tarea:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const { error } = await supabase
        .from('tareas_globales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTareas();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  const handleEstadoChange = async (tarea: TareaGlobal, nuevoEstado: Estado) => {
    try {
      const { error } = await supabase
        .from('tareas_globales')
        .update({ estado: nuevoEstado })
        .eq('id', tarea.id);

      if (error) throw error;
      loadTareas();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const openModal = (tarea?: TareaGlobal) => {
    if (tarea) {
      setEditingTarea(tarea);
      setFormData({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || '',
        prioridad: tarea.prioridad,
        fecha_limite: tarea.fecha_limite,
        estado: tarea.estado,
      });
    } else {
      setEditingTarea(null);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        fecha_limite: '',
        estado: 'Pendiente',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTarea(null);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'Media',
      fecha_limite: '',
      estado: 'Pendiente',
    });
  };

  const getPrioridadColor = (prioridad: Prioridad) => {
    switch (prioridad) {
      case 'Alta':
        return 'text-red-500';
      case 'Media':
        return 'text-yellow-500';
      case 'Baja':
        return 'text-green-500';
      default:
        return 'text-wos-text-muted';
    }
  };

  const getPrioridadBg = (prioridad: Prioridad) => {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-500 bg-opacity-10';
      case 'Media':
        return 'bg-yellow-500 bg-opacity-10';
      case 'Baja':
        return 'bg-green-500 bg-opacity-10';
      default:
        return 'bg-wos-bg';
    }
  };

  const isVencida = (fecha: string) => {
    return new Date(fecha) < new Date() && new Date(fecha).toDateString() !== new Date().toDateString();
  };

  const isProxima = (fecha: string) => {
    const diff = new Date(fecha).getTime() - new Date().getTime();
    const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes >= 0;
  };

  const filtrarTareas = (tareas: TareaGlobal[], estado: Estado) => {
    let filtradas = tareas.filter(t => t.estado === estado);

    if (filtroPrioridad !== 'todas') {
      filtradas = filtradas.filter(t => t.prioridad === filtroPrioridad);
    }

    if (filtroFecha === 'vencidas') {
      filtradas = filtradas.filter(t => isVencida(t.fecha_limite));
    } else if (filtroFecha === 'proximas') {
      filtradas = filtradas.filter(t => isProxima(t.fecha_limite));
    }

    return filtradas;
  };

  const handleDragStart = (tarea: TareaGlobal) => {
    setDraggedTarea(tarea);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (nuevoEstado: Estado) => {
    if (draggedTarea && draggedTarea.estado !== nuevoEstado) {
      handleEstadoChange(draggedTarea, nuevoEstado);
    }
    setDraggedTarea(null);
  };

  if (loading) {
    return <div className="text-center text-wos-text-muted py-8">Cargando tareas...</div>;
  }

  const columnas: { estado: Estado; titulo: string }[] = [
    { estado: 'Pendiente', titulo: 'Pendientes' },
    { estado: 'En curso', titulo: 'En curso' },
    { estado: 'Completada', titulo: 'Completadas' },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-wos-text mb-2">Tablero de Tareas</h2>
          <p className="text-wos-text-muted">
            Organiza tus tareas con un sistema Kanban visual
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-wos-accent text-wos-bg rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 bg-wos-card p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-wos-text-muted" />
          <span className="text-sm text-wos-text-muted">Filtros:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-wos-text">Prioridad:</label>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value as Prioridad | 'todas')}
            className="px-3 py-1 bg-wos-bg border border-wos-border rounded-lg text-sm text-wos-text focus:outline-none focus:border-wos-accent"
          >
            <option value="todas">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-wos-text">Fecha límite:</label>
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value as 'todas' | 'vencidas' | 'proximas')}
            className="px-3 py-1 bg-wos-bg border border-wos-border rounded-lg text-sm text-wos-text focus:outline-none focus:border-wos-accent"
          >
            <option value="todas">Todas</option>
            <option value="vencidas">Vencidas</option>
            <option value="proximas">Próximas (7 días)</option>
          </select>
        </div>

        {(filtroPrioridad !== 'todas' || filtroFecha !== 'todas') && (
          <button
            onClick={() => {
              setFiltroPrioridad('todas');
              setFiltroFecha('todas');
            }}
            className="text-sm text-wos-accent hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tablero Kanban */}
      <div className="grid grid-cols-3 gap-6">
        {columnas.map((columna) => {
          const tareasFiltradas = filtrarTareas(tareas, columna.estado);

          return (
            <div
              key={columna.estado}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(columna.estado)}
              className="bg-wos-card rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-wos-text">
                  {columna.titulo}
                </h3>
                <span className="text-sm text-wos-text-muted bg-wos-bg px-2 py-1 rounded">
                  {tareasFiltradas.length}
                </span>
              </div>

              <div className="space-y-3 min-h-96">
                {tareasFiltradas.map((tarea) => (
                  <div
                    key={tarea.id}
                    draggable
                    onDragStart={() => handleDragStart(tarea)}
                    className={`p-4 rounded-lg border border-wos-border hover:border-wos-accent transition-smooth cursor-move ${getPrioridadBg(
                      tarea.prioridad
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-wos-text flex-1">
                        {tarea.titulo}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(tarea)}
                          className="text-wos-text-muted hover:text-wos-accent transition-smooth"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tarea.id)}
                          className="text-wos-text-muted hover:text-red-500 transition-smooth"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {tarea.descripcion && (
                      <p className="text-xs text-wos-text-muted mb-3 line-clamp-2">
                        {tarea.descripcion}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      <div className="flex items-center gap-1 text-wos-text-muted">
                        <CalendarIcon size={12} />
                        <span className={isVencida(tarea.fecha_limite) ? 'text-red-500' : ''}>
                          {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {columna.estado !== 'Completada' && (
                      <button
                        onClick={() =>
                          handleEstadoChange(
                            tarea,
                            columna.estado === 'Pendiente' ? 'En curso' : 'Completada'
                          )
                        }
                        className="w-full mt-3 px-3 py-1 bg-wos-bg hover:bg-wos-border text-wos-text text-xs rounded transition-smooth"
                      >
                        {columna.estado === 'Pendiente' ? 'Iniciar' : 'Completar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de tarea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-wos-card rounded-lg p-6 w-full max-w-2xl border border-wos-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-wos-text">
                {editingTarea ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button
                onClick={closeModal}
                className="text-wos-text-muted hover:text-wos-text transition-smooth"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wos-text mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                  placeholder="Nombre de la tarea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wos-text mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent resize-none"
                  placeholder="Detalles de la tarea..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wos-text mb-2">
                    Prioridad *
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Prioridad })}
                    required
                    className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wos-text mb-2">
                    Fecha límite *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_limite}
                    onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wos-text mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as Estado })}
                  required
                  className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En curso">En curso</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-wos-bg text-wos-text rounded-lg hover:bg-wos-border transition-smooth"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-wos-accent text-wos-bg rounded-lg hover:opacity-90 transition-smooth"
                >
                  {editingTarea ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
