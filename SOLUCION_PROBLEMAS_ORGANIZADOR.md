# Solución de Problemas - Módulo Organizador

## Problemas Identificados y Solucionados

### 1. ✅ Diferencia Horaria en Eventos

**Problema:**
Los eventos se creaban con una hora (ej: 20:32) pero en el calendario aparecían con otra hora (ej: 21:32).

**Causa:**
El input `datetime-local` del navegador trabaja con la zona horaria local del usuario, pero Supabase guarda las fechas en formato UTC. Al mostrar los eventos, no se estaba convirtiendo de UTC de vuelta a la hora local.

**Solución Implementada:**

Se agregaron dos funciones de conversión en `CalendarioTab.tsx`:

```typescript
// Convierte de UTC (Supabase) a hora local (formulario)
const convertirUTCaLocal = (fechaUTC: string) => {
  const fecha = new Date(fechaUTC);
  const offset = fecha.getTimezoneOffset() * 60000;
  const fechaLocal = new Date(fecha.getTime() - offset);
  return fechaLocal.toISOString().slice(0, 16);
};

// Convierte de hora local (formulario) a UTC (Supabase)
const convertirLocalAUTC = (fechaLocal: string) => {
  const fecha = new Date(fechaLocal);
  return fecha.toISOString();
};
```

**Dónde se aplican:**
- Al **guardar** un evento: Convierte la hora local a UTC antes de enviar a Supabase
- Al **cargar** un evento para editar: Convierte UTC a hora local para mostrar en el formulario
- Al **mostrar** eventos en el calendario: Se muestran en la hora correcta del usuario

**Resultado:**
Ahora los eventos se guardan y muestran siempre en la hora local del usuario, sin diferencias.

---

### 2. ✅ Sistema de Recordatorios con Notificaciones

**Problema:**
El checkbox "Activar recordatorio" no hacía nada. Solo guardaba el valor en la base de datos pero no había alertas visuales ni sonoras.

**Solución Implementada:**

Se creó un sistema completo de recordatorios con 3 componentes nuevos:

#### A. Hook `useRecordatorios.tsx`

**Funcionalidad:**
- Verifica cada 30 segundos si hay eventos con recordatorio próximos
- Busca eventos que empiezan en los próximos 5 minutos
- Solicita permisos para notificaciones del navegador
- Emite notificación visual del navegador
- Reproduce sonido de alerta
- Evita notificaciones duplicadas usando localStorage

**Características:**
- ✅ Notificación del navegador (si el usuario da permiso)
- ✅ Notificación sonora usando Web Audio API
- ✅ Control de duplicados para no molestar
- ✅ Limpieza automática después de 1 hora
- ✅ Verificación cada 30 segundos en tiempo real

#### B. Componente `NotificacionesRecordatorio.tsx`

**Funcionalidad:**
- Muestra notificaciones visuales en la esquina superior derecha
- Diseño atractivo con animación de entrada
- Efecto de pulso para llamar la atención
- Muestra tiempo restante hasta el evento
- Botón para cerrar manualmente
- Múltiples notificaciones apiladas

**Características visuales:**
- 🔔 Ícono de campana con fondo accent
- Animación de entrada deslizante
- Efecto de pulso continuo
- Borde destacado en color accent
- Muestra título, descripción y hora del evento

#### C. Integración en `page.tsx`

El sistema de recordatorios se activa automáticamente al entrar al módulo Organizador y funciona en segundo plano mientras el usuario está en la aplicación.

---

## Comportamiento del Sistema de Recordatorios

### Flujo de Funcionamiento:

1. **Usuario crea evento con recordatorio** ✅
   - Marca el checkbox "Activar recordatorio"
   - Guarda el evento

2. **Sistema verifica constantemente** ⏱️
   - Cada 30 segundos busca eventos con recordatorio
   - Detecta eventos que empiezan en los próximos 5 minutos

3. **Cuando detecta un evento próximo** 🔔
   - Muestra notificación del navegador (si hay permiso)
   - Reproduce sonido de alerta (dos tonos)
   - Muestra notificación visual en la pantalla
   - Marca como notificado para evitar repetir

4. **Notificación persistente** 📌
   - Se mantiene visible hasta que el usuario la cierre
   - Muestra tiempo restante en minutos
   - Click en la notificación del navegador enfoca la ventana

