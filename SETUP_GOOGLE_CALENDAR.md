# ⚡ Setup Rápido - Google Calendar

**Tiempo estimado**: 10-15 minutos

---

## 1️⃣ Google Cloud Console (5-10 min)

### A. Crear Proyecto y Habilitar API

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto (o usa uno existente)
3. Busca **"Google Calendar API"** en la biblioteca
4. Click **"Enable"**

### B. Configurar OAuth

1. Ve a: **APIs & Services → OAuth consent screen**
2. Selecciona **"External"**
3. Rellena:
   - App name: `WOS`
   - Email: tu email
4. En **Scopes**, agrega:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. **Guardar**

### C. Crear Credenciales

1. Ve a: **APIs & Services → Credentials**
2. Click: **Create Credentials → OAuth client ID**
3. Tipo: **Web application**
4. Nombre: `WOS Calendar`
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/google/callback
   ```
   (Agrega tu dominio de producción si lo tienes)
6. Click **Create**
7. **COPIA** el **Client ID** y **Client Secret** que aparecen

---

## 2️⃣ Variables de Entorno (1 min)

Edita el archivo `.env.local` (créalo si no existe):

```env
# Supabase (ya debe estar)
NEXT_PUBLIC_SUPABASE_URL=https://zzidqchvcijqgcexrzca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_actual

# Google Calendar - AGREGA ESTAS LÍNEAS
NEXT_PUBLIC_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
```

⚠️ Reemplaza `TU_CLIENT_ID_AQUI` y `TU_CLIENT_SECRET_AQUI` con tus valores

---

## 3️⃣ Base de Datos (2 min)

### A. Abrir Supabase

1. Ve a: https://app.supabase.com/
2. Selecciona tu proyecto: `wallest_operating_system`
3. Click en **SQL Editor** (menú izquierdo)

### B. Ejecutar Script

1. Click **"New query"**
2. Abre el archivo: `/scripts/google_calendar_integration.sql`
3. Copia TODO el contenido
4. Pégalo en el editor de Supabase
5. Click **"Run"** (o F5)
6. Deberías ver: ✅ Success

### C. Verificar (Opcional)

Ejecuta esta query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%google%';
```

Deberías ver:
- `google_calendar_tokens`
- `google_calendar_sync`

---

## 4️⃣ Reiniciar Servidor (30 seg)

```bash
# Si el servidor está corriendo, detenlo (Ctrl+C)

# Reinicia
npm run dev
```

Espera a que diga: `✓ Ready in X.Xs`

---

## 5️⃣ Probar Integración (2 min)

### A. Conectar

1. Abre: http://localhost:3000
2. Navega a: **WALLest → Organizador → Calendario**
3. Click en el botón **"Conectar Google"** (o icono 🌥️)
4. Se abre ventana de Google → Selecciona tu cuenta
5. Click **"Permitir"**
6. Serás redirigido de vuelta
7. Verás: ✅ "Google Calendar conectado correctamente"

### B. Verificar

El botón Google ahora debería mostrar:
- ✅ Color verde
- ✅ Icono de check

### C. Crear Evento de Prueba

1. Click **"+ Nuevo Evento"**
2. Título: `Prueba Sync Google`
3. Fecha: Mañana a las 10:00
4. Click **"Crear Evento"**

### D. Verificar en Google Calendar

1. Ve a: https://calendar.google.com/
2. Busca el evento `Prueba Sync Google`
3. ✅ Debería aparecer automáticamente

### E. Sincronizar desde Google

1. En el WOS, click en el botón **"Google"**
2. Click **"Sincronizar Ahora"**
3. Verás: "X eventos sincronizados"
4. Los eventos de Google Calendar aparecen con icono 🌥️

---

## ✅ Checklist de Verificación

Marca cada paso completado:

- [ ] Google Calendar API habilitada
- [ ] OAuth consent screen configurado
- [ ] Credenciales OAuth creadas
- [ ] Client ID y Secret copiados
- [ ] Archivo `.env.local` actualizado
- [ ] Script SQL ejecutado en Supabase
- [ ] Tablas `google_calendar_*` creadas
- [ ] Servidor reiniciado
- [ ] Google Calendar conectado en WOS
- [ ] Botón muestra estado "Conectado" (verde)
- [ ] Evento de prueba creado en WOS
- [ ] Evento aparece en Google Calendar
- [ ] Sincronización manual funciona
- [ ] Eventos de Google aparecen en WOS

---

## 🐛 Problemas Comunes

### El botón "Conectar Google" no funciona

**Verifica**:
```bash
# En terminal, busca errores:
# Debería mostrar algo como:
# ✓ Compiled in XXms
```

Si hay errores de TypeScript, es posible que falte una dependencia.

### Error: "redirect_uri_mismatch"

**Solución**:
1. Ve a Google Cloud Console → Credentials
2. Edita tu OAuth client
3. Verifica que en **Authorized redirect URIs** esté:
   ```
   http://localhost:3000/api/google/callback
   ```
   (Sin espacios, sin "/" al final, exactamente así)

### Error: "Failed to exchange code"

**Verifica**:
1. Que `.env.local` tenga los valores correctos
2. Que reiniciaste el servidor después de editar `.env.local`
3. Que el Client Secret no tenga espacios al inicio/final

### Los eventos no se sincronizan

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo
4. Si dice "No valid access token": desconecta y reconecta

---

## 📚 Documentación Completa

Para más detalles, consulta:
- **Guía completa**: `INTEGRACION_GOOGLE_CALENDAR.md`
- **Resumen técnico**: `RESUMEN_INTEGRACION_GOOGLE_CALENDAR.md`

---

## 🎉 ¡Listo!

Si completaste todos los pasos y ✅ todo funciona, la integración está activa.

Ahora puedes:
- ✅ Crear eventos en WOS → Aparecen en Google
- ✅ Editar eventos en WOS → Se actualizan en Google
- ✅ Eliminar eventos en WOS → Se eliminan en Google
- ✅ Sincronizar desde Google → Eventos aparecen en WOS
- ✅ Ver estadísticas de sincronización
- ✅ Todo funciona automáticamente

**¡Disfruta tu calendario sincronizado! 🎊**
