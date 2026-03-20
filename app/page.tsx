'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LineChart, DonutChart } from '@/components/Charts';
import {
  TrendingUp, DollarSign, Building2, Target,
  Wallet, Calculator, Home, Wrench, Users,
  BarChart3, PieChart, TrendingDown,
} from 'lucide-react';

type DashboardData = {
  totalInvertido: number;
  beneficioTotal: number;
  roiPromedio: number;
  proyectosTotales: number;
  proyectosActivos: number;
  proyectosFinalizados: number;
  proyectosEstudio: number;
  liquidezDisponible: number;
  wallest: { balanceMensual: number; proyeccionMensual: number; gastosFijos: number };
  renova: { rentabilidadMedia: number; avancePromedio: number; roiEstimado: number };
  nexo: { propiedadesVenta: number; propiedadesReservadas: number; tasaConversion: number };
  evolucionMensual: { month: string; ingresos: number; gastos: number }[];
  distribucionCapital: { label: string; value: number; color: string }[];
};

const emptyData: DashboardData = {
  totalInvertido: 0, beneficioTotal: 0, roiPromedio: 0,
  proyectosTotales: 0, proyectosActivos: 0, proyectosFinalizados: 0,
  proyectosEstudio: 0, liquidezDisponible: 0,
  wallest: { balanceMensual: 0, proyeccionMensual: 0, gastosFijos: 0 },
  renova: { rentabilidadMedia: 0, avancePromedio: 0, roiEstimado: 0 },
  nexo: { propiedadesVenta: 0, propiedadesReservadas: 0, tasaConversion: 0 },
  evolucionMensual: [], distribucionCapital: [],
};

function KpiCard({ label, value, sub, icon: Icon, iconColor }: {
  label: string; value: string; sub?: string;
  icon: any; iconColor: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--wos-card)', border: '1px solid var(--wos-border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-wos-text-subtle">
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconColor + '18' }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-wos-text leading-none">{value}</p>
        {sub && <p className="text-xs mt-1 text-wos-text-subtle">{sub}</p>}
      </div>
    </div>
  );
}

function AreaCard({ title, color, icon: Icon, href, children }: {
  title: string; color: string; icon: any; href: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--wos-card)', border: `1px solid ${color}30` }}
    >
      {/* Top accent */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: color + '20' }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <h3 className="text-sm font-bold text-wos-text">{title}</h3>
          </div>
          <Link
            href={href}
            className="text-xs font-medium transition-colors"
            style={{ color: color + 'aa' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = color}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = color + 'aa'}
          >
            Ver detalle →
          </Link>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}

function AreaRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--wos-border)' }}>
      <span className="text-xs text-wos-text-subtle">{label}</span>
      <span className="text-sm font-semibold" style={{ color: valueColor || 'var(--wos-text)' }}>{value}</span>
    </div>
  );
}

