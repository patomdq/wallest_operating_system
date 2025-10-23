'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';

type Inmueble = {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  barrio: string | null;
  tipo: string | null;
  precio_compra: number | null;
  precio_venta: number | null;
  superficie: number | null;
  habitaciones: number | null;
  banos: number | null;
  descripcion: string | null;
  estado: 'EN_ESTUDIO' | 'ARRAS' | 'COMPRADO' | 'VENDIDO';
  fecha_alta: string | null;
  fecha_compra: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function ActivosInmobiliarios() {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [estadoOriginal, setEstadoOriginal] = useState<Inmueble['estado'] | null>(null);

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
    estado: 'EN_ESTUDIO' as Inmueble['estado'],
  });

  const limpiar = () => {
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
    });
    setEditingId(null);
    setEstadoOriginal(null);
    setShowForm(false);
  };

  const estadoBadge = (estado: Inmueble['estado']) =>
    ({
      EN_ESTUDIO: 'bg-yellow-500/20 text-yellow-500',
      ARRAS: 'bg-orange-500/20 text-orange-500',
      COMPRADO: 'bg-green-500/20 text-green-500',
      VENDIDO: 'bg-blue-500/20 text-blue-500',
    }[estado] || 'bg-gray-500/20 text-gray-400');

  const precioFmt = (n: number | null) =>
    typeof n === 'number' ? `€${n.toLocaleString()}` : '-';

  useEffect(() => {
    recargar();
  }, []);

  const recargar = async () => {
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setInmuebles(data as Inmueble[]);
  };
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const limpiarNumero = (v: any) =>
        v === '' || v === null || v === undefined ? null : Number(v);

      const payload: any = {
        nombre: formData.nombre?.trim() || null,
        direccion: formData.direccion?.trim() || null,
        ciudad: formData.ciudad?.trim() || null,
        codigo_postal: formData.codigo_postal?.trim() || null,
        barrio: formData.barrio?.trim() || null,
        tipo: formData.tipo || null,
        precio_compra: limpiarNumero(formData.precio_compra),
        precio_venta: limpiarNumero(formData.precio_venta),
        superficie: limpiarNumero(formData.superficie),
        habitaciones: limpiarNumero(formData.habitaciones),
        banos: limpiarNumero(formData.banos),
        descripcion: formData.descripcion?.trim() || null,
        estado: formData.estado || 'EN_ESTUDIO',
      };

      if (editingId) {
        if (estadoOriginal !== 'COMPRADO' && formData.estado === 'COMPRADO') {
          payload['fecha_compra'] = new Date().toISOString();
        } else if (estadoOriginal === 'COMPRADO' && formData.estado !== 'COMPRADO') {
          payload['fecha_compra'] = null;
        }

        const { error } = await supabase.from('inmuebles').update(payload).eq('id', editingId);
        if (error) throw error;
        console.log('✅ Inmueble actualizado correctamente');
      } else {
        if (formData.estado === 'COMPRADO') {
          payload['fecha_compra'] = new Date().toISOString();
        }

        const { error } = await supabase.from('inmuebles').insert([payload]);
        if (error) throw error;
        console.log('✅ Nuevo inmueble creado');
      }

      await recargar();
      limpiar();
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err);
      alert('Ocurrió un error al guardar o actualizar. Revisa la consola.');
    }
  };

  const handleEdit = (i: Inmueble) => {
    setEditingId(i.id);
    setEstadoOriginal(i.estado);
    setFormData({
      nombre: i.nombre || '',
      direccion: i.direccion || '',
      ciudad: i.ciudad || '',
      codigo_postal: i.codigo_postal || '',
      barrio: i.barrio || '',
      tipo: i.tipo || '',
      precio_compra: i.precio_compra?.toString() || '',
      precio_venta: i.precio_venta?.toString() || '',
      superficie: i.superficie?.toString() || '',
      habitaciones: i.habitaciones?.toString() || '',
      banos: i.banos?.toString() || '',
      descripcion: i.descripcion || '',
      estado: i.estado,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este inmueble?')) return;
    const { error } = await supabase.from('inmuebles').delete().eq('id', id);
    if (!error) await recargar();
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
            if (!showForm) {
              limpiar();
              setShowForm(true);
            } else {
              limpiar();
            }
          }}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Inmueble
        </button>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">
            {editingId ? 'Editar Inmueble' : 'Nuevo Inmueble'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input
                required
                type="text"
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
              <label className="block text-sm text-wos-text-muted mb-2">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">Seleccionar</option>
                <option value="Piso">Piso</option>
                <option value="Casa">Casa</option>
                <option value="Local">Local</option>
                <option value="Terreno">Terreno</option>
                <option value="Oficina">Oficina</option>
                <option value="Edificio">Edificio</option>
                <option value="Dúplex">Dúplex</option>
                <option value="Chalet">Chalet</option>
                <option value="Adosado">Adosado</option>
                <option value="Trastero">Trastero</option>
                <option value="Garaje">Garaje</option>
                <option value="Nave">Nave</option>
              </select>
            </div>

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

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value as Inmueble['estado'] })
                }
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="EN_ESTUDIO">En Estudio</option>
                <option value="ARRAS">Arras</option>
                <option value="COMPRADO">Comprado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-wos-text-muted mb-2">Descripción</label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg hover:opacity-90 transition-smooth"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={limpiar}
                className="bg-wos-border text-wos-text px-6 py-2 rounded-lg hover:bg-wos-card transition-smooth"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inmuebles.map((i) => (
                <tr key={i.id} className="border-b border-wos-border hover:bg-wos-bg">
                  <td className="px-6 py-4 text-wos-text">{i.nombre}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{i.ciudad || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{i.tipo || '-'}</td>
                  <td className="px-6 py-4 text-wos-text">{precioFmt(i.precio_compra)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge(i.estado)}`}>
                      {i.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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
            <div className="text-center py-12 text-wos-text-muted">
              No hay inmuebles registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}