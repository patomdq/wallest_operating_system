'use client';

import { useEffect, useState } from 'react';
import { supabase, Reforma } from '@/lib/supabase';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReformasPage() {
  const [reformas, setReformas] = useState<any[]>([]);
  const [inmuebles, setInmuebles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    inmueble_id: '',
    nombre: '',
    etapa: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Cargar reformas con información del inmueble
    const { data: ref } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre, ciudad)')
      .order('created_at', { ascending: false });

    // Cargar inmuebles disponibles
    const { data: inm } = await supabase
      .from('inmuebles')
      .select('*')
      .order('nombre');

    if (ref) setReformas(ref);
    if (inm) setInmuebles(inm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      inmueble_id: formData.inmueble_id,
      nombre: formData.nombre,
      etapa: formData.etapa || null,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_fin: formData.fecha_fin || null,
      estado: formData.estado,
      avance: 0, // Se calculará automáticamente con las partidas
    };

    await supabase.from('reformas').insert([dataToSave]);

    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({
      inmueble_id: '',
      nombre: '',
      etapa: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'pendiente',
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta reforma? Esto también eliminará todas sus partidas.')) {
      await supabase.from('reformas').delete().eq('id', id);
      loadData();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'finalizada':
        return 'bg-green-500/20 text-green-400';
      case 'en_proceso':
        return 'bg-blue-500/20 text-blue-400';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getAvanceColor = (avance: number) => {
    if (avance >= 75) return 'bg-green-500';
    if (avance >= 50) return 'bg-blue-500';
    if (avance >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Reformas</h1>
          <p className="text-wos-text-muted">
            Seguimiento de obras y reformas · Presupuesto y avance calculados automáticamente
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nueva Reforma
        </button>
      </div>

      {/* Alerta informativa */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300">
          <strong>Automatización activa:</strong> El presupuesto total se calcula sumando el costo de todas las partidas.
          El avance se calcula según las partidas finalizadas. Cuando todas las partidas estén finalizadas,
          la reforma se marcará automáticamente como finalizada.
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">Nueva Reforma</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Inmueble *</label>
              <select
                required
                value={formData.inmueble_id}
                onChange={(e) => setFormData({ ...formData, inmueble_id: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">Seleccionar inmueble</option>
                {inmuebles.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre} {i.ciudad ? `- ${i.ciudad}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Ej: Reforma integral"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Etapa</label>
              <input
                type="text"
                value={formData.etapa}
                onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Ej: Planificación, Ejecución..."
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha Fin Estimada</label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
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

      {/* Grid de Reformas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reformas.map((r: any) => (
          <div
            key={r.id}
            className="bg-wos-card border border-wos-border rounded-lg p-6 hover:border-wos-accent transition-smooth"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wos-accent mb-1">{r.nombre}</h3>
                <p className="text-sm text-wos-text-muted">
                  {r.inmuebles?.nombre}
                  {r.inmuebles?.ciudad && ` · ${r.inmuebles.ciudad}`}
                </p>
                {r.etapa && (
                  <p className="text-xs text-wos-text-muted mt-1">Etapa: {r.etapa}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-smooth"
                title="Eliminar reforma"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-wos-text-muted">Presupuesto Total:</span>
                <span className="text-sm font-semibold text-wos-accent">
                  €{r.presupuesto_total?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-wos-text-muted">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(r.estado)}`}>
                  {r.estado === 'finalizada' ? 'Finalizada' : r.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                </span>
              </div>

              {r.fecha_inicio && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wos-text-muted">Inicio:</span>
                  <span className="text-sm text-wos-text">
                    {new Date(r.fecha_inicio).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}

              {r.fecha_fin && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-wos-text-muted">Fin estimada:</span>
                  <span className="text-sm text-wos-text">
                    {new Date(r.fecha_fin).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-wos-text-muted">Avance automático</span>
                <span className="text-xs font-semibold text-wos-accent">{r.avance || 0}%</span>
              </div>
              <div className="w-full bg-wos-bg rounded-full h-2">
                <div
                  className={`${getAvanceColor(r.avance || 0)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${r.avance || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Botón para ver partidas */}
            <Link
              href="/renova/planificador"
              className="block w-full bg-wos-accent/10 text-wos-accent px-4 py-2 rounded-lg text-sm text-center hover:bg-wos-accent/20 transition-smooth"
            >
              Gestionar Partidas →
            </Link>
          </div>
        ))}
      </div>

      {reformas.length === 0 && (
        <div className="text-center py-12 text-wos-text-muted">
          No hay reformas registradas
        </div>
      )}
    </div>
  );
}
