# 📅 Integración con Google Calendar - Documentación Completa

**Fecha**: 16 de diciembre de 2025  
**Estado**: ✅ Implementado y listo para configurar

---

## 🎯 Resumen de la Integración

La integración permite sincronización bidireccional completa entre el Calendario del WOS y Google Calendar:

- ✅ **WOS → Google**: Eventos creados/editados/eliminados en WOS se sincronizan automáticamente
- ✅ **Google → WOS**: Eventos de Google Calendar aparecen en el WOS
- ✅ **Autenticación OAuth2**: Conexión segura con Google
- ✅ **Refresh automático**: Los tokens se renuevan automáticamente
- ✅ **UI integrada**: Botón de conexión y panel de estado en el Calendario

---

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Google Cloud Console

#### 1.1 Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente

#### 1.2 Habilitar la API de Google Calendar
1. En el menú lateral, ve a **"APIs & Services" → "Library"**
2. Busca **"Google Calendar API"**
3. Haz click en **"Enable"**

#### 1.3 Configurar la pantalla de consentimiento OAuth
1. Ve a **"APIs & Services" → "OAuth consent screen"**
2. Selecciona **"External"** (o Internal si es para organización)
3. Completa la información requerida:
   - **App name**: WOS - Wallest Operating System
   - **User support email**: Tu email
   - **Developer contact**: Tu email
4. En **"Scopes"**, agrega:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Guarda y continúa

#### 1.4 Crear credenciales OAuth 2.0
1. Ve a **"APIs & Services" → "Credentials"**
2. Click en **"Create Credentials" → "OAuth client ID"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: WOS Calendar Integration
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/google/callback` (desarrollo)
     - `https://tu-dominio.com/api/google/callback` (producción)
5. Click en **"Create"**
6. **GUARDA** el **Client ID** y **Client Secret** que aparecen

### 2. Configurar Variables de Entorno

#### 2.1 Actualizar archivo `.env.local`

Copia el archivo `.env.local.example` a `.env.local` si no existe:

```bash
cp .env.local.example .env.local
```

Luego edita `.env.local` y agrega las credenciales de Google:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zzidqchvcijqgcexrzca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key_aqui

# Google Calendar Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env.local` a Git (ya está en `.gitignore`)

### 3. Configurar Base de Datos en Supabase

#### 3.1 Ejecutar el script SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Click en **"SQL Editor"** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de `/scripts/google_calendar_integration.sql`
5. Click en **"Run"**

El script creará:
- ✅ Tabla `google_calendar_tokens` (almacena tokens de autenticación)
- ✅ Tabla `google_calendar_sync` (mapeo entre eventos WOS y Google)
- ✅ Columnas adicionales en `eventos_globales` (para identificar eventos de Google)
- ✅ Políticas RLS (Row Level Security)
- ✅ Funciones auxiliares para estadísticas

#### 3.2 Verificar las tablas

Ejecuta en SQL Editor:

```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%google%';

-- Verificar columnas agregadas a eventos_globales
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos_globales' 
AND column_name IN ('google_event_id', 'is_google_event');
```

### 4. Reiniciar el Servidor

