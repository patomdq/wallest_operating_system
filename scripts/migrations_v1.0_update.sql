-- =====================================================
-- WOS 1.0 - MIGRACIONES DE ACTUALIZACIÓN
-- Fecha: 2025-10-10
-- Descripción: Actualizaciones técnicas para WOS 1.0
-- =====================================================

-- =====================================================
-- IMPORTANTE: EJECUTAR EN ORDEN SECUENCIAL
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ACTUALIZAR TABLA INMUEBLES (ACTIVOS INMOBILIARIOS)
-- =====================================================

-- 1.1. Agregar nuevos campos booleanos
ALTER TABLE inmuebles 
ADD COLUMN IF NOT EXISTS nota_simple BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deudas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ocupado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS barrio VARCHAR(100);

-- 1.2. Actualizar tipo de campo 'tipo' para incluir nuevos valores
-- Primero verificamos si hay un constraint existente y lo eliminamos
DO $$
BEGIN
    -- Eliminar constraint de CHECK si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%inmuebles_tipo%' 
        AND table_name = 'inmuebles'
    ) THEN
        ALTER TABLE inmuebles DROP CONSTRAINT IF EXISTS inmuebles_tipo_check;
    END IF;
END $$;

-- Agregar nuevo constraint con todos los tipos
ALTER TABLE inmuebles
ADD CONSTRAINT inmuebles_tipo_check 
CHECK (tipo IN (
    'piso', 'casa', 'local', 'terreno', 'oficina', 
    'edificio', 'dúplex', 'chalet', 'adosado', 'trastero', 'garaje', 'nave'
));

-- 1.3. Actualizar estados válidos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%inmuebles_estado%' 
        AND table_name = 'inmuebles'
    ) THEN
        ALTER TABLE inmuebles DROP CONSTRAINT IF EXISTS inmuebles_estado_check;
    END IF;
END $$;

ALTER TABLE inmuebles
ADD CONSTRAINT inmuebles_estado_check 
CHECK (estado IN ('en_estudio', 'comprado', 'en_reforma', 'en_venta', 'vendido'));

-- 1.4. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_inmuebles_barrio ON inmuebles(barrio);
CREATE INDEX IF NOT EXISTS idx_inmuebles_nota_simple ON inmuebles(nota_simple);
CREATE INDEX IF NOT EXISTS idx_inmuebles_ocupado ON inmuebles(ocupado);

-- =====================================================
-- 2. ACTUALIZAR TABLA ADMINISTRACION
-- =====================================================

-- 2.1. Eliminar campo responsable
ALTER TABLE administracion DROP COLUMN IF EXISTS responsable;

-- 2.2. Agregar campo tipo para distinguir ingreso/gasto
ALTER TABLE administracion 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20);

-- Actualizar constraint para tipo
ALTER TABLE administracion
ADD CONSTRAINT administracion_tipo_check 
CHECK (tipo IN ('ingreso', 'gasto'));

-- 2.3. Agregar campo forma_pago para consistencia
ALTER TABLE administracion 
ADD COLUMN IF NOT EXISTS forma_pago VARCHAR(50);

-- Nota: categoria se mantiene como VARCHAR para permitir valores editables

-- =====================================================
-- 3. ACTUALIZAR TABLA PROVEEDORES
-- =====================================================

-- 3.1. Agregar campo tipo (activo/pasivo)
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'activo';

-- 3.2. Agregar constraint para tipo
ALTER TABLE proveedores
ADD CONSTRAINT proveedores_tipo_check 
CHECK (tipo IN ('activo', 'pasivo'));

-- 3.3. Crear índice
CREATE INDEX IF NOT EXISTS idx_proveedores_tipo ON proveedores(tipo);

-- =====================================================
-- 4. ACTUALIZAR TABLA COMERCIALIZACION
-- =====================================================

-- 4.1. Agregar nuevos campos
ALTER TABLE comercializacion 
ADD COLUMN IF NOT EXISTS publicado_en_portales BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS portales TEXT,
ADD COLUMN IF NOT EXISTS precio_quiebre DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS precio_minimo_aceptado DECIMAL(12,2);

