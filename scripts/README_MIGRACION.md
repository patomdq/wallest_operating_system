# Migración: Calculadora de Rentabilidad

## Descripción
Esta migración actualiza la tabla `simulaciones_rentabilidad` para soportar la nueva **Calculadora de Rentabilidad (CDR)**, reemplazando el antiguo Simulador de Rentabilidad.

## Cambios principales

### Nuevas columnas agregadas:
- `ciudad` - Ciudad del proyecto
- `impuestos_gastos` - Impuestos y gastos de compra
- `duracion_meses` - Duración de la operación en meses
- `rentabilidad_total` - Rentabilidad total en %
- `rentabilidad_anualizada` - Rentabilidad anualizada en %
- `beneficio_neto` - Beneficio neto en euros
- `estado` - Estado del proyecto (borrador, en_estudio, aprobado, rechazado)

### Columnas eliminadas:
- `itp_porcentaje`
- `notaria`
- `registro`
- `api_compra`
- `costo_total`
- `beneficio`
- `roi_total`
- `roi_anualizado`

## Cómo ejecutar la migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Accede a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `migracion_calculadora_rentabilidad.sql`
5. Haz clic en **Run** para ejecutar

### Opción 2: Desde CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O ejecutar el archivo SQL directamente
psql -h your-project.supabase.co -U postgres -d postgres -f migracion_calculadora_rentabilidad.sql
```

## Verificación

Después de ejecutar la migración, verifica que:

1. La tabla tiene la nueva estructura:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'simulaciones_rentabilidad';
```

2. El constraint del estado funciona correctamente:
```sql
-- Esto debería funcionar
INSERT INTO simulaciones_rentabilidad (nombre, precio_compra, precio_venta, estado)
VALUES ('Test', 100000, 120000, 'borrador');

-- Esto debería fallar
INSERT INTO simulaciones_rentabilidad (nombre, precio_compra, precio_venta, estado)
VALUES ('Test', 100000, 120000, 'estado_invalido');
```

## Rollback (Si es necesario)

Si necesitas revertir los cambios:

```sql
-- Restaurar columnas antiguas
ALTER TABLE simulaciones_rentabilidad 
ADD COLUMN IF NOT EXISTS itp_porcentaje NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS notaria NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS registro NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS api_compra NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS costo_total NUMERIC,
ADD COLUMN IF NOT EXISTS beneficio NUMERIC,
ADD COLUMN IF NOT EXISTS roi_total NUMERIC,
ADD COLUMN IF NOT EXISTS roi_anualizado NUMERIC;

-- Eliminar nuevas columnas
ALTER TABLE simulaciones_rentabilidad 
DROP COLUMN IF EXISTS ciudad,
DROP COLUMN IF EXISTS impuestos_gastos,
DROP COLUMN IF EXISTS duracion_meses,
DROP COLUMN IF EXISTS rentabilidad_total,
DROP COLUMN IF EXISTS rentabilidad_anualizada,
DROP COLUMN IF EXISTS beneficio_neto,
DROP COLUMN IF EXISTS estado;
```

## Notas importantes

⚠️ **ADVERTENCIA**: Esta migración eliminará columnas existentes. Si tienes datos importantes en las columnas antiguas, haz un respaldo antes de ejecutar:

```sql
-- Crear tabla de respaldo
CREATE TABLE simulaciones_rentabilidad_backup AS 
SELECT * FROM simulaciones_rentabilidad;
```

## Integración con Activos Inmobiliarios

Cuando un proyecto se marca como "Aprobado", se replica automáticamente en la tabla `inmuebles` con los siguientes datos:
- Nombre del proyecto
- Ciudad
- Precio de compra
- Estado: "en_estudio"
- Descripción con información de rentabilidad

Asegúrate de que la tabla `inmuebles` exista y tenga la estructura correcta.