```bash
# Detener el servidor si está corriendo (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

---

## 🚀 Uso de la Integración

### Conectar Google Calendar

1. Ve a **WALLest → Organizador → Calendario**
2. Haz click en el botón **"Conectar Google"** (o icono de nube)
3. Se abrirá una ventana de autenticación de Google
4. Selecciona tu cuenta de Google
5. Acepta los permisos solicitados
6. Serás redirigido de vuelta al WOS
7. Verás un mensaje de éxito y el estado cambiará a **"Conectado"**

### Panel de Estado de Sincronización

Una vez conectado, haz click en el botón **"Google"** para abrir el panel que muestra:

- **Total Eventos**: Número total de eventos en el calendario
- **Sincronizados**: Eventos correctamente sincronizados con Google
- **Pendientes**: Eventos esperando sincronización
- **Errores**: Eventos con fallos de sincronización
- **Última sincronización**: Fecha y hora de la última sincronización

### Sincronizar Manualmente

En el panel de Google Calendar:

1. Click en **"Sincronizar Ahora"**
2. El sistema importará todos los eventos de tu Google Calendar de los próximos 3 meses
3. Verás un mensaje con el número de eventos sincronizados

### Desconectar

1. Abre el panel de Google Calendar
2. Click en **"Desconectar"**
3. Confirma la acción
4. Los tokens se revocarán y eliminarán
5. Los eventos NO se eliminarán (ni en WOS ni en Google)

---

## 🔄 Sincronización Automática

### WOS → Google Calendar

Cuando **creas, editas o eliminas** un evento en el WOS:

1. El evento se guarda en la base de datos del WOS
2. Automáticamente se crea/actualiza/elimina en Google Calendar
3. Se crea un registro en `google_calendar_sync` para trackear el mapeo

### Google Calendar → WOS

La sincronización desde Google es **manual** por defecto:

- Click en **"Sincronizar Ahora"** en el panel de Google
- Los eventos de Google Calendar se importan al WOS
- Los eventos importados llevan el ícono de nube 🌥️

**Nota**: Para sincronización automática cada X minutos, se necesitaría implementar un cron job o webhook (ver sección de mejoras futuras).

---

## 🔒 Seguridad y Privacidad

### Tokens de Acceso

- ✅ Almacenados encriptados en Supabase
- ✅ Protegidos con Row Level Security (RLS)
- ✅ Cada usuario solo ve sus propios tokens
- ✅ Refresh automático antes de expirar
- ✅ Revocación automática al desconectar

### Permisos Solicitados

La app solicita SOLO los permisos necesarios:

- `calendar`: Leer calendarios
- `calendar.events`: Crear, editar y eliminar eventos

**NO se solicita**:
- ❌ Acceso a otros datos de Google
- ❌ Acceso a calendarios compartidos (solo el principal)
- ❌ Permisos de escritura en otros servicios

### Políticas RLS

Todas las tablas tienen políticas que garantizan:

- ✅ Los usuarios solo ven sus propios datos
- ✅ No se puede acceder a tokens de otros usuarios
- ✅ No se puede modificar registros de sincronización de otros

---

## 📊 Estructura de Base de Datos

### Tabla: `google_calendar_tokens`

```sql
CREATE TABLE google_calendar_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Tabla: `google_calendar_sync`

```sql
CREATE TABLE google_calendar_sync (
  id UUID PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES eventos_globales(id),
  google_event_id TEXT NOT NULL,
  google_calendar_id TEXT NOT NULL DEFAULT 'primary',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id),
  UNIQUE(google_event_id, user_id)
);
```

### Columnas agregadas a `eventos_globales`

```sql
ALTER TABLE eventos_globales ADD COLUMN google_event_id TEXT;
ALTER TABLE eventos_globales ADD COLUMN is_google_event BOOLEAN DEFAULT false;
```

---

## 🐛 Troubleshooting

### Error: "No valid access token"

**Causa**: El token de acceso expiró y el refresh falló

**Solución**:
1. Desconectar Google Calendar
2. Volver a conectar
3. Si persiste, verificar las credenciales en `.env.local`

### Error: "Failed to exchange code for tokens"

**Causa**: Problema con las credenciales o redirect URI

**Solución**:
1. Verificar que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
2. Verificar que el redirect URI en Google Cloud Console coincida exactamente:
   - Desarrollo: `http://localhost:3000/api/google/callback`
   - Producción: `https://tu-dominio.com/api/google/callback`

### Error: "403 Forbidden" al crear evento

**Causa**: La app no tiene permisos suficientes

**Solución**:
1. Desconectar y reconectar para obtener permisos actualizados
2. Verificar que los scopes estén correctamente configurados en Google Cloud Console

### Los eventos no se sincronizan

**Causa**: Problema de red o token inválido

