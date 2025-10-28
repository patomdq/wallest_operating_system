-- Tabla para eventos globales del calendario
CREATE TABLE IF NOT EXISTS eventos_globales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  recordatorio BOOLEAN DEFAULT FALSE,
  reforma_id UUID REFERENCES reformas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para tareas globales del tablero Kanban
CREATE TABLE IF NOT EXISTS tareas_globales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad TEXT CHECK (prioridad IN ('Alta', 'Media', 'Baja')) DEFAULT 'Media',
  fecha_limite DATE NOT NULL,
  estado TEXT CHECK (estado IN ('Pendiente', 'En curso', 'Completada')) DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos_globales(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_fin ON eventos_globales(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_eventos_reforma_id ON eventos_globales(reforma_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas_globales(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON tareas_globales(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas_globales(prioridad);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eventos_globales_updated_at
    BEFORE UPDATE ON eventos_globales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_globales_updated_at
    BEFORE UPDATE ON tareas_globales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
