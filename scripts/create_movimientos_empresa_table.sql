-- Crear tabla movimientos_empresa (Banco Central del sistema)
CREATE TABLE IF NOT EXISTS movimientos_empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Ingreso', 'Gasto')),
  categoria TEXT NOT NULL,
  concepto TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  cuenta TEXT NOT NULL,
  forma_pago TEXT NOT NULL,
  proyecto_id UUID REFERENCES reformas(id) ON DELETE SET NULL,
  proveedor TEXT,
  observaciones TEXT,
  linked_transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_fecha ON movimientos_empresa(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_tipo ON movimientos_empresa(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_proyecto_id ON movimientos_empresa(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_cuenta ON movimientos_empresa(cuenta);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_categoria ON movimientos_empresa(categoria);
CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_linked_transaction_id ON movimientos_empresa(linked_transaction_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE movimientos_empresa ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
CREATE POLICY "Enable read access for all users" ON movimientos_empresa
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON movimientos_empresa
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON movimientos_empresa
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON movimientos_empresa
  FOR DELETE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE movimientos_empresa IS 'Tabla central de movimientos financieros de la empresa - Banco Central del WOS';
COMMENT ON COLUMN movimientos_empresa.fecha IS 'Fecha del movimiento financiero';
COMMENT ON COLUMN movimientos_empresa.tipo IS 'Tipo de movimiento: Ingreso o Gasto';
COMMENT ON COLUMN movimientos_empresa.categoria IS 'Categoría del movimiento (Materiales, Servicios, Impuestos, etc.)';
COMMENT ON COLUMN movimientos_empresa.concepto IS 'Descripción breve del movimiento';
COMMENT ON COLUMN movimientos_empresa.monto IS 'Valor del movimiento en euros';
COMMENT ON COLUMN movimientos_empresa.cuenta IS 'Cuenta bancaria o caja (Ej: Banco Sabadell, Caja)';
COMMENT ON COLUMN movimientos_empresa.forma_pago IS 'Forma de pago: Débito, Crédito, Efectivo, Transferencia';
COMMENT ON COLUMN movimientos_empresa.proyecto_id IS 'Referencia opcional al proyecto/reforma vinculado';
COMMENT ON COLUMN movimientos_empresa.proveedor IS 'Nombre o identificador del proveedor';
COMMENT ON COLUMN movimientos_empresa.observaciones IS 'Notas adicionales sobre el movimiento';
