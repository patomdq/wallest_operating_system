'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function WallestDashboard() {
  const [stats, setStats] = useState({
    totalInmuebles: 0,
    inversionTotal: 0,
    roiPromedio: 0,
    empleados: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: inmuebles } = await supabase.from('inmuebles').select('*');
      const { data: rrhh } = await supabase.from('rrhh').select('*');

      if (inmuebles) {
        const total = inmuebles.length;
        const inversion = inmuebles.reduce(
          (sum: number, i: any) => sum + (i.precio_compra || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          totalInmuebles: total,
          inversionTotal: inversion,
        }));
      }

      if (rrhh) {
        setStats((prev) => ({ ...prev, empleados: rrhh.length }));
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Dashboard Wallest</h1>
        <p className="text-wos-text-muted">Resumen ejecutivo de operaciones inmobiliarias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Total Inmuebles</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{stats.totalInmuebles}</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Inversión Total</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">
            €{stats.inversionTotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">ROI Promedio</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{stats.roiPromedio.toFixed(1)}%</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Empleados</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{stats.empleados}</p>
        </div>
      </div>
    </div>
  );
}