-- 4.2. Crear índices
CREATE INDEX IF NOT EXISTS idx_comercializacion_publicado ON comercializacion(publicado_en_portales);

-- =====================================================
-- 5. ACTUALIZAR TABLA REFORMAS
-- =====================================================

-- 5.1. Renombrar columna 'presupuesto' a 'presupuesto_total' para claridad
ALTER TABLE reformas RENAME COLUMN presupuesto TO presupuesto_total;

-- 5.2. Asegurar que avance esté en porcentaje (0-100)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reformas_avance_check' 
        AND table_name = 'reformas'
    ) THEN
        ALTER TABLE reformas DROP CONSTRAINT reformas_avance_check;
    END IF;
END $$;

ALTER TABLE reformas
ADD CONSTRAINT reformas_avance_check 
CHECK (avance >= 0 AND avance <= 100);

-- 5.3. Actualizar estados válidos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%reformas_estado%' 
        AND table_name = 'reformas'
    ) THEN
        ALTER TABLE reformas DROP CONSTRAINT IF EXISTS reformas_estado_check;
    END IF;
END $$;

ALTER TABLE reformas
ADD CONSTRAINT reformas_estado_check 
CHECK (estado IN ('pendiente', 'en_proceso', 'finalizada'));

-- =====================================================
-- 6. ACTUALIZAR TABLA PLANIFICACION_REFORMA (PARTIDAS)
-- =====================================================

-- 6.1. Actualizar estados válidos para partidas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%planificacion_reforma_estado%' 
        AND table_name = 'planificacion_reforma'
    ) THEN
        ALTER TABLE planificacion_reforma DROP CONSTRAINT IF EXISTS planificacion_reforma_estado_check;
    END IF;
END $$;

ALTER TABLE planificacion_reforma
ADD CONSTRAINT planificacion_reforma_estado_check 
CHECK (estado IN ('pendiente', 'en_proceso', 'finalizado'));

-- =====================================================
-- 7. CREAR VISTAS PARA KPIS
-- =====================================================

-- 7.1. Vista: KPIs Globales (Finanzas + Administración)
CREATE OR REPLACE VIEW view_kpis_global AS
SELECT
    'finanzas' AS origen,
    tipo,
    SUM(monto) AS total,
    COUNT(*) AS cantidad,
    DATE_TRUNC('month', fecha) AS mes
FROM finanzas
GROUP BY tipo, DATE_TRUNC('month', fecha)

UNION ALL

SELECT
    'administracion' AS origen,
    tipo,
    SUM(importe) AS total,
    COUNT(*) AS cantidad,
    DATE_TRUNC('month', fecha) AS mes
FROM administracion
WHERE tipo IS NOT NULL
GROUP BY tipo, DATE_TRUNC('month', fecha)

ORDER BY mes DESC;

-- 7.2. Vista: Activos por Estado
CREATE OR REPLACE VIEW view_activos_por_estado AS
SELECT
    estado,
    COUNT(*) AS cantidad,
    SUM(precio_compra) AS inversion_total,
    SUM(precio_venta) AS valor_venta_total,
    AVG(precio_compra) AS precio_promedio
FROM inmuebles
WHERE estado IS NOT NULL
GROUP BY estado
ORDER BY 
    CASE estado
        WHEN 'en_estudio' THEN 1
        WHEN 'comprado' THEN 2
        WHEN 'en_reforma' THEN 3
        WHEN 'en_venta' THEN 4
        WHEN 'vendido' THEN 5
        ELSE 6
    END;

-- 7.3. Vista: Avance de Reformas
CREATE OR REPLACE VIEW view_avance_reformas AS
SELECT
    r.id,
    r.nombre,
    r.estado,
    r.presupuesto_total,
    r.avance,
    r.fecha_inicio,
    r.fecha_fin,
    i.nombre AS inmueble,
    i.ciudad,
    COUNT(pr.id) AS total_partidas,
    COUNT(CASE WHEN pr.estado = 'finalizado' THEN 1 END) AS partidas_finalizadas,
    SUM(pr.costo) AS costo_partidas_total,
    CASE 
        WHEN COUNT(pr.id) > 0 
        THEN ROUND((COUNT(CASE WHEN pr.estado = 'finalizado' THEN 1 END)::NUMERIC / COUNT(pr.id)::NUMERIC) * 100, 2)
        ELSE 0
    END AS avance_calculado
