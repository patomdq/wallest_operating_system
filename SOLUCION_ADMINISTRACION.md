# 🔧 SOLUCIÓN - Tabla de Administración No Guarda Datos

## Problema Identificado

La tabla `movimientos_empresa` **NO existe en la base de datos de Supabase**. Por eso los movimientos no se guardan.

## Solución Paso a Paso

### 1. Acceder a Supabase

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto WOS
4. En el menú lateral, haz clic en **"SQL Editor"**

### 2. Ejecutar el Script SQL

1. Copia **TODO** el contenido del archivo:
   ```
   scripts/create_movimientos_empresa_table.sql
   ```

2. Pégalo en el editor SQL de Supabase

3. Haz clic en el botón **"Run"** (Ejecutar)

4. Deberías ver el mensaje: **"Success. No rows returned"**

### 3. Verificar que la Tabla Existe

En el mismo SQL Editor, ejecuta:

```sql
SELECT * FROM movimientos_empresa LIMIT 1;
```

Si ves la estructura de la tabla (aunque esté vacía), ¡perfecto!

### 4. Verificar las Políticas RLS

Ejecuta este SQL para confirmar que las políticas están activas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'movimientos_empresa';
```

Deberías ver **4 políticas**:
- Enable read access for all users
- Enable insert access for all users
- Enable update access for all users
- Enable delete access for all users

---

## Contenido Completo del Script a Ejecutar

```sql
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
```

---

## ⚠️ Requisito Previo

Antes de ejecutar el script, asegúrate de que existe la extensión `uuid-ossp`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🧪 Prueba Final

Una vez ejecutado el script:

1. Recarga la página de Administración en tu navegador (http://localhost:3001/wallest/administracion)
2. Haz clic en **"Nuevo Movimiento"**
3. Completa el formulario:
   - Fecha: Hoy
   - Tipo: Gasto
   - Categoría: Materiales
   - Concepto: Prueba inicial
   - Monto: 100
   - Cuenta: Banco Sabadell
   - Forma de pago: Transferencia
4. Haz clic en **"Guardar"**

El movimiento debería aparecer en la tabla inmediatamente.

---

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (auto-generado) |
| fecha | DATE | Fecha del movimiento |
| tipo | TEXT | "Ingreso" o "Gasto" |
| categoria | TEXT | Categoría (Materiales, Servicios, etc.) |
| concepto | TEXT | Descripción del movimiento |
| monto | NUMERIC | Valor en euros |
| cuenta | TEXT | Banco o caja |
| forma_pago | TEXT | Método de pago |
| proyecto_id | UUID | Vinculación opcional a reforma |
| proveedor | TEXT | Nombre del proveedor (opcional) |
| observaciones | TEXT | Notas adicionales (opcional) |
| linked_transaction_id | UUID | Sincronización con finanzas_proyecto |
| created_at | TIMESTAMP | Fecha de creación del registro |

---

## 🎯 Resultado Esperado

Después de ejecutar el script, el módulo de Administración funcionará completamente:

✅ Guardado de movimientos  
✅ Edición de movimientos  
✅ Eliminación de movimientos  
✅ Cálculo de KPIs en tiempo real  
✅ Filtros por proyecto/cuenta/categoría  
✅ Sincronización con finanzas_proyecto  
✅ Saldos por cuenta  

---

**Fecha:** 25 de octubre de 2025  
**Archivo de script:** `scripts/create_movimientos_empresa_table.sql`  
**Ubicación de la solución:** `SOLUCION_ADMINISTRACION.md`
