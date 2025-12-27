# 🎯 Planificador de Reformas Mejorado

## ✅ Implementación completada

Se ha implementado exitosamente el sistema mejorado del Planificador de Reformas con las siguientes características:

### 📦 Archivos creados

1. **Scripts SQL:**
   - `scripts/mejora_planificador_reformas.sql` - Estructura de tablas y triggers
   - `scripts/plantilla_base_reformas.sql` - Datos precargados de partidas e ítems
   - `scripts/clonar_plantilla_reforma.sql` - Función para clonar plantillas

2. **Componentes Frontend:**
   - `components/ItemsTable.tsx` - Tabla editable de ítems con todas las funcionalidades
   - `app/renova/planificador/page.tsx` - Página índice que lista reformas
   - `app/renova/planificador/[reforma_id]/page.tsx` - Planificador detallado por reforma

3. **Tipos TypeScript:**
   - Actualizados en `lib/supabase.ts`

## 🚀 Cómo ver el resultado

### Paso 1: Ejecutar scripts SQL en Supabase

Necesitas ejecutar los scripts SQL en tu base de datos Supabase en el siguiente orden:

1. **Crear estructura de tablas:**
   ```bash
   # Abre Supabase Dashboard > SQL Editor
   # Copia y pega el contenido de:
   scripts/mejora_planificador_reformas.sql
   ```

2. **Insertar plantilla base:**
   ```bash
   # En SQL Editor, ejecuta:
   scripts/plantilla_base_reformas.sql
   ```

3. **Crear función de clonado (opcional pero recomendado):**
   ```bash
   # En SQL Editor, ejecuta:
   scripts/clonar_plantilla_reforma.sql
   ```

### Paso 2: Clonar plantilla en una reforma existente

Para que una reforma tenga las partidas precargadas, ejecuta:

```sql
-- Sustituye 'ID-DE-TU-REFORMA' por el ID real de una reforma existente
SELECT clonar_plantilla_en_reforma('ID-DE-TU-REFORMA');

-- O clona la plantilla en TODAS las reformas que no tengan partidas:
SELECT clonar_plantilla_en_reforma(id) 
FROM reformas 
WHERE id NOT IN (SELECT DISTINCT reforma_id FROM partidas_reforma_detalladas);
```

### Paso 3: Iniciar la aplicación

```bash
npm run dev
```

### Paso 4: Acceder al planificador mejorado

1. Abre tu navegador en `http://localhost:3000`
2. Inicia sesión en el WOS
3. Ve a **Renova > Planificador**
4. Verás una lista de reformas disponibles
5. Haz clic en cualquier reforma para entrar a su planificador detallado

## 🎨 Características implementadas

### ✅ Partidas precargadas
- 21 partidas base organizadas por categoría
- Electricidad, Pintura, Albañilería, Fontanería, etc.
- Cada partida tiene un color según su categoría

### ✅ Ítems detallados
- Cada partida contiene ítems precargados
- Por ejemplo, "Electrodomésticos" incluye: Frigorífico, Horno, Lavadora, etc.
- Los ítems son editables

### ✅ Campos por ítem
- Nombre del ítem
- Estancia (Cocina, Baño, Salón, etc.)
- Proveedor/Profesional
- Coste en euros
- Fecha de compra
- Fecha de entrega
- Fecha de instalación
- Nota

### ✅ Cálculo automático de totales
- El total de cada partida se calcula automáticamente desde sus ítems
- El presupuesto total de la reforma se calcula desde las partidas
- Los triggers en la base de datos mantienen todo sincronizado

### ✅ Estados de partidas
- Pendiente (gris)
- En curso (azul)
- Completado/OK (verde)

### ✅ Interfaz expandible
- Las partidas se muestran colapsadas
- Al hacer clic en una partida, se expande mostrando su tabla de ítems
- Puedes editar, agregar o eliminar ítems

### ✅ Agregar contenido personalizado
- Botón "Agregar partida" para crear partidas personalizadas
- Botón "Agregar ítem" dentro de cada partida

## 📊 Flujo de uso

1. **Seleccionar reforma** → Desde `/renova/planificador`
2. **Ver partidas** → Todas las partidas precargadas están visibles
3. **Expandir partida** → Click para ver detalle de ítems
4. **Editar ítem** → Click en ✏️ para editar campos
5. **Ver totales** → Se actualizan automáticamente

## 🔧 Verificación

Para verificar que la plantilla se cargó correctamente:

```sql
-- Ver partidas plantilla
SELECT COUNT(*) as total_partidas FROM partidas_plantilla;
-- Debería devolver: 21

-- Ver ítems plantilla
SELECT COUNT(*) as total_items FROM items_plantilla;
-- Debería devolver: ~120 ítems

-- Ver detalle por partida
SELECT 
  pp.nombre as partida,
  COUNT(ip.id) as total_items
FROM partidas_plantilla pp
LEFT JOIN items_plantilla ip ON ip.partida_plantilla_id = pp.id
GROUP BY pp.id, pp.nombre
ORDER BY pp.orden;
```

## 🎯 Resultado esperado

Al entrar al planificador de una reforma deberías ver:

1. **Header con información de la reforma**
   - Nombre
   - Estado y avance
   - Presupuesto total (calculado automáticamente)

2. **Lista de 21 partidas precargadas**
   - Electricidad
   - Pintura
   - Albañilería
   - ...
   - Electrodomésticos (con ítems: Frigorífico, Horno, Lavadora, etc.)
   - ...
   - Otros

3. **Cada partida muestra:**
   - Nombre y categoría
   - Estado (pendiente/en curso/ok)
   - Total calculado desde sus ítems
   - Botón para expandir/colapsar

4. **Al expandir una partida:**
   - Tabla con todos los ítems
   - Campos editables
   - Botón para agregar más ítems

## ⚠️ Notas importantes

1. **No modifiques las tablas antiguas**: Las tablas `planificacion_reforma` siguen existiendo pero no se usan en el nuevo sistema

2. **Los triggers funcionan automáticamente**: No necesitas actualizar totales manualmente, se calculan automáticamente al guardar ítems

3. **Cada reforma tiene su propia copia**: Cuando clonas la plantilla, cada reforma obtiene su propia instancia de partidas e ítems (no comparten datos)

4. **Las fechas son opcionales**: Si no tienes la información, simplemente deja el campo vacío

5. **El proveedor es a nivel de ítem**: Esto permite máxima granularidad. Si un mismo proveedor vende varios ítems, se repite el nombre.

## 🐛 Troubleshooting

### No veo las partidas precargadas
- Verifica que ejecutaste `plantilla_base_reformas.sql`
- Verifica que ejecutaste `clonar_plantilla_en_reforma()` para la reforma específica

### El total no se actualiza
- Verifica que los triggers se crearon correctamente
- Revisa la consola del navegador para errores

### Error al agregar ítems
- Verifica que las políticas RLS están configuradas correctamente
- Revisa que las foreign keys están bien configuradas

## 📞 Soporte

Si encuentras algún problema, revisa:
1. Console del navegador (F12)
2. Logs de Supabase
3. Network tab para ver llamadas a la API

---

**¡Listo para usar! 🎉**
