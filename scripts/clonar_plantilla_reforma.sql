-- ========================================
-- FUNCIÓN PARA CLONAR PLANTILLA EN UNA REFORMA
-- ========================================
-- Esta función clona todas las partidas e ítems de la plantilla base
-- en una reforma específica

CREATE OR REPLACE FUNCTION clonar_plantilla_en_reforma(p_reforma_id UUID)
RETURNS void AS $$
DECLARE
  v_partida_plantilla RECORD;
  v_partida_nueva_id UUID;
  v_item_plantilla RECORD;
BEGIN
  -- Iterar sobre todas las partidas de la plantilla
  FOR v_partida_plantilla IN
    SELECT * FROM partidas_plantilla ORDER BY orden
  LOOP
    -- Insertar la partida en la reforma
    INSERT INTO partidas_reforma_detalladas (
      reforma_id,
      nombre,
      categoria,
      estado,
      orden
    ) VALUES (
      p_reforma_id,
      v_partida_plantilla.nombre,
      v_partida_plantilla.categoria,
      'pendiente',
      v_partida_plantilla.orden
    ) RETURNING id INTO v_partida_nueva_id;

    -- Iterar sobre los ítems de esta partida plantilla
    FOR v_item_plantilla IN
      SELECT * FROM items_plantilla 
      WHERE partida_plantilla_id = v_partida_plantilla.id
      ORDER BY orden
    LOOP
      -- Insertar el ítem en la partida de la reforma
      INSERT INTO items_partida_reforma (
        partida_reforma_id,
        nombre,
        orden
      ) VALUES (
        v_partida_nueva_id,
        v_item_plantilla.nombre,
        v_item_plantilla.orden
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Plantilla clonada exitosamente en reforma %', p_reforma_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- EJEMPLO DE USO
-- ========================================
-- Para clonar la plantilla en una reforma existente:
-- SELECT clonar_plantilla_en_reforma('id-de-tu-reforma-aqui');

-- Para clonar la plantilla en TODAS las reformas existentes que no tengan partidas:
-- SELECT clonar_plantilla_en_reforma(id) 
-- FROM reformas 
-- WHERE id NOT IN (SELECT DISTINCT reforma_id FROM partidas_reforma_detalladas);
