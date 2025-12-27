-- ========================================
-- LIMPIAR ÍTEMS DUPLICADOS
-- ========================================
-- Este script elimina ítems duplicados manteniendo solo uno de cada nombre por partida

-- Eliminar duplicados de items_partida_reforma
DELETE FROM items_partida_reforma
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY partida_reforma_id, nombre, orden 
        ORDER BY created_at
      ) as rn
    FROM items_partida_reforma
  ) t
  WHERE t.rn > 1
);

-- Verificar que no haya duplicados
SELECT 
  partida_reforma_id,
  nombre,
  COUNT(*) as cantidad
FROM items_partida_reforma
GROUP BY partida_reforma_id, nombre
HAVING COUNT(*) > 1;

-- Si el resultado anterior está vacío, no hay duplicados
