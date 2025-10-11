'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, TrendingUp, DollarSign, FileSignature } from 'lucide-react';

export default function NexoDashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, enComercializacion: 0, transacciones: 0, valorTransacciones: 0 });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const { data: leads } = await supabase.from('leads').select('*');
    const { data: comercializacion } = await supabase.from('comercializacion').select('*');
    const { data: transacciones } = await supabase.from('transacciones').select('*');
    
    const valorTotal = transacciones?.reduce((sum: number, t: any) => sum + (t.precio_final || 0), 0) || 0;

    setStats({ totalLeads: leads?.length || 0, enComercializacion: comercializacion?.length || 0, transacciones: transacciones?.length || 0, valorTransacciones: valorTotal });
  };

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-wos-accent mb-2">Dashboard NEXO</h1><p className="text-wos-text-muted">Comercialización y ventas</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><Users size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Total Leads</span></div><p className="text-3xl font-bold text-wos-accent">{stats.totalLeads}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><TrendingUp size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">En Comercialización</span></div><p className="text-3xl font-bold text-wos-accent">{stats.enComercializacion}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><FileSignature size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Transacciones</span></div><p className="text-3xl font-bold text-wos-accent">{stats.transacciones}</p></div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6"><div className="flex items-center gap-3 mb-2"><DollarSign size={20} className="text-wos-text-muted" /><span className="text-sm text-wos-text-muted">Valor Total</span></div><p className="text-3xl font-bold text-wos-accent">€{stats.valorTransacciones.toLocaleString()}</p></div>
      </div>
    </div>
  );
}
