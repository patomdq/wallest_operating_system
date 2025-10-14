'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  Plus,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

type KPIs = {
  activosTotales: number;
  roiMedio: number;
  cashflowMensual: number;
  margenOperativo: number;
  diasVidaCaja: number;
  inmueblesEstudio: number;
  inmueblesReforma: number;
  inmueblesVenta: number;
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs>({
    activosTotales: 0,
    roiMedio: 0,
    cashflowMensual: 0,
    margenOperativo: 0,
    diasVidaCaja: 0,
    inmueblesEstudio: 0,
    inmueblesReforma: 0,
    inmueblesVenta: 0,
  });
  const [ingresos, setIngresos] = useState(0);
  const [gastos, setGastos] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar inmuebles
      const { data: inmuebles } = await supabase
        .from('inmuebles')
        .select('*');

      // Cargar finanzas
      const { data: finanzas } = await supabase
        .from('finanzas')
        .select('*');

      // Calcular KPIs
      if (inmuebles) {
        const totalActivos = inmuebles.length;
        const enEstudio = inmuebles.filter((i: any) => i.estado === 'EN_ESTUDIO').length;
        const comprados = inmuebles.filter((i: any) => i.estado === 'COMPRADO').length;

        setKpis((prev) => ({
          ...prev,
          activosTotales: totalActivos,
          inmueblesEstudio: enEstudio,
          inmueblesReforma: comprados,
        }));
      }

      if (finanzas) {
        const totalIngresos = finanzas
          .filter((f: any) => f.tipo === 'ingreso')
          .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);

        const totalGastos = finanzas
          .filter((f: any) => f.tipo === 'gasto')
          .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);

        setIngresos(totalIngresos);
        setGastos(totalGastos);

        const cashflow = totalIngresos - totalGastos;
        const margen = totalIngresos > 0 ? ((cashflow / totalIngresos) * 100) : 0;

        setKpis((prev) => ({
          ...prev,
          cashflowMensual: cashflow,
          margenOperativo: margen,
        }));
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Dashboard General</h1>
        <p className="text-wos-text-muted">Vista general de todos los indicadores</p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/wallest/activos"
          className="bg-wos-card border border-wos-border rounded-lg p-6 hover:border-wos-accent transition-smooth"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-wos-bg rounded-lg flex items-center justify-center">
              <Plus size={24} className="text-wos-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-wos-accent">Alta de Inmueble</h3>
              <p className="text-sm text-wos-text-muted">Registrar nuevo activo</p>
            </div>
          </div>
        </Link>

        <Link
          href="/wallest/calculadora"
          className="bg-wos-card border border-wos-border rounded-lg p-6 hover:border-wos-accent transition-smooth"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-wos-bg rounded-lg flex items-center justify-center">
              <Calculator size={24} className="text-wos-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-wos-accent">Calculadora de Rentabilidad</h3>
              <p className="text-sm text-wos-text-muted">Evaluar proyectos inmobiliarios</p>
            </div>
          </div>
        </Link>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Activos Totales</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{kpis.activosTotales}</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">ROI Medio</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{kpis.roiMedio.toFixed(1)}%</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Cashflow Mensual</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">
            €{kpis.cashflowMensual.toLocaleString()}
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Margen Operativo</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">
            {kpis.margenOperativo.toFixed(1)}%
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-wos-text-muted" />
            <span className="text-sm text-wos-text-muted">Días Vida Caja</span>
          </div>
          <p className="text-3xl font-bold text-wos-accent">{kpis.diasVidaCaja}</p>
        </div>
      </div>

      {/* Comparativa Ingresos vs Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-wos-accent">Ingresos vs Gastos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={20} className="text-green-500" />
                  <span className="text-sm text-wos-text-muted">Ingresos</span>
                </div>
                <span className="font-semibold text-green-500">
                  €{ingresos.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-wos-bg rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${ingresos > 0 ? (ingresos / (ingresos + gastos)) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <ArrowDownRight size={20} className="text-red-500" />
                  <span className="text-sm text-wos-text-muted">Gastos</span>
                </div>
                <span className="font-semibold text-red-500">
                  €{gastos.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-wos-bg rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${gastos > 0 ? (gastos / (ingresos + gastos)) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-wos-accent">Activos por Estado</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-wos-text-muted">En Estudio</span>
              <span className="font-semibold text-wos-accent">{kpis.inmueblesEstudio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-wos-text-muted">En Reforma</span>
              <span className="font-semibold text-wos-accent">{kpis.inmueblesReforma}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-wos-text-muted">En Venta</span>
              <span className="font-semibold text-wos-accent">{kpis.inmueblesVenta}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
