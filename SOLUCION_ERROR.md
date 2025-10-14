# 🔴 SOLUCIÓN AL ERROR: "Could not find the 'barrio' column"

---

## ❌ Problema

**Error mostrado:**
```
Error al guardar el proyecto: Could not find the 'barrio' column of 
'proyectos_rentabilidad' in the schema cache
```

**Causa:** Las columnas `ciudad`, `barrio` y `provincia` no existen en la tabla de Supabase.

---

## ✅ SOLUCIÓN (3 pasos simples)

### PASO 1: Acceder a Supabase

1. Ir a: **https://app.supabase.com**
2. Seleccionar tu proyecto
3. Click en **"SQL Editor"** (menú lateral izquierdo)
4. Click en **"New query"**

---

### PASO 2: Copiar y Pegar este Script

```sql
-- Agregar las columnas faltantes
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS barrio TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT;

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_proyectos_ciudad 
ON proyectos_rentabilidad(ciudad);

-- Verificar que se crearon
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
  AND column_name IN ('ciudad', 'barrio', 'provincia')
ORDER BY column_name;
```

---

### PASO 3: Ejecutar

1. Click en **"Run"** (botón inferior derecho)
2. O presionar: **Ctrl + Enter**

---

## ✅ Verificación

Deberías ver este resultado:

| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| barrio      | text      | YES         |
| ciudad      | text      | YES         |
| provincia   | text      | YES         |

**Si ves estas 3 filas = ✅ TODO CORRECTO**

---

## 🎯 Después de Ejecutar

1. **Refrescar la calculadora** (F5 o Ctrl+F5)
2. **Completar el formulario**
3. **Click "Guardar proyecto"**
4. **Debería funcionar sin error** ✅

---

## 🔄 Orden de Campos Corregido

También corregí el orden de los campos a:

```
1. Nombre del proyecto *
2. Dirección
3. Barrio
4. Ciudad
5. Provincia
6. Estado
7. Duración
8. Calificación
```

---

## 📝 Archivo del Script

El script también está en:
```
scripts/EJECUTAR_AHORA.sql
```

---

## 🐛 Si Continúa el Error

1. **Verificar que el script se ejecutó**:
   ```sql
   SELECT column_name 
   FROM information_schema.columns
   WHERE table_name = 'proyectos_rentabilidad';
   ```

2. **Debe incluir**: ciudad, barrio, provincia

3. **Si no aparecen**: 
   - Verificar que estás en el proyecto correcto
   - Intentar ejecutar cada ALTER TABLE por separado

---

## ✅ Resumen

**Problema**: Columnas faltantes en Supabase  
**Solución**: Ejecutar script SQL  
**Tiempo**: 2 minutos  
**Después**: La calculadora funcionará perfectamente

---

**¡Ejecuta el script y todo funcionará!** 🚀
