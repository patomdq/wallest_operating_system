'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

type Transaccion = { id: string; inmueble_id: string; comprador?: string; precio_final?: number; fecha_cierre?: string; notas?: string; };

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [inmuebles, setInmuebles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ inmueble_id: '', comprador: '', precio_final: '', fecha_cierre: new Date().toISOString().split('T')[0], notas: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: trans } = await supabase.from('transacciones').select('*, inmuebles(nombre)').order('fecha_cierre', { ascending: false });
    const { data: inm } = await supabase.from('inmuebles').select('*');
    if (trans) setTransacciones(trans);
    if (inm) setInmuebles(inm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('transacciones').insert([{ ...formData, precio_final: parseFloat(formData.precio_final) || 0 }]);
    setFormData({ inmueble_id: '', comprador: '', precio_final: '', fecha_cierre: new Date().toISOString().split('T')[0], notas: '' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar?')) { await supabase.from('transacciones').delete().eq('id', id); loadData(); }
  };

  const totalVentas = transacciones.reduce((sum, t) => sum + (t.precio_final || 0), 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold text-wos-accent mb-2">Transacciones</h1><p className="text-wos-text-muted">Historial de ventas cerradas</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg"><Plus size={20} />Nueva Transacción</button>
      </div>

      <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-wos-text-muted mb-1">Total Vendido</p><p className="text-3xl font-bold text-green-500">€{totalVentas.toLocaleString()}</p></div>
          <div><p className="text-sm text-wos-text-muted mb-1">Transacciones</p><p className="text-3xl font-bold text-wos-accent">{transacciones.length}</p></div>
        </div>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-wos-text-muted mb-2">Inmueble *</label><select required value={formData.inmueble_id} onChange={(e) => setFormData({ ...formData, inmueble_id: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"><option value="">Seleccionar</option>{inmuebles.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}</select></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Comprador</label><input type="text" value={formData.comprador} onChange={(e) => setFormData({ ...formData, comprador: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Precio Final (€)</label><input type="number" step="0.01" value={formData.precio_final} onChange={(e) => setFormData({ ...formData, precio_final: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Fecha Cierre</label><input type="date" value={formData.fecha_cierre} onChange={(e) => setFormData({ ...formData, fecha_cierre: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div className="md:col-span-2"><label className="block text-sm text-wos-text-muted mb-2">Notas</label><textarea rows={2} value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div className="md:col-span-2 flex gap-3"><button type="submit" className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg">Guardar</button><button type="button" onClick={() => setShowForm(false)} className="bg-wos-border text-wos-text px-6 py-2 rounded-lg">Cancelar</button></div>
          </form>
        </div>
      )}

      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-wos-bg border-b border-wos-border">
            <tr><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Fecha</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Inmueble</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Comprador</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Precio Final</th><th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th></tr>
          </thead>
          <tbody>
            {transacciones.map((t: any) => (<tr key={t.id} className="border-b border-wos-border hover:bg-wos-bg"><td className="px-6 py-4 text-wos-text-muted">{t.fecha_cierre || '-'}</td><td className="px-6 py-4 text-wos-text">{t.inmuebles?.nombre || '-'}</td><td className="px-6 py-4 text-wos-text-muted">{t.comprador || '-'}</td><td className="px-6 py-4 text-green-500 font-semibold">€{t.precio_final?.toLocaleString() || '0'}</td><td className="px-6 py-4 text-right"><button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 size={18} className="text-red-500" /></button></td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
