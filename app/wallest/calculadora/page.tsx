'use client';

import { useState, useEffect } from 'react';
import { supabase, ProyectoRentabilidad } from '@/lib/supabase';
import { Calculator, Save, Printer, Star, Edit2, Trash2 } from 'lucide-react';

const CONCEPTOS_GASTOS = [
  { id: 'precio_compra', nombre: 'Precio de compra' },
  { id: 'gastos_compraventa', nombre: 'Gastos de compraventa (notario, registro, gestoría)' },
  { id: 'gastos_cancelacion', nombre: 'Gastos de cancelación (notario, registro, gestoría)' },
  { id: 'itp', nombre: 'Impuesto de compra ITP' },
  { id: 'honorarios_profesionales', nombre: 'Honorarios profesionales' },
  { id: 'honorarios_complementaria', nombre: 'Honorarios gestión complementaria' },
  { id: 'certificado_energetico', nombre: 'Certificado energético' },
  { id: 'comisiones_inmobiliarias', nombre: 'Comisiones inmobiliarias' },
  { id: 'reforma', nombre: 'Reforma' },
  { id: 'seguros', nombre: 'Seguros' },
  { id: 'suministros_basura', nombre: 'Suministros / basura' },
  { id: 'cuotas_comunidad', nombre: 'Cuotas comunidad propietarios' },
  { id: 'deuda_ibi', nombre: 'Deuda IBI' },
  { id: 'deuda_comunidad', nombre: 'Deuda comunidad propietarios' },
];

