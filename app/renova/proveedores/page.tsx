'use client';

import { useEffect, useState } from 'react';
import { supabase, Proveedor } from '@/lib/supabase';
import { Plus, Trash2, Filter } from 'lucide-react';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'activo' | 'pasivo'>('todos');
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'activo' as 'activo' | 'pasivo',
    rubro: '',
    contacto: '',
    cif: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    const { data } = await supabase
      .from('proveedores')
      .select('*')
      .order('nombre');
    if (data) setProveedores(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      rubro: formData.rubro || null,
      contacto: formData.contacto || null,
      cif: formData.cif || null,
      email: formData.email || null,
      telefono: formData.telefono || null,
    };

    await supabase.from('proveedores').insert([dataToSave]);

    resetForm();
    loadProveedores();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'activo',
      rubro: '',
      contacto: '',
      cif: '',
      email: '',
      telefono: '',
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este proveedor?')) {
      await supabase.from('proveedores').delete().eq('id', id);
      loadProveedores();
    }
  };

  // Filtrar proveedores según el tipo seleccionado
  const proveedoresFiltrados = proveedores.filter((p) => {
    if (filtroTipo === 'todos') return true;
    return p.tipo === filtroTipo;
  });

  // Estadísticas
  const estadisticas = {
    total: proveedores.length,
    activos: proveedores.filter((p) => p.tipo === 'activo').length,
    pasivos: proveedores.filter((p) => p.tipo === 'pasivo').length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Proveedores</h1>
          <p className="text-wos-text-muted">
            Gestión de proveedores y contratistas · Activos: con contratos vigentes · Pasivos: históricos
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90 transition-smooth"
        >
          <Plus size={20} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <p className="text-xs text-wos-text-muted mb-1">Total Proveedores</p>
          <p className="text-2xl font-bold text-wos-text">{estadisticas.total}</p>
        </div>
        <div className="bg-wos-card border border-green-500/30 rounded-lg p-4">
          <p className="text-xs text-green-400 mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-400">{estadisticas.activos}</p>
        </div>
        <div className="bg-wos-card border border-gray-500/30 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Pasivos</p>
          <p className="text-2xl font-bold text-gray-400">{estadisticas.pasivos}</p>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-wos-accent">Nuevo Proveedor</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Nombre del proveedor"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'activo' | 'pasivo' })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="activo">Activo (contrato vigente)</option>
                <option value="pasivo">Pasivo (histórico)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Rubro</label>
              <input
                type="text"
                value={formData.rubro}
                onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Ej: Fontanería, Electricidad..."
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Contacto</label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Nombre del contacto"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">CIF</label>
              <input
                type="text"
                value={formData.cif}
                onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="CIF / NIF"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="+34 600 000 000"
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

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6">
        <Filter size={18} className="text-wos-text-muted" />
        <span className="text-sm text-wos-text-muted">Filtrar por tipo:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-4 py-2 rounded-lg text-sm transition-smooth ${
              filtroTipo === 'todos'
                ? 'bg-wos-accent text-wos-bg'
                : 'bg-wos-card border border-wos-border text-wos-text hover:border-wos-accent'
            }`}
          >
            Todos ({estadisticas.total})
          </button>
          <button
            onClick={() => setFiltroTipo('activo')}
            className={`px-4 py-2 rounded-lg text-sm transition-smooth ${
              filtroTipo === 'activo'
                ? 'bg-green-500 text-white'
                : 'bg-wos-card border border-wos-border text-wos-text hover:border-green-500'
            }`}
          >
            Activos ({estadisticas.activos})
          </button>
          <button
            onClick={() => setFiltroTipo('pasivo')}
            className={`px-4 py-2 rounded-lg text-sm transition-smooth ${
              filtroTipo === 'pasivo'
                ? 'bg-gray-500 text-white'
                : 'bg-wos-card border border-wos-border text-wos-text hover:border-gray-500'
            }`}
          >
            Pasivos ({estadisticas.pasivos})
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-wos-bg border-b border-wos-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Nombre
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Tipo
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Rubro
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Contacto
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Teléfono
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((p) => (
                <tr key={p.id} className="border-b border-wos-border hover:bg-wos-bg transition-smooth">
                  <td className="px-6 py-4 text-wos-text font-medium">{p.nombre}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.tipo === 'activo'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {p.tipo === 'activo' ? 'Activo' : 'Pasivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-wos-text-muted">{p.rubro || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{p.contacto || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{p.email || '-'}</td>
                  <td className="px-6 py-4 text-wos-text-muted">{p.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(p.id)}
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
          {proveedoresFiltrados.length === 0 && (
            <div className="text-center py-12 text-wos-text-muted">
              No hay proveedores {filtroTipo !== 'todos' && filtroTipo + 's'} registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
