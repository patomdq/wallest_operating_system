'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LineChart, DonutChart } from '@/components/Charts';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Target,
  Wallet,
  Calculator,
  Home,
  Wrench,
  Users,
  BarChart3,
  PieChart,
  TrendingDown,
} from 'lucide-react';

type DashboardData = {
  // KPIs principales
  totalInvertido: number;
  beneficioTotal: number;
  roiPromedio: number;
  proyectosTotales: number;
  proyectosActivos: number;
  proyectosFinalizados: number;
  proyectosEstudio: number;
  liquidezDisponible: number;

  // Datos por área
  wallest: {
    balanceMensual: number;
    proyeccionMensual: number;
    gastosFijos: number;
  };
  renova: {
    rentabilidadMedia: number;
    avancePromedio: number;
    roiEstimado: number;
  };
  nexo: {
    propiedadesVenta: number;
    propiedadesReservadas: number;
    tasaConversion: number;
  };

  // Datos para gráficos
  evolucionMensual: { month: string; ingresos: number; gastos: number }[];
  distribucionCapital: { label: string; value: number; color: string }[];
};

export default function DashboardGeneral() {
  const [data, setData] = useState<DashboardData>({
    totalInvertido: 0,
    beneficioTotal: 0,
    roiPromedio: 0,
    proyectosTotales: 0,
    proyectosActivos: 0,
    proyectosFinalizados: 0,
    proyectosEstudio: 0,
    liquidezDisponible: 0,
    wallest: {
      balanceMensual: 0,
      proyeccionMensual: 0,
      gastosFijos: 0,
    },
    renova: {
      rentabilidadMedia: 0,
      avancePromedio: 0,
      roiEstimado: 0,
    },
    nexo: {
      propiedadesVenta: 0,
      propiedadesReservadas: 0,
      tasaConversion: 0,
    },
    evolucionMensual: [],
    distribucionCapital: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos de todas las tablas con nombres correctos
      const [
        { data: inmuebles },
        { data: finanzas },
        { data: administracion },
        { data: reformas },
        { data: proyectoRentabilidad },
        { data: comercializacion },
        { data: leads },
        { data: movimientosEmpresa },
        { data: finanzasProyecto }
      ] = await Promise.all([
        supabase.from('inmuebles').select('*'),
        supabase.from('finanzas').select('*'),
        supabase.from('administracion').select('*'),
        supabase.from('reformas').select('*'),
        supabase.from('proyecto_rentabilidad').select('*'),
        supabase.from('comercializacion').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('movimientos_empresa').select('*'),
        supabase.from('finanzas_proyecto').select('*')
      ]);

      // 1️⃣ Total Invertido: Solo activos con estado "COMPRADO"
      const totalInvertido = (inmuebles || [])
        .filter((i: any) => i.estado === 'COMPRADO')
        .reduce((sum: number, i: any) => sum + (i.precio_compra || 0), 0);

      // 2️⃣ Beneficio Total: (precio_venta - costo_total) para proyectos finalizados/vendidos
      let beneficioTotal = 0;
      const proyectosFinalizados = (reformas || []).filter((r: any) => 
        r.estado === 'finalizado' || r.estado === 'Finalizado'
      );

      // Calcular beneficio por cada proyecto finalizado
      for (const reforma of proyectosFinalizados) {
        // Buscar el inmueble asociado
        const inmueble = (inmuebles || []).find((i: any) => i.id === reforma.inmueble_id);
        if (inmueble && inmueble.precio_venta && inmueble.precio_compra) {
          // Calcular costos totales del proyecto (precio compra + reforma + otros gastos)
          const costoCompra = inmueble.precio_compra || 0;
          const costoReforma = reforma.presupuesto_total || 0;
          
          // Obtener gastos adicionales del proyecto desde finanzas_proyecto
          const gastosProyecto = (finanzasProyecto || [])
            .filter((fp: any) => fp.reforma_id === reforma.id && fp.tipo === 'gasto')
            .reduce((sum: number, fp: any) => sum + (fp.total || 0), 0);
          
          const costoTotal = costoCompra + costoReforma + gastosProyecto;
          const beneficio = inmueble.precio_venta - costoTotal;
          beneficioTotal += beneficio;
        }
      }

      // 3️⃣ Liquidez: Saldo actual de administración
      const liquidezDisponible = (administracion || [])
        .filter((a: any) => a.tipo === 'ingreso')
        .reduce((sum: number, a: any) => sum + (a.importe || 0), 0) -
        (administracion || [])
        .filter((a: any) => a.tipo === 'gasto')
        .reduce((sum: number, a: any) => sum + (a.importe || 0), 0);

      // 4️⃣ ROI Promedio: Promedio de ROI de proyectos finalizados
      let roiPromedio = 0;
      const roisFinalizados: number[] = [];
      
      for (const reforma of proyectosFinalizados) {
        const inmueble = (inmuebles || []).find((i: any) => i.id === reforma.inmueble_id);
        if (inmueble && inmueble.precio_venta && inmueble.precio_compra) {
          const costoCompra = inmueble.precio_compra || 0;
          const costoReforma = reforma.presupuesto_total || 0;
          const gastosProyecto = (finanzasProyecto || [])
            .filter((fp: any) => fp.reforma_id === reforma.id && fp.tipo === 'gasto')
            .reduce((sum: number, fp: any) => sum + (fp.total || 0), 0);
          
          const costoTotal = costoCompra + costoReforma + gastosProyecto;
          if (costoTotal > 0) {
            const roi = ((inmueble.precio_venta - costoTotal) / costoTotal) * 100;
            roisFinalizados.push(roi);
          }
        }
      }
      
      roiPromedio = roisFinalizados.length > 0 
        ? roisFinalizados.reduce((sum, roi) => sum + roi, 0) / roisFinalizados.length
        : 0;

      // 5️⃣ Conteo de proyectos según estado en reformas
      const proyectosTotales = (reformas || []).length;
      const proyectosActivos = (reformas || []).filter((r: any) => 
        r.estado === 'en_proceso' || r.estado === 'En curso' || r.estado === 'pendiente'
      ).length;
      const proyectosFinalizadosCount = proyectosFinalizados.length;
      const proyectosEstudio = (inmuebles || []).filter((i: any) => 
        i.estado === 'EN_ESTUDIO'
      ).length;

      // Datos Wallest (basado en finanzas generales)
      const totalIngresos = (finanzas || [])
        .filter((f: any) => f.tipo === 'ingreso')
        .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);
      
      const totalGastos = (finanzas || [])
        .filter((f: any) => f.tipo === 'gasto')
        .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);

      const balanceMensual = totalIngresos - totalGastos;

      // Datos Renova
      const renovaReformas = reformas || [];
      const avancePromedio = renovaReformas.length > 0
        ? renovaReformas.reduce((sum: number, r: any) => sum + (r.avance || 0), 0) / renovaReformas.length
        : 0;

      // Datos Nexo
      const propiedadesVenta = (comercializacion || []).filter((c: any) => 
        c.estado === 'EN_VENTA'
      ).length;
      const propiedadesReservadas = (comercializacion || []).filter((c: any) => 
        c.estado === 'RESERVADO'
      ).length;

      // Evolución mensual con datos reales por mes
      const currentDate = new Date();
      const evolucionMensual = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + i, 1);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        // Filtrar ingresos y gastos por mes
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const ingresosDelMes = (finanzas || [])
          .filter((f: any) => f.tipo === 'ingreso' && f.fecha >= monthStart && f.fecha <= monthEnd)
          .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);
          
        const gastosDelMes = (finanzas || [])
          .filter((f: any) => f.tipo === 'gasto' && f.fecha >= monthStart && f.fecha <= monthEnd)
          .reduce((sum: number, f: any) => sum + (f.monto || 0), 0);
        
        return {
          month: monthNames[date.getMonth()],
          ingresos: ingresosDelMes,
          gastos: gastosDelMes,
        };
      });

      // Distribución del capital por área real
      const wallestInversion = (inmuebles || [])
        .filter((i: any) => i.estado === 'COMPRADO')
        .reduce((sum: number, i: any) => sum + (i.precio_compra || 0), 0);
      
      const renovaInversion = (reformas || [])
        .reduce((sum: number, r: any) => sum + (r.presupuesto_total || 0), 0);
      
      const nexoInversion = Math.max(0, totalInvertido - wallestInversion - renovaInversion);

      const distribucionCapital = [
        { label: 'Wallest (Compras)', value: wallestInversion, color: '#3B82F6' },
        { label: 'Renova (Reformas)', value: renovaInversion, color: '#10B981' },
        { label: 'Nexo (Comercial)', value: nexoInversion, color: '#F59E0B' },
      ].filter(item => item.value > 0);

      setData({
        totalInvertido,
        beneficioTotal,
        roiPromedio,
        proyectosTotales,
        proyectosActivos,
        proyectosFinalizados: proyectosFinalizadosCount,
        proyectosEstudio,
        liquidezDisponible,
        wallest: {
          balanceMensual,
          proyeccionMensual: balanceMensual * 1.1,
          gastosFijos: totalGastos * 0.7,
        },
        renova: {
          rentabilidadMedia: roiPromedio * 0.8,
          avancePromedio,
          roiEstimado: roiPromedio * 1.2,
        },
        nexo: {
          propiedadesVenta,
          propiedadesReservadas,
          tasaConversion: propiedadesVenta > 0 ? (propiedadesReservadas / propiedadesVenta) * 100 : 0,
        },
        evolucionMensual,
        distribucionCapital,
      });
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wos-bg flex items-center justify-center">
        <div className="text-wos-text-muted">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wos-bg">
      {/* Header */}
      <div className="bg-wos-card border-b border-wos-border p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-wos-accent mb-2">
            Dashboard General WOS
          </h1>
          <p className="text-sm md:text-base text-wos-text-muted">
            Resumen integral de operaciones, rentabilidad y rendimiento de la compañía
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-wos-text-muted font-medium">💰 Total Invertido</p>
                <p className="text-xl font-bold text-wos-accent">
                  €{(data.totalInvertido / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-wos-text-muted font-medium">📈 Beneficio Total</p>
                <p className="text-xl font-bold text-wos-accent">
                  €{(data.beneficioTotal / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-wos-text-muted font-medium">🎯 ROI Promedio</p>
                <p className="text-xl font-bold text-wos-accent">
                  {data.roiPromedio.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Building2 size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-wos-text-muted font-medium">🏗️ Proyectos</p>
                <p className="text-xl font-bold text-wos-accent">{data.proyectosTotales}</p>
                <p className="text-xs text-wos-text-muted">
                  {data.proyectosActivos} activos / {data.proyectosFinalizados} final.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wos-card border border-wos-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Wallet size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-wos-text-muted font-medium">💳 Liquidez</p>
                <p className="text-xl font-bold text-wos-accent">
                  €{(data.liquidezDisponible / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloques por área */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Wallest */}
          <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <Building2 size={20} className="text-blue-600 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-blue-600">🔸 Wallest</h3>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Balance mensual</p>
                <p className="text-xl md:text-2xl font-bold text-wos-accent">
                  €{(data.wallest.balanceMensual / 1000).toFixed(0)}k
                </p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Proyección mensual</p>
                <p className="text-base md:text-lg font-semibold text-green-500">
                  €{(data.wallest.proyeccionMensual / 1000).toFixed(0)}k
                </p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Gastos fijos principales</p>
                <p className="text-base md:text-lg font-semibold text-red-500">
                  €{(data.wallest.gastosFijos / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
            
            <Link 
              href="/wallest/activos" 
              className="mt-4 text-blue-600 text-sm font-medium hover:underline inline-block"
            >
              Ver detalle →
            </Link>
          </div>

          {/* Renova */}
          <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-green-50 rounded-lg flex-shrink-0">
                <Wrench size={20} className="text-green-600 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-green-600">🔸 Renova</h3>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Rentabilidad media</p>
                <p className="text-xl md:text-2xl font-bold text-wos-accent">
                  {data.renova.rentabilidadMedia.toFixed(1)}%
                </p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Avance promedio obras</p>
                <p className="text-base md:text-lg font-semibold text-blue-500">
                  {data.renova.avancePromedio.toFixed(1)}%
                </p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">ROI estimado activos</p>
                <p className="text-base md:text-lg font-semibold text-green-500">
                  {data.renova.roiEstimado.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <Link 
              href="/renova/reformas" 
              className="mt-4 text-green-600 text-sm font-medium hover:underline inline-block"
            >
              Ver detalle →
            </Link>
          </div>

          {/* Nexo */}
          <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-orange-50 rounded-lg flex-shrink-0">
                <Users size={20} className="text-orange-600 md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-orange-600">🔸 Nexo</h3>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Propiedades en venta</p>
                <p className="text-xl md:text-2xl font-bold text-wos-accent">{data.nexo.propiedadesVenta}</p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Propiedades reservadas</p>
                <p className="text-base md:text-lg font-semibold text-blue-500">{data.nexo.propiedadesReservadas}</p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-wos-text-muted mb-1">Tasa de conversión</p>
                <p className="text-base md:text-lg font-semibold text-green-500">
                  {data.nexo.tasaConversion}%
                </p>
              </div>
            </div>
            
            <Link 
              href="/nexo/leads" 
              className="mt-4 text-orange-600 text-sm font-medium hover:underline inline-block"
            >
              Ver detalle →
            </Link>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Evolución mensual */}
          <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <BarChart3 size={18} className="text-wos-accent flex-shrink-0 md:w-5 md:h-5" />
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-wos-accent">
                📊 Evolución Mensual
              </h3>
            </div>
            <div className="overflow-x-auto">
              <LineChart data={data.evolucionMensual} height={250} />
            </div>
          </div>

          {/* Distribución del capital */}
          <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <PieChart size={18} className="text-wos-accent flex-shrink-0 md:w-5 md:h-5" />
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-wos-accent">
                🧩 Distribución del Capital
              </h3>
            </div>
            <div className="overflow-x-auto">
              <DonutChart data={data.distribucionCapital} height={250} />
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-wos-card border border-wos-border rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-wos-accent text-center">Acciones Rápidas</h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
              <Link
                href="/wallest/activos"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <Home size={20} className="text-blue-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Activos</span>
              </Link>

              <Link
                href="/wallest/calculadora"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <Calculator size={20} className="text-purple-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Calculadora</span>
              </Link>

              <Link
                href="/wallest/finanzas"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <DollarSign size={20} className="text-green-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Finanzas</span>
              </Link>

              <Link
                href="/renova/reformas"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <Wrench size={20} className="text-orange-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Reformas</span>
              </Link>

              <Link
                href="/nexo/leads"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <Users size={20} className="text-indigo-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Leads</span>
              </Link>

              <Link
                href="/wallest/administracion"
                className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-wos-bg rounded-lg hover:bg-wos-border transition-colors"
              >
                <TrendingDown size={20} className="text-red-600 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-medium text-wos-text text-center">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
