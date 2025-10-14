# Cambios: Nueva Calculadora de Rentabilidad (CDR)

**Fecha**: 13 de octubre de 2025  
**Autor**: Sistema WOS  
**Módulo**: Wallest - Calculadora de Rentabilidad

---

## 📋 Resumen Ejecutivo

Se ha reemplazado el módulo "Simulador de Rentabilidad" por una nueva "Calculadora de Rentabilidad (CDR)" completamente funcional y vinculada al flujo operativo del sistema WOS.

---

## 🔄 Cambios Realizados

### 1. Estructura de Carpetas
- **Renombrado**: `/app/wallest/simulador/` → `/app/wallest/calculadora/`
- **Nueva URL**: `/wallest/calculadora`

### 2. Archivos Modificados

#### `/app/wallest/calculadora/page.tsx` (NUEVO)
- Componente React completamente reescrito
- Formulario horizontal con 7 campos principales
- Sistema de estados del proyecto (borrador, en_estudio, aprobado, rechazado)
- Cálculos automáticos de rentabilidad
- Tabla histórica con funciones CRUD completas
- Integración automática con módulo de Activos Inmobiliarios

#### `/lib/supabase.ts`
- Actualizado tipo `SimulacionRentabilidad` con nueva estructura:
  ```typescript
  {
    nombre: string
    ciudad?: string
    precio_compra: number
    precio_venta: number
    reforma: number
    impuestos_gastos: number
    duracion_meses: number
    rentabilidad_total?: number
    rentabilidad_anualizada?: number
    beneficio_neto?: number
    estado: 'borrador' | 'en_estudio' | 'aprobado' | 'rechazado'
  }
  ```

#### `/components/Sidebar.tsx`
- Actualizado menú: "Simulador de Rentabilidad" → "Calculadora de Rentabilidad"
- Nueva ruta: `/wallest/calculadora`

#### `/app/page.tsx`
- Actualizado enlace y descripción del dashboard principal

### 3. Scripts de Base de Datos

#### `/scripts/migracion_calculadora_rentabilidad.sql`
Script SQL completo para migrar la tabla `simulaciones_rentabilidad`:
- Agrega columnas nuevas: `ciudad`, `impuestos_gastos`, `duracion_meses`, `estado`, etc.
- Elimina columnas obsoletas: `itp_porcentaje`, `notaria`, `registro`, etc.
- Crea constraints e índices para optimización
- Incluye comentarios de documentación

#### `/scripts/README_MIGRACION.md`
Documentación completa de la migración con:
- Instrucciones paso a paso
- Verificación post-migración
- Procedimiento de rollback
- Advertencias de seguridad

---

## 🧮 Fórmulas Implementadas

### Rentabilidad Total
```
Rentabilidad Total = ((Precio Venta - Precio Compra - Reforma - Gastos) / (Precio Compra + Reforma + Gastos)) × 100
```

### Rentabilidad Anualizada
```
Rentabilidad Anualizada = ((1 + (Rentabilidad Total / 100)) ^ (12 / Meses) - 1) × 100
```

### Beneficio Neto
```
Beneficio Neto = Precio Venta - (Precio Compra + Reforma + Impuestos y Gastos)
```

---

## 🎨 Características de la Interfaz

### Formulario de Entrada (Layout Horizontal)
- **Nombre del proyecto** * (obligatorio)
- **Ciudad**
- **Precio de compra (€)** * (obligatorio)
- **Reforma (€)**
- **Impuestos y gastos (€)**
- **Precio de venta (€)** * (obligatorio)
- **Duración (meses)**
- **Botón**: Guardar Proyecto / Actualizar

### Bloque de Resultados (3 columnas)
1. **Rentabilidad Total (%)** - Verde si >15%, Amarillo si 0-15%, Rojo si <0%
2. **Rentabilidad Anualizada (%)** - Con misma lógica de colores
3. **Beneficio Neto (€)** - Con misma lógica de colores

### Tabla Histórica
Columnas:
- Nombre
- Ciudad
- Precio Compra
- Precio Venta
- Rentabilidad Total
- Rentabilidad Anualizada
- **Estado** (dropdown editable)
- **Acciones**: ✏️ Editar | 🗑️ Eliminar

---

## 🔁 Sistema de Estados

### Estados Disponibles
1. **Borrador** - Estado inicial por defecto
2. **En estudio** - Proyecto bajo análisis
3. **Aprobado** - Proyecto validado
4. **Rechazado** - Proyecto descartado

