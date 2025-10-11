# Plan de Implementación: WOS 1.0 - Modificaciones Técnicas

## Metadatos
- **Fecha de creación**: 2025-10-10
- **Versión**: WOS 1.0
- **Responsable**: Memex
- **Proyecto**: Wallest Operating System

## Objetivo
Implementar modificaciones técnicas confirmadas para WOS 1.0, incluyendo actualizaciones de base de datos, cambios funcionales en módulos y mejoras de UI/UX.

---

## Fase 1: Backend - Migraciones de Base de Datos

### 1.1. Actualizar tabla activos_inmobiliarios
- Agregar nuevos tipos de inmueble (edificio, dúplex, chalet, adosado, trastero, garaje, nave)
- Agregar campos booleanos: nota_simple, deudas, ocupado
- Agregar campo barrio (text)
- Actualizar relaciones con reformas

### 1.2. Actualizar tabla proveedores
- Agregar campo tipo (enum: activo, pasivo)

### 1.3. Actualizar tabla administracion
- Cambiar campo categoria de text a tipo desplegable editable
- Eliminar campo responsable

### 1.4. Actualizar tabla comercializacion
- Agregar campo publicado_en_portales (boolean)
- Agregar campo portales (text)
- Agregar campo precio_quiebre (numeric)
- Agregar campo precio_minimo_aceptado (numeric)

### 1.5. Crear vistas para KPIs
- view_kpis_global: ingresos vs gastos (finanzas + administración)
- view_activos_por_estado: conteo de inmuebles por estado
- view_avance_reformas: promedio de avances

### 1.6. Actualizar triggers y funciones
- Vincular presupuesto de reformas con suma de partidas
- Calcular avance automático basado en partidas finalizadas
- Auto-finalizar reforma cuando todas las partidas están completas

---

## Fase 2: Frontend - Módulo Activos Inmobiliarios (WALLest)

### 2.1. Actualizar formulario de activos
- Agregar nuevos tipos al select de tipo de inmueble
- Agregar checkboxes para: nota_simple, deudas, ocupado
- Agregar campo de texto para barrio
- Actualizar validaciones

### 2.2. Actualizar listado de activos
- Mostrar nuevos campos en tabla
- Actualizar filtros para incluir nuevos tipos

---

## Fase 3: Frontend - Módulo Administración

### 3.1. Actualizar formulario de administración
- Convertir categoría en select editable (combobox)
- Remover campo responsable del formulario
- Actualizar validaciones

### 3.2. Validar integración con KPIs
- Confirmar que no duplica registros de finanzas
- Validar que alimenta correctamente dashboard

---

## Fase 4: Frontend - Módulo Reformas/Planificador

### 4.1. Actualizar lógica de vinculación
- Vincular presupuesto_total con suma de partidas automáticamente
- Implementar cálculo de avance basado en partidas finalizadas

### 4.2. Mejorar gestión de partidas
- Permitir cambio manual de estado: pendiente, en_proceso, finalizado
- Implementar auto-finalización de reforma cuando todas las partidas estén completas
- Actualizar UI para reflejar estados visualmente

---

## Fase 5: Frontend - Módulo Proveedores

### 5.1. Actualizar formulario de proveedores
- Agregar select para tipo (activo/pasivo)
- Mantener campos existentes

### 5.2. Actualizar listado
- Mostrar tipo de proveedor
- Agregar filtros por tipo

---

## Fase 6: Frontend - Módulo CRM Leads

### 6.1. Agregar funcionalidad de edición
- Implementar botón de edición (✎) en tarjetas
- Crear modal/formulario de edición
- Mantener funcionalidad de arrastrar y soltar

### 6.2. Validar funcionalidades existentes
- Confirmar que columnas Kanban funcionan correctamente
- Validar cambios de estado

---

## Fase 7: Frontend - Módulo Comercialización

### 7.1. Actualizar formulario
- Agregar checkbox publicado_en_portales
- Agregar campo texto libre portales
- Agregar campos numéricos: precio_quiebre, precio_minimo_aceptado
- Mantener botón de eliminación

### 7.2. Actualizar listado
- Mostrar nuevos campos en tabla
- Actualizar visualización

---

## Fase 8: Ajustes Generales y UI/UX

### 8.1. Actualizar branding
- Uniformar logo: texto "WALLEST" en mayúsculas
- Verificar consistencia en toda la aplicación

### 8.2. Mejorar navegación
- Verificar que desplegables laterales cierren al navegar entre módulos
- Confirmar que modo oscuro se mantiene como predeterminado

### 8.3. Validar integraciones
- Confirmar que botón "Abrir carpeta de Drive" abre en nueva pestaña
- Validar que KPI "Total Vendido" se actualiza con nuevas transacciones

---

## Fase 9: Testing y Validación

### 9.1. Testing de base de datos
- Verificar todas las migraciones aplicadas correctamente
- Probar triggers y funciones automáticas
- Validar integridad referencial

### 9.2. Testing de frontend
- Probar flujos completos de cada módulo
- Validar formularios y validaciones
- Verificar que KPIs se actualizan correctamente

### 9.3. Testing de integración
- Probar flujo completo: activo → reforma → comercialización → transacción
- Validar sincronización entre módulos
- Verificar que automatizaciones funcionan correctamente

---

## Fase 10: Documentación

### 10.1. Actualizar documentación técnica
- Actualizar README con nuevos campos
- Documentar nuevas funcionalidades
- Actualizar scripts de migración

### 10.2. Crear notas de versión
- Documentar todos los cambios implementados
- Crear guía de migración para usuarios existentes

---

## Criterios de Éxito

✅ Todas las migraciones de base de datos ejecutadas sin errores  
✅ Todos los formularios actualizados con nuevos campos  
✅ Funcionalidades de edición implementadas en CRM  
✅ Automatizaciones de reformas funcionando correctamente  
✅ KPIs actualizándose en tiempo real  
✅ UI/UX consistente en toda la aplicación  
✅ Tests pasando para todos los flujos principales  
✅ Documentación actualizada  

---

## Riesgos y Mitigaciones

**Riesgo**: Pérdida de datos durante migraciones  
**Mitigación**: Crear backup completo antes de ejecutar migraciones

**Riesgo**: Incompatibilidad con datos existentes  
**Mitigación**: Usar ALTER TABLE con valores por defecto apropiados

**Riesgo**: Breaking changes en frontend  
**Mitigación**: Implementar cambios de forma incremental y validar cada módulo

---

## Notas Técnicas

- Base de datos: PostgreSQL (Supabase)
- Framework: Next.js 14+ con TypeScript
- Políticas RLS: Temporalmente desactivadas
- Todos los timestamps incluyen: created_at, updated_at, archived
