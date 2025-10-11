'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Hammer, DollarSign, Package, ShoppingCart } from 'lucide-react';

export default function RenovaDashboard() {
  const [stats, setStats] = useState({ totalReformas: 0, presupuestoTotal: 0, proveedores: 0, materialesBajoStock: 0 });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const { data: reformas } = await supabase.from('reformas').select('*');
    const { data: proveedores } = await supabase.from('proveedores').select('*');
    const { data: materiales } = await supabase.from('materiales').select('*');

    const presupuesto = reformas?.reduce((sum: number, r: any) => sum + (r.presupuesto || 0), 0) || 0;
    const bajoStock = materiales?.filter((m: any) => m.cantidad < m.stock_minimo).length || 0;

    setStats({ totalReformas: reformas?.length || 0, presupuestoTotal: presupuesto, proveedores: proveedores?.length || 0, materialesBajoStock: bajoStock });
  };

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-wos-accent mb-2">Dashboard RENOVA</h1><p className="text-wos-text-muted">Gestión integral de reformas</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><Hammer size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Reformas Activas</span></div><p className="text-3xl font-bold text-wos-accent">{stats.totalReformas}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><DollarSign size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Presupuesto Total</span></div><p className="text-3xl font-bold text-wos-accent">€{stats.presupuestoTotal.toLocaleString()}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><ShoppingCart size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Proveedores</span></div><p className="text-3xl font-bold text-wos-accent">{stats.proveedores}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><Package size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Materiales Bajo Stock</span></div><p className="text-3xl font-bold text-red-500">{stats.materialesBajoStock}</p></div>
      </div>
    </div>
  );
}