export default function DashboardGeneral() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        { data: inmuebles }, { data: finanzas }, { data: administracion },
        { data: reformas }, { data: comercializacion },
        { data: movimientosEmpresa }, { data: finanzasProyecto }
      ] = await Promise.all([
        supabase.from('inmuebles').select('*'),
        supabase.from('finanzas').select('*'),
        supabase.from('administracion').select('*'),
        supabase.from('reformas').select('*'),
        supabase.from('comercializacion').select('*'),
        supabase.from('movimientos_empresa').select('*'),
        supabase.from('finanzas_proyecto').select('*'),
      ]);

      const totalInvertido = (inmuebles || [])
        .filter((i: any) => i.estado === 'COMPRADO')
        .reduce((s: number, i: any) => s + (i.precio_compra || 0), 0);

      const proyectosFinalizados = (reformas || []).filter((r: any) =>
        r.estado === 'finalizado' || r.estado === 'Finalizado'
      );

      let beneficioTotal = 0;
      const roisFinalizados: number[] = [];

      for (const reforma of proyectosFinalizados) {
        const inmueble = (inmuebles || []).find((i: any) => i.id === reforma.inmueble_id);
        if (inmueble?.precio_venta && inmueble?.precio_compra) {
          const gastosProyecto = (finanzasProyecto || [])
            .filter((fp: any) => fp.reforma_id === reforma.id && fp.tipo === 'gasto')
            .reduce((s: number, fp: any) => s + (fp.total || 0), 0);
          const costoTotal = inmueble.precio_compra + (reforma.presupuesto_total || 0) + gastosProyecto;
          const beneficio = inmueble.precio_venta - costoTotal;
          beneficioTotal += beneficio;
          if (costoTotal > 0) roisFinalizados.push((beneficio / costoTotal) * 100);
        }
      }

      const roiPromedio = roisFinalizados.length > 0
        ? roisFinalizados.reduce((s, r) => s + r, 0) / roisFinalizados.length : 0;

      const liquidezDisponible =
        (administracion || []).filter((a: any) => a.tipo === 'ingreso').reduce((s: number, a: any) => s + (a.importe || 0), 0) -
        (administracion || []).filter((a: any) => a.tipo === 'gasto').reduce((s: number, a: any) => s + (a.importe || 0), 0);

      const proyectosTotales = (reformas || []).length;
      const proyectosActivos = (reformas || []).filter((r: any) =>
        r.estado === 'en_proceso' || r.estado === 'En curso' || r.estado === 'pendiente'
      ).length;
      const proyectosEstudio = (inmuebles || []).filter((i: any) => i.estado === 'EN_ESTUDIO').length;

      const totalIngresos = (finanzas || []).filter((f: any) => f.tipo === 'ingreso').reduce((s: number, f: any) => s + (f.monto || 0), 0);
      const totalGastos = (finanzas || []).filter((f: any) => f.tipo === 'gasto').reduce((s: number, f: any) => s + (f.monto || 0), 0);
      const balanceMensual = totalIngresos - totalGastos;

      const avancePromedio = (reformas || []).length > 0
        ? (reformas || []).reduce((s: number, r: any) => s + (r.avance || 0), 0) / (reformas || []).length : 0;

      const propiedadesVenta = (comercializacion || []).filter((c: any) => c.estado === 'EN_VENTA').length;
      const propiedadesReservadas = (comercializacion || []).filter((c: any) => c.estado === 'RESERVADO').length;

      const currentDate = new Date();
      const evolucionMensual = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + i, 1);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
        return {
          month: monthNames[date.getMonth()],
          ingresos: (finanzas || []).filter((f: any) => f.tipo === 'ingreso' && f.fecha >= monthStart && f.fecha <= monthEnd).reduce((s: number, f: any) => s + (f.monto || 0), 0),
          gastos: (finanzas || []).filter((f: any) => f.tipo === 'gasto' && f.fecha >= monthStart && f.fecha <= monthEnd).reduce((s: number, f: any) => s + (f.monto || 0), 0),
        };
      });

      const wallestInversion = (inmuebles || []).filter((i: any) => i.estado === 'COMPRADO').reduce((s: number, i: any) => s + (i.precio_compra || 0), 0);
      const renovaInversion = (reformas || []).reduce((s: number, r: any) => s + (r.presupuesto_total || 0), 0);
      const nexoInversion = Math.max(0, totalInvertido - wallestInversion - renovaInversion);

      setData({
        totalInvertido, beneficioTotal, roiPromedio,
        proyectosTotales, proyectosActivos,
        proyectosFinalizados: proyectosFinalizados.length,
        proyectosEstudio, liquidezDisponible,
        wallest: { balanceMensual, proyeccionMensual: balanceMensual * 1.1, gastosFijos: totalGastos * 0.7 },
        renova: { rentabilidadMedia: roiPromedio * 0.8, avancePromedio, roiEstimado: roiPromedio * 1.2 },
        nexo: { propiedadesVenta, propiedadesReservadas, tasaConversion: propiedadesVenta > 0 ? (propiedadesReservadas / propiedadesVenta) * 100 : 0 },
        evolucionMensual,
        distribucionCapital: [
          { label: 'Wallest', value: wallestInversion, color: '#F15A29' },
          { label: 'Renova', value: renovaInversion, color: '#22c55e' },
          { label: 'Nexo', value: nexoInversion, color: '#c9a84c' },
        ].filter(i => i.value > 0),
      });
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wos-bg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#F15A29] border-t-transparent" />
          <span className="text-sm text-wos-text-subtle">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wos-bg">

      {/* ── Page header ─────────────────────────────── */}
      <div className="px-6 py-6 border-b border-wos-border">
        <h1 className="text-2xl font-bold text-wos-text mb-1">Dashboard General</h1>
        <p className="text-sm text-wos-text-subtle">
          Resumen integral de operaciones, rentabilidad y rendimiento
        </p>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">

        {/* ── KPIs principales ────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Total Invertido"
            value={`€${(data.totalInvertido / 1000).toFixed(0)}k`}
            icon={DollarSign}
            iconColor="#F15A29"
          />
          <KpiCard
            label="Beneficio Total"
            value={`€${(data.beneficioTotal / 1000).toFixed(0)}k`}
            icon={TrendingUp}
            iconColor="#22c55e"
          />
          <KpiCard
            label="ROI Promedio"
            value={`${data.roiPromedio.toFixed(1)}%`}
            icon={Target}
            iconColor="#c9a84c"
          />
          <KpiCard
            label="Proyectos"
            value={`${data.proyectosTotales}`}
            sub={`${data.proyectosActivos} activos · ${data.proyectosFinalizados} finalizados`}
            icon={Building2}
            iconColor="#F15A29"
          />
          <KpiCard
            label="Liquidez"
            value={`€${(data.liquidezDisponible / 1000).toFixed(0)}k`}
            icon={Wallet}
            iconColor="#22c55e"
          />
        </div>

        {/* ── Bloques por área ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AreaCard title="Wallest" color="#F15A29" icon={Building2} href="/wallest/activos">
            <AreaRow label="Balance mensual" value={`€${(data.wallest.balanceMensual / 1000).toFixed(0)}k`} />
            <AreaRow label="Proyección mensual" value={`€${(data.wallest.proyeccionMensual / 1000).toFixed(0)}k`} valueColor="#22c55e" />
            <AreaRow label="Gastos fijos" value={`€${(data.wallest.gastosFijos / 1000).toFixed(0)}k`} valueColor="#f87171" />
          </AreaCard>

          <AreaCard title="Renova" color="#ea580c" icon={Wrench} href="/renova/reformas">
            <AreaRow label="Rentabilidad media" value={`${data.renova.rentabilidadMedia.toFixed(1)}%`} />
            <AreaRow label="Avance promedio obras" value={`${data.renova.avancePromedio.toFixed(1)}%`} valueColor="#60a5fa" />
            <AreaRow label="ROI estimado activos" value={`${data.renova.roiEstimado.toFixed(1)}%`} valueColor="#22c55e" />
          </AreaCard>

          <AreaCard title="Nexo" color="#22c55e" icon={Users} href="/nexo/leads">
            <AreaRow label="Propiedades en venta" value={`${data.nexo.propiedadesVenta}`} />
            <AreaRow label="Propiedades reservadas" value={`${data.nexo.propiedadesReservadas}`} valueColor="#60a5fa" />
            <AreaRow label="Tasa de conversión" value={`${data.nexo.tasaConversion.toFixed(0)}%`} valueColor="#22c55e" />
          </AreaCard>
        </div>

        {/* ── Gráficos ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: 'var(--wos-card)', border: '1px solid var(--wos-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} style={{ color: '#F15A29' }} />
              <h3 className="text-sm font-semibold text-wos-text">Evolución Mensual</h3>
            </div>
            <div className="overflow-x-auto">
              <LineChart data={data.evolucionMensual} height={220} />
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--wos-card)', border: '1px solid var(--wos-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={16} style={{ color: '#F15A29' }} />
              <h3 className="text-sm font-semibold text-wos-text">Distribución del Capital</h3>
            </div>
            <div className="overflow-x-auto">
              <DonutChart data={data.distribucionCapital} height={220} />
            </div>
          </div>
        </div>

        {/* ── Acciones rápidas ─────────────────────────── */}
        <div className="rounded-xl p-5" style={{ background: 'var(--wos-card)', border: '1px solid var(--wos-border)' }}>
          <h3 className="text-sm font-semibold text-wos-text mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { href: '/wallest/activos',      icon: Home,       label: 'Activos',      color: '#F15A29' },
              { href: '/wallest/calculadora',   icon: Calculator, label: 'Calculadora',  color: '#c9a84c' },
              { href: '/wallest/finanzas',      icon: DollarSign, label: 'Finanzas',     color: '#22c55e' },
              { href: '/renova/reformas',       icon: Wrench,     label: 'Reformas',     color: '#ea580c' },
              { href: '/nexo/leads',            icon: Users,      label: 'Leads',        color: '#60a5fa' },
              { href: '/wallest/administracion',icon: TrendingDown,label: 'Admin',       color: '#f87171' },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150"
                style={{ background: 'var(--wos-sidebar)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--wos-card-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--wos-sidebar)'}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: color + '18' }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-xs text-wos-text font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
