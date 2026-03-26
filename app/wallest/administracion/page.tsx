'use client';

import { useEffect, useState } from 'react';
import { supabase, sessionReady } from '@/lib/supabase';
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
  numero_factura?: string | null;
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
  'CaixaBank JV Nexo',
  'CaixaBank JV Zurgena 1',
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
  const [saldosPorCuenta, setSaldosPorCuenta] = useState<Record<string, number>>({});
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [saldoTotal, setSaldoTotal] = useState(0);

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
    observaciones: '',
    numero_factura: ''
  });

  useEffect(() => {
    sessionReady.then(() => loadData());
  }, []);

  useEffect(() => {
    calcularKPIs();
  }, [movimientos, filtroCuenta, filtroProyecto]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar movimientos
      console.log('Cargando movimientos desde movimientos_empresa...');
      const { data: movimientosData, error: errorMovimientos } = await supabase
        .from('movimientos_empresa')
        .select('*')
        .order('fecha', { ascending: false });

      if (errorMovimientos) {
        console.error('Error al cargar movimientos:', errorMovimientos);
        alert(`Error al cargar movimientos:\n${errorMovimientos.message}\n\n¿La tabla movimientos_empresa existe en Supabase?`);
        setLoading(false);
        return;
      }

      console.log(`Movimientos cargados: ${movimientosData?.length || 0}`);

      // Cargar proyectos
      const { data: proyectosData, error: errorProyectos } = await supabase
        .from('reformas')
        .select('id, nombre, inmuebles(nombre)')
        .order('nombre');

      if (errorProyectos) {
        console.error('Error al cargar proyectos:', errorProyectos);
      }

      if (movimientosData) {
        // Enriquecer con nombre de proyecto
        const movimientosConProyecto = movimientosData.map(mov => {
          const proyecto = proyectosData?.find(p => p.id === mov.proyecto_id);
          return {
            ...mov,
            proyecto_nombre: proyecto ? `${proyecto.nombre} (${proyecto.inmuebles?.nombre})` : null
          };
        });
        console.log('📋 Actualizando movimientos en estado:', movimientosConProyecto.length, 'movimientos');
        setMovimientos(movimientosConProyecto);
      }

      if (proyectosData) setProyectos(proyectosData);

    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert(`Error crítico al cargar datos:\n${error?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const CUENTA_PRINCIPAL = 'CaixaBank';

  const calcularKPIs = () => {
    // Filtrar por proyecto y cuenta si hay filtros activos
    const movsFiltrados = movimientos.filter(m => {
      if (filtroProyecto && m.proyecto_id !== filtroProyecto) return false;
      if (filtroCuenta && m.cuenta !== filtroCuenta) return false;
      return true;
    });

    // Para saldo actual: si no hay filtro de cuenta usamos solo la cuenta principal
    const movsParaSaldo = movimientos.filter(m => {
      if (filtroProyecto && m.proyecto_id !== filtroProyecto) return false;
      if (filtroCuenta) return m.cuenta === filtroCuenta;
      return m.cuenta === CUENTA_PRINCIPAL;
    });

    // Saldo actual — tipo-aware: los gastos pueden venir positivos o negativos en BD
    const saldoCalculado = movsParaSaldo.reduce((sum, m) =>
      sum + (m.tipo === 'Ingreso' ? Math.abs(m.monto) : -Math.abs(m.monto)), 0);
    setSaldoActual(saldoCalculado);

    // Totales acumulados (all-time) con tipo-aware math
    const calculatedTotalIngresos = movsFiltrados
      .filter(m => m.tipo === 'Ingreso')
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);
    const calculatedTotalGastos = movsFiltrados
      .filter(m => m.tipo === 'Gasto')
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);
    setTotalIngresos(calculatedTotalIngresos);
    setTotalGastos(calculatedTotalGastos);
    setSaldoTotal(calculatedTotalIngresos - calculatedTotalGastos);

    // Gastos e ingresos del mes actual
    const now = new Date();
    const mesActual = now.getMonth();
    const añoActual = now.getFullYear();

    const gastosMesActual = movsFiltrados
      .filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Gasto' && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      })
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);

    const ingresosMesActual = movsFiltrados
      .filter(m => {
        const fecha = new Date(m.fecha);
        return m.tipo === 'Ingreso' && fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      })
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);
    console.log('📊 Balance del mes:', ingresosMesActual - gastosMesActual, '€');

    setGastosMes(gastosMesActual);
    setIngresosMes(ingresosMesActual);
    setBalanceMes(ingresosMesActual - gastosMesActual);

    // Calcular saldos por cuenta — tipo-aware, respetando filtro de proyecto
    const saldosCuenta: Record<string, number> = {};
    movimientos.filter(m => !filtroProyecto || m.proyecto_id === filtroProyecto).forEach(m => {
      if (!saldosCuenta[m.cuenta]) {
        saldosCuenta[m.cuenta] = 0;
      }
      saldosCuenta[m.cuenta] += m.tipo === 'Ingreso' ? Math.abs(m.monto) : -Math.abs(m.monto);
    });
    setSaldosPorCuenta(saldosCuenta);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      fecha: formData.fecha,
      tipo: formData.tipo,
      categoria: formData.categoria,
      concepto: formData.concepto,
      monto: formData.tipo === 'Gasto' ? -(Math.abs(parseFloat(formData.monto) || 0)) : Math.abs(parseFloat(formData.monto) || 0),
      cuenta: formData.cuenta,
      forma_pago: formData.forma_pago,
      proyecto_id: formData.proyecto_id || null,
      proveedor: formData.proveedor || null,
      observaciones: formData.observaciones || null,
      numero_factura: formData.numero_factura || null
    };

    const financiasData = {
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
    };

    try {
      if (editingId) {
        // Obtener el movimiento anterior para ver si tenía proyecto vinculado
        const { data: movimientoAnterior, error: errorSelect } = await supabase
          .from('movimientos_empresa')
          .select('proyecto_id, concepto')
          .eq('id', editingId)
          .single();

        if (errorSelect) {
          console.error('Error al obtener movimiento anterior:', errorSelect);
          throw errorSelect;
        }

        // Actualizar en movimientos_empresa
        const { error: errorUpdate } = await supabase
          .from('movimientos_empresa')
          .update(dataToSave)
          .eq('id', editingId);

        if (errorUpdate) {
          console.error('Error al actualizar movimiento:', errorUpdate);
          throw errorUpdate;
        }

        // Sincronizar con finanzas_proyecto
        if (movimientoAnterior?.proyecto_id && formData.proyecto_id) {
          // Caso 1: Tenía proyecto y sigue teniendo proyecto (pueden ser el mismo o diferente)
          const { data: rows1 } = await supabase
            .from('finanzas_proyecto')
            .select('id')
            .eq('reforma_id', movimientoAnterior.proyecto_id)
            .eq('descripcion', movimientoAnterior.concepto)
            .limit(1);
          const registroFinanzas = rows1?.[0] ?? null;

          if (registroFinanzas) {
            if (movimientoAnterior.proyecto_id === formData.proyecto_id) {
              // Mismo proyecto: actualizar
              await supabase
                .from('finanzas_proyecto')
                .update(financiasData)
                .eq('id', registroFinanzas.id);
            } else {
              // Cambió de proyecto: eliminar el viejo e insertar nuevo
              await supabase
                .from('finanzas_proyecto')
                .delete()
                .eq('id', registroFinanzas.id);

              await supabase
                .from('finanzas_proyecto')
                .insert([financiasData]);
            }
          }
        } else if (movimientoAnterior?.proyecto_id && !formData.proyecto_id) {
          // Caso 2: Tenía proyecto pero ya no - eliminar de finanzas_proyecto
          const { data: rows2 } = await supabase
            .from('finanzas_proyecto')
            .select('id')
            .eq('reforma_id', movimientoAnterior.proyecto_id)
            .eq('descripcion', movimientoAnterior.concepto)
            .limit(1);
          const registroFinanzas = rows2?.[0] ?? null;

          if (registroFinanzas) {
            await supabase
              .from('finanzas_proyecto')
              .delete()
              .eq('id', registroFinanzas.id);
          }
        } else if (!movimientoAnterior?.proyecto_id && formData.proyecto_id) {
          // Caso 3: No tenía proyecto pero ahora sí - crear en finanzas_proyecto
          await supabase
            .from('finanzas_proyecto')
            .insert([financiasData]);
        }
        // Caso 4: No tenía proyecto y sigue sin proyecto - no hacer nada
      } else {
        // Crear nuevo movimiento
        console.log('Intentando guardar movimiento:', dataToSave);
        const { data: movimientoCreado, error: errorInsert } = await supabase
          .from('movimientos_empresa')
          .insert([dataToSave])
          .select();

        if (errorInsert) {
          console.error('Error al insertar movimiento:', errorInsert);
          alert(`Error al guardar el movimiento:\n${errorInsert.message}\n\nDetalles: ${JSON.stringify(errorInsert, null, 2)}`);
          throw errorInsert;
        }

        console.log('Movimiento creado exitosamente:', movimientoCreado);

        // Si está vinculado a un proyecto, también crear en finanzas_proyecto
        if (formData.proyecto_id) {
          const { error: errorFinanzas } = await supabase
            .from('finanzas_proyecto')
            .insert([financiasData]);

          if (errorFinanzas) {
            console.error('Error al insertar en finanzas_proyecto:', errorFinanzas);
            // No bloquear el guardado principal si falla la sincronización
          }
        }
      }

      resetForm();
      await loadData(); // Asegurar que se complete la carga antes de continuar
      alert('Movimiento guardado correctamente');
    } catch (error: any) {
      console.error('Error guardando movimiento:', error);
      if (error?.message) {
        alert(`Error al guardar el movimiento:\n${error.message}`);
      } else {
        alert('Error desconocido al guardar el movimiento. Verifica la consola del navegador.');
      }
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
      observaciones: '',
      numero_factura: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (movimiento: MovimientoEmpresa) => {
    console.log('✏️ handleEdit llamado para movimiento:', movimiento);
    
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
      observaciones: movimiento.observaciones || '',
      numero_factura: movimiento.numero_factura || ''
    });
    setEditingId(movimiento.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer.')) {
      try {
        // Obtener el movimiento para ver si está vinculado a un proyecto
        const { data: movimiento, error: errorSelect } = await supabase
          .from('movimientos_empresa')
          .select('proyecto_id, concepto')
          .eq('id', id)
          .single();

        if (errorSelect) {
          console.error('Error obteniendo movimiento:', errorSelect);
          alert('Error al obtener el movimiento: ' + errorSelect.message);
          return;
        }

        // Eliminar de movimientos_empresa
        const { error: errorDelete } = await supabase
          .from('movimientos_empresa')
          .delete()
          .eq('id', id);

        if (errorDelete) {
          console.error('Error eliminando movimiento:', errorDelete);
          alert('Error al eliminar el movimiento: ' + errorDelete.message);
          return;
        }

        // Si estaba vinculado a un proyecto, también eliminar de finanzas_proyecto
        if (movimiento?.proyecto_id) {
          const { data: registroFinanzas } = await supabase
            .from('finanzas_proyecto')
            .select('id')
            .eq('reforma_id', movimiento.proyecto_id)
            .eq('descripcion', movimiento.concepto)
            .single();

          if (registroFinanzas) {
            await supabase
              .from('finanzas_proyecto')
              .delete()
              .eq('id', registroFinanzas.id);
          }
        }

        loadData();
      } catch (error) {
        console.error('Error eliminando movimiento:', error);
        alert('Error al eliminar el movimiento');
      }
    }
  };

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroProyecto && m.proyecto_id !== filtroProyecto) return false;
    if (filtroCuenta && m.cuenta !== filtroCuenta) return false;
    if (filtroCategoria && m.categoria !== filtroCategoria) return false;
    return true;
  });

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

      {/* KPIs — Resumen ingresos / gastos / saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Total Ingresos</p>
            <ArrowUpCircle className="text-green-500 flex-shrink-0" size={20} />
          </div>
          <p className="text-4xl font-bold text-green-500">
            +{totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Acumulado total</p>
        </div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Total Gastos</p>
            <ArrowDownCircle className="text-red-500 flex-shrink-0" size={20} />
          </div>
          <p className="text-4xl font-bold text-red-500">
            -{totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Acumulado total</p>
        </div>
        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-wos-text-muted">Saldo Disponible</p>
            <Scale className={`flex-shrink-0 ${saldoTotal >= 0 ? 'text-green-500' : 'text-red-500'}`} size={20} />
          </div>
          <p className={`text-4xl font-bold ${saldoTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {saldoTotal >= 0 ? '+' : ''}{saldoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-wos-text-muted mt-2">Ingresos − Gastos</p>
        </div>
      </div>

      {/* KPIs — una card por cuenta bancaria, dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {Object.entries(saldosPorCuenta).map(([cuenta, saldo]) => (
          <div
            key={cuenta}
            className="bg-wos-card border border-wos-border rounded-lg p-6 cursor-pointer hover:border-wos-accent transition-colors"
            onClick={() => setFiltroCuenta(filtroCuenta === cuenta ? '' : cuenta)}
            style={{
              borderLeft: '3px solid #E85D04',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderColor: filtroCuenta === cuenta ? '#c9a84c' : undefined,
              borderLeftColor: '#E85D04',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-wos-text-muted truncate pr-2">{cuenta}</p>
              <Wallet className="text-wos-accent flex-shrink-0" size={20} />
            </div>
            <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
            <p className="text-xs text-wos-text-muted mt-2">Saldo actual</p>
            {filtroCuenta === cuenta && (
              <p className="text-xs text-wos-accent mt-1">● Filtrando por esta cuenta</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--wos-card)', border: '1px solid var(--wos-border)' }}
          >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-wos-text">
              {editingId ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm px-3 py-1 rounded-lg"
              style={{ color: 'var(--wos-text-subtle)', background: 'var(--wos-border)' }}
            >✕</button>
          </div>
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

            <div>
              <label className="block text-sm text-wos-text-muted mb-2">Número de factura</label>
              <input
                type="text"
                value={formData.numero_factura}
                onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-text focus:outline-none focus:border-wos-accent"
                placeholder="Ej: F-2024-001"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-wos-text-muted uppercase">Nº Factura</th>
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
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={mov.tipo === 'Ingreso'
                          ? { background: '#dcfce7', color: '#15803d' }
                          : { background: '#fee2e2', color: '#b91c1c' }}
                      >
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
                    <td className="px-4 py-3 text-wos-text-muted">{mov.numero_factura || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(mov);
                          }}
                          className="text-wos-accent hover:opacity-80"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mov.id);
                          }}
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