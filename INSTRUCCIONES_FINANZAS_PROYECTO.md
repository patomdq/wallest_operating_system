# Módulo de Finanzas de Proyecto - Instrucciones de Configuración

## 📋 Resumen

Se ha creado el módulo **Finanzas de Proyecto** en el sistema WOS que permite:
- Gestionar movimientos financieros individuales por reforma
- Visualizar KPIs automáticos (precio compra, gastos, ingresos, ROI)
- Calcular desviación presupuestaria
- Agregar, editar y eliminar partidas financieras
- Actualización en tiempo real de todos los indicadores

## 📂 Archivos Creados

1. **app/renova/finanzas-proyecto/page.tsx** - Página principal del módulo
2. **scripts/create_finanzas_proyecto_table.sql** - Script SQL para crear la tabla
3. **lib/supabase.ts** - Actualizado con el tipo FinanzaProyecto
4. **app/renova/reformas/page.tsx** - Modificado para incluir el enlace "Ver Finanzas →"

## 🗄️ Configuración de Base de Datos

### Paso 1: Crear la tabla en Supabase

1. Accede a tu proyecto en **Supabase Dashboard**
2. Ve a **SQL Editor** en el menú lateral
3. Copia y pega el contenido del archivo `scripts/create_finanzas_proyecto_table.sql`
4. Ejecuta el script haciendo clic en "Run"

El script creará:
- Tabla `finanzas_proyecto` con todos los campos necesarios
- Índices para mejorar el rendimiento
- Políticas de Row Level Security (RLS)
- Trigger para actualizar `updated_at` automáticamente

### Estructura de la tabla:

```sql
finanzas_proyecto:
  - id (UUID, primary key)
  - reforma_id (UUID, foreign key → reformas.id)
  - fecha (DATE)
  - tipo (TEXT: 'ingreso' | 'gasto')
  - categoria (TEXT)
  - descripcion (TEXT)
  - proveedor (TEXT)
  - cantidad (NUMERIC)
  - precio_unitario (NUMERIC)
  - total (NUMERIC)
  - forma_pago (TEXT)
  - observaciones (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## 🚀 Uso del Módulo

### Acceso al módulo:

1. **Desde el menú:** `/renova/finanzas-proyecto`
2. **Desde Reformas:** Hacer clic en el botón verde "Ver Finanzas →" en cualquier tarjeta de reforma

### Funcionalidades:

#### 1. Selector de Reforma
- Muestra todas las reformas disponibles
- Formato: "Nombre Reforma — Nombre Inmueble — Estado Inmueble"
- Al seleccionar se cargan automáticamente los datos

#### 2. Indicadores (KPIs)

**Cuatro tarjetas principales:**
- **Precio de compra:** Obtenido desde `inmuebles.precio_compra`
- **Gastos totales:** Suma de movimientos tipo 'gasto' (color rojo)
- **Ingresos totales:** Suma de movimientos tipo 'ingreso' (color verde)
- **ROI estimado (%):** Calculado como: (Ingresos - (Precio + Gastos)) / (Precio + Gastos) × 100
  - Verde si es positivo
  - Rojo si es negativo

**Quinta tarjeta:**
- **Desviación presupuestaria (%):** (Gastos - Planificado) / Planificado × 100
  - Verde: ≤ 0%
  - Amarillo: 0-20%
  - Rojo: > 20%
  - Planificado = suma de `costo` en `planificacion_reforma`

#### 3. Tabla de Movimientos

Muestra todos los movimientos financieros con:
- Fecha, Tipo, Categoría, Descripción
- Proveedor, Cantidad, Precio unitario, Total
- Forma de pago, Observaciones
- Acciones: Editar y Eliminar

**Footer de la tabla:**
- Total Gastos (rojo)
- Total Ingresos (verde)

#### 4. Formulario de Nueva Partida

Campos:
- **Fecha** (requerido)
- **Tipo:** Ingreso / Gasto
- **Categoría:** Materiales, Mano de obra, Honorarios, Impuestos, Venta, Arras, Otros
- **Descripción** (requerido)
- **Proveedor**
- **Cantidad** (calcula total automáticamente)
- **Precio unitario** (calcula total automáticamente)
- **Total** (requerido)
- **Forma de pago**
- **Observaciones** (textarea)

**Botones:**
- Guardar: Inserta o actualiza el registro
- Cancelar: Cierra el formulario sin cambios

#### 5. Edición y Eliminación

- **Editar:** Precarga el formulario con los datos existentes
- **Eliminar:** Solicita confirmación antes de borrar

**Actualización automática:**
Después de cualquier operación (agregar, editar, eliminar):
- Se recarga la tabla de movimientos
- Se recalculan todos los KPIs
- Sin recargar toda la página

## 🎨 Estilo Visual

El módulo mantiene coherencia con el sistema WOS:

### Clases Tailwind utilizadas:
- `bg-wos-card` - Fondo de tarjetas
- `bg-wos-bg` - Fondo general
- `border-wos-border` - Bordes
- `text-wos-text` - Texto principal
- `text-wos-text-muted` - Texto secundario
- `text-wos-accent` - Color de acento

### Colores específicos:
- **Ingreso:** `text-green-500`
- **Gasto:** `text-red-500`
- **ROI positivo:** `text-green-500`
- **ROI negativo:** `text-red-500`
- **Desviación ≤0:** `text-green-500`
- **Desviación 0-20:** `text-yellow-500`
- **Desviación >20:** `text-red-500`

## 📊 Fórmulas de Cálculo

### ROI (Return on Investment):
```
ROI = ((Ingresos Totales - Inversión Total) / Inversión Total) × 100
donde:
  Inversión Total = Precio de Compra + Gastos Totales
