-- Migración V2: Nueva Calculadora de Rentabilidad Completa
-- Fecha: 2025-10-13
-- Descripción: Creación de tabla completa para la nueva CDR

-- 1. Eliminar tabla antigua si existe (CUIDADO: esto borrará los datos)
-- DROP TABLE IF EXISTS simulaciones_rentabilidad CASCADE;

-- 2. Crear nueva tabla proyectos_rentabilidad
CREATE TABLE IF NOT EXISTS proyectos_rentabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  nombre TEXT NOT NULL,
  direccion TEXT,
  comunidad TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador',
  calificacion INTEGER DEFAULT 0 CHECK (calificacion >= 0 AND calificacion <= 5),
  
  -- Configuración del proyecto
  impuesto TEXT,
  valor_referencia NUMERIC DEFAULT 0,
  vendedor_no_residente BOOLEAN DEFAULT false,
  
  -- Precios de venta (3 escenarios)
  precio_venta_pesimista NUMERIC,
  precio_venta_realista NUMERIC,
  precio_venta_optimista NUMERIC,
  
  -- Conceptos principales (estimado vs real)
  precio_compra_estimado NUMERIC DEFAULT 0,
  precio_compra_real NUMERIC DEFAULT 0,
  
  gastos_compraventa_estimado NUMERIC DEFAULT 0,
  gastos_compraventa_real NUMERIC DEFAULT 0,
  
  gastos_cancelacion_estimado NUMERIC DEFAULT 0,
  gastos_cancelacion_real NUMERIC DEFAULT 0,
  
  impuestos_compra_estimado NUMERIC DEFAULT 0,
  impuestos_compra_real NUMERIC DEFAULT 0,
  
  retenciones_extranjeros_estimado NUMERIC DEFAULT 0,
  retenciones_extranjeros_real NUMERIC DEFAULT 0,
  
  liquidacion_complementaria_estimado NUMERIC DEFAULT 0,
  liquidacion_complementaria_real NUMERIC DEFAULT 0,
  
  -- Datos adicionales
  conceptos_adicionales JSONB,
  gastos_checklist TEXT[],
  duracion_meses INTEGER DEFAULT 12,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear constraint para el estado
ALTER TABLE proyectos_rentabilidad 
DROP CONSTRAINT IF EXISTS proyectos_rentabilidad_estado_check;

ALTER TABLE proyectos_rentabilidad 
ADD CONSTRAINT proyectos_rentabilidad_estado_check 
CHECK (estado IN ('borrador', 'aprobado', 'descartado', 'en_marcha', 'terminado'));

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_estado ON proyectos_rentabilidad(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_comunidad ON proyectos_rentabilidad(comunidad);
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_created_at ON proyectos_rentabilidad(created_at DESC);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_proyectos_rentabilidad_updated_at ON proyectos_rentabilidad;

CREATE TRIGGER update_proyectos_rentabilidad_updated_at
BEFORE UPDATE ON proyectos_rentabilidad
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE proyectos_rentabilidad ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas de acceso (ajustar según necesidades)
-- Política para lectura: todos los usuarios autenticados pueden leer
CREATE POLICY "Permitir lectura a usuarios autenticados" ON proyectos_rentabilidad
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserción: todos los usuarios autenticados pueden crear
CREATE POLICY "Permitir inserción a usuarios autenticados" ON proyectos_rentabilidad
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para actualización: todos los usuarios autenticados pueden actualizar
CREATE POLICY "Permitir actualización a usuarios autenticados" ON proyectos_rentabilidad
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para eliminación: todos los usuarios autenticados pueden eliminar
CREATE POLICY "Permitir eliminación a usuarios autenticados" ON proyectos_rentabilidad
FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Comentarios en la tabla y columnas
COMMENT ON TABLE proyectos_rentabilidad IS 'Proyectos de inversión inmobiliaria con cálculo de rentabilidad';

COMMENT ON COLUMN proyectos_rentabilidad.nombre IS 'Nombre identificativo del proyecto';
COMMENT ON COLUMN proyectos_rentabilidad.direccion IS 'Dirección completa del inmueble';
COMMENT ON COLUMN proyectos_rentabilidad.comunidad IS 'Comunidad autónoma';
COMMENT ON COLUMN proyectos_rentabilidad.estado IS 'Estado del proyecto: borrador, aprobado, descartado, en_marcha, terminado';
COMMENT ON COLUMN proyectos_rentabilidad.calificacion IS 'Calificación del proyecto de 0 a 5 estrellas';
COMMENT ON COLUMN proyectos_rentabilidad.impuesto IS 'Tipo de impuesto aplicable: ITP, IVA+AJD, etc.';
COMMENT ON COLUMN proyectos_rentabilidad.valor_referencia IS 'Valor de referencia catastral en euros';
COMMENT ON COLUMN proyectos_rentabilidad.vendedor_no_residente IS 'Indica si el vendedor es no residente en España';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_pesimista IS 'Precio de venta en escenario pesimista';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_realista IS 'Precio de venta en escenario realista';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_optimista IS 'Precio de venta en escenario optimista';
COMMENT ON COLUMN proyectos_rentabilidad.conceptos_adicionales IS 'Conceptos de gasto adicionales en formato JSON';
COMMENT ON COLUMN proyectos_rentabilidad.gastos_checklist IS 'Lista de conceptos de gastos seleccionados';
COMMENT ON COLUMN proyectos_rentabilidad.duracion_meses IS 'Duración estimada de la operación en meses';

-- 10. Insertar proyecto de ejemplo (opcional, comentar si no se necesita)
/*
INSERT INTO proyectos_rentabilidad (
  nombre,
  direccion,
  comunidad,
  estado,
  calificacion,
  impuesto,
  precio_venta_realista,
  precio_compra_estimado,
  duracion_meses
) VALUES (
  'Proyecto Ejemplo - Calle Mayor 15',
  'Calle Mayor 15, 3º B, Madrid',
  'Madrid',
  'borrador',
  4,
  'ITP',
  350000,
  250000,
  12
);
*/

-- 11. Verificación: Consultar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
ORDER BY ordinal_position;
