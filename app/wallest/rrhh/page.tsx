'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

type RRHH = {
  id: string;
  nombre: string;
  rol?: string;
  empresa?: string;
  fecha_alta?: string;
  email?: string;
  estado: string;
};

export default function RecursosHumanos() {
  const [empleados, setEmpleados] = useState<RRHH[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    empresa: '',
    fecha_alta: new Date().toISOString().split('T')[0],
    email: '',
    estado: 'activo',
  });

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    const { data } = await supabase.from('rrhh').select('*').order('nombre');
    if (data) setEmpleados(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('rrhh').insert([formData]);
    setFormData({ nombre: '', rol: '', empresa: '', fecha_alta: new Date().toISOString().split('T')[0], email: '', estado: 'activo' });
    setShowForm(false);
    loadEmpleados();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este empleado?')) {
      await supabase.from('rrhh').delete().eq('id', id);
      loadEmpleados();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">Recursos Humanos</h1>
          <p className="text-wos-text-muted">Gestión del equipo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg">
          <Plus size={20} />
          Nuevo Empleado
        </button>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Nombre *</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Rol</label>
              <input type="text" value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Empresa</label>
              <input type="text" value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" />
            </div>
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-wos-border text-wos-text px-6 py-2 rounded-lg">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-wos-bg border-b border-wos-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Nombre</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Rol</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Empresa</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Estado</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="border-b border-wos-border hover:bg-wos-bg">
                <td className="px-6 py-4 text-wos-text">{e.nombre}</td>
                <td className="px-6 py-4 text-wos-text-muted">{e.rol || '-'}</td>
                <td className="px-6 py-4 text-wos-text-muted">{e.empresa || '-'}</td>
                <td className="px-6 py-4 text-wos-text-muted">{e.email || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${e.estado === 'activo' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                    {e.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
