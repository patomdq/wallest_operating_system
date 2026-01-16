# 🔍 Diagnóstico Google Calendar OAuth - WOS

## ✅ Cambios implementados

### 1️⃣ Logging detallado agregado

Se agregó logging completo en:
- `lib/googleCalendar.ts` → función `exchangeCodeForTokens()`
- `app/api/google/callback/route.ts` → endpoint GET

**Qué se loguea ahora:**
- ✅ Verificación de que `client_id`, `client_secret` y `redirect_uri` NO son undefined
- ✅ El `redirect_uri` EXACTO que se envía a Google
- ✅ Status code de la respuesta de Google
- ✅ `error` y `error_description` completos del body de Google
- ✅ Stack trace completo en caso de error

### 2️⃣ Variables de entorno corregidas

**Origen de las variables:**

```typescript
// En producción (Vercel):
// Se leen del Dashboard de Vercel → Settings → Environment Variables

// En desarrollo local:
// Se leen del archivo .env.local

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;      // ✅ Público (OK)
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;          // ✅ Privado (CORRECTO)
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;                   // ✅ Explícito
```

**⚠️ CAMBIO CRÍTICO:**
- `GOOGLE_CLIENT_SECRET` ya NO usa `NEXT_PUBLIC_` (por seguridad)
- Esto significa que SOLO está disponible en el servidor (API routes)
- **Nunca** se expone al navegador

### 3️⃣ Redirect URI explícito

El `redirect_uri` ahora se define explícitamente:

```typescript
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
  'https://wallest-operating-system.vercel.app/api/google/callback';
```

**En producción DEBE ser exactamente:**
```
https://wallest-operating-system.vercel.app/api/google/callback
```

### 4️⃣ Verificación de credenciales

Se agregó validación para evitar enviar requests con variables undefined:

```typescript
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
  console.error('❌ Variables de entorno faltantes');
  throw new Error('Missing required environment variables');
}
```

---

## 📋 Checklist de verificación

### En Vercel (Producción)

1. **Ve a:** https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables

2. **Verifica que existan estas 3 variables:**

   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID = xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = xxx
   GOOGLE_REDIRECT_URI = https://wallest-operating-system.vercel.app/api/google/callback
   ```

3. **Verifica que el `GOOGLE_CLIENT_ID` corresponda al `GOOGLE_CLIENT_SECRET`:**
   - En Google Cloud Console → APIs & Services → Credentials
   - Encuentra el OAuth 2.0 Client ID que corresponde al `GOOGLE_CLIENT_ID`
   - Copia el Client Secret de ESE MISMO Client ID
   - Si hay múltiples OAuth Clients, asegúrate de usar el par correcto

4. **Verifica los Authorized Redirect URIs en Google Console:**
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Haz clic en tu OAuth 2.0 Client ID
   - En "Authorized redirect URIs" debe estar EXACTAMENTE:
     ```
     https://wallest-operating-system.vercel.app/api/google/callback
     ```
   - ⚠️ Sin espacios, sin barra final, exactamente igual

### En desarrollo local

1. **Verifica tu archivo `.env.local`:**

   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
   ```

2. **En Google Console, agrega también el redirect de localhost:**
   ```
   http://localhost:3000/api/google/callback
   ```

---

## 🔬 Cómo diagnosticar

### Paso 1: Revisar logs de Vercel

1. Ve a: https://vercel.com/dashboard → Tu proyecto → Logs
2. Haz clic en "Functions" para ver logs de API routes
3. Intenta conectar Google Calendar desde la app
4. Busca los logs que empiezan con:
   - `🔐 [OAuth Exchange]`
   - `🔄 [Callback]`
   - `❌` (errores)

### Paso 2: Verificar qué se está enviando

Los logs mostrarán:

```
🔐 [OAuth Exchange] Variables de entorno:
  - GOOGLE_CLIENT_ID: 123456789-abc...
  - GOOGLE_CLIENT_SECRET: ✓ Definido
  - REDIRECT_URI: https://wallest-operating-system.vercel.app/api/google/callback
```

### Paso 3: Si falla, verás el error de Google

```
❌ [OAuth Exchange] Error de Google:
  - Status: 400
  - Error: redirect_uri_mismatch
  - Error Description: The redirect URI in the request does not match...
```

---

## 🛠️ Soluciones a errores comunes

### Error: `redirect_uri_mismatch`

**Causa:** El redirect_uri enviado NO coincide con el configurado en Google Console

**Solución:**
1. Verifica en los logs cuál es el `REDIRECT_URI` que se está enviando
2. Ve a Google Console y asegúrate de que ESE EXACTO URI esté en la lista
3. Guarda cambios en Google Console
4. Espera 5 minutos para que se propaguen
5. Vuelve a intentar

### Error: `invalid_client`

**Causa:** El `client_id` y `client_secret` no coinciden (son de diferentes OAuth Clients)

**Solución:**
1. Ve a Google Console → Credentials
2. Identifica cuál OAuth 2.0 Client estás usando
3. Copia AMBOS valores del MISMO client:
   - Client ID
   - Client Secret
4. Actualiza las variables en Vercel
5. Redeploy la app

### Error: `Missing required environment variables`

**Causa:** Alguna variable está undefined en producción

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que TODAS las variables estén definidas
3. Si falta alguna, agrégala
4. **IMPORTANTE:** Después de agregar variables, debes hacer un **Redeploy**
5. Ve a Deployments → Redeploy

---

## 🎯 Próximos pasos

1. **Hacer redeploy en Vercel** (para que tome los cambios de código)
2. **Verificar las variables de entorno** en Vercel dashboard
3. **Intentar conectar Google Calendar** desde la app
4. **Revisar los logs de Vercel** para ver los mensajes detallados
5. **Reportar** los logs exactos que aparecen

---

## 📞 Información para debugging

Cuando reports el error, incluye:

1. **Los logs completos** que aparecen en Vercel (Functions logs)
2. **Confirmar:**
   - ¿El `REDIRECT_URI` coincide con Google Console?
   - ¿El `client_id` y `client_secret` son del mismo OAuth Client?
   - ¿Las variables están definidas en Vercel?
3. **Screenshot** de la configuración en Google Console (Authorized redirect URIs)

---

**Última actualización:** 27 de diciembre de 2025