FROM reformas r
LEFT JOIN inmuebles i ON r.inmueble_id = i.id
LEFT JOIN planificacion_reforma pr ON r.id = pr.reforma_id
GROUP BY r.id, r.nombre, r.estado, r.presupuesto_total, r.avance, r.fecha_inicio, r.fecha_fin, i.nombre, i.ciudad;

-- =====================================================
-- 8. FUNCIONES Y TRIGGERS ACTUALIZADOS
-- =====================================================

-- 8.1. Función: Actualizar presupuesto total de reforma basado en partidas
CREATE OR REPLACE FUNCTION actualizar_presupuesto_reforma()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reformas
    SET presupuesto_total = (
        SELECT COALESCE(SUM(costo), 0)
        FROM planificacion_reforma
        WHERE reforma_id = COALESCE(NEW.reforma_id, OLD.reforma_id)
    )
    WHERE id = COALESCE(NEW.reforma_id, OLD.reforma_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8.2. Trigger: Actualizar presupuesto cuando se insertan/actualizan/eliminan partidas
DROP TRIGGER IF EXISTS trigger_actualizar_presupuesto ON planificacion_reforma;
CREATE TRIGGER trigger_actualizar_presupuesto
AFTER INSERT OR UPDATE OR DELETE ON planificacion_reforma
FOR EACH ROW
EXECUTE FUNCTION actualizar_presupuesto_reforma();

-- 8.3. Función: Actualizar avance de reforma basado en partidas finalizadas
CREATE OR REPLACE FUNCTION actualizar_avance_reforma()
RETURNS TRIGGER AS $$
DECLARE
    total_partidas INTEGER;
    partidas_finalizadas INTEGER;
    nuevo_avance NUMERIC;
    reforma_id_actual UUID;
BEGIN
    -- Obtener el ID de la reforma
    reforma_id_actual := COALESCE(NEW.reforma_id, OLD.reforma_id);
    
    -- Contar partidas totales y finalizadas
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN estado = 'finalizado' THEN 1 END)
    INTO total_partidas, partidas_finalizadas
    FROM planificacion_reforma
    WHERE reforma_id = reforma_id_actual;
    
    -- Calcular nuevo avance
    IF total_partidas > 0 THEN
        nuevo_avance := ROUND((partidas_finalizadas::NUMERIC / total_partidas::NUMERIC) * 100, 2);
    ELSE
        nuevo_avance := 0;
    END IF;
    
    -- Actualizar avance en reforma
    UPDATE reformas
    SET avance = nuevo_avance,
        estado = CASE 
            WHEN nuevo_avance = 100 THEN 'finalizada'
            WHEN nuevo_avance > 0 THEN 'en_proceso'
            ELSE estado
        END
    WHERE id = reforma_id_actual;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8.4. Trigger: Actualizar avance cuando cambia estado de partidas
DROP TRIGGER IF EXISTS trigger_actualizar_avance ON planificacion_reforma;
CREATE TRIGGER trigger_actualizar_avance
AFTER INSERT OR UPDATE OR DELETE ON planificacion_reforma
FOR EACH ROW
EXECUTE FUNCTION actualizar_avance_reforma();

-- 8.5. Función mejorada: Auto-crear reforma cuando inmueble se marca como COMPRADO
CREATE OR REPLACE FUNCTION auto_crear_reforma()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'comprado' AND (OLD.estado IS NULL OR OLD.estado != 'comprado') THEN
        INSERT INTO reformas (inmueble_id, nombre, estado, avance)
        VALUES (NEW.id, 'Reforma ' || NEW.nombre, 'pendiente', 0)
        ON CONFLICT DO NOTHING;
        
        -- Actualizar estado del inmueble a en_reforma
        NEW.estado := 'en_reforma';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8.6. Función mejorada: Auto-crear comercialización cuando reforma finaliza
