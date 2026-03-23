'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ── IDs ficticios ───────────────────────────────────────────────────────────
const DEMO_INMUEBLE_ID = 'demo-inmueble-nexo';
const DEMO_REFORMA_ID  = 'demo-reforma-nexo';

// ── Datos ficticios de la Operación Edificio Nexo ───────────────────────────
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
      precio_compra: 190000,
      precio_venta:  330000,
      superficie:    450,
      habitaciones:  8,
      banos:         4,
      descripcion:   'Edificio de inversión conjunta — Demo Mode activo.',
      estado:        'COMPRADO' as const,
      fecha_alta:    '2026-01-01',
      fecha_compra:  '2026-01-15',
      created_at:    '2026-01-01T00:00:00Z',
      updated_at:    '2026-01-01T00:00:00Z',
    },
  ],

  movimientos: [
    { id: 'dm-01', fecha: '2026-01-01', tipo: 'Ingreso' as const, categoria: 'Saldo Inicial',  concepto: 'Aportación HASU',                        monto:  120000,  cuenta: 'CaixaBank',          forma_pago: 'Transferencia', proyecto_id: null,            proveedor: null,                     observaciones: null, numero_factura: null },
    { id: 'dm-02', fecha: '2026-01-02', tipo: 'Ingreso' as const, categoria: 'Saldo Inicial',  concepto: 'Aportación Carlos Martínez',              monto:   98000,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                     observaciones: null, numero_factura: null },
    { id: 'dm-03', fecha: '2026-01-15', tipo: 'Gasto'   as const, categoria: 'Ventas',         concepto: 'Compra inmueble Edificio Nexo',            monto: -190000,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                     observaciones: null, numero_factura: null },
    { id: 'dm-04', fecha: '2026-01-15', tipo: 'Gasto'   as const, categoria: 'Notaría',        concepto: 'Notaría y Registro',                      monto:   -7600,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                     observaciones: null, numero_factura: 'F-2026-001' },
    { id: 'dm-05', fecha: '2026-01-20', tipo: 'Gasto'   as const, categoria: 'Impuestos',      concepto: 'ITP 2%',                                  monto:   -3800,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: null,                     observaciones: null, numero_factura: null },
    { id: 'dm-06', fecha: '2026-02-01', tipo: 'Gasto'   as const, categoria: 'Materiales',     concepto: 'Reformas Mediterráneo anticipo',           monto:  -10000,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Reformas Mediterráneo SL', observaciones: null, numero_factura: 'F-2026-010' },
    { id: 'dm-07', fecha: '2026-02-10', tipo: 'Gasto'   as const, categoria: 'Servicios',      concepto: 'Electricidad Almería factura 1',           monto:   -4200,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Electricidad Almería',    observaciones: null, numero_factura: 'F-2026-020' },
    { id: 'dm-08', fecha: '2026-03-01', tipo: 'Gasto'   as const, categoria: 'Materiales',     concepto: 'Reformas Mediterráneo certificación 1',    monto:   -5000,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Reformas Mediterráneo SL', observaciones: null, numero_factura: 'F-2026-030' },
    { id: 'dm-09', fecha: '2026-03-15', tipo: 'Gasto'   as const, categoria: 'Servicios',      concepto: 'Electricidad Almería factura 2',           monto:   -4300,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Electricidad Almería',    observaciones: null, numero_factura: 'F-2026-040' },
    { id: 'dm-10', fecha: '2026-03-18', tipo: 'Gasto'   as const, categoria: 'Servicios',      concepto: 'Pinturas García',                         monto:   -3500,  cuenta: 'CaixaBank JV Nexo',  forma_pago: 'Transferencia', proyecto_id: DEMO_REFORMA_ID, proveedor: 'Pinturas García',         observaciones: null, numero_factura: 'F-2026-050' },
  ],

  reformas: [
    {
      id:                   DEMO_REFORMA_ID,
      inmueble_id:          DEMO_INMUEBLE_ID,
      nombre:               'Reforma Edificio Nexo',
      etapa:                'Ejecución',
      presupuesto_total:    55000,
      avance:               62,
      fecha_inicio:         '2026-02-01',
      fecha_fin:            '2026-07-31',
      estado:               'en_curso',
      inmuebles:            { nombre: 'Edificio Nexo', ciudad: 'Almería' },
      // Campos calculados que agrega loadData
      presupuesto_planificado: 55000,
      presupuesto_ejecutado:   37000,
      desviacion:              0,
    },
  ],

  // Para el selector de proyectos en administracion
  proyectos: [
    {
      id:        DEMO_REFORMA_ID,
      nombre:    'Edificio Nexo',
      inmuebles: { nombre: 'Edificio Nexo' },
    },
  ],

  proveedores: [
    { id: 'dpv-1', nombre: 'Reformas Mediterráneo SL', tipo: 'activo' as const, rubro: 'Construcción', contacto: 'Miguel Torres', cif: 'B12345678', email: 'info@reformas-med.demo',  telefono: '611 222 333' },
    { id: 'dpv-2', nombre: 'Electricidad Almería',     tipo: 'activo' as const, rubro: 'Electricidad', contacto: 'Antonio Ruiz',  cif: 'B87654321', email: 'info@elec-almeria.demo', telefono: '622 333 444' },
    { id: 'dpv-3', nombre: 'Pinturas García',          tipo: 'activo' as const, rubro: 'Pintura',      contacto: 'Luis García',   cif: 'B11223344', email: 'info@pinturas-g.demo',   telefono: '633 444 555' },
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

// ── Context ─────────────────────────────────────────────────────────────────
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
