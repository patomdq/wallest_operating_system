-- SCRIPT SQL PARA CALCULADORA DE RENTABILIDAD
-- Ejecutar en Supabase SQL Editor
-- Este script elimina la tabla existente y la recrea completamente

-- 1. ELIMINAR TABLA EXISTENTE (esto borrará los datos anteriores)
DROP TABLE IF EXISTS proyectos_rentabilidad CASCADE;

-- 2. CREAR TABLA COMPLETA DESDE CERO
CREATE TABLE proyectos_rentabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del proyecto
  nombre TEXT NOT NULL,
  direccion TEXT,
  comunidad TEXT DEFAULT 'Andalucía',
  estado TEXT NOT NULL DEFAULT 'borrador',
  calificacion INTEGER DEFAULT 0,
  duracion_meses INTEGER DEFAULT 12,
  
  -- Gastos - Estimados
  precio_compra_estimado NUMERIC DEFAULT 0,
  gastos_compraventa_estimado NUMERIC DEFAULT 0,
  gastos_cancelacion_estimado NUMERIC DEFAULT 0,
  itp_estimado NUMERIC DEFAULT 0,
  honorarios_profesionales_estimado NUMERIC DEFAULT 0,
  honorarios_complementaria_estimado NUMERIC DEFAULT 0,
  certificado_energetico_estimado NUMERIC DEFAULT 0,
  comisiones_inmobiliarias_estimado NUMERIC DEFAULT 0,
  reforma_estimado NUMERIC DEFAULT 0,
  seguros_estimado NUMERIC DEFAULT 0,
  suministros_basura_estimado NUMERIC DEFAULT 0,
  cuotas_comunidad_estimado NUMERIC DEFAULT 0,
  deuda_ibi_estimado NUMERIC DEFAULT 0,
  deuda_comunidad_estimado NUMERIC DEFAULT 0,
  
  -- Gastos - Reales
  precio_compra_real NUMERIC DEFAULT 0,
  gastos_compraventa_real NUMERIC DEFAULT 0,
  gastos_cancelacion_real NUMERIC DEFAULT 0,
  itp_real NUMERIC DEFAULT 0,
  honorarios_profesionales_real NUMERIC DEFAULT 0,
  honorarios_complementaria_real NUMERIC DEFAULT 0,
  certificado_energetico_real NUMERIC DEFAULT 0,
  comisiones_inmobiliarias_real NUMERIC DEFAULT 0,
  reforma_real NUMERIC DEFAULT 0,
  seguros_real NUMERIC DEFAULT 0,
  suministros_basura_real NUMERIC DEFAULT 0,
  cuotas_comunidad_real NUMERIC DEFAULT 0,
  deuda_ibi_real NUMERIC DEFAULT 0,
  deuda_comunidad_real NUMERIC DEFAULT 0,
  
  -- Precios de venta (3 escenarios)
  precio_venta_pesimista NUMERIC DEFAULT 0,
  precio_venta_realista NUMERIC DEFAULT 0,
  precio_venta_optimista NUMERIC DEFAULT 0,
  
  -- Resultados calculados
  rentabilidad_pesimista NUMERIC DEFAULT 0,
  rentabilidad_realista NUMERIC DEFAULT 0,
  rentabilidad_optimista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_pesimista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_realista NUMERIC DEFAULT 0,
  rentabilidad_anualizada_optimista NUMERIC DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (calificacion >= 0 AND calificacion <= 5),
  CHECK (estado IN ('borrador', 'aprobado', 'descartado', 'en_marcha', 'terminado'))
);

-- 3. CREAR ÍNDICES
CREATE INDEX idx_proyectos_rentabilidad_nombre ON proyectos_rentabilidad(nombre);
CREATE INDEX idx_proyectos_rentabilidad_estado ON proyectos_rentabilidad(estado);
CREATE INDEX idx_proyectos_rentabilidad_comunidad ON proyectos_rentabilidad(comunidad);
CREATE INDEX idx_proyectos_rentabilidad_created_at ON proyectos_rentabilidad(created_at DESC);

-- 4. FUNCIÓN PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA updated_at
CREATE TRIGGER update_proyectos_rentabilidad_updated_at
BEFORE UPDATE ON proyectos_rentabilidad
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. HABILITAR ROW LEVEL SECURITY
ALTER TABLE proyectos_rentabilidad ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS DE ACCESO
CREATE POLICY "Permitir lectura a todos los usuarios autenticados" 
ON proyectos_rentabilidad
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción a todos los usuarios autenticados" 
ON proyectos_rentabilidad
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización a todos los usuarios autenticados" 
ON proyectos_rentabilidad
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir eliminación a todos los usuarios autenticados" 
ON proyectos_rentabilidad
FOR DELETE 
USING (true);

-- 8. VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
SELECT 
  'Tabla creada correctamente' as resultado,
  COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad';
