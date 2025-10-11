# Instrucciones de Despliegue - WOS 1.0 Modificaciones

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:
- ✅ Acceso a tu proyecto de Supabase
- ✅ Backup completo de tu base de datos actual
- ✅ Node.js 18+ instalado
- ✅ Repositorio del proyecto actualizado

---

## 🗄️ Paso 1: Ejecutar Migraciones de Base de Datos

### 1.1. Crear Backup de Seguridad

**IMPORTANTE**: Antes de ejecutar cualquier migración, crea un backup completo.

En Supabase:
1. Ve a **Database** → **Backups**
2. Click en **Create backup**
3. Espera a que se complete

### 1.2. Ejecutar Script de Migraciones

1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor**
3. Abre el archivo `scripts/migrations_v1.0_update.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor de Supabase
6. Click en **Run** (o presiona Ctrl/Cmd + Enter)

### 1.3. Verificar que las Migraciones se Ejecutaron Correctamente

Deberías ver mensajes de éxito como:

```
✅ MIGRACIONES WOS 1.0 COMPLETADAS
✅ Tabla inmuebles: Actualizada con nuevos campos y tipos
✅ Tabla administracion: Campo responsable eliminado
✅ Tabla proveedores: Campo tipo agregado
✅ Tabla comercializacion: Nuevos campos agregados
✅ Tabla reformas: Lógica de avance automático implementada
✅ Vistas KPIs: Creadas
✅ Triggers: Actualizados y optimizados
✅ Sistema listo para usar
```

### 1.4. Verificar Tablas y Campos

Ejecuta estas consultas para verificar:

```sql
-- Verificar campos de inmuebles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inmuebles' 
AND column_name IN ('barrio', 'nota_simple', 'deudas', 'ocupado');

-- Verificar campos de administracion
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'administracion' 
AND column_name IN ('tipo', 'forma_pago');

-- Verificar campo de proveedores
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
AND column_name = 'tipo';

-- Verificar campos de comercializacion
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comercializacion' 
AND column_name IN ('publicado_en_portales', 'portales', 'precio_quiebre', 'precio_minimo_aceptado');

-- Verificar vistas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'view_%';

-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 💻 Paso 2: Actualizar Código Frontend

### 2.1. Obtener el Código Actualizado

Si trabajas con Git:

```bash
# Opción A: Si hiciste commit de los cambios
git pull origin main

# Opción B: Si los archivos están en tu máquina local
# Ya deberían estar actualizados en:
# C:\Users\Flia\Workspace\wallest_operating_system
```

### 2.2. Verificar Archivos Actualizados

Confirma que tienes estos archivos actualizados:

**TypeScript Types:**
- ✅ `lib/supabase.ts`

**Módulos Actualizados:**
- ✅ `app/wallest/activos/page.tsx`
- ✅ `app/wallest/administracion/page.tsx`
- ✅ `app/renova/reformas/page.tsx`
- ✅ `app/renova/planificador/page.tsx`
- ✅ `app/renova/proveedores/page.tsx`
- ✅ `app/nexo/leads/page.tsx`
- ✅ `app/nexo/comercializacion/page.tsx`

### 2.3. Instalar Dependencias (si es necesario)

```bash
cd C:\Users\Flia\Workspace\wallest_operating_system
npm install
```

### 2.4. Compilar y Probar Localmente

```bash
# Compilar TypeScript y verificar errores
npm run build

# Si hay errores, revisar y corregir
# Si no hay errores, continuar con desarrollo
npm run dev
```

---

## 🧪 Paso 3: Testing Local

### 3.1. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre el navegador en: `http://localhost:3000`

### 3.2. Checklist de Testing

#### ✅ Módulo Activos Inmobiliarios
- [ ] Crear nuevo inmueble con tipo "edificio" o "dúplex"
- [ ] Marcar checkboxes: nota_simple, deudas, ocupado
- [ ] Agregar valor en campo "barrio"
- [ ] Verificar que se guarda correctamente
- [ ] Editar inmueble existente

