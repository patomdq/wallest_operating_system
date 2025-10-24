'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ProyectoConsolidado = {
  id: string;
  nombre: string;
  estado: string;
  precio_compra: number;
  fecha_compra: string | null;
  presupuesto_planificado: number;
  gastos_reales: number;
  ingresos: number;
  beneficio: number;
  roi: number;
  fecha_venta: string | null;
  desviacion_presupuestaria: number;
  inmueble_nombre: string;
  tiene_venta: boolean;
};

export default function FinanzasConsolidadas() {
  const [proyectos, setProyectos] = useState<ProyectoConsolidado[]>([]);
  const [loading, setLoading] = useState(true);
  
  // KPIs globales
  const [inversionTotal, setInversionTotal] = useState(0);
  const [gastosTotal, setGastosTotal] = useState(0);
  const [ingresosTotal, setIngresosTotal] = useState(0);
  const [beneficioTotal, setBeneficioTotal] = useState(0);
  const [roiPromedioGlobal, setRoiPromedioGlobal] = useState(0);
  const [sortColumn, setSortColumn] = useState<string>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadProyectosConsolidados();
  }, []);

  const loadProyectosConsolidados = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las reformas con información del inmueble
      const { data: reformas, error: reformasError } = await supabase
        .from('reformas')
        .select(`
          id,
          nombre,
          estado,
          presupuesto,
          fecha_fin,
          inmueble_id,
          inmuebles (
            nombre,
            estado,
            precio_compra,
            fecha_compra
          )
        `);

      if (reformasError) throw reformasError;

      // Para cada reforma, obtener sus finanzas
      const proyectosConsolidados: ProyectoConsolidado[] = [];
      
      for (const reforma of reformas || []) {
        // Obtener movimientos financieros del proyecto
        const { data: movimientos } = await supabase
          .from('finanzas_proyecto')
          .select('tipo, total, categoria, fecha')
          .eq('reforma_id', reforma.id);

        // Calcular gastos e ingresos
        const gastos = movimientos
          ?.filter(m => m.tipo === 'gasto')
          .reduce((sum, m) => sum + (m.total || 0), 0) || 0;
        
        const ingresos = movimientos
          ?.filter(m => m.tipo === 'ingreso')
          .reduce((sum, m) => sum + (m.total || 0), 0) || 0;

        const precioCompra = reforma.inmuebles?.precio_compra || 0;
        const presupuestoPlanificado = reforma.presupuesto || 0;

        // Calcular beneficio
        const beneficio = ingresos - (precioCompra + gastos);

        // Calcular ROI
        const inversionTotal = precioCompra + gastos;
        const roi = inversionTotal > 0
          ? ((ingresos - inversionTotal) / inversionTotal) * 100
          : 0;

        // Detectar si tiene venta (ingresos tipo Venta o estado VENDIDO)
        const tieneVenta = reforma.inmuebles?.estado === 'VENDIDO' || 
          movimientos?.some(m => m.tipo === 'ingreso' && (m.categoria === 'Venta' || m.categoria === 'venta'));

        // Fecha de venta (buscar en movimientos o usar fecha_fin si está vendido)
        const fechaVenta = tieneVenta 
          ? (movimientos?.find(m => m.tipo === 'ingreso' && (m.categoria === 'Venta' || m.categoria === 'venta'))?.fecha || reforma.fecha_fin)
          : null;

        // Calcular desviación presupuestaria
        const desviacion = presupuestoPlanificado > 0
          ? ((gastos - presupuestoPlanificado) / presupuestoPlanificado) * 100
          : 0;

        proyectosConsolidados.push({
          id: reforma.id,
          nombre: reforma.nombre,
          estado: reforma.inmuebles?.estado || reforma.estado || 'EN_ESTUDIO',
          precio_compra: precioCompra,
          fecha_compra: reforma.inmuebles?.fecha_compra || null,
          presupuesto_planificado: presupuestoPlanificado,
          gastos_reales: gastos,
          ingresos: ingresos,
          beneficio: beneficio,
          roi: roi,
          fecha_venta: fechaVenta,
          desviacion_presupuestaria: desviacion,
          inmueble_nombre: reforma.inmuebles?.nombre || 'Sin inmueble',
          tiene_venta: tieneVenta,
        });
      }

      setProyectos(proyectosConsolidados);

      // Calcular KPIs globales
      const totalInversion = proyectosConsolidados.reduce(
        (sum, p) => sum + p.precio_compra, 0
      );
      const totalGastos = proyectosConsolidados.reduce(
        (sum, p) => sum + p.gastos_reales, 0
      );
      const totalIngresos = proyectosConsolidados.reduce(
        (sum, p) => sum + p.ingresos, 0
      );

      // Beneficio total
      const totalBeneficio = totalIngresos - (totalInversion + totalGastos);

      // ROI promedio (solo de proyectos con venta)
      const proyectosConVenta = proyectosConsolidados.filter(p => p.tiene_venta);
      const roiGlobal = proyectosConVenta.length > 0
        ? proyectosConVenta.reduce((sum, p) => sum + p.roi, 0) / proyectosConVenta.length
        : 0;

      setInversionTotal(totalInversion);
      setGastosTotal(totalGastos);
      setIngresosTotal(totalIngresos);
      setBeneficioTotal(totalBeneficio);
      setRoiPromedioGlobal(roiGlobal);

    } catch (error) {
      console.error('Error cargando proyectos consolidados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedProyectos = [...proyectos].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof ProyectoConsolidado];
    let bValue: any = b[sortColumn as keyof ProyectoConsolidado];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'VENDIDO':
        return 'bg-blue-500/20 text-blue-500';
      case 'COMPRADO':
        return 'bg-green-500/20 text-green-500';
      case 'ARRAS':
        return 'bg-orange-500/20 text-orange-500';
      case 'EN_ESTUDIO':
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'VENDIDO':
        return 'Vendido';
      case 'COMPRADO':
        return 'Comprado';
      case 'ARRAS':
        return 'Arras';
      case 'EN_ESTUDIO':
        return 'En Estudio';
      default:
        return estado;
    }
  };

  const getDesviacionColor = (desv: number) => {
    if (desv <= 0) return 'text-green-500';
    if (desv <= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-wos-accent mb-2">Finanzas</h1>
        <p className="text-wos-text-muted">Panel consolidado de todos los proyectos</p>
      </div>

      {/* KPIs Globales - 5 tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-wos-text-muted">Inversión Total</p>
            <TrendingUp className="text-wos-accent" size={16} />
          </div>
          <p className="text-2xl font-bold text-wos-text">
            {inversionTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-wos-text-muted">Gastos Totales</p>
            <TrendingUp className="text-red-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-red-500">
            {gastosTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-wos-text-muted">Ingresos Totales</p>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-green-500">
            {ingresosTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-wos-text-muted">Beneficio Total</p>
            <TrendingUp className={beneficioTotal >= 0 ? 'text-green-500' : 'text-red-500'} size={16} />
          </div>
          <p className={`text-2xl font-bold ${beneficioTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {beneficioTotal.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-wos-text-muted">ROI Promedio</p>
            <TrendingUp className={roiPromedioGlobal >= 0 ? 'text-green-500' : 'text-red-500'} size={16} />
          </div>
          <p className={`text-2xl font-bold ${roiPromedioGlobal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {roiPromedioGlobal.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Tabla Consolidada */}
      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-wos-border">
          <h2 className="text-lg font-semibold text-wos-text">Proyectos Consolidados</h2>
          <p className="text-sm text-wos-text-muted mt-1">Vista detallada de todos los proyectos</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-wos-text-muted">Cargando proyectos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-wos-bg border-b border-wos-border">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-wos-text-muted uppercase cursor-pointer hover:text-wos-accent" onClick={() => handleSort('nombre')}>
                    Proyecto {sortColumn === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase cursor-pointer hover:text-wos-accent" onClick={() => handleSort('estado')}>
                    Estado {sortColumn === 'estado' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-wos-text-muted uppercase">Precio Compra</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase">F. Compra</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-wos-text-muted uppercase">Presupuesto</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-wos-text-muted uppercase">Gastos</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-wos-text-muted uppercase">Ingresos</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-wos-text-muted uppercase cursor-pointer hover:text-wos-accent" onClick={() => handleSort('beneficio')}>
                    Beneficio {sortColumn === 'beneficio' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase cursor-pointer hover:text-wos-accent" onClick={() => handleSort('roi')}>
                    ROI (%) {sortColumn === 'roi' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase">F. Venta</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase">Desv. (%)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-wos-text-muted uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wos-border">
                {sortedProyectos.map((proyecto) => (
                  <tr key={proyecto.id} className="hover:bg-wos-bg transition-smooth">
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-wos-text">{proyecto.nombre}</p>
                        <p className="text-xs text-wos-text-muted">{proyecto.inmueble_nombre}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                        {getEstadoLabel(proyecto.estado)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-wos-text text-right whitespace-nowrap">
                      {proyecto.precio_compra.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-3 py-2 text-wos-text-muted text-center">
                      {proyecto.fecha_compra ? new Date(proyecto.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                    </td>
                    <td className="px-3 py-2 text-wos-text text-right whitespace-nowrap">
                      {proyecto.presupuesto_planificado.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-3 py-2 text-red-500 font-medium text-right whitespace-nowrap">
                      {proyecto.gastos_reales.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-3 py-2 text-green-500 font-medium text-right whitespace-nowrap">
                      {proyecto.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className={`px-3 py-2 font-bold text-right whitespace-nowrap ${proyecto.beneficio >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {proyecto.beneficio.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-3 py-2 text-center">
                      {proyecto.tiene_venta ? (
                        <span className={`font-bold ${proyecto.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {proyecto.roi.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {proyecto.roi.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-wos-text-muted text-center">
                      {proyecto.fecha_venta ? new Date(proyecto.fecha_venta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                    </td>
                    <td className={`px-3 py-2 font-medium text-center ${getDesviacionColor(proyecto.desviacion_presupuestaria)}`}>
                      {proyecto.desviacion_presupuestaria.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Link href={`/renova/finanzas-proyecto?reforma_id=${proyecto.id}`} className="inline-flex items-center gap-1 text-wos-accent hover:opacity-80">
                        Ver <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedProyectos.length === 0 && !loading && (
              <div className="text-center py-12 text-wos-text-muted">No hay proyectos registrados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
