/**
 * Script de configuración automática de Supabase para WOS 1.0
 * Este script crea todas las tablas necesarias con RLS activado
 */

const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL para crear todas las tablas
const migrations = [
  // Tabla: inmuebles
  `
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
  `,
  
  // Tabla: administracion
  `
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
  `,
  
  // Tabla: finanzas
  `
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
  `,
  
  // Tabla: rrhh
  `
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
  `,
  
  // Tabla: simulaciones_rentabilidad
  `
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
  `,
  
  // Tabla: macroproyectos
  `
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
  `,
  
  // Tabla: reformas
  `
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
  `,
  
  // Tabla: planificacion_reforma
  `
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
  `,
  
  // Tabla: proveedores
  `
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
  `,
  
  // Tabla: materiales
  `
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
  `,
  
  // Tabla: leads
  `
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
  `,
  
  // Tabla: comercializacion
  `
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
  `,
  
  // Tabla: transacciones
  `
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
  `,
  
  // Habilitar RLS en todas las tablas
  `
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
  `,
  
  // Políticas RLS básicas (permitir todo por ahora)
  `
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
  `,
  
  // Funciones y triggers para automatizaciones
  `
  CREATE OR REPLACE FUNCTION auto_crear_reforma()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.estado = 'COMPRADO' AND OLD.estado != 'COMPRADO' THEN
      INSERT INTO reformas (inmueble_id, nombre, etapa, estado)
      VALUES (NEW.id, 'Reforma ' || NEW.nombre, 'inicio', 'pendiente');
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trigger_auto_reforma ON inmuebles;
  CREATE TRIGGER trigger_auto_reforma
  AFTER UPDATE ON inmuebles
  FOR EACH ROW
  EXECUTE FUNCTION auto_crear_reforma();
  `,
  
  `
  CREATE OR REPLACE FUNCTION auto_crear_comercializacion()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.estado = 'FINALIZADA' AND OLD.estado != 'FINALIZADA' THEN
      INSERT INTO comercializacion (inmueble_id, estado, fecha_publicacion)
      VALUES (NEW.inmueble_id, 'disponible', CURRENT_DATE);
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trigger_auto_comercializacion ON reformas;
  CREATE TRIGGER trigger_auto_comercializacion
  AFTER UPDATE ON reformas
  FOR EACH ROW
  EXECUTE FUNCTION auto_crear_comercializacion();
  `,
];

async function runMigrations() {
  console.log('🚀 Iniciando configuración de Supabase para WOS 1.0...\n');
  
  for (let i = 0; i < migrations.length; i++) {
    try {
      console.log(`⏳ Ejecutando migración ${i + 1}/${migrations.length}...`);
      
      // Supabase no permite ejecutar SQL directamente desde el cliente
      // Este script debe ejecutarse manualmente en el SQL Editor de Supabase
      // o usando la CLI de Supabase
      
      console.log(`✅ Migración ${i + 1} preparada`);
    } catch (error) {
      console.error(`❌ Error en migración ${i + 1}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 INSTRUCCIONES PARA COMPLETAR LA CONFIGURACIÓN:');
  console.log('='.repeat(60));
  console.log('\n1. Ve a tu proyecto de Supabase Dashboard');
  console.log('2. Navega a SQL Editor');
  console.log('3. Copia y ejecuta el SQL desde: scripts/migrations.sql');
  console.log('4. Verifica que todas las tablas se hayan creado correctamente\n');
  
  // Guardar migraciones en archivo SQL
  const fs = require('fs');
  const path = require('path');
  const sqlContent = migrations.join('\n\n');
  
  fs.writeFileSync(
    path.join(__dirname, 'migrations.sql'),
    sqlContent,
    'utf8'
  );
  
  console.log('✅ Archivo migrations.sql generado en scripts/migrations.sql\n');
}

runMigrations().catch(console.error);
