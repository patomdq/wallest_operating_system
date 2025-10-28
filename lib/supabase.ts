import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos
export type Inmueble = {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  barrio?: string;
  tipo?: string;
  precio_compra?: number;
  precio_venta?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  estado: string;
  descripcion?: string;
  nota_simple?: boolean;
  deudas?: boolean;
  ocupado?: boolean;
  fecha_alta?: string;
  fecha_compra?: string;
  created_at?: string;
  updated_at?: string;
};

export type Finanza = {
  id: string;
  concepto: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  proyecto_asociado?: string;
  fecha: string;
  forma_pago?: string;
  comentario?: string;
  created_at?: string;
  updated_at?: string;
};

export type Reforma = {
  id: string;
  inmueble_id: string;
  nombre: string;
  etapa?: string;
  presupuesto_total?: number;
  avance: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
};

export type Lead = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  estado: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProyectoRentabilidad = {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  barrio?: string;
  provincia?: string;
  tipo_inmueble?: string;
  estado: 'borrador' | 'aprobado' | 'descartado' | 'en_marcha' | 'terminado';
  calificacion?: number;
  duracion_meses?: number;
  url?: string;
  observaciones?: string;
  
  // Gastos - Estimados
  precio_compra_estimado?: number;
  gastos_compraventa_estimado?: number;
  gastos_cancelacion_estimado?: number;
  itp_estimado?: number;
  honorarios_profesionales_estimado?: number;
  honorarios_complementaria_estimado?: number;
  certificado_energetico_estimado?: number;
  comisiones_inmobiliarias_estimado?: number;
  reforma_estimado?: number;
  seguros_estimado?: number;
  suministros_basura_estimado?: number;
  cuotas_comunidad_estimado?: number;
  deuda_ibi_estimado?: number;
  deuda_comunidad_estimado?: number;
  
  // Gastos - Reales
  precio_compra_real?: number;
  gastos_compraventa_real?: number;
  gastos_cancelacion_real?: number;
  itp_real?: number;
  honorarios_profesionales_real?: number;
  honorarios_complementaria_real?: number;
  certificado_energetico_real?: number;
  comisiones_inmobiliarias_real?: number;
  reforma_real?: number;
  seguros_real?: number;
  suministros_basura_real?: number;
  cuotas_comunidad_real?: number;
  deuda_ibi_real?: number;
  deuda_comunidad_real?: number;
  
  // Precios de venta
  precio_venta_pesimista?: number;
  precio_venta_realista?: number;
  precio_venta_optimista?: number;
  
  // Resultados calculados
  rentabilidad_pesimista?: number;
  rentabilidad_realista?: number;
  rentabilidad_optimista?: number;
  rentabilidad_anualizada_pesimista?: number;
  rentabilidad_anualizada_realista?: number;
  rentabilidad_anualizada_optimista?: number;
  
  created_at?: string;
  updated_at?: string;
};

export type Administracion = {
  id: string;
  concepto: string;
  categoria?: string;
  importe: number;
  tipo: 'ingreso' | 'gasto';
  fecha: string;
  forma_pago?: string;
  comentario?: string;
  created_at?: string;
  updated_at?: string;
};

export type Proveedor = {
  id: string;
  nombre: string;
  tipo: 'activo' | 'pasivo';
  rubro?: string;
  contacto?: string;
  cif?: string;
  email?: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
};

export type PartidaReforma = {
  id: string;
  reforma_id: string;
  partida: string;
  profesional?: string;
  costo?: number;
  tiempo_dias?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: 'pendiente' | 'en_proceso' | 'finalizado';
  created_at?: string;
  updated_at?: string;
};

export type Comercializacion = {
  id: string;
  inmueble_id: string;
  agente?: string;
  precio_salida?: number;
  publicado_en_portales?: boolean;
  portales?: string;
  precio_quiebre?: number;
  precio_minimo_aceptado?: number;
  estado: string;
  fecha_publicacion?: string;
  created_at?: string;
  updated_at?: string;
};

export type FinanzaProyecto = {
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

export type MovimientoEmpresa = {
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
};

export type EventoGlobal = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  recordatorio: boolean;
  reforma_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TareaGlobal = {
  id: string;
  titulo: string;
  descripcion?: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fecha_limite: string;
  estado: 'Pendiente' | 'En curso' | 'Completada';
  created_at?: string;
  updated_at?: string;
};
