# Cambios: Tipo de Inmueble y URL - Calculadora de Rentabilidad

## Fecha: 2025-10-20

## Cambios Implementados

### 1. Campo "Tipo de Inmueble"

**Ubicación**: En la sección de Datos del Proyecto, después del campo "Provincia" y antes de "Estado"

**Características**:
- ✅ Dropdown/Select con las siguientes opciones:
  - Piso
  - Casa
  - Local
  - Terreno
  - Oficina
  - Edificio
  - Trastero
  - Chalet
  - Adosado
  - Dúplex
  - Garaje
  - Nave
- ✅ Mismo estilo visual que otros campos
- ✅ Se guarda en base de datos
- ✅ Se carga al editar proyecto
- ✅ Se limpia al crear nuevo proyecto

### 2. Campo "URL"

**Ubicación**: Al final de la sección "Gastos de la Operación", justo ENCIMA del campo "Observaciones"

**Características**:
- ✅ Input tipo URL
- ✅ Placeholder con ejemplos: Drive, Dropbox
- ✅ Permite pegar links externos
- ✅ Mismo estilo visual que otros campos
- ✅ Se guarda en base de datos
- ✅ Se carga al editar proyecto
- ✅ Se limpia al crear nuevo proyecto

### 3. Estructura Mantenida

- ✅ No se alteró el diseño general
- ✅ No se afectaron los cálculos
- ✅ Consistencia visual con el resto del sistema

## Archivos Modificados

### `/app/wallest/calculadora/page.tsx`

**Estados agregados**:
```typescript
const [tipoInmueble, setTipoInmueble] = useState('');
const [url, setUrl] = useState('');
```

**Funciones actualizadas**:
- `handleGuardarProyecto`: Incluye tipo_inmueble y url
- `handleEditarProyecto`: Carga tipo_inmueble y url
- `limpiarFormulario`: Limpia tipo_inmueble y url

### `/lib/supabase.ts`

**Tipo actualizado**:
```typescript
export type ProyectoRentabilidad = {
  // ... campos existentes
  tipo_inmueble?: string;
  url?: string;
  observaciones?: string;
  // ...
};
```

## Script SQL

### Archivo: `/scripts/agregar_tipo_inmueble_url.sql`

```sql
-- Agregar columna tipo_inmueble
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS tipo_inmueble TEXT;

-- Agregar columna url
ALTER TABLE proyectos_rentabilidad 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN proyectos_rentabilidad.tipo_inmueble IS 'Tipo de inmueble: Piso, Casa, Local, Terreno, Oficina, Edificio, Trastero, Chalet, Adosado, Dúplex, Garaje, Nave';
COMMENT ON COLUMN proyectos_rentabilidad.url IS 'URL a documentos externos (Drive, Dropbox, etc.)';
```

## Instrucciones de Activación

### 1. Ejecutar Script SQL en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Abre **SQL Editor**
3. Copia el contenido del archivo `scripts/agregar_tipo_inmueble_url.sql`
4. Pega en el editor
5. Haz clic en **Run** o **Ejecutar**

### 2. Reiniciar Servidor de Desarrollo

```bash
# Detener servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

### 3. Verificar Funcionamiento

1. Abre la Calculadora de Rentabilidad
2. Verifica que aparece el campo "Tipo de Inmueble" después de Provincia
3. Verifica que aparece el campo "URL" antes de Observaciones
4. Crea un proyecto de prueba con ambos campos
5. Guarda y verifica en Supabase que se guardaron
6. Edita el proyecto y verifica que los campos se cargan correctamente

## Orden de Campos Resultante

**Sección: Datos del Proyecto**
1. Nombre del proyecto *
2. Dirección
3. Barrio
4. Ciudad
5. Provincia
6. **Tipo de Inmueble** ← NUEVO
7. Estado
8. Duración de la operación (meses)
9. Calificación

**Sección: Gastos de la Operación (al final)**
- [Tabla de gastos]
- **URL** ← NUEVO
- Observaciones

## Resultado Visual

Los campos mantienen la consistencia visual:
- Color de fondo: `bg-wos-bg`
- Borde: `border-wos-border`
- Texto: `text-wos-accent`
- Focus: `focus:ring-2 focus:ring-wos-primary`
- Padding: `px-4 py-2`
- Border radius: `rounded-lg`