### Permisos Requeridos:

Al entrar por primera vez al módulo Organizador, el navegador pedirá permiso para mostrar notificaciones:

- **Permitir**: Se mostrarán notificaciones del navegador + visuales + sonoras
- **Denegar**: Solo se mostrarán notificaciones visuales + sonoras dentro de la app

---

## Archivos Modificados y Creados

### Modificados:
```
app/wallest/organizador/components/CalendarioTab.tsx
  ├─ Agregadas funciones de conversión de zona horaria
  └─ Aplicadas conversiones al guardar y cargar eventos

app/wallest/organizador/page.tsx
  ├─ Integrado hook useRecordatorios
  └─ Agregado componente NotificacionesRecordatorio
```

### Creados:
```
app/wallest/organizador/components/useRecordatorios.tsx
  └─ Hook personalizado para gestión de recordatorios

app/wallest/organizador/components/NotificacionesRecordatorio.tsx
  └─ Componente visual de notificaciones
```

---

## Pruebas Sugeridas

### 1. Probar Zona Horaria:
1. Crear un evento a las 15:00
2. Verificar que en el calendario aparece a las 15:00
3. Editar el evento y verificar que muestra 15:00
4. Guardar y confirmar que sigue mostrando 15:00

### 2. Probar Recordatorios:
1. Crear un evento que empiece en 3-4 minutos
2. Activar el checkbox "Activar recordatorio"
3. Guardar el evento
4. Esperar hasta que falten 5 minutos
5. Verificar que aparezca:
   - Notificación del navegador (si diste permiso)
   - Notificación visual en esquina superior derecha
   - Sonido de alerta (dos tonos)

### 3. Probar Notificaciones Múltiples:
1. Crear varios eventos con recordatorio
2. Configurarlos para que empiecen en horarios cercanos
3. Verificar que se muestran múltiples notificaciones apiladas
4. Cerrar una por una con el botón X

---

## Configuración de Recordatorios

### Tiempo de anticipación:
- Por defecto: **5 minutos antes** del evento
- Puedes modificarlo en `useRecordatorios.tsx` línea 29

### Frecuencia de verificación:
- Por defecto: **cada 30 segundos**
- Puedes modificarlo en `useRecordatorios.tsx` línea 17

### Duración del sonido:
- Dos tonos de **0.5 segundos cada uno**
- Puedes modificarlo en `useRecordatorios.tsx` líneas 71-102

---

## Mejoras Futuras Opcionales

1. **Configuración personalizada:**
   - Permitir al usuario elegir anticipación (5, 10, 15 minutos)
   - Seleccionar tipo de sonido
   - Activar/desactivar sonido

2. **Recordatorios múltiples:**
   - 1 día antes
   - 1 hora antes
   - 5 minutos antes

3. **Integración con calendario externo:**
   - Sincronizar con Google Calendar
   - Exportar a ICS

4. **Historial de notificaciones:**
   - Ver recordatorios anteriores
   - Reactivar recordatorios perdidos

---

## Resumen de Estado

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Conversión de zona horaria | ✅ SOLUCIONADO | Eventos se muestran en hora local correcta |
| Notificaciones del navegador | ✅ IMPLEMENTADO | Requiere permiso del usuario |
| Notificaciones visuales | ✅ IMPLEMENTADO | Siempre visibles en la app |
| Alertas sonoras | ✅ IMPLEMENTADO | Dos tonos usando Web Audio API |
| Control de duplicados | ✅ IMPLEMENTADO | No repite notificaciones |
| Verificación en tiempo real | ✅ IMPLEMENTADO | Cada 30 segundos |

**Estado Final: AMBOS PROBLEMAS RESUELTOS** ✅

---

## Notas Técnicas

- Las conversiones de zona horaria usan el offset del navegador del usuario
- Los recordatorios solo funcionan mientras la aplicación está abierta
- localStorage evita notificaciones duplicadas entre recargas
- Web Audio API es compatible con todos los navegadores modernos
- Las notificaciones del navegador requieren HTTPS en producción (localhost funciona)

---

Desarrollado para: Wallest Operating System - Módulo Organizador
Fecha: Octubre 2025
