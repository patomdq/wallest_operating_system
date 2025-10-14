-- Migración: Actualizar tabla simulaciones_rentabilidad para nueva Calculadora de Rentabilidad
-- Fecha: 2025-10-13
-- Descripción: Modifica la estructura para soportar la nueva funcionalidad de CDR

-- 1. Agregar nuevas columnas si no existen
ALTER TABLE simulaciones_rentabilidad 
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS impuestos_gastos NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS duracion_meses INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS rentabilidad_total NUMERIC,
ADD COLUMN IF NOT EXISTS rentabilidad_anualizada NUMERIC,
ADD COLUMN IF NOT EXISTS beneficio_neto NUMERIC,
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'borrador';

-- 2. Eliminar columnas antiguas que ya no se usan
ALTER TABLE simulaciones_rentabilidad 
DROP COLUMN IF EXISTS itp_porcentaje,
DROP COLUMN IF EXISTS notaria,
DROP COLUMN IF EXISTS registro,
DROP COLUMN IF EXISTS api_compra,
DROP COLUMN IF EXISTS costo_total,
DROP COLUMN IF EXISTS beneficio,
DROP COLUMN IF EXISTS roi_total,
DROP COLUMN IF EXISTS roi_anualizado;

-- 3. Crear constraint para el campo estado
ALTER TABLE simulaciones_rentabilidad 
DROP CONSTRAINT IF EXISTS simulaciones_rentabilidad_estado_check;

ALTER TABLE simulaciones_rentabilidad 
ADD CONSTRAINT simulaciones_rentabilidad_estado_check 
CHECK (estado IN ('borrador', 'en_estudio', 'aprobado', 'rechazado'));

-- 4. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_simulaciones_estado ON simulaciones_rentabilidad(estado);
CREATE INDEX IF NOT EXISTS idx_simulaciones_created_at ON simulaciones_rentabilidad(created_at DESC);

-- 5. Actualizar registros existentes (si los hay)
UPDATE simulaciones_rentabilidad 
SET estado = 'borrador' 
WHERE estado IS NULL OR estado = '';

-- 6. Comentarios en las columnas
COMMENT ON COLUMN simulaciones_rentabilidad.nombre IS 'Nombre del proyecto inmobiliario';
COMMENT ON COLUMN simulaciones_rentabilidad.ciudad IS 'Ciudad donde se ubica el proyecto';
COMMENT ON COLUMN simulaciones_rentabilidad.precio_compra IS 'Precio de compra del inmueble en euros';
COMMENT ON COLUMN simulaciones_rentabilidad.reforma IS 'Costo estimado de reforma en euros';
COMMENT ON COLUMN simulaciones_rentabilidad.impuestos_gastos IS 'Impuestos y gastos asociados a la compra en euros';
COMMENT ON COLUMN simulaciones_rentabilidad.precio_venta IS 'Precio de venta proyectado en euros';
COMMENT ON COLUMN simulaciones_rentabilidad.duracion_meses IS 'Duración estimada de la operación en meses';
COMMENT ON COLUMN simulaciones_rentabilidad.rentabilidad_total IS 'Rentabilidad total del proyecto en porcentaje';
COMMENT ON COLUMN simulaciones_rentabilidad.rentabilidad_anualizada IS 'Rentabilidad anualizada en porcentaje';
COMMENT ON COLUMN simulaciones_rentabilidad.beneficio_neto IS 'Beneficio neto del proyecto en euros';
COMMENT ON COLUMN simulaciones_rentabilidad.estado IS 'Estado del proyecto: borrador, en_estudio, aprobado, rechazado';
