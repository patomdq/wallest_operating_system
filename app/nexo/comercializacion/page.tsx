'use client';

import { useEffect, useState } from 'react';
import { supabase, Comercializacion } from '@/lib/supabase';
import { Plus, Trash2, Globe, TrendingDown, DollarSign } from 'lucide-react';

export default function ComercializacionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [inmuebles, setInmuebles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    inmueble_id: '',
    agente: '',
    precio_salida: '',
    publicado_en_portales: false,
    portales: '',
    precio_quiebre: '',
    precio_minimo_aceptado: '',
    estado: 'activo',
    fecha_publicacion: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: com } = await supabase
      .from('comercializacion')
      .select('*, inmuebles(nombre, ciudad, tipo, precio_venta)')
      .order('created_at', { ascending: false });
    const { data: inm } = await supabase
      .from('inmuebles')
      .select('*')
      .in('estado', ['en_venta', 'vendido']);
    if (com) setItems(com);
    if (inm) setInmuebles(inm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      inmueble_id: formData.inmueble_id,
      agente: formData.agente || null,
      precio_salida: formData.precio_salida ? parseFloat(formData.precio_salida) : null,
      publicado_en_portales: formData.publicado_en_portales,
      portales: formData.portales || null,
      precio_quiebre: formData.precio_quiebre ? parseFloat(formData.precio_quiebre) : null,
      precio_minimo_aceptado: formData.precio_minimo_aceptado
        ? parseFloat(formData.precio_minimo_aceptado)
        : null,
      estado: formData.estado,
      fecha_publicacion: formData.fecha_publicacion || null,
    };

    await supabase.from('comercializacion').insert([dataToSave]);

    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({
      inmueble_id: '',
      agente: '',
      precio_salida: '',
      publicado_en_portales: false,
      portales: '',
      precio_quiebre: '',
      precio_minimo_aceptado: '',
      estado: 'activo',
      fecha_publicacion: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta comercialización?')) {
      await supabase.from('comercializacion').delete().eq('id', id);
      loadData();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/20 text-green-400';
      case 'pausado':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'vendido':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Estadísticas
  const estadisticas = {
    total: items.length,
    activos: items.filter((i) => i.estado === 'activo').length,
    pausados: items.filter((i) => i.estado === 'pausado').length,
    vendidos: items.filter((i) => i.estado === 'vendido').length,
    publicados: items.filter((i) => i.publicado_en_portales).length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Comercialización</h1>
          <p className="text-wos-text-muted">
            Inmuebles en venta · Gestión de portales y estrategia de precios
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nueva Comercialización
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <p className="text-xs text-wos-text-muted mb-1">Total</p>
          <p className="text-2xl font-bold text-wos-text">{estadisticas.total}</p>
        </div>
        <div className="bg-wos-card border border-green-500/30 rounded-lg p-4">
          <p className="text-xs text-green-400 mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-400">{estadisticas.activos}</p>
        </div>
        <div className="bg-wos-card border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs text-yellow-400 mb-1">Pausados</p>
          <p className="text-2xl font-bold text-yellow-400">{estadisticas.pausados}</p>
        </div>
        <div className="bg-wos-card border border-blue-500/30 rounded-lg p-4">
          <p className="text-xs text-blue-400 mb-1">Vendidos</p>
          <p className="text-2xl font-bold text-blue-400">{estadisticas.vendidos}</p>
        </div>
        <div className="bg-wos-card border border-purple-500/30 rounded-lg p-4">
          <p className="text-xs text-purple-400 mb-1">En Portales</p>
          <p className="text-2xl font-bold text-purple-400">{estadisticas.publicados}</p>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">Nueva Comercialización</h2>
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
              <label className="block text-sm text-wos-text-muted mb-2">Agente</label>
              <input
                type="text"
                value={formData.agente}
                onChange={(e) => setFormData({ ...formData, agente: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Nombre del agente comercial"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Precio Salida (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_salida}
                onChange={(e) => setFormData({ ...formData, precio_salida: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Precio Quiebre (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_quiebre}
                onChange={(e) => setFormData({ ...formData, precio_quiebre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Precio para empatar"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">
                Precio Mínimo Aceptado (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_minimo_aceptado}
                onChange={(e) =>
                  setFormData({ ...formData, precio_minimo_aceptado: e.target.value })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Precio mínimo de venta"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha Publicación</label>
              <input
                type="date"
                value={formData.fecha_publicacion}
                onChange={(e) => setFormData({ ...formData, fecha_publicacion: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div className="md:col-span-2 bg-wos-bg/50 p-4 rounded-lg border border-wos-border">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="publicado_portales"
                  checked={formData.publicado_en_portales}
                  onChange={(e) =>
                    setFormData({ ...formData, publicado_en_portales: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-wos-border bg-wos-bg text-wos-accent focus:ring-wos-accent focus:ring-offset-0"
                />
                <label htmlFor="publicado_portales" className="text-wos-text cursor-pointer">
                  Publicado en Portales Inmobiliarios
                </label>
              </div>

              {formData.publicado_en_portales && (
                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Portales (separados por comas)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.portales}
                    onChange={(e) => setFormData({ ...formData, portales: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                    placeholder="Ej: Idealista, Fotocasa, Habitaclia"
                  />
                </div>
              )}
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

      {/* Tabla */}
      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-wos-bg border-b border-wos-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Inmueble
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Agente
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Precio Salida
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Precio Quiebre
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Precio Mínimo
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Portales
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
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-wos-border hover:bg-wos-bg transition-smooth">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-wos-text font-medium">{item.inmuebles?.nombre || '-'}</p>
                      {item.inmuebles?.ciudad && (
                        <p className="text-xs text-wos-text-muted">{item.inmuebles.ciudad}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted">{item.agente || '-'}</td>
                  <td className="px-6 py-4 text-wos-text font-semibold">
                    €{item.precio_salida?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted">
                    {item.precio_quiebre ? `€${item.precio_quiebre.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted">
                    {item.precio_minimo_aceptado
                      ? `€${item.precio_minimo_aceptado.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {item.publicado_en_portales ? (
                      <div>
                        <div className="flex items-center gap-1 text-green-400 mb-1">
                          <Globe size={14} />
                          <span className="text-xs">Publicado</span>
                        </div>
                        {item.portales && (
                          <p className="text-xs text-wos-text-muted line-clamp-2">
                            {item.portales}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-wos-text-muted">No publicado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                      {item.estado === 'activo' ? 'Activo' : item.estado === 'pausado' ? 'Pausado' : 'Vendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                        title="Eliminar"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12 text-wos-text-muted">
              No hay inmuebles en comercialización
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
