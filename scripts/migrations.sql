-- Migraciones para WOS 1.0 - Wallest Operating System
-- Ejecutar este script en Supabase SQL Editor

-- =====================================================
-- CREAR TABLAS
-- =====================================================

-- Tabla: inmuebles
CREATE TABLE IF NOT EXISTS inmuebles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  codigo_postal VARCHAR(10),
  tipo VARCHAR(50),
  precio_compra DECIMAL(12,2),
  precio_venta DECIMAL(12,2),
  superficie DECIMAL(10,2),
  habitaciones INTEGER,
  banos INTEGER,
  estado VARCHAR(50) DEFAULT 'EN_ESTUDIO',
  descripcion TEXT,
  fecha_alta TIMESTAMP DEFAULT NOW(),
  fecha_compra TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: administracion
CREATE TABLE IF NOT EXISTS administracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100),
  importe DECIMAL(12,2),
  fecha DATE,
  responsable VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: finanzas
CREATE TABLE IF NOT EXISTS finanzas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concepto TEXT NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('ingreso', 'gasto')),
  monto DECIMAL(12,2) NOT NULL,
  proyecto_asociado VARCHAR(255),
  fecha DATE NOT NULL,
  forma_pago VARCHAR(50),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: rrhh
CREATE TABLE IF NOT EXISTS rrhh (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(100),
  empresa VARCHAR(255),
  fecha_alta DATE,
  email VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: simulaciones_rentabilidad
CREATE TABLE IF NOT EXISTS simulaciones_rentabilidad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio_compra DECIMAL(12,2) NOT NULL,
  precio_venta DECIMAL(12,2) NOT NULL,
  itp_porcentaje DECIMAL(5,2) DEFAULT 10,
  notaria DECIMAL(12,2) DEFAULT 0,
  registro DECIMAL(12,2) DEFAULT 0,
  api_compra DECIMAL(12,2) DEFAULT 0,
  reforma DECIMAL(12,2) DEFAULT 0,
  costo_total DECIMAL(12,2),
  beneficio DECIMAL(12,2),
  roi_total DECIMAL(10,2),
  roi_anualizado DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: macroproyectos
CREATE TABLE IF NOT EXISTS macroproyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'planificacion',
  fecha_inicio DATE,
  fecha_fin DATE,
  responsable VARCHAR(255),
  avance DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: reformas
CREATE TABLE IF NOT EXISTS reformas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inmueble_id UUID REFERENCES inmuebles(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  etapa VARCHAR(100),
  presupuesto DECIMAL(12,2),
  avance DECIMAL(5,2) DEFAULT 0,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: planificacion_reforma
CREATE TABLE IF NOT EXISTS planificacion_reforma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reforma_id UUID REFERENCES reformas(id) ON DELETE CASCADE,
  partida VARCHAR(255) NOT NULL,
  profesional VARCHAR(255),
  costo DECIMAL(12,2),
  tiempo_dias INTEGER,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rubro VARCHAR(100),
  contacto VARCHAR(255),
  cif VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: materiales
CREATE TABLE IF NOT EXISTS materiales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  costo_unitario DECIMAL(12,2),
  cantidad INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'nuevo',
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: comercializacion
CREATE TABLE IF NOT EXISTS comercializacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inmueble_id UUID REFERENCES inmuebles(id) ON DELETE CASCADE,
  agente VARCHAR(255),
  precio_salida DECIMAL(12,2),
  estado VARCHAR(50) DEFAULT 'disponible',
  fecha_publicacion DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inmueble_id UUID REFERENCES inmuebles(id) ON DELETE CASCADE,
  comprador VARCHAR(255),
  precio_final DECIMAL(12,2),
  fecha_cierre DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE inmuebles ENABLE ROW LEVEL SECURITY;
ALTER TABLE administracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulaciones_rentabilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE macroproyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planificacion_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercializacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS (permitir todo por ahora)
-- =====================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Permitir todo en inmuebles" ON inmuebles;
DROP POLICY IF EXISTS "Permitir todo en administracion" ON administracion;
DROP POLICY IF EXISTS "Permitir todo en finanzas" ON finanzas;
DROP POLICY IF EXISTS "Permitir todo en rrhh" ON rrhh;
DROP POLICY IF EXISTS "Permitir todo en simulaciones_rentabilidad" ON simulaciones_rentabilidad;
DROP POLICY IF EXISTS "Permitir todo en macroproyectos" ON macroproyectos;
DROP POLICY IF EXISTS "Permitir todo en reformas" ON reformas;
DROP POLICY IF EXISTS "Permitir todo en planificacion_reforma" ON planificacion_reforma;
DROP POLICY IF EXISTS "Permitir todo en proveedores" ON proveedores;
DROP POLICY IF EXISTS "Permitir todo en materiales" ON materiales;
DROP POLICY IF EXISTS "Permitir todo en leads" ON leads;
DROP POLICY IF EXISTS "Permitir todo en comercializacion" ON comercializacion;
DROP POLICY IF EXISTS "Permitir todo en transacciones" ON transacciones;

-- Crear nuevas políticas
CREATE POLICY "Permitir todo en inmuebles" ON inmuebles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en administracion" ON administracion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en finanzas" ON finanzas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en rrhh" ON rrhh FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en simulaciones_rentabilidad" ON simulaciones_rentabilidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en macroproyectos" ON macroproyectos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en reformas" ON reformas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en planificacion_reforma" ON planificacion_reforma FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en proveedores" ON proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en materiales" ON materiales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en comercializacion" ON comercializacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCIONES Y TRIGGERS PARA AUTOMATIZACIONES
-- =====================================================

-- Función: Auto-crear reforma cuando inmueble se marca como COMPRADO
CREATE OR REPLACE FUNCTION auto_crear_reforma()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'COMPRADO' AND (OLD.estado IS NULL OR OLD.estado != 'COMPRADO') THEN
    INSERT INTO reformas (inmueble_id, nombre, etapa, estado)
    VALUES (NEW.id, 'Reforma ' || NEW.nombre, 'inicio', 'pendiente');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Ejecutar auto_crear_reforma
DROP TRIGGER IF EXISTS trigger_auto_reforma ON inmuebles;
CREATE TRIGGER trigger_auto_reforma
AFTER UPDATE ON inmuebles
FOR EACH ROW
EXECUTE FUNCTION auto_crear_reforma();

-- Función: Auto-crear comercialización cuando reforma se marca como FINALIZADA
CREATE OR REPLACE FUNCTION auto_crear_comercializacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'FINALIZADA' AND (OLD.estado IS NULL OR OLD.estado != 'FINALIZADA') THEN
    INSERT INTO comercializacion (inmueble_id, estado, fecha_publicacion)
    VALUES (NEW.inmueble_id, 'disponible', CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Ejecutar auto_crear_comercializacion
DROP TRIGGER IF EXISTS trigger_auto_comercializacion ON reformas;
CREATE TRIGGER trigger_auto_comercializacion
AFTER UPDATE ON reformas
FOR EACH ROW
EXECUTE FUNCTION auto_crear_comercializacion();

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inmuebles_estado ON inmuebles(estado);
CREATE INDEX IF NOT EXISTS idx_reformas_inmueble_id ON reformas(inmueble_id);
CREATE INDEX IF NOT EXISTS idx_comercializacion_inmueble_id ON comercializacion(inmueble_id);
CREATE INDEX IF NOT EXISTS idx_finanzas_tipo ON finanzas(tipo);
CREATE INDEX IF NOT EXISTS idx_finanzas_fecha ON finanzas(fecha);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_materiales_proveedor_id ON materiales(proveedor_id);

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Todas las tablas, triggers y políticas han sido creadas correctamente';
  RAISE NOTICE '✅ WOS 1.0 está listo para usar';
END $$;
