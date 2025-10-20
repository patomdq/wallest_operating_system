-- Script para agregar campos Tipo de Inmueble y URL a la tabla proyectos_rentabilidad
-- Fecha: 2025-10-20
-- Descripción: Agrega columnas para tipo de inmueble y URL de documentos externos

-- Agregar columna tipo_inmueble
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS tipo_inmueble TEXT;

-- Agregar columna url
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN proyectos_rentabilidad.tipo_inmueble IS 'Tipo de inmueble: Piso, Casa, Local, Terreno, Oficina, Edificio, Trastero, Chalet, Adosado, Dúplex, Garaje, Nave';
COMMENT ON COLUMN proyectos_rentabilidad.url IS 'URL a documentos externos (Drive, Dropbox, etc.)';