```

### Desviación Presupuestaria:
```
Desviación = ((Gastos Totales - Presupuesto Planificado) / Presupuesto Planificado) × 100
donde:
  Presupuesto Planificado = suma de costo en planificacion_reforma
```

## 🔒 Restricciones Cumplidas

✅ No se modificó `app/renova/planificador`
✅ No se alteró la lógica de estados de las reformas
✅ No se tocó el módulo `wallest/finanzas`
✅ No se cambió la estructura de tablas existentes
✅ Solo se agregó la nueva tabla `finanzas_proyecto`
✅ Solo se modificó `app/renova/reformas/page.tsx` para agregar el enlace

## 🧪 Pruebas Recomendadas

1. **Crear tabla en Supabase** ejecutando el script SQL
2. **Iniciar el servidor** de desarrollo: `npm run dev`
3. **Navegar** a una reforma existente
4. **Hacer clic** en "Ver Finanzas →"
5. **Seleccionar** una reforma del dropdown
6. **Agregar** varios movimientos de prueba (gastos e ingresos)
7. **Verificar** que los KPIs se calculan correctamente
8. **Editar** un movimiento y verificar actualización
9. **Eliminar** un movimiento y verificar recalculo
10. **Probar** la navegación directa con URL: `/renova/finanzas-proyecto?reforma_id=xxx`

## 📝 Notas Adicionales

- El módulo es completamente independiente del módulo general de finanzas
- Los cálculos se actualizan en tiempo real sin recargar la página
- El selector de reforma muestra iconos de estado del inmueble:
  - 🟢 COMPRADO
  - 🟠 ARRAS
  - 🔵 VENDIDO
  - 🟡 EN_ESTUDIO
- El campo `total` se calcula automáticamente al introducir cantidad y precio unitario
- Las políticas RLS están configuradas para acceso completo (ajustar según necesidades)

## 🆘 Solución de Problemas

### La tabla no aparece en Supabase:
- Verificar que el script SQL se ejecutó correctamente
- Revisar que no haya errores en el SQL Editor
- Verificar que existe la extensión `uuid-ossp` en Supabase

### Los KPIs no se calculan:
- Verificar que existe `precio_compra` en el inmueble relacionado
- Verificar que existe al menos una partida en `planificacion_reforma`
- Revisar la consola del navegador por errores

### El formulario no guarda datos:
- Verificar las políticas RLS en Supabase
- Revisar la consola del navegador
- Verificar que `reforma_id` está seleccionado

---

**Fecha de creación:** 2025-10-24
**Módulo:** Finanzas de Proyecto
**Sistema:** WOS (Wallest Operating System)
