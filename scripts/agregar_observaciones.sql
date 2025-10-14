-- Script para agregar campo de Observaciones a la tabla proyectos_rentabilidad
-- Fecha: 2025-10-14
-- Descripción: Agrega columna para guardar observaciones/comentarios de la operación

-- Agregar columna observaciones (tipo TEXT, nullable)
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Comentario descriptivo de la columna
COMMENT ON COLUMN proyectos_rentabilidad.observaciones IS 'Observaciones o comentarios generales sobre la operación';
