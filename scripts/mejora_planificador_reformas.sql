-- ========================================
-- MEJORA DEL PLANIFICADOR DE REFORMAS
-- ========================================
-- Este script crea la estructura para un planificador detallado
-- con partidas e ítems precargados

-- ========================================
-- 1. TABLAS DE PLANTILLA BASE
-- ========================================

-- Tabla de plantilla de partidas (catálogo base reutilizable)
CREATE TABLE IF NOT EXISTS partidas_plantilla (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL, -- obra / materiales / mobiliario / electro / decoracion / otros
  orden INTEGER DEFAULT 0, -- Para mantener orden en la UI
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de plantilla de ítems (catálogo base de ítems por partida)
CREATE TABLE IF NOT EXISTS items_plantilla (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partida_plantilla_id UUID REFERENCES partidas_plantilla(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  orden INTEGER DEFAULT 0, -- Para mantener orden en la UI
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 2. TABLAS DE DATOS DE REFORMA (instancias)
-- ========================================

-- Tabla de partidas específicas de cada reforma (clonadas desde plantilla)
CREATE TABLE IF NOT EXISTS partidas_reforma_detalladas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reforma_id UUID REFERENCES reformas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente / en_curso / ok
  total_calculado DECIMAL(12,2) DEFAULT 0, -- Calculado automáticamente desde ítems
  notas TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ítems específicos de cada partida de reforma
CREATE TABLE IF NOT EXISTS items_partida_reforma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partida_reforma_id UUID REFERENCES partidas_reforma_detalladas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  estancia VARCHAR(100), -- Cocina / Baño / Salón / etc.
  proveedor VARCHAR(255),
  coste DECIMAL(12,2),
  fecha_compra DATE,
  fecha_entrega DATE,
  fecha_instalacion DATE,
  nota TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 3. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_items_plantilla_partida ON items_plantilla(partida_plantilla_id);
CREATE INDEX IF NOT EXISTS idx_partidas_reforma_reforma ON partidas_reforma_detalladas(reforma_id);
CREATE INDEX IF NOT EXISTS idx_items_partida_partida ON items_partida_reforma(partida_reforma_id);

-- ========================================
-- 4. TRIGGERS PARA ACTUALIZAR TOTALES
-- ========================================

-- Función para actualizar el total calculado de una partida
CREATE OR REPLACE FUNCTION actualizar_total_partida()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE partidas_reforma_detalladas
  SET total_calculado = (
    SELECT COALESCE(SUM(coste), 0)
    FROM items_partida_reforma
    WHERE partida_reforma_id = COALESCE(NEW.partida_reforma_id, OLD.partida_reforma_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.partida_reforma_id, OLD.partida_reforma_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar total cuando se inserta, actualiza o elimina un ítem
DROP TRIGGER IF EXISTS trigger_actualizar_total_partida ON items_partida_reforma;
CREATE TRIGGER trigger_actualizar_total_partida
AFTER INSERT OR UPDATE OR DELETE ON items_partida_reforma
FOR EACH ROW
EXECUTE FUNCTION actualizar_total_partida();

-- Función para actualizar presupuesto total de la reforma
CREATE OR REPLACE FUNCTION actualizar_presupuesto_reforma()
RETURNS TRIGGER AS $$
DECLARE
  v_reforma_id UUID;
BEGIN
  -- Obtener el reforma_id
  v_reforma_id := COALESCE(NEW.reforma_id, OLD.reforma_id);
  
  -- Actualizar presupuesto y avance en tabla reformas
  UPDATE reformas
  SET 
    presupuesto = (
      SELECT COALESCE(SUM(total_calculado), 0)
      FROM partidas_reforma_detalladas
      WHERE reforma_id = v_reforma_id
    ),
    avance = CASE 
      WHEN (SELECT COUNT(*) FROM partidas_reforma_detalladas WHERE reforma_id = v_reforma_id) = 0 THEN 0
      ELSE (
        SELECT ROUND(
          (COUNT(CASE WHEN estado = 'ok' THEN 1 END)::numeric * 100) / 
          COUNT(*)::numeric
        )
        FROM partidas_reforma_detalladas
        WHERE reforma_id = v_reforma_id
      )
    END,
    estado = CASE
      WHEN (SELECT COUNT(*) FROM partidas_reforma_detalladas WHERE reforma_id = v_reforma_id AND estado != 'ok') = 0
        AND (SELECT COUNT(*) FROM partidas_reforma_detalladas WHERE reforma_id = v_reforma_id) > 0
        THEN 'finalizada'
      WHEN (SELECT COUNT(*) FROM partidas_reforma_detalladas WHERE reforma_id = v_reforma_id AND estado IN ('en_curso', 'ok')) > 0
        THEN 'en_proceso'
      ELSE 'pendiente'
    END,
    updated_at = NOW()
  WHERE id = v_reforma_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar reforma cuando cambian las partidas
DROP TRIGGER IF EXISTS trigger_actualizar_presupuesto_reforma ON partidas_reforma_detalladas;
CREATE TRIGGER trigger_actualizar_presupuesto_reforma
AFTER INSERT OR UPDATE OR DELETE ON partidas_reforma_detalladas
FOR EACH ROW
EXECUTE FUNCTION actualizar_presupuesto_reforma();

-- ========================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- ========================================

ALTER TABLE partidas_plantilla ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_plantilla ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas_reforma_detalladas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_partida_reforma ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (ajustar según necesidades de autenticación)
DROP POLICY IF EXISTS "Permitir todo en partidas_plantilla" ON partidas_plantilla;
CREATE POLICY "Permitir todo en partidas_plantilla" ON partidas_plantilla FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en items_plantilla" ON items_plantilla;
CREATE POLICY "Permitir todo en items_plantilla" ON items_plantilla FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en partidas_reforma_detalladas" ON partidas_reforma_detalladas;
CREATE POLICY "Permitir todo en partidas_reforma_detalladas" ON partidas_reforma_detalladas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en items_partida_reforma" ON items_partida_reforma;
CREATE POLICY "Permitir todo en items_partida_reforma" ON items_partida_reforma FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 1. Las tablas de plantilla (partidas_plantilla, items_plantilla) son el catálogo base
-- 2. Las tablas de reforma (partidas_reforma_detalladas, items_partida_reforma) son instancias específicas por reforma
-- 3. Los totales se calculan automáticamente mediante triggers
-- 4. El campo "total_calculado" en partidas NO debe editarse manualmente
-- 5. El presupuesto en tabla reformas se actualiza automáticamente
