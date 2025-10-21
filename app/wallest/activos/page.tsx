'use client';

import { useEffect, useState } from 'react';
import { supabase, Inmueble } from '@/lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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
  });

  useEffect(() => {
    loadInmuebles();
  }, []);

  const loadInmuebles = async () => {
    const { data } = await supabase
      .from('inmuebles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInmuebles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
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
      estado: formData.estado, // ✅ ESTA LÍNEA ES LA QUE ASEGURA EL GUARDADO CORRECTO
      nota_simple: formData.nota_simple,
      deudas: formData.deudas,
      ocupado: formData.ocupado,
    };

    if (editingId) {
      await supabase.from('inmuebles').update(dataToSave).eq('id', editingId);
    } else {
      await supabase.from('inmuebles').insert([dataToSave]);
    }

    resetForm();
    loadInmuebles();
  };

  const handleEdit = (inmueble: Inmueble) => {
    setEditingId(inmueble.id);
    setFormData({
      nombre: inmueble.nombre,
      direccion: inmueble.direccion || '',
      ciudad: inmueble.ciudad || '',
      codigo_postal: inmueble.codigo_postal || '',
      barrio: inmueble.barrio || '',
      tipo: inmueble.tipo || '',
      precio_compra: inmueble.precio_compra?.toString() || '',
      precio_venta: inmueble.precio_venta?.toString() || '',
      superficie: inmueble.superficie?.toString() || '',
      habitaciones: inmueble.habitaciones?.toString() || '',
      banos: inmueble.banos?.toString() || '',
      descripcion: inmueble.descripcion || '',
      estado: inmueble.estado || 'EN_ESTUDIO',
      nota_simple: inmueble.nota_simple || false,
      deudas: inmueble.deudas || false,
      ocupado: inmueble.ocupado || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este inmueble?')) {
      await supabase.from('inmuebles').delete().eq('id', id);
      loadInmuebles();
    }
  };

  const resetForm = () => {
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
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getEstadoColor = (estado: string) => {
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
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Activos Inmobiliarios</h1>
          <p className="text-wos-text-muted">Gestión completa de propiedades</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            {/* 🔹 Campo Estado */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              >
                <option value="EN_ESTUDIO">En Estudio</option>
                <option value="COMPRADO">Comprado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            {/* 🔹 Otros campos... */}
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text"
              />
            </div>

            <div className="md:col-span-3 flex gap-3 mt-4">
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
                <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inmuebles.map((inmueble) => (
                <tr key={inmueble.id} className="border-b border-wos-border hover:bg-wos-bg">
                  <td className="px-6 py-4 text-wos-text">{inmueble.nombre}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{inmueble.ciudad || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted capitalize">{inmueble.tipo || '-'}</td>
                  <td className="px-6 py-4 text-wos-text">
                    {inmueble.precio_compra ? `€${inmueble.precio_compra.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(inmueble.estado)}`}
                    >
                      {inmueble.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(inmueble)} className="p-2 hover:bg-wos-bg rounded-lg">
                        <Edit2 size={18} className="text-wos-text-muted" />
                      </button>
                      <button onClick={() => handleDelete(inmueble.id)} className="p-2 hover:bg-red-500/20 rounded-lg">
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