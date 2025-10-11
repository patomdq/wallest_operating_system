# 🚀 Guía de Instalación Rápida - WOS 1.0

## Paso 1: Requisitos Previos

Necesitas tener instalado:
- **Node.js 18+** (descargar desde [nodejs.org](https://nodejs.org))
- Una cuenta gratuita en **Supabase** (crear en [supabase.com](https://supabase.com))

## Paso 2: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto:
   - Nombre: `wallest-os` (o el que prefieras)
   - Base de datos: Genera una contraseña segura
   - Región: Elige la más cercana a ti
3. Espera a que el proyecto se cree (~2 minutos)

## Paso 3: Configurar Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de terminal en el menú lateral)
2. Crea una nueva query
3. Copia TODO el contenido del archivo `scripts/migrations.sql`
4. Pégalo en el editor SQL
5. Haz clic en **Run** (o presiona F5)
6. Verifica que veas el mensaje de éxito

## Paso 4: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia estos dos valores:
   - **Project URL** (ejemplo: https://xxxxx.supabase.co)
   - **anon public** key (la clave larga que empieza con "eyJ...")

## Paso 5: Configurar el Proyecto

1. Abre el proyecto en tu editor de código
2. Copia el archivo `.env.local.example` y renómbralo a `.env.local`
3. Abre `.env.local` y pega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ.................
```

## Paso 6: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (~2-3 minutos).

## Paso 7: Iniciar la Aplicación

### Opción A: Usar el script automático (Windows)
```powershell
.\start.ps1
```

### Opción B: Manualmente
```bash
npm run dev
```

## Paso 8: Abrir en el Navegador

Abre tu navegador y ve a:
```
http://localhost:3000
```

¡Listo! Deberías ver el Dashboard de WOS 1.0.

---

## 🔧 Solución de Problemas

### Error: "Node.js no encontrado"
- Instala Node.js desde [nodejs.org](https://nodejs.org)
- Reinicia tu terminal después de instalar

### Error: "Cannot connect to Supabase"
- Verifica que las credenciales en `.env.local` sean correctas
- Asegúrate de que no haya espacios extra al copiar
- Verifica que el proyecto de Supabase esté activo

### Error: "Table doesn't exist"
- Ve a Supabase SQL Editor
- Ejecuta nuevamente el script `migrations.sql`
- Verifica que no haya errores en la ejecución

### El puerto 3000 está ocupado
```bash
npm run dev -- -p 3001
```
Luego abre: http://localhost:3001

---

## 📱 Próximos Pasos

Una vez que la aplicación esté funcionando:

1. **Crea tu primer inmueble**
   - Ve a Wallest → Activos Inmobiliarios
   - Haz clic en "Nuevo Inmueble"
   - Llena los datos y guarda

2. **Prueba el Simulador de Rentabilidad**
   - Ve a Wallest → Simulador de Rentabilidad
   - Introduce los datos de una inversión
   - Observa cómo se calculan los resultados automáticamente

3. **Explora el CRM de Leads**
   - Ve a Nexo → CRM de Leads
   - Crea algunos leads de prueba
   - Arrastra las tarjetas entre etapas

---

## 🎯 Verificación Rápida

Para verificar que todo funciona correctamente:

✅ El Dashboard principal muestra los KPIs
✅ Puedes crear un inmueble en Activos Inmobiliarios
✅ El Simulador de Rentabilidad calcula el ROI
✅ Los datos se guardan (recarga la página y siguen ahí)

---

## 💡 Consejos

- **Backup**: Supabase hace backups automáticos, pero puedes exportar datos desde el panel
- **Desarrollo**: Los cambios en el código se reflejan automáticamente (hot reload)
- **Producción**: Para desplegar, ejecuta `npm run build` primero

---

¿Necesitas ayuda? Revisa el README.md para más información.
