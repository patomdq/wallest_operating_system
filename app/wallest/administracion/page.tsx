'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Filter, TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';

type MovimientoEmpresa = {
  id: string;
  fecha: string;
  tipo: 'Ingreso' | 'Gasto';
  categoria: string;
  concepto: string;
  monto: number;
  cuenta: string;
  forma_pago: string;
  proyecto_id?: string | null;
  proveedor?: string | null;
  observaciones?: string | null;
  created_at?: string;
  proyecto_nombre?: string;
};

// Categorías predefinidas
const CATEGORIAS = [
  'Materiales',
  'Servicios',
  'Impuestos',
  'Sueldos',
  'Honorarios',
  'Suministros',
  'Seguros',
  'Gestoría',
  'Notaría',
  'Registro',
  'Comunidad',
  'Legal',
  'Contable',
  'Marketing',
  'Comisiones',
  'Arras',
  'Ventas',
  'Saldo Inicial',
  'Otros'
];

const FORMAS_PAGO = [
  'Efectivo',
  'Débito',
  'Crédito',
  'Transferencia',
  'Bizum',
  'Cheque'
];

const CUENTAS = [
  'Banco Sabadell',
  'BBVA',
  'CaixaBank',
  'Santander',
  'Caja',
  'Otra'
];

export default function AdministracionPage() {
  const [movimientos, setMovimientos] = useState<MovimientoEmpresa[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // KPIs
  const [saldoActual, setSaldoActual] = useState(0);
  const [gastosMes, setGastosMes] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [balanceMes, setBalanceMes] = useState(0);

  // Filtros
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroCuenta, setFiltroCuenta] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Gasto' as 'Ingreso' | 'Gasto',
    categoria: '',
    concepto: '',
    monto: '',
    cuenta: '',
    forma_pago: '',
    proyecto_id: '',
    proveedor: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calcularKPIs();
  }, [movimientos]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar movimientos
      const { data: movimientosData } = await supabase
        .from('movimientos_empresa')
        .select('*')
        .order('fecha', { ascending: false });

      // Cargar proyectos
      const { data: proyectosData } = await supabase
        .from('reformas')
        .select('id, nombre, inmuebles(nombre)')
        .order('nombre');

      if (movimientosData) {
        // Enriquecer con nombre de proyecto
        const movimientosConProyecto = movimientosData.map(mov => {
          const proyecto = proyectosData?.find(p => p.id === mov.proyecto_id);
          return {
            ...mov,
            proyecto_nombre: proyecto ? `${proyecto.nombre} (${proyecto.inmuebles?.nombre})` : null
          };
        });
        setMovimientos(movimientosConProyecto);
      }

      if (proyectosData) setProyectos(proyectosData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularKPIs = () => {
    // Saldo actual (todos los ingresos - todos los gastos)
    const ingresos = movimientos
      .filter(m => m.tipo === 'Ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const gastos = movimientos
      .filter(m => m.tipo === 'Gasto')
      .reduce((sum, m) => sum + m.monto, 0);
    
    setSaldoActual(ingresos - gastos);

    // Gastos e ingresos del mes actual
    const now = new Date();
    const mesActual = now.getMonth();
    const añoActual = now.getFullYear();

    const gastosMesActual = movimientos
      .filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Gasto' && 
               fecha.getMonth() === mesActual && 
               fecha.getFullYear() === añoActual;
      })
      .reduce((sum, m) => sum + m.monto, 0);

    const ingresosMesActual = movimientos
      .filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Ingreso' && 
               fecha.getMonth() === mesActual && 
               fecha.getFullYear() === añoActual;
      })
      .reduce((sum, m) => sum + m.monto, 0);

    setGastosMes(gastosMesActual);
    setIngresosMes(ingresosMesActual);
    setBalanceMes(ingresosMesActual - gastosMesActual);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      fecha: formData.fecha,
      tipo: formData.tipo,
      categoria: formData.categoria,
      concepto: formData.concepto,
      monto: parseFloat(formData.monto) || 0,
      cuenta: formData.cuenta,
      forma_pago: formData.forma_pago,
      proyecto_id: formData.proyecto_id || null,
      proveedor: formData.proveedor || null,
      observaciones: formData.observaciones || null
    };

    try {
      if (editingId) {
        await supabase
          .from('movimientos_empresa')
          .update(dataToSave)
          .eq('id', editingId);
      } else {
        await supabase
          .from('movimientos_empresa')
          .insert([dataToSave]);

        // Si está vinculado a un proyecto, también crear en finanzas_proyecto
        if (formData.proyecto_id) {
          await supabase
            .from('finanzas_proyecto')
            .insert([{
              reforma_id: formData.proyecto_id,
              fecha: formData.fecha,
              tipo: formData.tipo.toLowerCase(),
              categoria: formData.categoria,
              descripcion: formData.concepto,
              proveedor: formData.proveedor || '',
              cantidad: 1,
              precio_unitario: parseFloat(formData.monto) || 0,
              total: parseFloat(formData.monto) || 0,
              forma_pago: formData.forma_pago,
              observaciones: formData.observaciones || ''
            }]);
        }
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando movimiento:', error);
      alert('Error al guardar el movimiento');
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Gasto',
      categoria: '',
      concepto: '',
      monto: '',
      cuenta: '',
      forma_pago: '',
      proyecto_id: '',
      proveedor: '',
      observaciones: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (movimiento: MovimientoEmpresa) => {
    setFormData({
      fecha: movimiento.fecha,
      tipo: movimiento.tipo,
      categoria: movimiento.categoria,
      concepto: movimiento.concepto,
      monto: movimiento.monto.toString(),
      cuenta: movimiento.cuenta,
      forma_pago: movimiento.forma_pago,
      proyecto_id: movimiento.proyecto_id || '',
      proveedor: movimiento.proveedor || '',
      observaciones: movimiento.observaciones || ''
    });
    setEditingId(movimiento.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este movimiento?')) {
      await supabase.from('movimientos_empresa').delete().eq('id', id);
      loadData();
    }
  };

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroProyecto && m.proyecto_id !== filtroProyecto) return false;
    if (filtroCuenta && m.cuenta !== filtroCuenta) return false;
    if (filtroCategoria && m.categoria !== filtroCategoria) return false;
    return true;
  });

  // Calcular saldos por cuenta
  const saldosPorCuenta = movimientos.reduce((acc, m) => {
    if (!acc[m.cuenta]) acc[m.cuenta] = 0;
    acc[m.cuenta] += m.tipo === 'Ingreso' ? m.monto : -m.monto;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent mb-2">
            Administración — Caja y Bancos
          </h1>
          <p className="text-wos-text-muted">
            Gestión centralizada de movimientos financieros. Control de caja, bancos, ingresos y gastos de toda la empresa.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-wos-accent text-wos-bg px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus size={20} />
          Nuevo Movimiento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Saldo Actual</p>
            <Wallet className="text-wos-accent" size={20} />
          </div>
          <p className={`text-3xl font-bold ${saldoActual >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {saldoActual.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Saldo total de todas las cuentas</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Gastos del Mes</p>
            <ArrowDownCircle className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-500">
            {gastosMes.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Total de gastos registrados este mes</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Ingresos del Mes</p>
            <ArrowUpCircle className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {ingresosMes.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Total de ingresos registrados este mes</p>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Balance Mensual</p>
            <Scale className={balanceMes >= 0 ? 'text-green-500' : 'text-red-500'} size={20} />
          </div>
          <p className={`text-3xl font-bold ${balanceMes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {balanceMes.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Resultado neto del mes en curso</p>
        </div>
      </div>

      {/* Saldos por cuenta */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-wos-text mb-3">Saldo por Cuenta</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(saldosPorCuenta).map(([cuenta, saldo]) => (
            <div key={cuenta} className="flex items-center gap-2">
              <span className="text-sm text-wos-text-muted">{cuenta}:</span>
              <span className={`text-sm font-semibold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {saldo.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-wos-card border border-wos-border rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-wos-text mb-4">
            {editingId ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Fecha *</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Ingreso' | 'Gasto' })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="Gasto">Gasto</option>
                <option value="Ingreso">Ingreso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Categoría *</label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">-- Seleccionar --</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Concepto *</label>
              <input
                type="text"
                required
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Descripción del movimiento"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Monto (€) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Cuenta *</label>
              <select
                required
                value={formData.cuenta}
                onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">-- Seleccionar --</option>
                {CUENTAS.map(cuenta => (
                  <option key={cuenta} value={cuenta}>{cuenta}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Forma de Pago *</label>
              <select
                required
                value={formData.forma_pago}
                onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">-- Seleccionar --</option>
                {FORMAS_PAGO.map(forma => (
                  <option key={forma} value={forma}>{forma}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Proyecto (opcional)</label>
              <select
                value={formData.proyecto_id}
                onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              >
                <option value="">-- Sin proyecto --</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.inmuebles?.nombre})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Proveedor</label>
              <input
                type="text"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-wos-text-muted mb-2">Observaciones</label>
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

      {/* Filtros */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-wos-text-muted" />
          <h3 className="text-sm font-semibold text-wos-text">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filtroProyecto}
            onChange={(e) => setFiltroProyecto(e.target.value)}
            className="bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-sm text-wos-text focus:outline-none focus:border-wos-accent"
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select
            value={filtroCuenta}
            onChange={(e) => setFiltroCuenta(e.target.value)}
            className="bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-sm text-wos-text focus:outline-none focus:border-wos-accent"
          >
            <option value="">Todas las cuentas</option>
            {CUENTAS.map(cuenta => (
              <option key={cuenta} value={cuenta}>{cuenta}</option>
            ))}
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-sm text-wos-text focus:outline-none focus:border-wos-accent"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-wos-card border border-wos-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-wos-border">
          <h2 className="text-lg font-semibold text-wos-text">Movimientos</h2>
          <p className="text-sm text-wos-text-muted mt-1">
            {movimientosFiltrados.length} movimiento(s) registrado(s)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-wos-text-muted">Cargando movimientos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-wos-bg border-b border-wos-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-wos-text-muted uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Concepto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Proyecto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-wos-text-muted uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Cuenta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Forma Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Proveedor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-wos-text-muted uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wos-border">
                {movimientosFiltrados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-wos-bg transition-smooth">
                    <td className="px-4 py-3 text-wos-text-muted">
                      {new Date(mov.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mov.tipo === 'Ingreso' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-wos-text">{mov.categoria}</td>
                    <td className="px-4 py-3 text-wos-text">{mov.concepto}</td>
                    <td className="px-4 py-3 text-wos-text-muted text-xs">
                      {mov.proyecto_nombre || '-'}
                    </td>
                    <td className={`px-4 py-3 font-semibold text-right ${
                      mov.tipo === 'Ingreso' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {mov.tipo === 'Ingreso' ? '+' : '-'}{mov.monto.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-4 py-3 text-wos-text">{mov.cuenta}</td>
                    <td className="px-4 py-3 text-wos-text">{mov.forma_pago}</td>
                    <td className="px-4 py-3 text-wos-text-muted">{mov.proveedor || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(mov)}
                          className="text-wos-accent hover:opacity-80"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mov.id)}
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
            </table>

            {movimientosFiltrados.length === 0 && !loading && (
              <div className="text-center py-12 text-wos-text-muted">
                No hay movimientos registrados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