#### ✅ Módulo Administración
- [ ] Crear nuevo registro de administración
- [ ] Seleccionar categoría del listado predefinido
- [ ] Escribir categoría personalizada
- [ ] Seleccionar tipo: Ingreso o Gasto
- [ ] Verificar que campo "responsable" no existe
- [ ] Ver tabla con colores según tipo

#### ✅ Módulo Reformas
- [ ] Crear nueva reforma
- [ ] Verificar que presupuesto_total empieza en 0
- [ ] Verificar que avance empieza en 0%
- [ ] Ver barra de progreso
- [ ] Click en "Gestionar Partidas"

#### ✅ Módulo Planificador
- [ ] Seleccionar una reforma
- [ ] Ver información de reforma (presupuesto, avance, estado)
- [ ] Crear nueva partida con costo
- [ ] Verificar que presupuesto_total de reforma se actualiza automáticamente
- [ ] Cambiar estado de partida a "Finalizado"
- [ ] Verificar que avance se actualiza automáticamente
- [ ] Crear más partidas y marcar como finalizadas
- [ ] Verificar que cuando todas están finalizadas, reforma se marca como "finalizada"

#### ✅ Módulo Proveedores
- [ ] Crear proveedor con tipo "Activo"
- [ ] Crear proveedor con tipo "Pasivo"
- [ ] Usar filtros para ver solo activos
- [ ] Usar filtros para ver solo pasivos
- [ ] Ver estadísticas actualizadas

#### ✅ Módulo CRM Leads
- [ ] Crear nuevo lead
- [ ] Click en botón de edición (✎)
- [ ] Editar datos del lead
- [ ] Guardar cambios
- [ ] Mover lead entre estados (Nuevo → Contactado → Oferta → Cerrado)
- [ ] Verificar estadísticas en cada fase

#### ✅ Módulo Comercialización
- [ ] Crear nueva comercialización
- [ ] Marcar checkbox "Publicado en Portales"
- [ ] Agregar lista de portales
- [ ] Agregar precio quiebre
- [ ] Agregar precio mínimo aceptado
- [ ] Verificar que aparece icono de Globe
- [ ] Ver todos los campos en la tabla

### 3.3. Testing de Automatizaciones

**Flujo Completo: Activo → Reforma → Comercialización**

1. Crear un nuevo inmueble con estado "EN_ESTUDIO"
2. Cambiar estado a "COMPRADO"
3. Verificar que:
   - Se crea automáticamente una reforma en módulo Reformas
   - Estado del inmueble cambia a "en_reforma"
4. Ir a Planificador y agregar partidas a esa reforma
5. Marcar todas las partidas como "Finalizado"
6. Verificar que:
   - Reforma se marca automáticamente como "finalizada"
   - Se crea registro automático en Comercialización
   - Estado del inmueble cambia a "en_venta"

---

## 🚀 Paso 4: Despliegue a Producción

### 4.1. Commit de Cambios (si usas Git)

```bash
git add .
git commit -m "feat: WOS 1.0 - Implementar modificaciones técnicas

- Actualizar tablas BD con nuevos campos
- Crear vistas para KPIs automáticos
- Implementar triggers para cálculos automáticos
- Actualizar 7 módulos del frontend
- Agregar funcionalidad de edición en CRM Leads
- Mejorar UX con estadísticas y filtros"

git push origin main
```

### 4.2. Desplegar en Vercel (o tu plataforma)

**Si usas Vercel con auto-deploy:**
- El push a main desplegará automáticamente

**Si despliegas manualmente:**

```bash
npm run build
vercel --prod
```

### 4.3. Verificar Variables de Entorno

En tu plataforma de hosting, confirma que tienes:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

### 4.4. Testing en Producción

Repite el checklist de testing del Paso 3.2 en tu URL de producción.

---

## 📝 Paso 5: Documentación y Capacitación

### 5.1. Actualizar README

