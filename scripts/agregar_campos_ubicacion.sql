-- Script para agregar campos de ubicación a proyectos_rentabilidad
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevas columnas si no existen
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS barrio TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT;

-- 2. Eliminar columna comunidad si existe (opcional)
-- Comentar la siguiente línea si quieres mantener los datos de comunidad
-- ALTER TABLE proyectos_rentabilidad DROP COLUMN IF EXISTS comunidad;

-- 3. Crear índice para ciudad (mejorar búsquedas)
CREATE INDEX IF NOT EXISTS idx_proyectos_rentabilidad_ciudad ON proyectos_rentabilidad(ciudad);

-- 4. Agregar comentarios a las nuevas columnas
COMMENT ON COLUMN proyectos_rentabilidad.ciudad IS 'Ciudad donde se ubica el proyecto';
COMMENT ON COLUMN proyectos_rentabilidad.barrio IS 'Barrio o zona específica';
COMMENT ON COLUMN proyectos_rentabilidad.provincia IS 'Provincia del proyecto';

-- 5. Verificar que las columnas se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
  AND column_name IN ('ciudad', 'barrio', 'provincia', 'comunidad')
ORDER BY ordinal_position;
