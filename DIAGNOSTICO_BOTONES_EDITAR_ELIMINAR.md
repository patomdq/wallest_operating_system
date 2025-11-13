# 🔍 Diagnóstico: Botones Editar y Eliminar

**Fecha**: 13 de noviembre de 2025
**Problema Reportado**: Botones de editar (lápiz) y eliminar (tacho) no funcionan en algunos módulos

---

## 📋 Módulos Afectados

### 1. ❌ Activos Inmobiliarios
- **Problema**: No permite eliminar un inmueble
- **Archivo**: `/app/wallest/activos/page.tsx`
- **Función**: `handleDelete` (línea 166)
- **Botón**: Trash2 icon (línea 477)

### 2. ❌ Administración
- **Problema**: No permite editar movimientos al hacer click en el icono de editar
- **Archivo**: `/app/wallest/administracion/page.tsx`
- **Función**: `handleEdit` (línea 386)
- **Botón**: Edit2 icon (línea 790)

---

## 🔍 Análisis del Código Fuente

### Activos Inmobiliarios - handleDelete

**Estado actual del código**:
```typescript
const handleDelete = async (id: string) => {
  const inmueble = inmuebles.find(i => i.id === id);
  if (!inmueble) return;

  const confirmMessage = `¿Está seguro de que desea eliminar el inmueble "${inmueble.nombre}"?...`;
  if (!confirm(confirmMessage)) return;

  try {
    // Código de eliminación en cascada...
  } catch (error) {
    console.error('Error durante la eliminación:', error);
    alert(`❌ Error al eliminar el inmueble: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};
```

**Botón en JSX**:
```jsx
<button
  onClick={() => handleDelete(i.id)}
  className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
  title="Eliminar"
>
  <Trash2 size={18} className="text-red-500" />
</button>
```

**Observación**: El código se ve correcto sintácticamente.

### Administración - handleEdit

**Estado actual del código**:
```typescript
const handleEdit = (movimiento: MovimientoEmpresa) => {
  setFormData({
    fecha: movimiento.fecha,
    tipo: movimiento.tipo,
    categoria: movimiento.categoria,
    concepto: movimiento.concepto,
    monto: movimiento.monto.toString(),
    cuenta: movimiento.cuenta,
    forma_pago: movimiento.forma_pago,
    proyecto_id: movimiento.proyecto_id || '',
    proveedor: movimiento.proveedor || '',
    observaciones: movimiento.observaciones || ''
  });
  setEditingId(movimiento.id);
  setShowForm(true);
};
```

**Botón en JSX**:
```jsx
<button
  onClick={() => handleEdit(mov)}
  className="text-wos-accent hover:opacity-80"
  title="Editar"
>
  <Edit2 size={16} />
</button>
```

**Observación**: El código también se ve correcto.

---

## 🐛 Posibles Causas del Problema

### 1. Error de JavaScript en Tiempo de Ejecución
- **Síntoma**: El botón no responde al click
- **Causa**: Excepción no capturada que detiene la ejecución
- **Dónde verificar**: Consola del navegador (F12 → Console)

### 2. Problemas de Base de Datos
- **Síntoma**: Confirmación aparece pero falla al ejecutar
- **Causa**: Restricciones de Foreign Key o permisos RLS
- **Dónde verificar**: Network tab en DevTools + Respuesta de Supabase

### 3. Estado de React Bloqueado
- **Síntoma**: Click no tiene efecto visible
- **Causa**: Estado loading=true o disabled implícito
- **Dónde verificar**: React DevTools → State

### 4. Event Bubbling/Propagation
- **Síntoma**: Click en botón trigger a otro elemento
- **Causa**: Falta `e.stopPropagation()` o conflicto con row onClick
- **Dónde verificar**: Revisar si hay onClick en `<tr>` o parent elements

---

## 🔧 Soluciones Propuestas

### Solución 1: Agregar stopPropagation

Modificar botones para prevenir event bubbling:

**En Activos Inmobiliarios**:
```typescript
<button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(i.id);
  }}
  className="p-2 hover:bg-red-500/20 rounded-lg transition-smooth"
  title="Eliminar"