El README ya incluye las nuevas funcionalidades, pero puedes agregar notas específicas para tu equipo.

### 5.2. Crear Guía de Usuario (Opcional)

Documenta las nuevas funcionalidades para los usuarios:

**Novedades en Activos Inmobiliarios:**
- Nuevos tipos de inmuebles disponibles
- Campos adicionales para control administrativo
- Campo de barrio para mejor segmentación

**Novedades en Administración:**
- Categorías personalizables
- Distinción entre ingresos y gastos
- Campo de forma de pago

**Novedades en Reformas:**
- Cálculo automático de presupuesto
- Avance calculado por partidas finalizadas
- Automatización completa del flujo

**Novedades en CRM:**
- Edición de leads desde el Kanban
- Estadísticas por fase

**Novedades en Comercialización:**
- Gestión de portales inmobiliarios
- Estrategia de precios (quiebre y mínimo)

---

## 🔧 Troubleshooting

### Error: "column does not exist"

**Solución**: Las migraciones no se ejecutaron correctamente.
- Vuelve a ejecutar `scripts/migrations_v1.0_update.sql`
- Verifica que no haya errores en el SQL Editor

### Error: "trigger does not exist"

**Solución**: Los triggers no se crearon.
- Verifica que los triggers se crearon: `SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';`
- Re-ejecuta la sección de triggers del script de migraciones

### Error: TypeScript - "Property does not exist on type"

**Solución**: Los tipos no están sincronizados.
- Verifica que `lib/supabase.ts` está actualizado
- Ejecuta `npm run build` para verificar errores
- Reinicia el servidor de desarrollo

### Presupuesto/Avance no se actualiza automáticamente

**Solución**: Los triggers no están funcionando.
- Verifica en Supabase SQL Editor:
  ```sql
  SELECT * FROM information_schema.triggers 
  WHERE event_object_table IN ('reformas', 'planificacion_reforma');
  ```
- Si no aparecen, re-ejecuta la sección de triggers del script

### Campos nuevos no aparecen en formularios

**Solución**: Caché del navegador.
- Hacer hard refresh: Ctrl + Shift + R (Windows) o Cmd + Shift + R (Mac)
- Limpiar caché del navegador
- Probar en modo incógnito

---

## ✅ Checklist Final de Despliegue

- [ ] Backup de base de datos creado
- [ ] Migraciones SQL ejecutadas correctamente
- [ ] Vistas SQL creadas
- [ ] Triggers SQL creados y funcionando
- [ ] Código frontend actualizado
- [ ] Dependencias instaladas
- [ ] Build exitoso sin errores
- [ ] Testing local completado (todos los módulos)
- [ ] Testing de automatizaciones completado
- [ ] Cambios committeados (si aplica)
- [ ] Desplegado a producción
- [ ] Variables de entorno verificadas
- [ ] Testing en producción completado
- [ ] Documentación actualizada
- [ ] Equipo notificado de nuevas funcionalidades

---

## 📞 Soporte

Si encuentras algún problema durante el despliegue:

1. Revisa esta guía completa
2. Verifica los logs de Supabase para errores de BD
3. Verifica los logs del navegador (F12 → Console) para errores de frontend
4. Consulta el archivo `RESUMEN_CAMBIOS.md` para detalles técnicos

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema WOS 1.0 estará completamente actualizado con todas las modificaciones técnicas implementadas.

**Cambios Principales Implementados:**
- ✅ 6 tablas de BD actualizadas
- ✅ 3 vistas para KPIs automáticos
- ✅ 4 triggers para automatizaciones
- ✅ 7 módulos frontend mejorados
- ✅ Cálculos automáticos de presupuestos y avances
- ✅ Edición de leads en CRM
- ✅ Gestión avanzada de comercialización

**Próximos Pasos Recomendados:**
- Monitorear uso de las nuevas funcionalidades
- Recopilar feedback del equipo
- Planificar mejoras adicionales según necesidades
