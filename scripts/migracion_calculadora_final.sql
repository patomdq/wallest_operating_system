-- Migración Final: Calculadora de Rentabilidad - Versión Simplificada
-- Fecha: 2025-10-13
-- Descripción: Tabla completa con todos los campos necesarios

-- 1. Eliminar tabla existente si necesario (CUIDADO: borra datos)
-- DROP TABLE IF EXISTS proyectos_rentabilidad CASCADE;

-- 2. Crear tabla proyectos_rentabilidad
CREATE TABLE IF NOT EXISTS proyectos_rentabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del proyecto
  nombre TEXT NOT NULL,
  direccion TEXT,
  comunidad TEXT DEFAULT 'Andalucía',
  estado TEXT NOT NULL DEFAULT 'borrador',
  calificacion INTEGER DEFAULT 0 CHECK (calificacion >= 0 AND calificacion <= 5),
  duracion_meses INTEGER DEFAULT 12,
  
  -- Gastos - Estimados
  precio_compra_estimado NUMERIC DEFAULT 0,
  gastos_compraventa_estimado NUMERIC DEFAULT 0,
  gastos_cancelacion_estimado NUMERIC DEFAULT 0,
  itp_estimado NUMERIC DEFAULT 0,
  honorarios_profesionales_estimado NUMERIC DEFAULT 0,
  honorarios_complementaria_estimado NUMERIC DEFAULT 0,
  certificado_energetico_estimado NUMERIC DEFAULT 0,
  comisiones_inmobiliarias_estimado NUMERIC DEFAULT 0,
  reforma_estimado NUMERIC DEFAULT 0,
  seguros_estimado NUMERIC DEFAULT 0,
  suministros_basura_estimado NUMERIC DEFAULT 0,
  cuotas_comunidad_estimado NUMERIC DEFAULT 0,
  deuda_ibi_estimado NUMERIC DEFAULT 0,
  deuda_comunidad_estimado NUMERIC DEFAULT 0,
  
  -- Gastos - Reales
  precio_compra_real NUMERIC DEFAULT 0,
  gastos_compraventa_real NUMERIC DEFAULT 0,
  gastos_cancelacion_real NUMERIC DEFAULT 0,
  itp_real NUMERIC DEFAULT 0,
  honorarios_profesionales_real NUMERIC DEFAULT 0,
  honorarios_complementaria_real NUMERIC DEFAULT 0,
  certificado_energetico_real NUMERIC DEFAULT 0,
  comisiones_inmobiliarias_real NUMERIC DEFAULT 0,
  reforma_real NUMERIC DEFAULT 0,
  seguros_real NUMERIC DEFAULT 0,
  suministros_basura_real NUMERIC DEFAULT 0,
  cuotas_comunidad_real NUMERIC DEFAULT 0,
  deuda_ibi_real NUMERIC DEFAULT 0,
  deuda_comunidad_real NUMERIC DEFAULT 0,
  
  -- Precios de venta (3 escenarios)
  precio_venta_pesimista NUMERIC DEFAULT 0,
  precio_venta_realista NUMERIC DEFAULT 0,
  precio_venta_optimista NUMERIC DEFAULT 0,
  
  -- Resultados calculados
  rentabilidad_pesimista NUMERIC DEFAULT 0,
  rentabilidad_realista NUMERIC DEFAULT 0,
  rentabilidad_optimista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_pesimista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_realista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_optimista NUMERIC DEFAULT 0,
  
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

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_nombre ON proyectos_rentabilidad(nombre);
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_estado ON proyectos_rentabilidad(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_comunidad ON proyectos_rentabilidad(comunidad);
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_created_at ON proyectos_rentabilidad(created_at DESC);

-- 5. Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at
DROP TRIGGER IF EXISTS update_proyectos_rentabilidad_updated_at ON proyectos_rentabilidad;

CREATE TRIGGER update_proyectos_rentabilidad_updated_at
BEFORE UPDATE ON proyectos_rentabilidad
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar Row Level Security
ALTER TABLE proyectos_rentabilidad ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de acceso
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON proyectos_rentabilidad;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON proyectos_rentabilidad;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON proyectos_rentabilidad;
DROP POLICY IF EXISTS "Permitir eliminación a usuarios autenticados" ON proyectos_rentabilidad;

CREATE POLICY "Permitir lectura a usuarios autenticados" ON proyectos_rentabilidad
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción a usuarios autenticados" ON proyectos_rentabilidad
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización a usuarios autenticados" ON proyectos_rentabilidad
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación a usuarios autenticados" ON proyectos_rentabilidad
FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Comentarios
COMMENT ON TABLE proyectos_rentabilidad IS 'Calculadora de rentabilidad inmobiliaria - Proyectos de inversión';

COMMENT ON COLUMN proyectos_rentabilidad.nombre IS 'Nombre identificativo del proyecto';
COMMENT ON COLUMN proyectos_rentabilidad.direccion IS 'Dirección del inmueble';
COMMENT ON COLUMN proyectos_rentabilidad.comunidad IS 'Comunidad autónoma (por defecto Andalucía)';
COMMENT ON COLUMN proyectos_rentabilidad.estado IS 'Estado: borrador, aprobado, descartado, en_marcha, terminado';
COMMENT ON COLUMN proyectos_rentabilidad.calificacion IS 'Calificación en estrellas (0-5)';
COMMENT ON COLUMN proyectos_rentabilidad.duracion_meses IS 'Duración estimada de la operación en meses';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_pesimista IS 'Precio de venta en escenario pesimista';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_realista IS 'Precio de venta en escenario realista';
COMMENT ON COLUMN proyectos_rentabilidad.precio_venta_optimista IS 'Precio de venta en escenario optimista';
COMMENT ON COLUMN proyectos_rentabilidad.rentabilidad_pesimista IS 'Rentabilidad (%) escenario pesimista';
COMMENT ON COLUMN proyectos_rentabilidad.rentabilidad_realista IS 'Rentabilidad (%) escenario realista';
COMMENT ON COLUMN proyectos_rentabilidad.rentabilidad_optimista IS 'Rentabilidad (%) escenario optimista';

-- 10. Insertar proyecto de ejemplo (opcional, comentar si no se necesita)
/*
INSERT INTO proyectos_rentabilidad (
  nombre,
  direccion,
  comunidad,
  estado,
  calificacion,
  duracion_meses,
  precio_compra_estimado,
  precio_venta_realista
) VALUES (
  'Proyecto Ejemplo - Reforma Integral',
  'Calle Mayor 15, 3º B, Madrid',
  'Madrid',
  'borrador',
  4,
  12,
  250000,
  350000
);
*/

-- 11. Verificación
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
ORDER BY ordinal_position;

-- 12. Verificar que todo funciona
SELECT COUNT(*) as total_proyectos FROM proyectos_rentabilidad;