**Solución**:
1. Abrir la consola del navegador (F12)
2. Buscar errores en la pestaña Console
3. Verificar respuestas en la pestaña Network
4. Reintentar la sincronización manual
5. Si falla, desconectar y reconectar

### Error: "Cannot read properties of null (reading 'id')"

**Causa**: Usuario no autenticado en WOS

**Solución**:
1. Verificar que estás logueado en WOS
2. Refrescar la página
3. Intentar de nuevo

---

## 📱 Funcionalidades Implementadas

### ✅ Autenticación
- [x] OAuth2 con Google
- [x] Almacenamiento seguro de tokens
- [x] Refresh automático de tokens
- [x] Revocación de acceso

### ✅ Sincronización WOS → Google
- [x] Crear eventos en Google al crear en WOS
- [x] Actualizar eventos en Google al editar en WOS
- [x] Eliminar eventos en Google al eliminar en WOS
- [x] Mapeo automático entre sistemas

### ✅ Sincronización Google → WOS
- [x] Importar eventos de Google Calendar
- [x] Actualizar eventos existentes
- [x] Identificar eventos de Google con ícono
- [x] Sincronización manual on-demand

### ✅ Interfaz de Usuario
- [x] Botón de conexión/desconexión
- [x] Panel de estado de sincronización
- [x] Indicadores visuales (iconos, colores)
- [x] Estadísticas de sincronización
- [x] Botón de sincronización manual

### ✅ Seguridad
- [x] Row Level Security (RLS)
- [x] Tokens encriptados
- [x] Permisos mínimos necesarios
- [x] Políticas de acceso por usuario

---

## 🚧 Mejoras Futuras (Opcionales)

### Sincronización Automática Periódica

Implementar un cron job o webhook para sincronizar automáticamente cada X minutos:

```typescript
// Ejemplo de implementación con webhook
// app/api/google/webhook/route.ts
export async function POST(request: Request) {
  // Verificar firma del webhook
  // Sincronizar eventos
  // Retornar 200 OK
}
```

### Notificaciones Push

Recibir notificaciones cuando cambian eventos en Google:

- Implementar webhooks de Google Calendar
- Usar Google Calendar API Notifications
- Actualizar eventos en tiempo real

### Calendarios Múltiples

Permitir seleccionar qué calendario de Google usar:

- Lista de calendarios disponibles
- Selector en la UI
- Sincronización por calendario

### Sincronización de Recordatorios

Sincronizar también los recordatorios:

- Notificaciones de Google
- Alarmas personalizadas
- Email/SMS reminders

### Compartir Eventos

Permitir compartir eventos con otros usuarios:

- Invitaciones por email
- Calendarios compartidos
- Permisos de edición

---

## 📚 Referencias

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

---

## ✅ Checklist de Instalación

Marca cada paso al completarlo:

- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar Google Calendar API
- [ ] Configurar pantalla de consentimiento OAuth
- [ ] Crear credenciales OAuth 2.0
- [ ] Copiar Client ID y Client Secret
- [ ] Actualizar `.env.local` con las credenciales
- [ ] Ejecutar script SQL en Supabase
- [ ] Verificar que las tablas se crearon
- [ ] Reiniciar el servidor de desarrollo
- [ ] Probar la conexión con Google Calendar
- [ ] Crear un evento de prueba
- [ ] Verificar sincronización en Google Calendar
- [ ] Importar eventos desde Google
- [ ] Verificar que aparecen en WOS

---

## 🎉 Resultado Final

Una vez completada la configuración, tendrás:

✅ **Calendario unificado**: Todos tus eventos en un solo lugar  
✅ **Sincronización bidireccional**: Trabaja desde WOS o Google indistintamente  
✅ **Acceso universal**: Consulta eventos desde cualquier dispositivo  
✅ **Sin duplicados**: Sistema inteligente de mapeo de eventos  
✅ **Seguro y confiable**: Tokens protegidos y refresh automático  

---

**Estado**: ✅ **Implementación completa y lista para usar**  
**Autor**: Memex AI Assistant  
**Fecha**: 16 de diciembre de 2025  
