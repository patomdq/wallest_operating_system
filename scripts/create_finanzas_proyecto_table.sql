-- Crear tabla finanzas_proyecto
CREATE TABLE IF NOT EXISTS finanzas_proyecto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reforma_id UUID NOT NULL REFERENCES reformas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  proveedor TEXT,
  cantidad NUMERIC DEFAULT 0,
  precio_unitario NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  forma_pago TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_finanzas_proyecto_reforma_id ON finanzas_proyecto(reforma_id);
CREATE INDEX IF NOT EXISTS idx_finanzas_proyecto_fecha ON finanzas_proyecto(fecha);
CREATE INDEX IF NOT EXISTS idx_finanzas_proyecto_tipo ON finanzas_proyecto(tipo);

-- Habilitar Row Level Security (RLS)
ALTER TABLE finanzas_proyecto ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (ajustar según tus necesidades de seguridad)
CREATE POLICY "Enable read access for all users" ON finanzas_proyecto
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON finanzas_proyecto
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON finanzas_proyecto
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON finanzas_proyecto
  FOR DELETE USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_finanzas_proyecto_updated_at ON finanzas_proyecto;
CREATE TRIGGER update_finanzas_proyecto_updated_at
  BEFORE UPDATE ON finanzas_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
