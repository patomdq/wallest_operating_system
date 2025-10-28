'use client';

import { useEffect, useState } from 'react';
import { supabase, EventoGlobal, Reforma } from '@/lib/supabase';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit2, X } from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarioTab() {
  const [eventos, setEventos] = useState<EventoGlobal[]>([]);
  const [reformas, setReformas] = useState<Reforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoGlobal | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    recordatorio: false,
    reforma_id: '',
  });

  useEffect(() => {
    loadEventos();
    loadReformas();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_globales')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReformas = async () => {
    try {
      const { data, error } = await supabase
        .from('reformas')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setReformas(data || []);
    } catch (error) {
      console.error('Error cargando reformas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        fecha_inicio: convertirLocalAUTC(formData.fecha_inicio),
        fecha_fin: convertirLocalAUTC(formData.fecha_fin),
        recordatorio: formData.recordatorio,
        reforma_id: formData.reforma_id || null,
      };

      if (editingEvento) {
        const { error } = await supabase
          .from('eventos_globales')
          .update(eventoData)
          .eq('id', editingEvento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('eventos_globales')
          .insert([eventoData]);

        if (error) throw error;
      }

      loadEventos();
      closeModal();
    } catch (error) {
      console.error('Error guardando evento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const { error } = await supabase
        .from('eventos_globales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadEventos();
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const convertirUTCaLocal = (fechaUTC: string) => {
    const fecha = new Date(fechaUTC);
    const offset = fecha.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(fecha.getTime() - offset);
    return fechaLocal.toISOString().slice(0, 16);
  };

  const convertirLocalAUTC = (fechaLocal: string) => {
    const fecha = new Date(fechaLocal);
    return fecha.toISOString();
  };

  const openModal = (evento?: EventoGlobal) => {
    if (evento) {
      setEditingEvento(evento);
      setFormData({
        titulo: evento.titulo,
        descripcion: evento.descripcion || '',
        fecha_inicio: convertirUTCaLocal(evento.fecha_inicio),
        fecha_fin: convertirUTCaLocal(evento.fecha_fin),
        recordatorio: evento.recordatorio,
        reforma_id: evento.reforma_id || '',
      });
    } else {
      setEditingEvento(null);
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        recordatorio: false,
        reforma_id: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvento(null);
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      recordatorio: false,
      reforma_id: '',
    });
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const getDateString = () => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    if (viewMode === 'day') {
      options.day = 'numeric';
    }
    return currentDate.toLocaleDateString('es-ES', options);
  };

  const getEventosForDate = (date: Date) => {
    return eventos.filter(evento => {
      const eventoDate = new Date(evento.fecha_inicio);
      return eventoDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    if (viewMode === 'month') {
      return renderMonthView();
    } else if (viewMode === 'week') {
      return renderWeekView();
    } else {
      return renderDayView();
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const date = new Date(year, month, dayNumber);
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const eventosDelDia = isCurrentMonth ? getEventosForDate(date) : [];
      const isToday = isCurrentMonth && date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={i}
          className={`min-h-24 p-2 border border-wos-border ${
            isCurrentMonth ? 'bg-wos-card' : 'bg-wos-bg opacity-50'
          } ${isToday ? 'ring-2 ring-wos-accent' : ''}`}
        >
          {isCurrentMonth && (
            <>
              <div className={`text-sm mb-1 ${isToday ? 'text-wos-accent font-bold' : 'text-wos-text-muted'}`}>
                {dayNumber}
              </div>
              <div className="space-y-1">
                {eventosDelDia.slice(0, 3).map((evento) => (
                  <div
                    key={evento.id}
                    className="text-xs p-1 bg-wos-bg rounded cursor-pointer hover:bg-wos-border transition-smooth truncate"
                    onClick={() => openModal(evento)}
                    title={evento.titulo}
                  >
                    {evento.titulo}
                  </div>
                ))}
                {eventosDelDia.length > 3 && (
                  <div className="text-xs text-wos-text-muted">
                    +{eventosDelDia.length - 3} más
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="bg-wos-card rounded-lg p-4">
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-wos-text-muted p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const eventosDelDia = getEventosForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      weekDays.push(
        <div key={i} className={`flex-1 p-4 border border-wos-border bg-wos-card ${isToday ? 'ring-2 ring-wos-accent' : ''}`}>
          <div className={`text-sm font-semibold mb-3 ${isToday ? 'text-wos-accent' : 'text-wos-text'}`}>
            {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2">
            {eventosDelDia.map((evento) => (
              <div
                key={evento.id}
                className="p-2 bg-wos-bg rounded cursor-pointer hover:bg-wos-border transition-smooth"
                onClick={() => openModal(evento)}
              >
                <div className="text-sm font-medium text-wos-text">{evento.titulo}</div>
                <div className="text-xs text-wos-text-muted">
                  {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-wos-card rounded-lg p-4">
        <div className="flex gap-2">
          {weekDays}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const eventosDelDia = getEventosForDate(currentDate);

    return (
      <div className="bg-wos-card rounded-lg p-6">
        <h3 className="text-xl font-semibold text-wos-text mb-4">
          {currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        <div className="space-y-3">
          {eventosDelDia.length > 0 ? (
            eventosDelDia.map((evento) => (
              <div
                key={evento.id}
                className="p-4 bg-wos-bg rounded-lg border border-wos-border hover:border-wos-accent transition-smooth cursor-pointer"
                onClick={() => openModal(evento)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-wos-text">{evento.titulo}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(evento);
                      }}
                      className="text-wos-text-muted hover:text-wos-accent transition-smooth"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(evento.id);
                      }}
                      className="text-wos-text-muted hover:text-red-500 transition-smooth"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {evento.descripcion && (
                  <p className="text-sm text-wos-text-muted mb-2">{evento.descripcion}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-wos-text-muted">
                  <span>
                    {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(evento.fecha_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {evento.recordatorio && <span className="text-wos-accent">🔔 Recordatorio</span>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-wos-text-muted py-8">No hay eventos para este día</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-wos-text-muted py-8">Cargando calendario...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-wos-text mb-2">Calendario General</h2>
        <p className="text-wos-text-muted">
          Organiza tus eventos, reuniones y recordatorios desde un solo lugar.
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeDate('prev')}
            className="p-2 bg-wos-card hover:bg-wos-border rounded-lg transition-smooth"
          >
            <ChevronLeft size={20} className="text-wos-text" />
          </button>
          
          <h3 className="text-xl font-semibold text-wos-text min-w-48 text-center">
            {getDateString()}
          </h3>
          
          <button
            onClick={() => changeDate('next')}
            className="p-2 bg-wos-card hover:bg-wos-border rounded-lg transition-smooth"
          >
            <ChevronRight size={20} className="text-wos-text" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-wos-card hover:bg-wos-border rounded-lg text-sm text-wos-text transition-smooth"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Selector de vista */}
          <div className="flex bg-wos-card rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded text-sm transition-smooth ${
                viewMode === 'month'
                  ? 'bg-wos-bg text-wos-accent'
                  : 'text-wos-text-muted hover:text-wos-text'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded text-sm transition-smooth ${
                viewMode === 'week'
                  ? 'bg-wos-bg text-wos-accent'
                  : 'text-wos-text-muted hover:text-wos-text'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded text-sm transition-smooth ${
                viewMode === 'day'
                  ? 'bg-wos-bg text-wos-accent'
                  : 'text-wos-text-muted hover:text-wos-text'
              }`}
            >
              Día
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-wos-accent text-wos-bg rounded-lg hover:opacity-90 transition-smooth"
          >
            <Plus size={20} />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Calendario */}
      {renderCalendar()}

      {/* Modal de evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-wos-card rounded-lg p-6 w-full max-w-2xl border border-wos-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-wos-text">
                {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
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
                  placeholder="Reunión, evento, etc."
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
                  placeholder="Detalles del evento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wos-text mb-2">
                    Fecha y hora de inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-wos-text mb-2">
                    Fecha y hora de fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wos-text mb-2">
                  Vincular con proyecto/reforma
                </label>
                <select
                  value={formData.reforma_id}
                  onChange={(e) => setFormData({ ...formData, reforma_id: e.target.value })}
                  className="w-full px-4 py-2 bg-wos-bg border border-wos-border rounded-lg text-wos-text focus:outline-none focus:border-wos-accent"
                >
                  <option value="">Sin vincular</option>
                  {reformas.map((reforma) => (
                    <option key={reforma.id} value={reforma.id}>
                      {reforma.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recordatorio"
                  checked={formData.recordatorio}
                  onChange={(e) => setFormData({ ...formData, recordatorio: e.target.checked })}
                  className="w-4 h-4 bg-wos-bg border-wos-border rounded"
                />
                <label htmlFor="recordatorio" className="text-sm text-wos-text cursor-pointer">
                  Activar recordatorio
                </label>
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
                  {editingEvento ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
