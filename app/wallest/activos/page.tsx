'use client';

import { useEffect, useState } from 'react';
import { supabase, Inmueble } from '@/lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';

/* Utilidades de fecha */
function toDateTimeLocal(value?: string | null) {
  if (!value) return '';
  // Asegura formato compatible con <input type="datetime-local">
  const d = new Date(value);
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  return iso.slice(0, 16); // yyyy-MM-ddTHH:mm
}
function fromDateTimeLocal(value: string | undefined) {
  return value && value.trim() !== '' ? new Date(value).toISOString() : null;
}
function fmtDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  const dd = d.toLocaleDateString('es-ES');
  const hh = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${dd} ${hh}`;
}

/* Badge por estado */
function getEstadoColor(estado?: string | null) {
  switch (estado) {
    case 'EN_ESTUDIO':
      return 'bg-yellow-500/20 text-yellow-500';
    case 'COMPRADO':
      return 'bg-green-500/20 text-green-500';
    case 'VENDIDO':
      return 'bg-blue-500/20 text-blue-500';
    default:
      return 'bg-gray-500/20 text-gray-500';
  }
}

export default function ActivosInmobiliarios() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    barrio: '',
    tipo: '',
    precio_compra: '',
    precio_venta: '',
    superficie: '',
    habitaciones: '',
    banos: '',
    descripcion: '',
    estado: 'EN_ESTUDIO',
    nota_simple: false,
    deudas: false,
    ocupado: false,
    fecha_alta: '' as string | undefined,
    fecha_compra: '' as string | undefined,
    created_at: '' as string | undefined,
    updated_at: '' as string | undefined,
  });

  /* Cargar datos */
  useEffect(() => {
    loadInmuebles();
  }, []);

  const loadInmuebles = async () => {
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setInmuebles(data as Inmueble[]);
  };

  /* Guardar */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nombre: formData.nombre,
      direccion: formData.direccion || null,
      ciudad: formData.ciudad || null,
      codigo_postal: formData.codigo_postal || null,
      barrio: formData.barrio || null,
      tipo: formData.tipo || null,
      precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra) : null,
      precio_venta: formData.precio_venta ? parseFloat(formData.precio_venta) : null,
      superficie: formData.superficie ? parseFloat(formData.superficie) : null,
      habitaciones: formData.habitaciones ? parseInt(formData.habitaciones) : null,
      banos: formData.banos ? parseInt(formData.banos) : null,
      descripcion: formData.descripcion || null,
      estado: formData.estado,
      nota_simple: !!formData.nota_simple,
      deudas: !!formData.deudas,
      ocupado: !!formData.ocupado,
      fecha_alta: fromDateTimeLocal(formData.fecha_alta),
      fecha_compra: fromDateTimeLocal(formData.fecha_compra),
      created_at: fromDateTimeLocal(formData.created_at) ?? undefined, // si viene vacía, deja que DB maneje default
      updated_at: fromDateTimeLocal(formData.updated_at) ?? new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('inmuebles').update(payload).eq('id', editingId);
    } else {
      await supabase.from('inmuebles').insert([payload]);
    }

    await loadInmuebles();
    resetForm();
  };

  /* Editar */
  const handleEdit = (inmueble: Inmueble) => {
    setEditingId(inmueble.id);
    setFormData({
      nombre: inmueble.nombre ?? '',
      direccion: inmueble.direccion ?? '',
      ciudad: inmueble.ciudad ?? '',
      codigo_postal: inmueble.codigo_postal ?? '',
      barrio: inmueble.barrio ?? '',
      tipo: inmueble.tipo ?? '',
      precio_compra: inmueble.precio_compra != null ? String(inmueble.precio_compra) : '',
      precio_venta: inmueble.precio_venta != null ? String(inmueble.precio_venta) : '',
      superficie: inmueble.superficie != null ? String(inmueble.superficie) : '',
      habitaciones: inmueble.habitaciones != null ? String(inmueble.habitaciones) : '',
      banos: inmueble.banos != null ? String(inmueble.banos) : '',
      descripcion: inmueble.descripcion ?? '',
      estado: (inmueble.estado as any) ?? 'EN_ESTUDIO',
      nota_simple: !!inmueble.nota_simple,
      deudas: !!inmueble.deudas,
      ocupado: !!inmueble.ocupado,
      fecha_alta: toDateTimeLocal((inmueble as any).fecha_alta),
      fecha_compra: toDateTimeLocal((inmueble as any).fecha_compra),
      created_at: toDateTimeLocal((inmueble as any).created_at),
      updated_at: toDateTimeLocal((inmueble as any).updated_at),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Eliminar */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este inmueble?')) return;
    await supabase.from('inmuebles').delete().eq('id', id);
    await loadInmuebles();
  };

  /* Reset */
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      barrio: '',
      tipo: '',
      precio_compra: '',
      precio_venta: '',
      superficie: '',
      habitaciones: '',
      banos: '',
      descripcion: '',
      estado: 'EN_ESTUDIO',
      nota_simple: false,
      deudas: false,
      ocupado: false,
      fecha_alta: undefined,
      fecha_compra: undefined,
      created_at: undefined,
      updated_at: undefined,
    });
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Activos Inmobiliarios</h1>
          <p className="text-wos-text-muted">Gestión completa de propiedades</p>
        </div>
        <button
          onClick={() => {
            // Si estaba editando y se pulsa "Nuevo Inmueble", resetea limpio
            if (showForm && editingId) resetForm();
            setShowForm((s) => !s);
          }}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Inmueble
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">
            {editingId ? 'Editar Inmueble' : 'Nuevo Inmueble'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Columna 1 */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Código Postal</label>
              <input
                type="text"
                value={formData.codigo_postal}
                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Barrio</label>
              <input
                type="text"
                value={formData.barrio}
                onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">Seleccionar</option>
                <option value="piso">Piso</option>
                <option value="casa">Casa</option>
                <option value="local">Local</option>
                <option value="terreno">Terreno</option>
                <option value="oficina">Oficina</option>
                <option value="edificio">Edificio</option>
                <option value="dúplex">Dúplex</option>
                <option value="chalet">Chalet</option>
                <option value="adosado">Adosado</option>
                <option value="trastero">Trastero</option>
                <option value="garaje">Garaje</option>
                <option value="nave">Nave</option>
              </select>
            </div>

            {/* Números */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Precio Compra (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_compra}
                onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Precio Venta (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Superficie (m²)</label>
              <input
                type="number"
                step="0.01"
                value={formData.superficie}
                onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Habitaciones</label>
              <input
                type="number"
                value={formData.habitaciones}
                onChange={(e) => setFormData({ ...formData, habitaciones: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Baños</label>
              <input
                type="number"
                value={formData.banos}
                onChange={(e) => setFormData({ ...formData, banos: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="EN_ESTUDIO">En Estudio</option>
                <option value="COMPRADO">Comprado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            {/* Checks */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-wos-bg/50 p-4 rounded-lg border border-wos-border">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.nota_simple}
                  onChange={(e) => setFormData({ ...formData, nota_simple: e.target.checked })}
                  className="w-5 h-5 rounded border-wos-border bg-wos-bg text-wos-accent focus:ring-wos-accent focus:ring-offset-0"
                />
                <span className="text-wos-text">Nota simple</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.deudas}
                  onChange={(e) => setFormData({ ...formData, deudas: e.target.checked })}
                  className="w-5 h-5 rounded border-wos-border bg-wos-bg text-wos-accent focus:ring-wos-accent focus:ring-offset-0"
                />
                <span className="text-wos-text">Deudas</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.ocupado}
                  onChange={(e) => setFormData({ ...formData, ocupado: e.target.checked })}
                  className="w-5 h-5 rounded border-wos-border bg-wos-bg text-wos-accent focus:ring-wos-accent focus:ring-offset-0"
                />
                <span className="text-wos-text">Ocupado</span>
              </label>
            </div>

            {/* Fechas editables */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha de alta</label>
              <input
                type="datetime-local"
                value={formData.fecha_alta ?? ''}
                onChange={(e) => setFormData({ ...formData, fecha_alta: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha de compra</label>
              <input
                type="datetime-local"
                value={formData.fecha_compra ?? ''}
                onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Creado</label>
              <input
                type="datetime-local"
                value={formData.created_at ?? ''}
                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Actualizado</label>
              <input
                type="datetime-local"
                value={formData.updated_at ?? ''}
                onChange={(e) => setFormData({ ...formData, updated_at: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-wos-text-muted mb-2">Descripción</label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            {/* Botones */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:bg-wos-card transition-smooth"
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Ciudad</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Tipo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Precio Compra</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Fecha Alta</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Fecha Compra</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Creado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Actualizado</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inmuebles.map((i) => (
                <tr key={i.id} className="border-b border-wos-border hover:bg-wos-bg">
                  <td className="px-6 py-4 text-wos-text">{i.nombre}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{i.ciudad || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted capitalize">{i.tipo || '-'}</td>
                  <td className="px-6 py-4 text-wos-text">
                    {i.precio_compra != null ? `€${Number(i.precio_compra).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(i.estado)}`}>
                      {i.estado || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted">{fmtDate((i as any).fecha_alta)}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{fmtDate((i as any).fecha_compra)}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{fmtDate((i as any).created_at)}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{fmtDate((i as any).updated_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(i)}
                        className="p-2 hover:bg-wos-bg rounded-lg transition-smooth"
                        title="Editar"
                      >
                        <Edit2 size={18} className="text-wos-text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
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

          {inmuebles.length === 0 && (
            <div className="text-center py-12 text-wos-text-muted">No hay inmuebles registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}