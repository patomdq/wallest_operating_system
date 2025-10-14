# ⚠️ IMPORTANTE: Ejecutar Script SQL

## 🎯 Problema Detectado

La tabla `proyectos_rentabilidad` existe pero con una estructura antigua. Necesitamos recrearla.

---

## ✅ SOLUCIÓN: Ejecutar el nuevo script

### Archivo a usar:
```
scripts/EJECUTAR_ESTE.sql
```

Este script:
1. ✅ Elimina la tabla antigua (si existe)
2. ✅ Crea la tabla nueva con 46 campos
3. ✅ Configura índices
4. ✅ Configura triggers
5. ✅ Configura RLS y políticas
6. ✅ Verifica que todo está OK

---

## 📋 PASOS PARA EJECUTAR

### 1. Acceder a Supabase
```
https://app.supabase.com
→ Seleccionar tu proyecto
→ SQL Editor (menú lateral izquierdo)
→ Click "New query"
```

### 2. Copiar el Script
```
Abrir archivo: wallest_operating_system/scripts/EJECUTAR_ESTE.sql
Seleccionar TODO el contenido (Ctrl+A)
Copiar (Ctrl+C)
```

### 3. Pegar en Supabase
```
En el SQL Editor de Supabase
Pegar (Ctrl+V)
```

### 4. Ejecutar
```
Click botón "Run" (esquina inferior derecha)
O presionar: Ctrl + Enter
```

### 5. Verificar
Deberías ver:
```
✅ Success
resultado: "Tabla creada correctamente"
total_columnas: 46
```

---

## ⚠️ ADVERTENCIA

**Este script elimina la tabla existente y todos sus datos.**

Si tienes proyectos guardados que quieres conservar:
1. Exporta los datos primero:
   ```sql
   SELECT * FROM proyectos_rentabilidad;
   ```
2. Guarda el resultado
3. Después de ejecutar el script, importa manualmente si es necesario

---

## 🔍 Verificar que funcionó

Después de ejecutar, prueba esta consulta:
```sql
-- Debería funcionar sin errores
SELECT * FROM proyectos_rentabilidad LIMIT 1;
```

También puedes ver la estructura:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'proyectos_rentabilidad'
ORDER BY ordinal_position;
```

Deberías ver 46 columnas.

---

## 🎉 Siguiente Paso

Una vez ejecutado el script exitosamente:

1. Ir a: http://localhost:3000/wallest/calculadora
2. Completar un proyecto de prueba
3. Click "Guardar proyecto"
4. Debería aparecer: "Proyecto guardado correctamente"

---

## 🐛 Si hay errores

### Error: "permission denied"
**Solución**: Asegúrate de estar usando el usuario correcto de Supabase

### Error: "relation does not exist"
**Solución**: El script ya lo maneja con DROP TABLE IF EXISTS

### Error: "syntax error"
**Solución**: Asegúrate de copiar TODO el script, desde la primera línea hasta la última

---

## 📞 Ayuda

Si continúa el error:
1. Copia el mensaje de error completo
2. Verifica que estás en el proyecto correcto de Supabase
3. Intenta ejecutar solo la primera parte:
   ```sql
   DROP TABLE IF EXISTS proyectos_rentabilidad CASCADE;
   ```
4. Luego ejecuta el resto del script

---

**Archivo a ejecutar**: `scripts/EJECUTAR_ESTE.sql`

**¡Ejecuta este script y la calculadora funcionará perfectamente!** 🚀
