# WOS 1.0 - Wallest Operating System

Sistema operativo integral para gestión inmobiliaria con áreas de Inversión (Wallest), Reformas (Renova) y Comercialización (Nexo).

## 🚀 Características Principales

### Dashboard General
- KPIs globales en tiempo real
- Gráficos comparativos de ingresos vs gastos
- Seguimiento de activos por estado
- Accesos rápidos a funciones principales

### WALLest - Gestión de Inversiones
- **Activos Inmobiliarios**: Alta y gestión completa de propiedades
- **Finanzas**: Control de ingresos y gastos
- **Administración**: Gestión administrativa
- **Recursos Humanos**: Control del equipo
- **Simulador de Rentabilidad**: Cálculo de ROI con formato horizontal
- **Gestor de Macroproyectos**: Planificación de grandes proyectos
- **Documentos**: Integración con Google Drive

### RENOVA - Gestión de Reformas
- **Reformas**: Seguimiento de obras activas
- **Planificador**: Gestión detallada de partidas por reforma
- **Proveedores**: Base de datos de contratistas
- **Stock/Materiales**: Control de inventario con alertas de stock bajo

### NEXO - Comercialización y Ventas
- **CRM de Leads**: Pipeline visual con tarjetas arrastrables
- **Comercialización**: Propiedades en venta
- **Transacciones**: Historial de ventas cerradas
- **Contratos**: En desarrollo

## 🔧 Requisitos Previos

- Node.js 18+ o superior
- Cuenta de Supabase (gratuita)

## 📦 Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

   a. Crear un proyecto en [supabase.com](https://supabase.com)
   
   b. Copiar `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   
   c. Editar `.env.local` con tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Configurar Base de Datos**

   Ir a tu proyecto de Supabase → SQL Editor y ejecutar el contenido del archivo:
   ```
   scripts/migrations.sql
   ```

   Esto creará todas las tablas necesarias con sus relaciones y triggers automáticos.

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

- **inmuebles**: Propiedades inmobiliarias
- **finanzas**: Movimientos financieros
- **administracion**: Gestión administrativa
- **rrhh**: Recursos humanos
- **simulaciones_rentabilidad**: Cálculos de ROI guardados
- **macroproyectos**: Grandes proyectos
- **reformas**: Obras y reformas (con relación a inmuebles)
- **planificacion_reforma**: Partidas detalladas de reformas
- **proveedores**: Contratistas y proveedores
- **materiales**: Inventario de materiales
- **leads**: Prospectos de clientes
- **comercializacion**: Propiedades en venta
- **transacciones**: Ventas cerradas

### Automatizaciones

- ✅ Cuando un inmueble pasa a estado "COMPRADO" → Se crea automáticamente en Reformas
- ✅ Cuando una reforma se marca "FINALIZADA" → Se activa automáticamente en Comercialización
- ✅ Todas las actualizaciones se reflejan en el Dashboard

## 🎨 Diseño

- Minimalista y profesional
- Paleta de colores: Negro, blanco y gris
- Sidebar fijo con menús desplegables
- Interfaz fluida y limpia
- Responsive (adaptable a móviles)

## 📊 Características Especiales

### Simulador de Rentabilidad
- Formato horizontal con bloque superior de inputs
- Resultados en matriz 3x3
- Colores según ROI: <10% rojo, 10-25% amarillo, >25% verde
- Guardar simulaciones con nombre personalizado
- Exportar a CSV

### CRM Visual
- Pipeline de leads con tarjetas
- Mover leads entre etapas fácilmente
- Estados: nuevo → contactado → oferta → cerrado

### Alertas de Stock
- Materiales con stock < mínimo se marcan en rojo
- Alerta visual en dashboard

## 🔒 Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Políticas básicas de acceso configuradas

## 🚀 Despliegue en Producción

### Vercel (Recomendado)
```bash
npm run build
```

Conectar el repositorio a Vercel y configurar las variables de entorno.

### Otros Proveedores
El proyecto es compatible con cualquier hosting que soporte Next.js 14+.

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo local
- `npm run build` - Build de producción
- `npm start` - Ejecutar build de producción
- `npm run lint` - Linter
- `npm run supabase:migrate` - Ver instrucciones de migración

## 🤝 Soporte

Para problemas o preguntas, revisar la documentación de:
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licencia

Propietario - Todos los derechos reservados

---

**WOS 1.0** - Sistema operativo para gestión inmobiliaria profesional
