'use client';

import { useState, useEffect } from 'react';
import { supabase, ProyectoRentabilidad } from '@/lib/supabase';
import { Calculator, Edit2, Trash2, Plus, Star, ArrowLeft, FileSpreadsheet, Printer } from 'lucide-react';

//@ts-nocheck

const COMUNIDADES = [
  'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria', 
  'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 
  'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'Valencia'
];

const IMPUESTOS = ['ITP', 'IVA + AJD', 'Sin impuesto'];

const CONCEPTOS_CHECKLIST = [
  'Plusvalía compra',
  'Compensaciones vendedor/okupa',
  'Deuda IBI',
  'Deuda suministros/basura',
  'Deuda comunidad propietarios',
  'Honorarios profesionales',
  'Cerrajería',
  'Comisiones inmobiliarias',
  'Tasas judiciales',
  'Certificado energético',
  'Honorarios gestión complementaria',
  'Plusvalía venta',
  'IBI',
  'Suministros/basura',
  'Cuotas comunidad propietarios',
  'Derrama comunidad propietarios',
  'Alarma',
  'Seguros',
  'Reforma'
];

export default function CalculadoraRentabilidad() {
  const [vistaActual, setVistaActual] = useState<'listado' | 'nuevo' | 'detalle'>('listado');
  const [proyectos, setProyectos] = useState<ProyectoRentabilidad[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoRentabilidad | null>(null);
  
  // Formulario de nuevo proyecto
  const [formNuevo, setFormNuevo] = useState({
    nombre: '',
    direccion: '',
    comunidad: '',
    estado: 'borrador' as const,
    calificacion: 0,
  });

  // Formulario de detalle
  const [formDetalle, setFormDetalle] = useState({
    estado: 'borrador' as const,
    calificacion: 0,
    impuesto: '',
    valor_referencia: '',
    vendedor_no_residente: false,
  });

  // Precios de venta (3 escenarios)
  const [preciosVenta, setPreciosVenta] = useState({
    pesimista: '',
    realista: '',
    optimista: '',
  });

  // Conceptos principales
  const [conceptos, setConceptos] = useState([
    { id: 1, nombre: 'Precio de compra', estimado: '', real: '' },
    { id: 2, nombre: 'Gastos de compraventa (notario, registro, gestión)', estimado: '', real: '' },
    { id: 3, nombre: 'Gastos cancelación (notario, registro, gestión)', estimado: '', real: '' },
    { id: 4, nombre: 'Impuestos de compra ITP', estimado: '', real: '' },
    { id: 5, nombre: 'Retenciones extranjeros', estimado: '', real: '' },
    { id: 6, nombre: 'Liquidación complementaria', estimado: '', real: '' },
  ]);

  const [conceptosAdicionales, setConceptosAdicionales] = useState<any[]>([]);
  
  // Checklist de gastos
  const [gastosSeleccionados, setGastosSeleccionados] = useState<string[]>([]);
  
  // Opciones de cálculo
  const [conComplementaria, setConComplementaria] = useState(true);
  const [sinComplementaria, setSinComplementaria] = useState(true);
  
  // Rentabilidad deseada
  const [rentabilidadDeseada, setRentabilidadDeseada] = useState('');
  const [duracionMeses, setDuracionMeses] = useState('12');

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    const { data } = await supabase
      .from('proyectos_rentabilidad')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProyectos(data);
  };

  const handleGuardarNuevo = async () => {
    if (!formNuevo.nombre) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    const { error } = await supabase
      .from('proyectos_rentabilidad')
      .insert([{
        nombre: formNuevo.nombre,
        direccion: formNuevo.direccion,
        comunidad: formNuevo.comunidad,
        estado: formNuevo.estado,
        calificacion: formNuevo.calificacion,
      }]);

    if (error) {
      alert('Error al guardar el proyecto');
      console.error(error);
    } else {
      alert('Proyecto guardado correctamente');
      setFormNuevo({ nombre: '', direccion: '', comunidad: '', estado: 'borrador', calificacion: 0 });
      setVistaActual('listado');
      loadProyectos();
    }
  };

  const handleEliminarProyecto = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    const { error } = await supabase
      .from('proyectos_rentabilidad')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar el proyecto');
    } else {
      loadProyectos();
    }
  };

  const handleEditarProyecto = (proyecto: ProyectoRentabilidad) => {
    setProyectoSeleccionado(proyecto);
    setVistaActual('detalle');
    
    // Cargar datos en el formulario
    setFormDetalle({
      estado: proyecto.estado as any,
      calificacion: proyecto.calificacion || 0,
      impuesto: (proyecto as any).impuesto || '',
      valor_referencia: (proyecto as any).valor_referencia?.toString() || '',
      vendedor_no_residente: (proyecto as any).vendedor_no_residente || false,
    });

    setPreciosVenta({
      pesimista: proyecto.precio_venta_pesimista?.toString() || '',
      realista: proyecto.precio_venta_realista?.toString() || '',
      optimista: proyecto.precio_venta_optimista?.toString() || '',
    });

    setConceptos([
      { id: 1, nombre: 'Precio de compra', estimado: proyecto.precio_compra_estimado?.toString() || '', real: proyecto.precio_compra_real?.toString() || '' },
      { id: 2, nombre: 'Gastos de compraventa', estimado: proyecto.gastos_compraventa_estimado?.toString() || '', real: proyecto.gastos_compraventa_real?.toString() || '' },
      { id: 3, nombre: 'Gastos cancelación', estimado: proyecto.gastos_cancelacion_estimado?.toString() || '', real: proyecto.gastos_cancelacion_real?.toString() || '' },
      { id: 4, nombre: 'Impuestos de compra ITP', estimado: (proyecto as any).impuestos_compra_estimado?.toString() || '', real: (proyecto as any).impuestos_compra_real?.toString() || '' },
      { id: 5, nombre: 'Retenciones extranjeros', estimado: (proyecto as any).retenciones_extranjeros_estimado?.toString() || '', real: (proyecto as any).retenciones_extranjeros_real?.toString() || '' },
      { id: 6, nombre: 'Liquidación complementaria', estimado: (proyecto as any).liquidacion_complementaria_estimado?.toString() || '', real: (proyecto as any).liquidacion_complementaria_real?.toString() || '' },
    ]);

    setGastosSeleccionados((proyecto as any).gastos_checklist || []);
  };

  const calcularDesviacion = (estimado: string, real: string) => {
    const est = parseFloat(estimado) || 0;
    const rl = parseFloat(real) || 0;
    return rl - est;
  };

  const calcularTotalInversion = (escenario: 'estimado' | 'real') => {
    let total = 0;
    conceptos.forEach(c => {
      const valor = escenario === 'estimado' ? parseFloat(c.estimado) || 0 : parseFloat(c.real) || 0;
      total += valor;
    });
    return total;
  };

  const calcularBeneficioNeto = (precioVenta: number, escenario: 'estimado' | 'real') => {
    const totalInversion = calcularTotalInversion(escenario);
    return precioVenta - totalInversion;
  };

  const calcularRentabilidadNeta = (precioVenta: number, escenario: 'estimado' | 'real') => {
    const totalInversion = calcularTotalInversion(escenario);
    const beneficio = calcularBeneficioNeto(precioVenta, escenario);
    return totalInversion > 0 ? (beneficio / totalInversion) * 100 : 0;
  };

  const calcularRentabilidadAnualizada = (rentabilidadTotal: number, meses: number) => {
    if (meses <= 0) return 0;
    return (rentabilidadTotal / meses) * 12;
  };

  const calcularPrecioCompraObjetivo = (precioVenta: number, rentabilidadDeseada: number) => {
    // Simplificación: suma de conceptos excepto precio de compra
    let otrosGastos = 0;
    conceptos.slice(1).forEach(c => {
      otrosGastos += parseFloat(c.estimado) || 0;
    });

    // Precio máximo de compra = PV - Otros gastos - (Rentabilidad * (PV - Otros gastos))
    const precioMaximo = precioVenta - otrosGastos - ((rentabilidadDeseada / 100) * (precioVenta - otrosGastos));
    return precioMaximo;
  };

  const agregarConceptoAdicional = () => {
    const nuevoId = conceptos.length + conceptosAdicionales.length + 1;
    setConceptosAdicionales([
      ...conceptosAdicionales,
      { id: nuevoId, nombre: 'Nuevo concepto', estimado: '', real: '' }
    ]);
  };

  const renderEstrellas = (calificacion: number, onChange?: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              size={20}
              className={star <= calificacion ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
            />
          </button>
        ))}
      </div>
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-500/20 text-gray-300';
      case 'aprobado': return 'bg-green-500/20 text-green-300';
      case 'descartado': return 'bg-red-500/20 text-red-300';
      case 'en_marcha': return 'bg-blue-500/20 text-blue-300';
      case 'terminado': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const exportarExcel = () => {
    alert('Función de exportación a Excel en desarrollo');
  };

  const imprimir = () => {
    window.print();
  };

  // VISTA: LISTADO
  if (vistaActual === 'listado') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-wos-accent flex items-center gap-3">
              <Calculator className="text-wos-primary" />
              Calculadora de Rentabilidad
            </h1>
            <p className="text-wos-text-muted mt-1">
              Gestión completa de proyectos inmobiliarios
            </p>
          </div>
          <button
            onClick={() => setVistaActual('nuevo')}
            className="bg-wos-primary hover:bg-wos-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-smooth flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Proyecto
          </button>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-wos-accent mb-4">
            Listado de Proyectos
          </h2>

          {proyectos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wos-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Nombre / Dirección</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Comunidad</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-wos-text-muted">Estado</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-wos-text-muted">Calificación</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Beneficio</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-wos-text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((proyecto) => {
                    const beneficioEstimado = calcularBeneficioNeto(proyecto.precio_venta_realista || 0, 'estimado');
                    const beneficioReal = calcularBeneficioNeto(proyecto.precio_venta_realista || 0, 'real');

                    return (
                      <tr key={proyecto.id} className="border-b border-wos-border/50 hover:bg-wos-bg/50 transition-smooth">
                        <td className="py-3 px-4">
                          <div className="text-wos-accent font-medium">{proyecto.nombre}</div>
                          {proyecto.direccion && (
                            <div className="text-sm text-wos-text-muted">{proyecto.direccion}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-wos-text-muted">{(proyecto as any).comunidad || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                            {proyecto.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex justify-center">
                          {renderEstrellas(proyecto.calificacion || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-sm">
                            <div className="text-wos-text-muted">Est: €{beneficioEstimado.toLocaleString()}</div>
                            <div className="text-wos-accent">Real: €{beneficioReal.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditarProyecto(proyecto)}
                              className="px-3 py-1 bg-wos-primary/20 hover:bg-wos-primary/30 text-wos-primary rounded text-xs transition-smooth"
                            >
                              Ver detalle
                            </button>
                            <button
                              onClick={() => handleEditarProyecto(proyecto)}
                              className="p-2 hover:bg-wos-bg rounded-lg transition-smooth"
                              title="Editar"
                            >
                              <Edit2 size={16} className="text-wos-text-muted hover:text-wos-primary" />
                            </button>
                            <button
                              onClick={() => handleEliminarProyecto(proyecto.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
                              title="Eliminar"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-wos-text-muted py-8">
              No hay proyectos registrados. Crea uno nuevo para comenzar.
            </p>
          )}
        </div>
      </div>
    );
  }

  // VISTA: NUEVO PROYECTO
  if (vistaActual === 'nuevo') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setVistaActual('listado')}
            className="p-2 hover:bg-wos-card rounded-lg transition-smooth"
          >
            <ArrowLeft className="text-wos-accent" />
          </button>
          <h1 className="text-3xl font-bold text-wos-accent">
            Crear Nuevo Proyecto
          </h1>
        </div>

        <div className="bg-wos-card border border-wos-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">
                Nombre del proyecto *
              </label>
              <input
                type="text"
                value={formNuevo.nombre}
                onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
                placeholder="Ej: Reforma Calle Mayor 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formNuevo.direccion}
                onChange={(e) => setFormNuevo({ ...formNuevo, direccion: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
                placeholder="Ej: Calle Mayor 15, 3º B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">
                Comunidad
              </label>
              <select
                value={formNuevo.comunidad}
                onChange={(e) => setFormNuevo({ ...formNuevo, comunidad: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              >
                <option value="">Seleccionar...</option>
                {COMUNIDADES.map(com => (
                  <option key={com} value={com}>{com}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">
                Estado
              </label>
              <select
                value={formNuevo.estado}
                onChange={(e) => setFormNuevo({ ...formNuevo, estado: e.target.value as any })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              >
                <option value="borrador">Borrador</option>
                <option value="aprobado">Aprobado</option>
                <option value="descartado">Descartado</option>
                <option value="en_marcha">En marcha</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">
                Calificación
              </label>
              {renderEstrellas(formNuevo.calificacion, (val) => setFormNuevo({ ...formNuevo, calificacion: val }))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleGuardarNuevo}
              className="bg-wos-primary hover:bg-wos-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-smooth"
            >
              Grabar
            </button>
            <button
              onClick={() => setVistaActual('listado')}
              className="bg-wos-bg border border-wos-border hover:bg-wos-card text-wos-accent px-6 py-2 rounded-lg font-medium transition-smooth"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA: DETALLE DEL PROYECTO
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setVistaActual('listado')}
          className="p-2 hover:bg-wos-card rounded-lg transition-smooth"
        >
          <ArrowLeft className="text-wos-accent" />
        </button>
        <h1 className="text-3xl font-bold text-wos-accent">
          {proyectoSeleccionado?.nombre}
        </h1>
      </div>

      {/* SECCIÓN 3: Detalle del proyecto */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Configuración del Proyecto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Proyecto</label>
            <select
              value={proyectoSeleccionado?.id || ''}
              onChange={(e) => {
                const proyecto = proyectos.find(p => p.id === e.target.value);
                if (proyecto) handleEditarProyecto(proyecto);
              }}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
            >
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Comunidad</label>
            <select
              value={(formDetalle as any).comunidad}
              onChange={(e) => setFormDetalle({ ...(formDetalle as any), comunidad: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
            >
              <option value="">Seleccionar...</option>
              {COMUNIDADES.map(com => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Estado</label>
            <select
              value={formDetalle.estado}
              onChange={(e) => setFormDetalle({ ...formDetalle, estado: e.target.value as any })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
            >
              <option value="borrador">Borrador</option>
              <option value="aprobado">Aprobado</option>
              <option value="descartado">Descartado</option>
              <option value="en_marcha">En marcha</option>
              <option value="terminado">Terminado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Calificación</label>
            {renderEstrellas(formDetalle.calificacion, (val) => setFormDetalle({ ...formDetalle, calificacion: val }))}
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Impuesto</label>
            <select
              value={formDetalle.impuesto}
              onChange={(e) => setFormDetalle({ ...formDetalle, impuesto: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
            >
              <option value="">Seleccionar...</option>
              {IMPUESTOS.map(imp => (
                <option key={imp} value={imp}>{imp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">Valor de referencia (€)</label>
            <input
              type="number"
              value={formDetalle.valor_referencia}
              onChange={(e) => setFormDetalle({ ...formDetalle, valor_referencia: e.target.value })}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-wos-text-muted mb-2">Vendedor NO residente</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={formDetalle.vendedor_no_residente === true}
                onChange={() => setFormDetalle({ ...formDetalle, vendedor_no_residente: true })}
                className="text-wos-primary focus:ring-wos-primary"
              />
              <span className="text-wos-accent">Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={formDetalle.vendedor_no_residente === false}
                onChange={() => setFormDetalle({ ...formDetalle, vendedor_no_residente: false })}
                className="text-wos-primary focus:ring-wos-primary"
              />
              <span className="text-wos-accent">No</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="bg-wos-primary hover:bg-wos-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-smooth">
            Editar
          </button>
          <button
            onClick={() => setVistaActual('nuevo')}
            className="bg-wos-bg border border-wos-border hover:bg-wos-card text-wos-accent px-6 py-2 rounded-lg font-medium transition-smooth"
          >
            Nuevo
          </button>
        </div>

        {/* Checklist de gastos */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-wos-accent mb-4">Conceptos de Gastos</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {CONCEPTOS_CHECKLIST.map((concepto) => (
                <label
                  key={concepto}
                  className="flex items-center gap-2 whitespace-nowrap cursor-pointer min-w-fit px-3 py-2 bg-wos-bg border border-wos-border rounded-lg hover:border-wos-primary transition-smooth"
                >
                  <input
                    type="checkbox"
                    checked={gastosSeleccionados.includes(concepto)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGastosSeleccionados([...gastosSeleccionados, concepto]);
                      } else {
                        setGastosSeleccionados(gastosSeleccionados.filter(g => g !== concepto));
                      }
                    }}
                    className="text-wos-primary focus:ring-wos-primary"
                  />
                  <span className="text-sm text-wos-accent">{concepto}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 4: Bloque COMPRAR AV-VENDER */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Comprar AV – Vender</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-wos-accent mb-3">Precio de venta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">Pesimista (€)</label>
              <input
                type="number"
                value={preciosVenta.pesimista}
                onChange={(e) => setPreciosVenta({ ...preciosVenta, pesimista: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">Realista (€)</label>
              <input
                type="number"
                value={preciosVenta.realista}
                onChange={(e) => setPreciosVenta({ ...preciosVenta, realista: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wos-text-muted mb-2">Optimista (€)</label>
              <input
                type="number"
                value={preciosVenta.optimista}
                onChange={(e) => setPreciosVenta({ ...preciosVenta, optimista: e.target.value })}
                className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wos-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Concepto</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Estimado (€)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Real (€)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Desviación (€)</th>
              </tr>
            </thead>
            <tbody>
              {conceptos.map((concepto, index) => {
                const desviacion = calcularDesviacion(concepto.estimado, concepto.real);
                return (
                  <tr key={concepto.id} className="border-b border-wos-border/50">
                    <td className="py-3 px-4 text-wos-accent">{concepto.nombre}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={concepto.estimado}
                        onChange={(e) => {
                          const newConceptos = [...conceptos];
                          newConceptos[index].estimado = e.target.value;
                          setConceptos(newConceptos);
                        }}
                        className="w-full bg-wos-bg border border-wos-border rounded px-2 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={concepto.real}
                        onChange={(e) => {
                          const newConceptos = [...conceptos];
                          newConceptos[index].real = e.target.value;
                          setConceptos(newConceptos);
                        }}
                        className="w-full bg-wos-bg border border-wos-border rounded px-2 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0"
                      />
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${desviacion < 0 ? 'text-green-500' : desviacion > 0 ? 'text-red-500' : 'text-wos-text-muted'}`}>
                      {desviacion.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {conceptosAdicionales.map((concepto, index) => {
                const desviacion = calcularDesviacion(concepto.estimado, concepto.real);
                return (
                  <tr key={concepto.id} className="border-b border-wos-border/50">
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={concepto.nombre}
                        onChange={(e) => {
                          const newConceptos = [...conceptosAdicionales];
                          newConceptos[index].nombre = e.target.value;
                          setConceptosAdicionales(newConceptos);
                        }}
                        className="w-full bg-wos-bg border border-wos-border rounded px-2 py-1 text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={concepto.estimado}
                        onChange={(e) => {
                          const newConceptos = [...conceptosAdicionales];
                          newConceptos[index].estimado = e.target.value;
                          setConceptosAdicionales(newConceptos);
                        }}
                        className="w-full bg-wos-bg border border-wos-border rounded px-2 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={concepto.real}
                        onChange={(e) => {
                          const newConceptos = [...conceptosAdicionales];
                          newConceptos[index].real = e.target.value;
                          setConceptosAdicionales(newConceptos);
                        }}
                        className="w-full bg-wos-bg border border-wos-border rounded px-2 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0"
                      />
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${desviacion < 0 ? 'text-green-500' : desviacion > 0 ? 'text-red-500' : 'text-wos-text-muted'}`}>
                      {desviacion.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={agregarConceptoAdicional}
          className="mt-4 flex items-center gap-2 text-wos-primary hover:text-wos-primary/80 transition-smooth"
        >
          <Plus size={20} />
          Agregar concepto
        </button>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 5: Resultados finales */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Resultados Finales</h2>
        
        <div className="mb-6 flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={conComplementaria}
              onChange={(e) => setConComplementaria(e.target.checked)}
              className="text-wos-primary focus:ring-wos-primary"
            />
            <span className="text-wos-accent">Con complementaria</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sinComplementaria}
              onChange={(e) => setSinComplementaria(e.target.checked)}
              className="text-wos-primary focus:ring-wos-primary"
            />
            <span className="text-wos-accent">Sin complementaria</span>
          </label>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wos-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Concepto</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Estimado</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Real</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Desviación</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-wos-border/50">
                <td className="py-3 px-4 text-wos-accent font-medium">Total inversión</td>
                <td className="py-3 px-4 text-right text-wos-accent">
                  €{calcularTotalInversion('estimado').toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-wos-accent">
                  €{calcularTotalInversion('real').toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-wos-text-muted">
                  €{(calcularTotalInversion('real') - calcularTotalInversion('estimado')).toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-wos-border/50">
                <td className="py-3 px-4 text-wos-accent font-medium">Beneficio neto</td>
                <td className="py-3 px-4 text-right text-wos-accent">
                  €{calcularBeneficioNeto(parseFloat(preciosVenta.realista) || 0, 'estimado').toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-wos-accent">
                  €{calcularBeneficioNeto(parseFloat(preciosVenta.realista) || 0, 'real').toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-wos-text-muted">
                  €{(calcularBeneficioNeto(parseFloat(preciosVenta.realista) || 0, 'real') - calcularBeneficioNeto(parseFloat(preciosVenta.realista) || 0, 'estimado')).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-wos-accent font-medium">Rentabilidad neta</td>
                <td className="py-3 px-4 text-right text-green-500 font-bold">
                  {calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'estimado').toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right text-green-500 font-bold">
                  {calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'real').toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right text-wos-text-muted">
                  {(calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'real') - calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'estimado')).toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resultados por escenario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-wos-text-muted mb-2">Escenario Pesimista</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-wos-text-muted">Precio venta:</span>
                <div className="text-lg font-bold text-wos-accent">€{parseFloat(preciosVenta.pesimista || '0').toLocaleString()}</div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad:</span>
                <div className="text-2xl font-bold text-red-500">
                  {calcularRentabilidadNeta(parseFloat(preciosVenta.pesimista) || 0, 'estimado').toFixed(2)}%
                </div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad anualizada:</span>
                <div className="text-lg font-semibold text-red-400">
                  {calcularRentabilidadAnualizada(
                    calcularRentabilidadNeta(parseFloat(preciosVenta.pesimista) || 0, 'estimado'),
                    parseFloat(duracionMeses) || 12
                  ).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-wos-text-muted mb-2">Escenario Realista</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-wos-text-muted">Precio venta:</span>
                <div className="text-lg font-bold text-wos-accent">€{parseFloat(preciosVenta.realista || '0').toLocaleString()}</div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad:</span>
                <div className="text-2xl font-bold text-yellow-500">
                  {calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'estimado').toFixed(2)}%
                </div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad anualizada:</span>
                <div className="text-lg font-semibold text-yellow-400">
                  {calcularRentabilidadAnualizada(
                    calcularRentabilidadNeta(parseFloat(preciosVenta.realista) || 0, 'estimado'),
                    parseFloat(duracionMeses) || 12
                  ).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-wos-bg border border-wos-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-wos-text-muted mb-2">Escenario Optimista</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-wos-text-muted">Precio venta:</span>
                <div className="text-lg font-bold text-wos-accent">€{parseFloat(preciosVenta.optimista || '0').toLocaleString()}</div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad:</span>
                <div className="text-2xl font-bold text-green-500">
                  {calcularRentabilidadNeta(parseFloat(preciosVenta.optimista) || 0, 'estimado').toFixed(2)}%
                </div>
              </div>
              <div>
                <span className="text-xs text-wos-text-muted">Rentabilidad anualizada:</span>
                <div className="text-lg font-semibold text-green-400">
                  {calcularRentabilidadAnualizada(
                    calcularRentabilidadNeta(parseFloat(preciosVenta.optimista) || 0, 'estimado'),
                    parseFloat(duracionMeses) || 12
                  ).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-wos-text-muted mb-2">Duración de la operación (meses)</label>
          <input
            type="number"
            value={duracionMeses}
            onChange={(e) => setDuracionMeses(e.target.value)}
            className="w-48 bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
            placeholder="12"
          />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 6: Precio de compra para rentabilidad deseada */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">
          Precio de Compra para Rentabilidad Objetivo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Rentabilidad deseada (%)
            </label>
            <input
              type="number"
              value={rentabilidadDeseada}
              onChange={(e) => setRentabilidadDeseada(e.target.value)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="20"
            />
          </div>

          {rentabilidadDeseada && preciosVenta.realista && (
            <div className="flex items-end">
              <div className="bg-wos-bg border-2 border-wos-primary rounded-lg p-4 w-full">
                <div className="text-sm text-wos-text-muted mb-1">Precio máximo de compra</div>
                <div className="text-2xl font-bold text-wos-primary">
                  €{calcularPrecioCompraObjetivo(
                    parseFloat(preciosVenta.realista) || 0,
                    parseFloat(rentabilidadDeseada) || 0
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              if (!rentabilidadDeseada) {
                alert('Introduce una rentabilidad deseada');
                return;
              }
              // El cálculo ya se muestra automáticamente arriba
            }}
            className="bg-wos-primary hover:bg-wos-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-smooth"
          >
            Calcular
          </button>
          <button
            onClick={exportarExcel}
            className="bg-wos-bg border border-wos-border hover:bg-wos-card text-wos-accent px-6 py-2 rounded-lg font-medium transition-smooth flex items-center gap-2"
          >
            <FileSpreadsheet size={20} />
            Exportar
          </button>
          <button
            onClick={imprimir}
            className="bg-wos-bg border border-wos-border hover:bg-wos-card text-wos-accent px-6 py-2 rounded-lg font-medium transition-smooth flex items-center gap-2"
          >
            <Printer size={20} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
