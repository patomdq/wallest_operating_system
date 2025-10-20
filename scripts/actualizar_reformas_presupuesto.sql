-- Script para actualizar presupuestos y avances de reformas existentes
-- Ejecutar este script en Supabase para actualizar datos de reformas

-- Actualizar presupuesto_total y avance de cada reforma basado en sus partidas
UPDATE reformas r
SET 
  presupuesto_total = COALESCE((
    SELECT SUM(COALESCE(costo, 0))
    FROM planificacion_reforma pr
    WHERE pr.reforma_id = r.id
  ), 0),
  avance = CASE 
    WHEN (SELECT COUNT(*) FROM planificacion_reforma WHERE reforma_id = r.id) = 0 THEN 0
    ELSE ROUND(
      (SELECT COUNT(*) FROM planificacion_reforma WHERE reforma_id = r.id AND estado = 'finalizado')::numeric * 100 / 
      (SELECT COUNT(*) FROM planificacion_reforma WHERE reforma_id = r.id)::numeric
    )
  END,
  estado = CASE
    WHEN (
      SELECT COUNT(*) 
      FROM planificacion_reforma 
      WHERE reforma_id = r.id AND estado = 'finalizado'
    ) = (
      SELECT COUNT(*) 
      FROM planificacion_reforma 
      WHERE reforma_id = r.id
    ) 
    AND (SELECT COUNT(*) FROM planificacion_reforma WHERE reforma_id = r.id) > 0 
    THEN 'finalizada'
    WHEN (
      SELECT COUNT(*) 
      FROM planificacion_reforma 
      WHERE reforma_id = r.id AND estado = 'finalizado'
    ) > 0 
    THEN 'en_proceso'
    ELSE 'pendiente'
  END
WHERE EXISTS (
  SELECT 1 FROM planificacion_reforma pr WHERE pr.reforma_id = r.id
);

-- Mostrar resultados
SELECT 
  r.id,
  r.nombre,
  r.presupuesto_total,
  r.avance,
  r.estado,
  (SELECT COUNT(*) FROM planificacion_reforma WHERE reforma_id = r.id) as total_partidas
FROM reformas r
ORDER BY r.created_at DESC;
