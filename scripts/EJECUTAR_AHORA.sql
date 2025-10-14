-- ⚠️ EJECUTAR ESTE SCRIPT EN SUPABASE PARA CORREGIR EL ERROR
-- Script para agregar las columnas faltantes

-- Agregar las tres columnas que faltan
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS barrio TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_proyectos_ciudad ON proyectos_rentabilidad(ciudad);

-- Verificar que se crearon correctamente
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
  AND column_name IN ('ciudad', 'barrio', 'provincia')
ORDER BY column_name;