### Flujo Automático
Cuando un proyecto cambia a estado **"Aprobado"**:
1. Se replica automáticamente en la tabla `inmuebles`
2. Datos copiados:
   - Nombre del proyecto
   - Ciudad
   - Precio de compra
   - Estado inicial: "en_estudio"
   - Descripción con rentabilidades estimadas

---

## 🎯 Funcionalidades Implementadas

### ✅ Gestión de Proyectos
- [x] Crear nuevo proyecto
- [x] Editar proyecto existente
- [x] Eliminar proyecto
- [x] Cambiar estado del proyecto
- [x] Persistencia en Supabase
- [x] Validación de campos obligatorios

### ✅ Cálculos Automáticos
- [x] Cálculo en tiempo real al modificar campos
- [x] Rentabilidad total
- [x] Rentabilidad anualizada
- [x] Beneficio neto

### ✅ Integración con Activos
- [x] Replicación automática al aprobar proyecto
- [x] Transferencia de datos relevantes
- [x] Evitar duplicados

### ✅ Interfaz de Usuario
- [x] Diseño horizontal minimalista
- [x] Colores semánticos (verde/amarillo/rojo)
- [x] Responsive design
- [x] Iconos lucide-react
- [x] Feedback visual (loading, alerts)

---

## 📊 Mejoras Respecto al Anterior

### Antes (Simulador)
- ❌ Campos fragmentados (ITP, notaría, registro separados)
- ❌ Sin sistema de estados
- ❌ Sin integración con otros módulos
- ❌ ROI simplificado (asumiendo 2 años fijos)
- ❌ Sin gestión de ciudad

### Ahora (Calculadora)
- ✅ Campo consolidado "Impuestos y gastos"
- ✅ Sistema de estados completo con workflow
- ✅ Integración automática con Activos Inmobiliarios
- ✅ Rentabilidad anualizada dinámica según duración
- ✅ Gestión de ubicación (ciudad)
- ✅ Nombre descriptivo del proyecto
- ✅ Duración personalizable en meses

---

## 🔐 Validaciones

### Campos Obligatorios
- Nombre del proyecto
- Precio de compra
- Precio de venta

### Valores por Defecto
- Reforma: 0€
- Impuestos y gastos: 0€
- Duración: 12 meses (si no se especifica se usa 1 mes para evitar división por cero)
- Estado: Borrador

---

## 🚀 Pasos para Activar

### 1. Ejecutar Migración de Base de Datos
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: scripts/migracion_calculadora_rentabilidad.sql
```

### 2. Verificar Estructura
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'simulaciones_rentabilidad';
```

### 3. Reiniciar Servidor de Desarrollo
```bash
npm run dev
```

### 4. Acceder al Módulo
- Navegar a: `http://localhost:3000/wallest/calculadora`
- O desde el menú lateral: **Wallest → Calculadora de Rentabilidad**

---

## 📝 Notas Técnicas

### Tecnologías Utilizadas
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilos**: Tailwind CSS con tema WOS
- **Base de datos**: Supabase (PostgreSQL)
- **Iconos**: lucide-react

### Consideraciones de Rendimiento
- Índices creados en `estado` y `created_at`
- Cálculos del lado del cliente para respuesta inmediata
- Guardado asíncrono con feedback visual

### Manejo de Errores
- Try/catch en todas las operaciones de BD
- Alerts para feedback al usuario
- Console.error para debugging
- Validación de campos antes de envío

---

## 🔮 Próximas Mejoras Sugeridas

1. **Exportación de datos**
   - CSV de proyectos
   - PDF de reportes individuales

2. **Gráficos y visualización**
   - Comparativa de proyectos
   - Evolución de rentabilidades

3. **Notificaciones**
   - Alert cuando un proyecto cambia a "Aprobado"
   - Recordatorios de seguimiento

4. **Filtros avanzados**
   - Por estado
   - Por rango de rentabilidad
   - Por ciudad

5. **Adjuntos**
   - Subir documentos del proyecto
   - Imágenes del inmueble

---

## 📞 Soporte

Para dudas o problemas con este módulo:
1. Revisar `scripts/README_MIGRACION.md`
2. Verificar logs de Supabase
3. Consultar tipos en `lib/supabase.ts`

---

**Estado**: ✅ Completado y listo para producción  
**Última actualización**: 2025-10-13
