'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

type Macroproyecto = { id: string; nombre: string; descripcion?: string; estado: string; fecha_inicio?: string; fecha_fin?: string; responsable?: string; avance: number; };

export default function MacroproyectosPage() {
  const [proyectos, setProyectos] = useState<Macroproyecto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', estado: 'planificacion', fecha_inicio: '', fecha_fin: '', responsable: '', avance: '0' });

  useEffect(() => { loadProyectos(); }, []);

  const loadProyectos = async () => {
    const { data } = await supabase.from('macroproyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('macroproyectos').insert([{ ...formData, avance: parseFloat(formData.avance) }]);
    setFormData({ nombre: '', descripcion: '', estado: 'planificacion', fecha_inicio: '', fecha_fin: '', responsable: '', avance: '0' });
    setShowForm(false);
    loadProyectos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar?')) { await supabase.from('macroproyectos').delete().eq('id', id); loadProyectos(); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold text-wos-accent mb-2">Gestor de Macroproyectos</h1><p className="text-wos-text-muted">Planificación y seguimiento de grandes proyectos</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg"><Plus size={20} />Nuevo Proyecto</button>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-wos-text-muted mb-2">Nombre *</label><input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Estado</label><select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"><option value="planificacion">Planificación</option><option value="en_curso">En Curso</option><option value="completado">Completado</option><option value="pausado">Pausado</option></select></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Fecha Inicio</label><input type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Fecha Fin</label><input type="date" value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Responsable</label><input type="text" value={formData.responsable} onChange={(e) => setFormData({ ...formData, responsable: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Avance (%)</label><input type="number" min="0" max="100" value={formData.avance} onChange={(e) => setFormData({ ...formData, avance: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div className="md:col-span-2"><label className="block text-sm text-wos-text-muted mb-2">Descripción</label><textarea rows={3} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div className="md:col-span-2 flex gap-3"><button type="submit" className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg">Guardar</button><button type="button" onClick={() => setShowForm(false)} className="bg-wos-border text-wos-text px-6 py-2 rounded-lg">Cancelar</button></div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((p) => (
          <div key={p.id} className="bg-wos-card border border-wos-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-wos-accent">{p.nombre}</h3>
              <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-red-500/20 rounded"><Trash2 size={16} className="text-red-500" /></button>
            </div>
            <p className="text-sm text-wos-text-muted mb-4">{p.descripcion || 'Sin descripción'}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-wos-text-muted">Estado:</span><span className="text-wos-text capitalize">{p.estado}</span></div>
              <div className="flex justify-between"><span className="text-wos-text-muted">Responsable:</span><span className="text-wos-text">{p.responsable || '-'}</span></div>
              <div className="mt-4"><div className="flex justify-between mb-1"><span className="text-xs text-wos-text-muted">Avance</span><span className="text-xs text-wos-accent">{p.avance}%</span></div><div className="w-full bg-wos-bg rounded-full h-2"><div className="bg-wos-accent h-2 rounded-full" style={{ width: `${p.avance}%` }}></div></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
