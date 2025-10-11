'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

type Material = { id: string; nombre: string; proveedor_id?: string; costo_unitario?: number; cantidad: number; stock_minimo: number; };

export default function Materiales() {
  const [materiales, setMateriales] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', proveedor_id: '', costo_unitario: '', cantidad: '0', stock_minimo: '0' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: mat } = await supabase.from('materiales').select('*, proveedores(nombre)').order('nombre');
    const { data: prov } = await supabase.from('proveedores').select('*');
    if (mat) setMateriales(mat);
    if (prov) setProveedores(prov);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('materiales').insert([{ ...formData, costo_unitario: parseFloat(formData.costo_unitario) || 0, cantidad: parseInt(formData.cantidad) || 0, stock_minimo: parseInt(formData.stock_minimo) || 0 }]);
    setFormData({ nombre: '', proveedor_id: '', costo_unitario: '', cantidad: '0', stock_minimo: '0' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar?')) { await supabase.from('materiales').delete().eq('id', id); loadData(); }
  };

  const esBajoStock = (cantidad: number, minimo: number) => cantidad < minimo;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold text-wos-accent mb-2">Stock / Materiales</h1><p className="text-wos-text-muted">Control de inventario</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg"><Plus size={20} />Nuevo Material</button>
      </div>

      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-wos-text-muted mb-2">Nombre *</label><input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Proveedor</label><select value={formData.proveedor_id} onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"><option value="">Seleccionar</option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Costo Unitario (€)</label><input type="number" step="0.01" value={formData.costo_unitario} onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Cantidad</label><input type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div><label className="block text-sm text-wos-text-muted mb-2">Stock Mínimo</label><input type="number" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })} className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent" /></div>
            <div className="flex gap-3 items-end"><button type="submit" className="bg-wos-accent text-wos-bg px-6 py-2 rounded-lg">Guardar</button><button type="button" onClick={() => setShowForm(false)} className="bg-wos-border text-wos-text px-6 py-2 rounded-lg">Cancelar</button></div>
          </form>
        </div>
      )}

      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-wos-bg border-b border-wos-border">
            <tr><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Material</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Proveedor</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Costo Unit.</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Cantidad</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Stock Mín.</th><th className="text-left px-6 py-4 text-sm font-semibold text-wos-text-muted">Estado</th><th className="text-right px-6 py-4 text-sm font-semibold text-wos-text-muted">Acciones</th></tr>
          </thead>
          <tbody>
            {materiales.map((m: any) => {
              const bajoStock = esBajoStock(m.cantidad, m.stock_minimo);
              return (<tr key={m.id} className={`border-b border-wos-border hover:bg-wos-bg ${bajoStock ? 'bg-red-500/5' : ''}`}><td className="px-6 py-4 text-wos-text flex items-center gap-2">{bajoStock && <AlertTriangle size={16} className="text-red-500" />}{m.nombre}</td><td className="px-6 py-4 text-wos-text-muted">{m.proveedores?.nombre || '-'}</td><td className="px-6 py-4 text-wos-text">€{m.costo_unitario?.toLocaleString() || '0'}</td><td className={`px-6 py-4 font-semibold ${bajoStock ? 'text-red-500' : 'text-wos-text'}`}>{m.cantidad}</td><td className="px-6 py-4 text-wos-text-muted">{m.stock_minimo}</td><td className="px-6 py-4">{bajoStock ? <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-500">Bajo Stock</span> : <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-500">OK</span>}</td><td className="px-6 py-4 text-right"><button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 size={18} className="text-red-500" /></button></td></tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