export default function CalculadoraRentabilidad() {
  // Datos del proyecto
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [barrio, setBarrio] = useState('');
  const [provincia, setProvincia] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estado, setEstado] = useState<'borrador' | 'aprobado' | 'descartado' | 'en_marcha' | 'terminado'>('borrador');
  const [calificacion, setCalificacion] = useState(0);
  const [duracionMeses, setDuracionMeses] = useState(12);
  
  // Estado para botón guardar
  const [guardando, setGuardando] = useState(false);
  
  // Proyectos guardados
  const [proyectosGuardados, setProyectosGuardados] = useState<ProyectoRentabilidad[]>([]);
  
  // Proyecto en edición
  const [proyectoEditando, setProyectoEditando] = useState<string | null>(null);

  // Gastos (estimados y reales)
  const [gastos, setGastos] = useState<Record<string, { estimado: number; real: number }>>(() => {
    const initial: Record<string, { estimado: number; real: number }> = {};
    CONCEPTOS_GASTOS.forEach(concepto => {
      initial[concepto.id] = { estimado: 0, real: 0 };
    });
    return initial;
  });

  // Precios de venta
  const [precioVentaPesimista, setPrecioVentaPesimista] = useState(0);
  const [precioVentaRealista, setPrecioVentaRealista] = useState(0);
  const [precioVentaOptimista, setPrecioVentaOptimista] = useState(0);
  
  // Observaciones
  const [observaciones, setObservaciones] = useState('');

  // Resultados calculados
  const [resultados, setResultados] = useState({
    totalInversionEstimado: 0,
    totalInversionReal: 0,
    beneficioPesimista: 0,
    beneficioRealista: 0,
    beneficioOptimista: 0,
    rentabilidadPesimista: 0,
    rentabilidadRealista: 0,
    rentabilidadOptimista: 0,
    rentabilidadAnualizadaPesimista: 0,
    rentabilidadAnualizadaRealista: 0,
    rentabilidadAnualizadaOptimista: 0,
  });

  // Cargar proyectos guardados al iniciar
  useEffect(() => {
    loadProyectosGuardados();
  }, []);

  // Calcular resultados automáticamente cuando cambian los valores
  useEffect(() => {
    calcularResultados();
  }, [gastos, precioVentaPesimista, precioVentaRealista, precioVentaOptimista, duracionMeses]);

  const loadProyectosGuardados = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos_rentabilidad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProyectosGuardados(data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };

  // Helper para normalizar números
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    
    // Si ya es número
    if (typeof value === 'number') {
      return isNaN(value) || !isFinite(value) ? 0 : value;
    }
    
    // Si es string
    let str = String(value).trim();
    
    // Remover símbolo de euro
    str = str.replace(/€/g, '');
    
    // Remover espacios
    str = str.replace(/\s/g, '');
    
    // Remover puntos de miles (formato europeo: 1.234.567)
    str = str.replace(/\./g, '');
    
    // Reemplazar coma decimal por punto
    str = str.replace(/,/g, '.');
    
    // Parsear
    const num = parseFloat(str);
    
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  const calcularResultados = () => {
    // Total inversión REAL (o estimado si real no existe)
    let totalInversionReal = 0;
    
    // Sumar todos los gastos usando valores reales (o estimados si no hay real)
    CONCEPTOS_GASTOS.forEach(concepto => {
      const valorReal = toNumber(gastos[concepto.id].real);
      const valorEstimado = toNumber(gastos[concepto.id].estimado);
      totalInversionReal += valorReal > 0 ? valorReal : valorEstimado;
    });

    // Prevenir división por cero
    if (totalInversionReal <= 0) {
      setResultados({
        totalInversionEstimado: 0,
        totalInversionReal: 0,
        beneficioPesimista: 0,
        beneficioRealista: 0,
        beneficioOptimista: 0,
        rentabilidadPesimista: 0,
        rentabilidadRealista: 0,
        rentabilidadOptimista: 0,
        rentabilidadAnualizadaPesimista: 0,
        rentabilidadAnualizadaRealista: 0,
        rentabilidadAnualizadaOptimista: 0,
      });
      return;
    }

    // Beneficios por escenario
    const pvPesimista = toNumber(precioVentaPesimista);
    const pvRealista = toNumber(precioVentaRealista);
    const pvOptimista = toNumber(precioVentaOptimista);

    const beneficioPesimista = pvPesimista - totalInversionReal;
    const beneficioRealista = pvRealista - totalInversionReal;
    const beneficioOptimista = pvOptimista - totalInversionReal;

    // Rentabilidades por escenario
    const rentabilidadPesimista = (beneficioPesimista / totalInversionReal) * 100;
    const rentabilidadRealista = (beneficioRealista / totalInversionReal) * 100;
    const rentabilidadOptimista = (beneficioOptimista / totalInversionReal) * 100;

    // Rentabilidades anualizadas
    const meses = Math.max(1, toNumber(duracionMeses));
    
    const calcularAnualizada = (rentab: number) => {
      if (isNaN(rentab) || !isFinite(rentab)) return 0;
      const anualizada = (Math.pow(1 + rentab / 100, 12 / meses) - 1) * 100;
      return isNaN(anualizada) || !isFinite(anualizada) ? 0 : anualizada;
    };

    const rentabilidadAnualizadaPesimista = calcularAnualizada(rentabilidadPesimista);
    const rentabilidadAnualizadaRealista = calcularAnualizada(rentabilidadRealista);
    const rentabilidadAnualizadaOptimista = calcularAnualizada(rentabilidadOptimista);

    // Total estimado para referencia
    let totalEstimado = 0;
    CONCEPTOS_GASTOS.forEach(concepto => {
      totalEstimado += toNumber(gastos[concepto.id].estimado);
    });

    setResultados({
      totalInversionEstimado: totalEstimado,
      totalInversionReal: totalInversionReal,
      beneficioPesimista: isNaN(beneficioPesimista) ? 0 : beneficioPesimista,
      beneficioRealista: isNaN(beneficioRealista) ? 0 : beneficioRealista,
      beneficioOptimista: isNaN(beneficioOptimista) ? 0 : beneficioOptimista,
      rentabilidadPesimista: isNaN(rentabilidadPesimista) ? 0 : rentabilidadPesimista,
      rentabilidadRealista: isNaN(rentabilidadRealista) ? 0 : rentabilidadRealista,
      rentabilidadOptimista: isNaN(rentabilidadOptimista) ? 0 : rentabilidadOptimista,
      rentabilidadAnualizadaPesimista,
      rentabilidadAnualizadaRealista,
      rentabilidadAnualizadaOptimista,
    });
  };

  const handleGastoChange = (conceptoId: string, tipo: 'estimado' | 'real', valor: string) => {
    const numericValue = parseFloat(valor) || 0;
    setGastos(prev => ({
      ...prev,
      [conceptoId]: {
        ...prev[conceptoId],
        [tipo]: numericValue,
      },
    }));
  };

  const calcularDesviacion = (conceptoId: string) => {
    return gastos[conceptoId].real - gastos[conceptoId].estimado;
  };

  const handleGuardarProyecto = async () => {
    // Validaciones
    if (!nombre || nombre.trim() === '') {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    const precioCompraEst = toNumber(gastos.precio_compra.estimado);
    const precioCompraReal = toNumber(gastos.precio_compra.real);
    
    if (precioCompraEst === 0 && precioCompraReal === 0) {
      alert('Debe ingresar el precio de compra');
      return;
    }

    const pvRealista = toNumber(precioVentaRealista);
    const pvPesimista = toNumber(precioVentaPesimista);
    
    if (pvRealista === 0 && pvPesimista === 0) {
      alert('Debe ingresar al menos un precio de venta (realista o pesimista)');
      return;
    }

    // Activar estado de guardando
    setGuardando(true);

    try {
      // Preparar datos para guardar (todos los valores numéricos con toNumber)
      const proyectoData: any = {
        nombre: nombre.trim(),
        direccion: direccion?.trim() || null,
        estado: estado || 'borrador',
        calificacion: toNumber(calificacion),
        duracion_meses: toNumber(duracionMeses) || 12,
        
        // Precios de venta
        precio_venta_pesimista: toNumber(precioVentaPesimista),
        precio_venta_realista: toNumber(precioVentaRealista),
        precio_venta_optimista: toNumber(precioVentaOptimista),
        
        // Resultados calculados
        rentabilidad_pesimista: toNumber(resultados.rentabilidadPesimista),
        rentabilidad_realista: toNumber(resultados.rentabilidadRealista),
        rentabilidad_optimista: toNumber(resultados.rentabilidadOptimista),
        rentabilidad_anualizada_pesimista: toNumber(resultados.rentabilidadAnualizadaPesimista),
        rentabilidad_anualizada_realista: toNumber(resultados.rentabilidadAnualizadaRealista),
        rentabilidad_anualizada_optimista: toNumber(resultados.rentabilidadAnualizadaOptimista),
      };

      // Agregar campos de ubicación
      if (ciudad && ciudad.trim()) proyectoData.ciudad = ciudad.trim();
      if (barrio && barrio.trim()) proyectoData.barrio = barrio.trim();
      if (provincia && provincia.trim()) proyectoData.provincia = provincia.trim();

      // Agregar todos los gastos estimados y reales (con toNumber)
      CONCEPTOS_GASTOS.forEach(concepto => {
        proyectoData[`${concepto.id}_estimado`] = toNumber(gastos[concepto.id].estimado);
        proyectoData[`${concepto.id}_real`] = toNumber(gastos[concepto.id].real);
      });
      
      // Agregar observaciones
      proyectoData.observaciones = observaciones?.trim() || null;

      console.log('Datos a guardar:', proyectoData); // Para debugging

      let error;

      if (proyectoEditando) {
        // ACTUALIZAR proyecto existente
        const { error: updateError } = await supabase
          .from('proyectos_rentabilidad')
          .update(proyectoData)
          .eq('id', proyectoEditando);
        
        error = updateError;
      } else {
        // INSERTAR nuevo proyecto
        const { error: insertError } = await supabase
          .from('proyectos_rentabilidad')
          .insert([proyectoData]);
        
        error = insertError;
      }

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      alert(proyectoEditando ? 'Proyecto actualizado correctamente' : 'Proyecto guardado correctamente');
      
      // Limpiar formulario y estado de edición
      limpiarFormulario();
      setProyectoEditando(null);
      
      // Recargar lista de proyectos
      loadProyectosGuardados();
    } catch (error: any) {
      console.error('Error completo al guardar:', error);
      alert(`Error al guardar el proyecto: ${error?.message || 'Error desconocido'}`);
    } finally {
      // Desactivar estado de guardando
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCiudad('');
    setBarrio('');
    setProvincia('');
    setDireccion('');
    setEstado('borrador');
    setCalificacion(0);
    setDuracionMeses(12);
    
    const gastosLimpios: Record<string, { estimado: number; real: number }> = {};
    CONCEPTOS_GASTOS.forEach(concepto => {
      gastosLimpios[concepto.id] = { estimado: 0, real: 0 };
    });
    setGastos(gastosLimpios);
    
    setPrecioVentaPesimista(0);
    setPrecioVentaRealista(0);
    setPrecioVentaOptimista(0);
    setObservaciones('');
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleEditarProyecto = (proyecto: ProyectoRentabilidad) => {
    // Cargar datos del proyecto en el formulario
    setNombre(proyecto.nombre || '');
    setCiudad(proyecto.ciudad || '');
    setBarrio(proyecto.barrio || '');
    setProvincia(proyecto.provincia || '');
    setDireccion(proyecto.direccion || '');
    setEstado(proyecto.estado);
    setCalificacion(proyecto.calificacion || 0);
    setDuracionMeses(proyecto.duracion_meses || 12);

    // Cargar precios de venta
    setPrecioVentaPesimista(proyecto.precio_venta_pesimista || 0);
    setPrecioVentaRealista(proyecto.precio_venta_realista || 0);
    setPrecioVentaOptimista(proyecto.precio_venta_optimista || 0);

    // Cargar gastos
    const nuevosGastos: Record<string, { estimado: number; real: number }> = {};
    CONCEPTOS_GASTOS.forEach(concepto => {
      nuevosGastos[concepto.id] = {
        estimado: (proyecto as any)[`${concepto.id}_estimado`] || 0,
        real: (proyecto as any)[`${concepto.id}_real`] || 0,
      };
    });
    setGastos(nuevosGastos);
    
    // Cargar observaciones
    setObservaciones((proyecto as any).observaciones || '');

    // Guardar ID del proyecto en edición
    setProyectoEditando(proyecto.id);

    // Scroll al inicio del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProyecto = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proyecto "${nombre}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('proyectos_rentabilidad')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar:', error);
        throw error;
      }

      alert('Proyecto eliminado correctamente');
      loadProyectosGuardados();
      
      // Si estábamos editando este proyecto, limpiar el formulario
      if (proyectoEditando === id) {
        limpiarFormulario();
        setProyectoEditando(null);
      }
    } catch (error: any) {
      console.error('Error completo al eliminar:', error);
      alert(`Error al eliminar el proyecto: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleCancelarEdicion = () => {
    limpiarFormulario();
    setProyectoEditando(null);
  };

  const renderEstrellas = (valor: number, onChange: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="cursor-pointer transition-smooth"
          >
            <Star
              size={20}
              className={star <= valor ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-gray-500'}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatEuro = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const getRentabilidadColor = (valor: number) => {
    if (valor < 0) return 'text-red-500';
    if (valor < 15) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wos-accent flex items-center gap-3">
            <Calculator className="text-wos-primary" />
            Calculadora de Rentabilidad
          </h1>
          <p className="text-wos-text-muted mt-1">
            Análisis completo de inversión inmobiliaria
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: Datos del Proyecto */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Datos del Proyecto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Nombre del proyecto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="Ej: Calle Mayor 15, 3º B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Barrio
            </label>
            <input
              type="text"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="Ej: Malasaña"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Ciudad
            </label>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="Ej: Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Provincia
            </label>
            <input
              type="text"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="Ej: Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
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
              Duración de la operación (meses)
            </label>
            <input
              type="number"
              value={duracionMeses}
              onChange={(e) => setDuracionMeses(parseInt(e.target.value) || 1)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Calificación
            </label>
            {renderEstrellas(calificacion, setCalificacion)}
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 2: Gastos de la operación */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Gastos de la Operación</h2>
        
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
              {CONCEPTOS_GASTOS.map((concepto) => {
                const desviacion = calcularDesviacion(concepto.id);
                return (
                  <tr key={concepto.id} className="border-b border-wos-border/50 hover:bg-wos-bg/50 transition-smooth">
                    <td className="py-3 px-4 text-wos-accent">{concepto.nombre}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={gastos[concepto.id].estimado || ''}
                        onChange={(e) => handleGastoChange(concepto.id, 'estimado', e.target.value)}
                        className="w-full bg-wos-bg border border-wos-border rounded px-3 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={gastos[concepto.id].real || ''}
                        onChange={(e) => handleGastoChange(concepto.id, 'real', e.target.value)}
                        className="w-full bg-wos-bg border border-wos-border rounded px-3 py-1 text-right text-wos-accent focus:outline-none focus:ring-1 focus:ring-wos-primary"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${desviacion < 0 ? 'text-green-500' : desviacion > 0 ? 'text-red-500' : 'text-wos-text-muted'}`}>
                      {formatEuro(desviacion)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-wos-bg font-semibold">
                <td className="py-3 px-4 text-wos-accent">TOTAL INVERSIÓN</td>
                <td className="py-3 px-4 text-right text-wos-accent">{formatEuro(resultados.totalInversionEstimado)}</td>
                <td className="py-3 px-4 text-right text-wos-accent">{formatEuro(resultados.totalInversionReal)}</td>
                <td className="py-3 px-4 text-right text-wos-accent">
                  {formatEuro(resultados.totalInversionReal - resultados.totalInversionEstimado)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Observaciones */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-wos-text-muted mb-2">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-3 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary resize-y min-h-[100px]"
            placeholder="Escribe aquí tus observaciones o comentarios generales sobre la operación..."
          />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 3: Precio de venta (3 escenarios) */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Precio de Venta - Escenarios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Precio de venta Pesimista (€)
            </label>
            <input
              type="number"
              value={precioVentaPesimista || ''}
              onChange={(e) => setPrecioVentaPesimista(parseFloat(e.target.value) || 0)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Precio de venta Realista (€)
            </label>
            <input
              type="number"
              value={precioVentaRealista || ''}
              onChange={(e) => setPrecioVentaRealista(parseFloat(e.target.value) || 0)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wos-text-muted mb-2">
              Precio de venta Optimista (€)
            </label>
            <input
              type="number"
              value={precioVentaOptimista || ''}
              onChange={(e) => setPrecioVentaOptimista(parseFloat(e.target.value) || 0)}
              className="w-full bg-wos-bg border border-wos-border rounded-lg px-4 py-2 text-wos-accent focus:outline-none focus:ring-2 focus:ring-wos-primary"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 4: Resultados */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Resultados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Escenario Pesimista */}
          <div className="bg-wos-bg border-2 border-red-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Escenario Pesimista</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Beneficio</div>
                <div className={`text-2xl font-bold ${getRentabilidadColor(resultados.beneficioPesimista)}`}>
                  {formatEuro(resultados.beneficioPesimista)}
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadPesimista)}`}>
                  {resultados.rentabilidadPesimista.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad Anualizada</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadAnualizadaPesimista)}`}>
                  {resultados.rentabilidadAnualizadaPesimista.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Escenario Realista */}
          <div className="bg-wos-bg border-2 border-yellow-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">Escenario Realista</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Beneficio</div>
                <div className={`text-2xl font-bold ${getRentabilidadColor(resultados.beneficioRealista)}`}>
                  {formatEuro(resultados.beneficioRealista)}
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadRealista)}`}>
                  {resultados.rentabilidadRealista.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad Anualizada</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadAnualizadaRealista)}`}>
                  {resultados.rentabilidadAnualizadaRealista.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Escenario Optimista */}
          <div className="bg-wos-bg border-2 border-green-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Escenario Optimista</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Beneficio</div>
                <div className={`text-2xl font-bold ${getRentabilidadColor(resultados.beneficioOptimista)}`}>
                  {formatEuro(resultados.beneficioOptimista)}
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadOptimista)}`}>
                  {resultados.rentabilidadOptimista.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-wos-text-muted mb-1">Rentabilidad Anualizada</div>
                <div className={`text-xl font-semibold ${getRentabilidadColor(resultados.rentabilidadAnualizadaOptimista)}`}>
                  {resultados.rentabilidadAnualizadaOptimista.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 5: Botones de acción */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        {proyectoEditando && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-blue-300 text-sm">
              ✏️ Editando proyecto. Los cambios se guardarán al hacer click en "Actualizar proyecto".
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGuardarProyecto}
            disabled={guardando}
            className="flex-1 md:flex-initial bg-wos-primary hover:bg-wos-primary/80 disabled:bg-wos-primary/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-smooth flex items-center justify-center gap-2 min-w-[200px]"
          >
            <Save size={20} />
            {guardando ? 'Guardando...' : proyectoEditando ? 'Actualizar proyecto' : 'Guardar proyecto'}
          </button>

          {proyectoEditando && (
            <button
              onClick={handleCancelarEdicion}
              className="flex-1 md:flex-initial bg-wos-bg border border-wos-border hover:bg-red-500/20 text-wos-accent px-6 py-3 rounded-lg font-medium transition-smooth flex items-center justify-center gap-2 min-w-[200px]"
            >
              Cancelar edición
            </button>
          )}

          <button
            onClick={handleImprimir}
            className="flex-1 md:flex-initial bg-wos-bg border border-wos-border hover:bg-wos-card text-wos-accent px-6 py-3 rounded-lg font-medium transition-smooth flex items-center justify-center gap-2 min-w-[200px]"
          >
            <Printer size={20} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-wos-border"></div>

      {/* SECCIÓN 6: Proyectos Guardados */}
      <div className="bg-wos-card border border-wos-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-wos-accent mb-4">Proyectos guardados</h2>
        
        {proyectosGuardados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wos-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Nombre del proyecto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Dirección</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-wos-text-muted">Ciudad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Precio de compra</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Rent. Pesimista</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Rent. Realista</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-wos-text-muted">Rent. Optimista</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-wos-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectosGuardados.map((proyecto) => (
                  <tr 
                    key={proyecto.id} 
                    className={`border-b border-wos-border/50 hover:bg-wos-bg/50 transition-smooth ${proyectoEditando === proyecto.id ? 'bg-blue-500/10' : ''}`}
                  >
                    <td className="py-3 px-4 text-wos-accent font-medium">{proyecto.nombre}</td>
                    <td className="py-3 px-4 text-wos-text-muted">{proyecto.direccion || '-'}</td>
                    <td className="py-3 px-4 text-wos-text-muted">{proyecto.ciudad || '-'}</td>
                    <td className="py-3 px-4 text-right text-wos-accent">
                      {formatEuro(proyecto.precio_compra_estimado || proyecto.precio_compra_real || 0)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${getRentabilidadColor(proyecto.rentabilidad_pesimista || 0)}`}>
                      {(proyecto.rentabilidad_pesimista || 0).toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${getRentabilidadColor(proyecto.rentabilidad_realista || 0)}`}>
                      {(proyecto.rentabilidad_realista || 0).toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${getRentabilidadColor(proyecto.rentabilidad_optimista || 0)}`}>
                      {(proyecto.rentabilidad_optimista || 0).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditarProyecto(proyecto)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-smooth group"
                          title="Editar proyecto"
                        >
                          <Edit2 size={18} className="text-wos-text-muted group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleEliminarProyecto(proyecto.id, proyecto.nombre)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth group"
                          title="Eliminar proyecto"
                        >
                          <Trash2 size={18} className="text-wos-text-muted group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-wos-text-muted py-8">
            No hay proyectos guardados todavía
          </p>
        )}
      </div>
    </div>
  );
}