>
  <Trash2 size={18} className="text-red-500" />
</button>
```

**En Administración**:
```typescript
<button
  onClick={(e) => {
    e.stopPropagation();
    handleEdit(mov);
  }}
  className="text-wos-accent hover:opacity-80"
  title="Editar"
>
  <Edit2 size={16} />
</button>
```

### Solución 2: Agregar Logging Detallado

Agregar console.log para diagnóstico:

```typescript
const handleDelete = async (id: string) => {
  console.log('🔴 handleDelete llamado con id:', id);
  
  const inmueble = inmuebles.find(i => i.id === id);
  console.log('📍 Inmueble encontrado:', inmueble);
  
  if (!inmueble) {
    console.log('⚠️ Inmueble no encontrado, abortando');
    return;
  }
  
  // ... resto del código
};
```

### Solución 3: Verificar Permisos RLS en Supabase

Verificar políticas de seguridad:

```sql
-- Ver políticas de inmuebles
SELECT * FROM pg_policies WHERE tablename = 'inmuebles';

-- Ver políticas de movimientos_empresa
SELECT * FROM pg_policies WHERE tablename = 'movimientos_empresa';
```

### Solución 4: Agregar Estado de Carga

Prevenir clicks múltiples:

```typescript
const [deleting, setDeleting] = useState<string | null>(null);

const handleDelete = async (id: string) => {
  if (deleting) return; // Prevenir clicks múltiples
  
  setDeleting(id);
  try {
    // ... código de eliminación
  } finally {
    setDeleting(null);
  }
};

// En el botón:
<button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(i.id);
  }}
  disabled={deleting === i.id}
  className={`p-2 hover:bg-red-500/20 rounded-lg transition-smooth ${
    deleting === i.id ? 'opacity-50 cursor-not-allowed' : ''
  }`}
  title="Eliminar"
>
  <Trash2 size={18} className="text-red-500" />
</button>
```

---

## 📝 Plan de Acción

### Paso 1: Diagnóstico
1. Abrir el navegador en modo desarrollador (F12)
2. Navegar a cada módulo afectado
3. Intentar usar los botones problemáticos
4. Revisar:
   - Console: Buscar errores JavaScript
   - Network: Buscar requests fallidos a Supabase
   - React DevTools: Verificar estado de componentes

### Paso 2: Aplicar Soluciones
1. Implementar solución 1 (stopPropagation) en todos los botones
2. Implementar solución 2 (logging) temporalmente
3. Verificar permisos RLS (solución 3)
4. Implementar solución 4 (estado de carga) si es necesario

### Paso 3: Testing
1. Probar cada botón en cada módulo
2. Verificar que no hay regresiones
3. Eliminar console.logs una vez confirmado que funciona

---

## 📊 Checklist de Módulos

| Módulo | Botón Editar | Botón Eliminar | Estado |
|--------|--------------|----------------|--------|
| Activos Inmobiliarios | - | ❌ No funciona | Pendiente |
| Administración | ❌ No funciona | - | Pendiente |
| Reformas (Renova) | ? | ? | Por verificar |
| Materiales (Renova) | - | ? | Por verificar |
| Transacciones (Nexo) | - | ? | Por verificar |
| Macroproyectos | - | ? | Por verificar |
| Organizador - Tareas | - | ? | Por verificar |
| Organizador - Calendario | - | ? | Por verificar |
| Calculadora Rentabilidad | ? | - | Por verificar |

---

## 🎯 Objetivo

**Todos los botones de editar y eliminar deben funcionar correctamente en todos los módulos del sistema.**

---

**Próximos Pasos**: Aplicar las soluciones propuestas y verificar resultados.
