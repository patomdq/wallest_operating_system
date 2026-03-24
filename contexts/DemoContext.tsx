'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const DEMO_INMUEBLE_ID = 'demo-inmueble-nexo';
const DEMO_REFORMA_ID  = 'demo-reforma-nexo';

export const demoData = {

  inmuebles: [
    {
      id:            DEMO_INMUEBLE_ID,
      nombre:        'Edificio Nexo',
      ciudad:        'Almería',
      direccion:     'Calle Mediterráneo 14',
      codigo_postal: '04001',
      barrio:        'Centro',
      tipo:          'Edificio',
      tipo_operacion: 'JV',
      porcentaje_hasu: 60,
      precio_compra: 190000,
      precio_venta:  330000,
      superficie:    450,
      habitaciones:  8,
      banos:         4,
      descripcion:   'Edificio de inversión conjunta — Demo Mode.',
      estado:        'COMPRADO' as const,
      fecha_alta:    '2026-01-01',
      fecha_compra:  '2026-01-15',
      created_at:    '2026-01-01T00:00:00Z',
      updated_at:    '2026-01-01T00:00:00Z',
    },
  ],

  // Todos en CaixaBank JV Nexo, todos vinculados al proyecto, ordenados desc por fecha
  movimientos: [
    { id: 'dm-10', fecha: '2026-03-18', tipo: 'Gasto'   as const, categoria: 'Servicios',  concepto: 'Pinturas García',                          monto:   -3000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Pinturas García',          observaciones: null, numero_factura: 'F-2026-050', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-09', fecha: '2026-03-15', tipo: 'Gasto'   as const, categoria: 'Servicios',  concepto: 'Electricidad Almería factura 2',            monto:   -3500, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Electricidad Almería',     observaciones: null, numero_factura: 'F-2026-040', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-08', fecha: '2026-03-01', tipo: 'Gasto'   as const, categoria: 'Materiales', concepto: 'Reformas Mediterráneo certificación 1',     monto:   -4000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Reformas Mediterráneo SL',  observaciones: null, numero_factura: 'F-2026-030', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-07', fecha: '2026-02-10', tipo: 'Gasto'   as const, categoria: 'Servicios',  concepto: 'Electricidad Almería factura 1',            monto:   -3500, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Electricidad Almería',     observaciones: null, numero_factura: 'F-2026-020', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-06', fecha: '2026-02-01', tipo: 'Gasto'   as const, categoria: 'Materiales', concepto: 'Reformas Mediterráneo anticipo',            monto:   -8000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Reformas Mediterráneo SL',  observaciones: null, numero_factura: 'F-2026-010', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-05', fecha: '2026-01-20', tipo: 'Gasto'   as const, categoria: 'Impuestos',  concepto: 'ITP 2%',                                   monto:   -3800, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                       observaciones: null, numero_factura: null,          proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-04', fecha: '2026-01-15', tipo: 'Gasto'   as const, categoria: 'Notaría',    concepto: 'Notaría y Registro',                       monto:   -7600, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                       observaciones: null, numero_factura: 'F-2026-001', proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-03', fecha: '2026-01-15', tipo: 'Gasto'   as const, categoria: 'Ventas',     concepto: 'Compra inmueble Edificio Nexo',             monto: -190000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                       observaciones: null, numero_factura: null,          proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-02', fecha: '2026-01-02', tipo: 'Ingreso' as const, categoria: 'Saldo Inicial', concepto: 'Aportación Carlos Martínez',            monto:   98000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                       observaciones: null, numero_factura: null,          proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
    { id: 'dm-01', fecha: '2026-01-01', tipo: 'Ingreso' as const, categoria: 'Saldo Inicial', concepto: 'Aportación HASU',                       monto:  120000, cuenta: 'CaixaBank JV Nexo', forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                       observaciones: null, numero_factura: null,          proyecto_nombre: 'Reforma Edificio Nexo (Edificio Nexo)' },
  ],

  reformas: [
    {
      id:                      DEMO_REFORMA_ID,
      inmueble_id:             DEMO_INMUEBLE_ID,
      nombre:                  'Reforma Edificio Nexo',
      etapa:                   'Ejecución',
      presupuesto:             55000,
      avance:                  62,
      fecha_inicio:            '2026-02-01',
      fecha_fin:               '2026-07-31',
      estado:                  'en_curso',
      inmuebles:               { nombre: 'Edificio Nexo', ciudad: 'Almería' },
      presupuesto_planificado: 55000,
      presupuesto_ejecutado:   37000,
      desviacion:              -32.7,
    },
  ],

  proyectos: [
    {
      id:        DEMO_REFORMA_ID,
      nombre:    'Reforma Edificio Nexo',
      inmuebles: { nombre: 'Edificio Nexo' },
    },
  ],

  proveedores: [
    { id: 'dpv-1', nombre: 'Reformas Mediterráneo SL', tipo: 'activo' as const, rubro: 'Construcción', contacto: 'Miguel Torres', cif: 'B12345678', email: 'info@reformas-med.demo',  telefono: '611 222 333' },
    { id: 'dpv-2', nombre: 'Electricidad Almería',     tipo: 'activo' as const, rubro: 'Electricidad', contacto: 'Antonio Ruiz',  cif: 'B87654321', email: 'info@elec-almeria.demo', telefono: '622 333 444' },
    { id: 'dpv-3', nombre: 'Pinturas García',          tipo: 'activo' as const, rubro: 'Pintura',      contacto: 'Luis García',   cif: 'B11223344', email: 'info@pinturas-g.demo',   telefono: '633 444 555' },
  ],

  // Planificador — PartidaReformaDetallada
  partidas: [
    { id: 'dp-1', reforma_id: DEMO_REFORMA_ID, nombre: 'Albañilería',  categoria: 'obra'        as const, estado: 'en_curso'  as const, total_calculado: 15000, orden: 1, notas: 'Presupuesto: 18.000 € · Avance 85%' },
    { id: 'dp-2', reforma_id: DEMO_REFORMA_ID, nombre: 'Electricidad', categoria: 'otros'       as const, estado: 'en_curso'  as const, total_calculado:  8500, orden: 2, notas: 'Presupuesto: 12.000 € · Avance 70%' },
    { id: 'dp-3', reforma_id: DEMO_REFORMA_ID, nombre: 'Fontanería',   categoria: 'obra'        as const, estado: 'ok'        as const, total_calculado:  8000, orden: 3, notas: 'Presupuesto: 8.000 € · Avance 100%' },
    { id: 'dp-4', reforma_id: DEMO_REFORMA_ID, nombre: 'Carpintería',  categoria: 'materiales'  as const, estado: 'pendiente' as const, total_calculado:  2000, orden: 4, notas: 'Presupuesto: 10.000 € · Avance 20%' },
    { id: 'dp-5', reforma_id: DEMO_REFORMA_ID, nombre: 'Pintura',      categoria: 'decoracion'  as const, estado: 'en_curso'  as const, total_calculado:  3500, orden: 5, notas: 'Presupuesto: 7.000 € · Avance 50%' },
  ],

  // Planificador — Items por partida
  items: [
    // Albañilería (dp-1)
    { id: 'di-1-1', partida_reforma_id: 'dp-1', nombre: 'Demolición tabiques',   estancia: 'General',              proveedor: 'Reformas Mediterráneo SL', coste: 5000, orden: 1, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-1-2', partida_reforma_id: 'dp-1', nombre: 'Solado salón',          estancia: 'Salón',                proveedor: 'Reformas Mediterráneo SL', coste: 6000, orden: 2, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-1-3', partida_reforma_id: 'dp-1', nombre: 'Solado habitaciones',   estancia: 'Habitación principal', proveedor: 'Reformas Mediterráneo SL', coste: 4000, orden: 3, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    // Electricidad (dp-2)
    { id: 'di-2-1', partida_reforma_id: 'dp-2', nombre: 'Cuadro eléctrico',              estancia: 'General', proveedor: 'Electricidad Almería', coste: 3500, orden: 1, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-2-2', partida_reforma_id: 'dp-2', nombre: 'Instalación puntos de luz',     estancia: 'General', proveedor: 'Electricidad Almería', coste: 3000, orden: 2, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-2-3', partida_reforma_id: 'dp-2', nombre: 'Tomas de corriente',            estancia: 'General', proveedor: 'Electricidad Almería', coste: 2000, orden: 3, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    // Fontanería (dp-3)
    { id: 'di-3-1', partida_reforma_id: 'dp-3', nombre: 'Instalación baño principal', estancia: 'Baño principal', proveedor: 'Reformas Mediterráneo SL', coste: 4000, orden: 1, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-3-2', partida_reforma_id: 'dp-3', nombre: 'Instalación cocina',        estancia: 'Cocina',         proveedor: 'Reformas Mediterráneo SL', coste: 2500, orden: 2, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-3-3', partida_reforma_id: 'dp-3', nombre: 'Tuberías generales',        estancia: 'General',        proveedor: 'Reformas Mediterráneo SL', coste: 1500, orden: 3, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    // Carpintería (dp-4)
    { id: 'di-4-1', partida_reforma_id: 'dp-4', nombre: 'Puertas interiores',    estancia: 'General',        proveedor: null, coste: 1200, orden: 1, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-4-2', partida_reforma_id: 'dp-4', nombre: 'Armarios habitación 1', estancia: 'Habitación 1',   proveedor: null, coste:  800, orden: 2, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    // Pintura (dp-5)
    { id: 'di-5-1', partida_reforma_id: 'dp-5', nombre: 'Paredes salón y pasillo', estancia: 'Salón',    proveedor: 'Pinturas García', coste: 1500, orden: 1, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
    { id: 'di-5-2', partida_reforma_id: 'dp-5', nombre: 'Habitaciones',            estancia: 'General',  proveedor: 'Pinturas García', coste: 2000, orden: 2, nota: null, fecha_compra: null, fecha_entrega: null, fecha_instalacion: null },
  ],

  // Nexo — Leads
  leads: [
    { id: 'dl-1', nombre: 'Pedro Sánchez',   email: 'pedro.sanchez@demo.com',   telefono: '611 001 001', estado: 'oferta',     notas: 'Interesado en Unidad 1 — oferta 280.000 €', created_at: '2026-03-10T10:00:00Z' },
    { id: 'dl-2', nombre: 'María González',  email: 'maria.gonzalez@demo.com',  telefono: '622 002 002', estado: 'oferta',     notas: 'Interesada en Unidad 2 — oferta 295.000 €', created_at: '2026-03-12T10:00:00Z' },
  ],

  // Nexo — Comercialización
  comercializacion: [
    {
      id: 'dc-1',
      inmueble_id: DEMO_INMUEBLE_ID,
      inmuebles:   { nombre: 'Edificio Nexo — Unidad 1', ciudad: 'Almería', tipo: 'Apartamento', precio_venta: 320000 },
      agente:      'Wallest',
      precio_salida:           320000,
      precio_quiebre:          310000,
      precio_minimo_aceptado:  295000,
      publicado_en_portales:   true,
      portales:                'Idealista, Fotocasa',
      estado:                  'activo',
      fecha_publicacion:       '2026-07-01',
    },
    {
      id: 'dc-2',
      inmueble_id: DEMO_INMUEBLE_ID,
      inmuebles:   { nombre: 'Edificio Nexo — Unidad 2', ciudad: 'Almería', tipo: 'Apartamento', precio_venta: 340000 },
      agente:      'Wallest',
      precio_salida:           340000,
      precio_quiebre:          330000,
      precio_minimo_aceptado:  310000,
      publicado_en_portales:   true,
      portales:                'Idealista, Fotocasa',
      estado:                  'activo',
      fecha_publicacion:       '2026-07-01',
    },
  ],

  // Finanzas — ProyectoConsolidado
  // Inversión: 190k compra + 37k reforma ejecutada = 227k
  // Venta proyectada realista: 330k  → beneficio proyectado: 85k (sobre coste total 245k)
  finanzas: [
    {
      id:                      DEMO_REFORMA_ID,
      nombre:                  'Reforma Edificio Nexo',
      tipo_operacion:          'JV',
      porcentaje_hasu:         60,
      estado:                  'COMPRADO',
      precio_compra:           190000,
      fecha_compra:            '2026-01-15',
      presupuesto_planificado: 55000,
      gastos_reales:           37000,
      ingresos:                0,
      beneficio:               85000,   // proyectado: 330k - 245k
      roi:                     34.7,    // proyectado
      fecha_venta:             null,
      desviacion_presupuestaria: -32.7, // (37k - 55k) / 55k × 100
      inmueble_nombre:         'Edificio Nexo',
      tiene_venta:             false,
    },
  ],

  calculadora: {
    id:                          'demo-calc-nexo',
    nombre:                      'Edificio Nexo — Análisis de Rentabilidad',
    ciudad:                      'Almería',
    barrio:                      'Centro',
    provincia:                   'Almería',
    direccion:                   'Calle Mediterráneo 14',
    tipo_inmueble:               'Edificio',
    estado:                      'en_marcha' as const,
    calificacion:                4,
    duracion_meses:              8,
    observaciones:               'JV con Carlos Martínez (40%). Demo Mode activo.',
    url:                         '',
    precio_compra_estimado:      190000,
    precio_compra_real:          190000,
    gastos_compraventa_estimado: 11400,
    gastos_compraventa_real:     11400,
    gastos_cancelacion_estimado: 0,
    gastos_cancelacion_real:     0,
    itp_estimado:                3800,
    itp_real:                    3800,
    honorarios_profesionales_estimado: 0,
    honorarios_profesionales_real:     0,
    honorarios_complementaria_estimado: 0,
    honorarios_complementaria_real:     0,
    certificado_energetico_estimado: 0,
    certificado_energetico_real:     0,
    comisiones_inmobiliarias_estimado: 0,
    comisiones_inmobiliarias_real:     0,
    reforma_estimado:            55000,
    reforma_real:                37000,
    seguros_estimado:            0,
    seguros_real:                0,
    suministros_basura_estimado: 0,
    suministros_basura_real:     0,
    cuotas_comunidad_estimado:   0,
    cuotas_comunidad_real:       0,
    deuda_ibi_estimado:          0,
    deuda_ibi_real:              0,
    deuda_comunidad_estimado:    0,
    deuda_comunidad_real:        0,
    precio_venta_pesimista:      310000,
    precio_venta_realista:       330000,
    precio_venta_optimista:      350000,
    created_at:                  '2026-01-01T00:00:00Z',
    updated_at:                  '2026-03-01T00:00:00Z',
  },
};

type DemoContextType = {
  isDemoMode: boolean;
  toggleDemo: () => void;
};

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  toggleDemo: () => {},
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('wos_demo_mode');
    if (stored === 'true') setIsDemoMode(true);
  }, []);

  const toggleDemo = () => {
    setIsDemoMode(prev => {
      const next = !prev;
      localStorage.setItem('wos_demo_mode', String(next));
      return next;
    });
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);
export const DEMO_REFORMA_ID_EXPORT = DEMO_REFORMA_ID;