CREATE OR REPLACE FUNCTION auto_crear_comercializacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'finalizada' AND (OLD.estado IS NULL OR OLD.estado != 'finalizada') THEN
        -- Crear registro en comercialización
        INSERT INTO comercializacion (
            inmueble_id, 
            estado, 
            fecha_publicacion,
            publicado_en_portales
        )
        VALUES (NEW.inmueble_id, 'activo', CURRENT_DATE, false)
        ON CONFLICT DO NOTHING;
        
        -- Actualizar estado del inmueble a en_venta
        UPDATE inmuebles
        SET estado = 'en_venta'
        WHERE id = NEW.inmueble_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear triggers con las funciones actualizadas
DROP TRIGGER IF EXISTS trigger_auto_reforma ON inmuebles;
CREATE TRIGGER trigger_auto_reforma
AFTER UPDATE ON inmuebles
FOR EACH ROW
EXECUTE FUNCTION auto_crear_reforma();

DROP TRIGGER IF EXISTS trigger_auto_comercializacion ON reformas;
CREATE TRIGGER trigger_auto_comercializacion
AFTER UPDATE ON reformas
FOR EACH ROW
EXECUTE FUNCTION auto_crear_comercializacion();

-- =====================================================
-- 9. ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_finanzas_proyecto ON finanzas(proyecto_asociado);
CREATE INDEX IF NOT EXISTS idx_administracion_tipo ON administracion(tipo);
CREATE INDEX IF NOT EXISTS idx_administracion_fecha ON administracion(fecha);
CREATE INDEX IF NOT EXISTS idx_reformas_estado ON reformas(estado);
CREATE INDEX IF NOT EXISTS idx_reformas_avance ON reformas(avance);
CREATE INDEX IF NOT EXISTS idx_partidas_estado ON planificacion_reforma(estado);
CREATE INDEX IF NOT EXISTS idx_partidas_reforma ON planificacion_reforma(reforma_id);

-- =====================================================
-- 10. DATOS DE EJEMPLO PARA CATEGORÍAS DE ADMINISTRACIÓN
-- =====================================================

-- Crear tabla para categorías predefinidas (opcional, para select editable)
CREATE TABLE IF NOT EXISTS categorias_administracion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar categorías comunes
INSERT INTO categorias_administracion (nombre, descripcion) VALUES
    ('Gestoría', 'Gastos de gestoría y trámites administrativos'),
    ('Notaría', 'Gastos notariales'),
    ('Registro', 'Gastos de registro de la propiedad'),
    ('Impuestos', 'ITP, IBI, plusvalía, etc.'),
    ('Seguros', 'Seguros de hogar, vida, etc.'),
    ('Suministros', 'Agua, luz, gas'),
    ('Comunidad', 'Gastos de comunidad'),
    ('Legal', 'Asesoría legal'),
    ('Contable', 'Asesoría contable'),
    ('Marketing', 'Publicidad y marketing'),
    ('Otros', 'Gastos varios')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- COMMIT Y MENSAJE DE ÉXITO
-- =====================================================

COMMIT;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ MIGRACIONES WOS 1.0 COMPLETADAS';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Tabla inmuebles: Actualizada con nuevos campos y tipos';
    RAISE NOTICE '✅ Tabla administracion: Campo responsable eliminado';
    RAISE NOTICE '✅ Tabla proveedores: Campo tipo agregado';
    RAISE NOTICE '✅ Tabla comercializacion: Nuevos campos agregados';
    RAISE NOTICE '✅ Tabla reformas: Lógica de avance automático implementada';
    RAISE NOTICE '✅ Vistas KPIs: Creadas (view_kpis_global, view_activos_por_estado, view_avance_reformas)';
    RAISE NOTICE '✅ Triggers: Actualizados y optimizados';
    RAISE NOTICE '✅ Índices: Creados para mejor rendimiento';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Sistema listo para usar';
END $$;
