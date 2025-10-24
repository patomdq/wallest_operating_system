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
  precio_venta: number;
  roi_provisorio: number;
  roi_definitivo: number;
  fecha_fin: string | null;
  desviacion_presupuestaria: number;
  inmueble_nombre: string;
};

export default function FinanzasConsolidadas() {
  const [proyectos, setProyectos] = useState<ProyectoConsolidado[]>([]);
  const [loading, setLoading] = useState(true);
  
  // KPIs globales
  const [inversionTotal, setInversionTotal] = useState(0);
  const [gastosTotal, setGastosTotal] = useState(0);
  const [ingresosTotal, setIngresosTotal] = useState(0);
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
          .select('tipo, total')
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

        // Calcular ROI provisorio
        const inversionTotal = precioCompra + gastos;
        const roiProvisorio = inversionTotal > 0
          ? ((ingresos - inversionTotal) / inversionTotal) * 100
          : 0;

        // ROI definitivo (solo si está finalizado)
        const roiDefinitivo = reforma.estado === 'finalizada' ? roiProvisorio : 0;

        // Calcular desviación presupuestaria
        const desviacion = presupuestoPlanificado > 0
          ? ((gastos - presupuestoPlanificado) / presupuestoPlanificado) * 100
          : 0;

        proyectosConsolidados.push({
          id: reforma.id,
          nombre: reforma.nombre,
          estado: reforma.estado,
          precio_compra: precioCompra,
          fecha_compra: reforma.inmuebles?.fecha_compra || null,
          presupuesto_planificado: presupuestoPlanificado,
          gastos_reales: gastos,
          ingresos: ingresos,
          precio_venta: ingresos,
          roi_provisorio: roiProvisorio,
          roi_definitivo: roiDefinitivo,
          fecha_fin: reforma.fecha_fin,
          desviacion_presupuestaria: desviacion,
          inmueble_nombre: reforma.inmuebles?.nombre || 'Sin inmueble',
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

      // ROI promedio ponderado
      const totalInversionConGastos = totalInversion + totalGastos;
      const roiGlobal = totalInversionConGastos > 0
        ? ((totalIngresos - totalInversionConGastos) / totalInversionConGastos) * 100
        : 0;

      setInversionTotal(totalInversion);
      setGastosTotal(totalGastos);
      setIngresosTotal(totalIngresos);
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
      case 'finalizada':
        return 'bg-green-500/20 text-green-500';
      case 'en_proceso':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'finalizada':
        return 'Finalizada';
      case 'en_proceso':
        return 'En Proceso';
      default:
        return 'Planificación';
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Inversión Total</p>
            <TrendingUp className="text-wos-accent" size={20} />
          </div>
          <p className="text-3xl font-bold text-wos-text">
            €{inversionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Suma de todos los precios de compra</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Gastos Totales</p>
            <TrendingUp className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-500">
            €{gastosTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Suma de todos los gastos registrados</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Ingresos Totales</p>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            €{ingresosTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Suma de todos los ingresos (arras, ventas)</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">ROI Promedio Global</p>
            <TrendingUp className={roiPromedioGlobal >= 0 ? 'text-green-500' : 'text-red-500'} size={20} />
          </div>
          <p className={`text-3xl font-bold ${roiPromedioGlobal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {roiPromedioGlobal.toFixed(2)}%
          </p>
          <p className="text-xs text-wos-text-muted mt-2">ROI ponderado de todos los proyectos</p>
        </div>
      </div>

      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-wos-border">
          <h2 className="text-lg font-semibold text-wos-text">Proyectos Consolidados</h2>
          <p className="text-sm text-wos-text-muted mt-1">Vista detallada de todos los proyectos activos y finalizados</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-wos-text-muted">Cargando proyectos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-wos-bg border-b border-wos-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider cursor-pointer hover:text-wos-accent" onClick={() => handleSort('nombre')}>
                    Proyecto {sortColumn === 'nombre' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider cursor-pointer hover:text-wos-accent" onClick={() => handleSort('estado')}>
                    Estado {sortColumn === 'estado' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">Precio Compra</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">Fecha Compra</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">Presupuesto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">Gastos Reales</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">Ingresos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider cursor-pointer hover:text-wos-accent" onClick={() => handleSort('roi_provisorio')}>
                    ROI Provisorio {sortColumn === 'roi_provisorio' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">ROI Definitivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider cursor-pointer hover:text-wos-accent" onClick={() => handleSort('fecha_fin')}>
                    Fecha Fin {sortColumn === 'fecha_fin' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">Desviación (%)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-wos-text-muted uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wos-border">
                {sortedProyectos.map((proyecto) => (
                  <tr key={proyecto.id} className="hover:bg-wos-bg transition-smooth">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-wos-text">{proyecto.nombre}</p>
                        <p className="text-xs text-wos-text-muted">{proyecto.inmueble_nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                        {getEstadoLabel(proyecto.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-wos-text text-right">
                      €{proyecto.precio_compra.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-wos-text-muted">
                      {proyecto.fecha_compra ? new Date(proyecto.fecha_compra).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-wos-text text-right">
                      €{proyecto.presupuesto_planificado.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-500 font-medium text-right">
                      €{proyecto.gastos_reales.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-500 font-medium text-right">
                      €{proyecto.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${proyecto.roi_provisorio >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {proyecto.roi_provisorio.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right">
                      {proyecto.estado === 'finalizada' ? (
                        <span className={proyecto.roi_definitivo >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {proyecto.roi_definitivo.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-wos-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-wos-text-muted">
                      {proyecto.fecha_fin ? new Date(proyecto.fecha_fin).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-right ${getDesviacionColor(proyecto.desviacion_presupuestaria)}`}>
                      {proyecto.desviacion_presupuestaria.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/renova/finanzas-proyecto?reforma_id=${proyecto.id}`} className="flex items-center justify-center gap-1 text-wos-accent hover:opacity-80 text-sm">
                        Ver detalle <ArrowRight size={14} />
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

      <div className="mt-8 bg-wos-card border border-wos-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wos-text mb-3">ℹ️ Información sobre los cálculos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-wos-text-muted">
          <div>
            <p className="font-medium text-wos-text mb-1">ROI Provisorio:</p>
            <p>(Ingresos - (Precio Compra + Gastos)) / (Precio Compra + Gastos) × 100</p>
          </div>
          <div>
            <p className="font-medium text-wos-text mb-1">Desviación Presupuestaria:</p>
            <p>(Gastos Reales - Presupuesto Planificado) / Presupuesto Planificado × 100</p>
          </div>
          <div>
            <p className="font-medium text-wos-text mb-1">ROI Definitivo:</p>
            <p>Se muestra solo cuando el proyecto está en estado "Finalizada"</p>
          </div>
          <div>
            <p className="font-medium text-wos-text mb-1">Colores de desviación:</p>
            <p>
              <span className="text-green-500">Verde: ≤0%</span> | 
              <span className="text-yellow-500"> Amarillo: 0-20%</span> | 
              <span className="text-red-500"> Rojo: &gt;20%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
