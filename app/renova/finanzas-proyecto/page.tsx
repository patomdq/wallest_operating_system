'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type FinanzaProyecto = {
  id: string;
  reforma_id: string;
  fecha: string;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  descripcion: string;
  proveedor: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  forma_pago: string;
  observaciones: string;
  created_at?: string;
  updated_at?: string;
};

export default function FinanzasProyectoPage() {
  const searchParams = useSearchParams();
  const reformaIdFromUrl = searchParams.get('reforma_id');

  const [movimientos, setMovimientos] = useState<FinanzaProyecto[]>([]);
  const [reformas, setReformas] = useState<any[]>([]);
  const [reformaSeleccionada, setReformaSeleccionada] = useState(reformaIdFromUrl || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // KPIs
  const [precioCompra, setPrecioCompra] = useState(0);
  const [gastosReforma, setGastosReforma] = useState(0);
  const [ingresosReforma, setIngresosReforma] = useState(0);
  const [roi, setRoi] = useState(0);
  const [desviacion, setDesviacion] = useState(0);
  const [presupuestoPlanificado, setPresupuestoPlanificado] = useState(0);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'gasto' as 'ingreso' | 'gasto',
    categoria: 'Materiales',
    descripcion: '',
    proveedor: '',
    cantidad: '',
    precio_unitario: '',
    total: '',
    forma_pago: '',
    observaciones: '',
  });

  useEffect(() => {
    loadReformas();
  }, []);

  useEffect(() => {
    if (reformaSeleccionada) {
      loadMovimientos();
      loadKPIs();
    }
  }, [reformaSeleccionada]);

  useEffect(() => {
    if (reformaIdFromUrl && reformas.length > 0) {
      setReformaSeleccionada(reformaIdFromUrl);
    }
  }, [reformaIdFromUrl, reformas]);

  const loadReformas = async () => {
    const { data, error } = await supabase
      .from('reformas')
      .select('*, inmuebles(nombre, estado)')
      .order('created_at', { ascending: false });
    
    if (!error && data) setReformas(data);
  };

  const loadMovimientos = async () => {
    const { data } = await supabase
      .from('finanzas_proyecto')
      .select('*')
      .eq('reforma_id', reformaSeleccionada)
      .order('fecha', { ascending: false });
    
    if (data) setMovimientos(data);
  };

  const loadKPIs = async () => {
    // Cargar precio de compra del inmueble
    const { data: reforma } = await supabase
      .from('reformas')
      .select('*, inmuebles(precio_compra)')
      .eq('id', reformaSeleccionada)
      .single();
    
    if (reforma?.inmuebles) {
      setPrecioCompra(reforma.inmuebles.precio_compra || 0);
    }

    // Cargar presupuesto planificado
    const { data: partidas } = await supabase
      .from('planificacion_reforma')
      .select('costo')
      .eq('reforma_id', reformaSeleccionada);
    
    if (partidas) {
      const planificado = partidas.reduce((sum, p) => sum + (p.costo || 0), 0);
      setPresupuestoPlanificado(planificado);
    }

    // Calcular gastos e ingresos
    const { data: finanzas } = await supabase
      .from('finanzas_proyecto')
      .select('tipo, total')
      .eq('reforma_id', reformaSeleccionada);
    
    if (finanzas) {
      const gastos = finanzas
        .filter(f => f.tipo === 'gasto')
        .reduce((sum, f) => sum + (f.total || 0), 0);
      
      const ingresos = finanzas
        .filter(f => f.tipo === 'ingreso')
        .reduce((sum, f) => sum + (f.total || 0), 0);
      
      setGastosReforma(gastos);
      setIngresosReforma(ingresos);

      // Calcular ROI
      const precioCompraActual = reforma?.inmuebles?.precio_compra || 0;
      const inversionTotal = precioCompraActual + gastos;
      const roiCalculado = inversionTotal > 0 
        ? ((ingresos - inversionTotal) / inversionTotal) * 100 
        : 0;
      setRoi(roiCalculado);

      // Calcular desviación presupuestaria
      const planificado = partidas?.reduce((sum: number, p: any) => sum + (p.costo || 0), 0) || 0;
      const desviacionCalculada = planificado > 0 
        ? ((gastos - planificado) / planificado) * 100 
        : 0;
      setDesviacion(desviacionCalculada);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      reforma_id: reformaSeleccionada,
      fecha: formData.fecha,
      tipo: formData.tipo,
      categoria: formData.categoria,
      descripcion: formData.descripcion,
      proveedor: formData.proveedor,
      cantidad: parseFloat(formData.cantidad) || 0,
      precio_unitario: parseFloat(formData.precio_unitario) || 0,
      total: parseFloat(formData.total) || 0,
      forma_pago: formData.forma_pago,
      observaciones: formData.observaciones,
    };

    if (editingId) {
      await supabase
        .from('finanzas_proyecto')
        .update(dataToSave)
        .eq('id', editingId);
    } else {
      await supabase
        .from('finanzas_proyecto')
        .insert([dataToSave]);
    }

    resetForm();
    loadMovimientos();
    loadKPIs();
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'gasto',
      categoria: 'Materiales',
      descripcion: '',
      proveedor: '',
      cantidad: '',
      precio_unitario: '',
      total: '',
      forma_pago: '',
      observaciones: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (movimiento: FinanzaProyecto) => {
    setFormData({
      fecha: movimiento.fecha,
      tipo: movimiento.tipo,
      categoria: movimiento.categoria,
      descripcion: movimiento.descripcion,
      proveedor: movimiento.proveedor,
      cantidad: movimiento.cantidad.toString(),
      precio_unitario: movimiento.precio_unitario.toString(),
      total: movimiento.total.toString(),
      forma_pago: movimiento.forma_pago,
      observaciones: movimiento.observaciones,
    });
    setEditingId(movimiento.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este movimiento?')) {
      await supabase.from('finanzas_proyecto').delete().eq('id', id);
      loadMovimientos();
      loadKPIs();
    }
  };

  const totalGastos = movimientos
    .filter(m => m.tipo === 'gasto')
    .reduce((sum, m) => sum + (m.total || 0), 0);

  const totalIngresos = movimientos
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + (m.total || 0), 0);

  const getDesviacionColor = (desv: number) => {
    if (desv <= 0) return 'text-green-500';
    if (desv <= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const estadoIcon = (estado?: string) => {
    switch (estado) {
      case 'COMPRADO':   return '🟢';
      case 'ARRAS':      return '🟠';
      case 'VENDIDO':    return '🔵';
      case 'EN_ESTUDIO':
      default:           return '🟡';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">
            Finanzas de Proyecto
          </h1>
          <p className="text-wos-text-muted">
            Control financiero detallado por reforma
          </p>
        </div>
        {reformaSeleccionada && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Plus size={20} />
            Nueva partida financiera
          </button>
        )}
      </div>

      {/* Selector de Reforma */}
      <div className="mb-8">
        <label className="block text-sm text-wos-text-muted mb-2">
          Selecciona una reforma
        </label>
        <select
          value={reformaSeleccionada}
          onChange={(e) => setReformaSeleccionada(e.target.value)}
          className="w-full bg-wos-card border border-wos-border rounded-lg px-4 py-3 text-wos-text focus:outline-none focus:border-wos-accent"
        >
          <option value="">-- Selecciona una reforma --</option>
          {reformas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} — {r.inmuebles?.nombre} — {estadoIcon(r.inmuebles?.estado)} {r.inmuebles?.estado}
            </option>
          ))}
        </select>
      </div>

      {reformaSeleccionada && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-wos-card border border-wos-border rounded-lg p-6">
              <p className="text-sm text-wos-text-muted mb-2">Precio de compra</p>
              <p className="text-3xl font-bold text-wos-text">
                €{precioCompra.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-wos-card border border-wos-border rounded-lg p-6">
              <p className="text-sm text-wos-text-muted mb-2">Gastos totales</p>
              <p className="text-3xl font-bold text-red-500">
                €{gastosReforma.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-wos-card border border-wos-border rounded-lg p-6">
              <p className="text-sm text-wos-text-muted mb-2">Ingresos totales</p>
              <p className="text-3xl font-bold text-green-500">
                €{ingresosReforma.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-wos-card border border-wos-border rounded-lg p-6">
              <p className="text-sm text-wos-text-muted mb-2">ROI estimado (%)</p>
              <p className={`text-3xl font-bold ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {roi.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Desviación presupuestaria */}
          <div className="mb-8">
            <div className="bg-wos-card border border-wos-border rounded-lg p-6">
              <p className="text-sm text-wos-text-muted mb-2">
                Desviación presupuestaria (Planificado: €{presupuestoPlanificado.toLocaleString('es-ES')})
              </p>
              <p className={`text-3xl font-bold ${getDesviacionColor(desviacion)}`}>
                {desviacion.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-wos-text mb-4">
                {editingId ? 'Editar partida' : 'Nueva partida financiera'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'ingreso' | 'gasto' })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  >
                    <option value="Materiales">Materiales</option>
                    <option value="Mano de obra">Mano de obra</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Impuestos">Impuestos</option>
                    <option value="Venta">Venta</option>
                    <option value="Arras">Arras</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cantidad}
                    onChange={(e) => {
                      const cantidad = e.target.value;
                      const precio = formData.precio_unitario;
                      const total = cantidad && precio ? (parseFloat(cantidad) * parseFloat(precio)).toFixed(2) : '';
                      setFormData({ ...formData, cantidad, total });
                    }}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Precio unitario (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => {
                      const precio = e.target.value;
                      const cantidad = formData.cantidad;
                      const total = cantidad && precio ? (parseFloat(cantidad) * parseFloat(precio)).toFixed(2) : '';
                      setFormData({ ...formData, precio_unitario: precio, total });
                    }}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Total (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Forma de pago
                  </label>
                  <input
                    type="text"
                    value={formData.forma_pago}
                    onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-wos-text-muted mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-wos-bg border border-wos-border text-wos-text px-4 py-2 rounded-lg hover:bg-wos-card"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabla de movimientos */}
          <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-wos-bg border-b border-wos-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Forma pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Observaciones
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-wos-text-muted uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wos-border">
                  {movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-wos-bg transition-smooth">
                      <td className="px-4 py-3 text-sm text-wos-text">
                        {new Date(m.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`${m.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'} font-medium`}>
                          {m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-wos-text">{m.categoria}</td>
                      <td className="px-4 py-3 text-sm text-wos-text">{m.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-wos-text">{m.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-wos-text text-right">{m.cantidad}</td>
                      <td className="px-4 py-3 text-sm text-wos-text text-right">
                        €{m.precio_unitario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${m.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'}`}>
                        €{m.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-wos-text">{m.forma_pago}</td>
                      <td className="px-4 py-3 text-sm text-wos-text">{m.observaciones}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(m)}
                            className="text-wos-accent hover:opacity-80"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-red-500 hover:opacity-80"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-wos-bg border-t-2 border-wos-border">
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-wos-text text-right">
                      Total Gastos:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-red-500 text-right">
                      €{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-wos-text text-right">
                      Total Ingresos:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-500 text-right">
                      €{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {movimientos.length === 0 && (
              <div className="text-center py-12 text-wos-text-muted">
                No hay movimientos financieros registrados para esta reforma
              </div>
            )}
          </div>
        </>
      )}

      {!reformaSeleccionada && (
        <div className="text-center py-12 text-wos-text-muted">
          Selecciona una reforma para ver sus finanzas
        </div>
      )}
    </div>
  );
}
