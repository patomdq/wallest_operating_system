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

export type SimulacionRentabilidad = {
  id: string;
  nombre: string;
  precio_compra: number;
  precio_venta: number;
  itp_porcentaje: number;
  notaria: number;
  registro: number;
  api_compra: number;
  reforma: number;
  costo_total?: number;
  beneficio?: number;
  roi_total?: number;
  roi_anualizado?: number;
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
