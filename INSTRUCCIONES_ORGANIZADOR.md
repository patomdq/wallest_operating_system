# Módulo Organizador - Instrucciones de Instalación

## 1. Crear las Tablas en Supabase

Para que el módulo Organizador funcione correctamente, debes ejecutar el script SQL en tu base de datos de Supabase:

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Crea una nueva consulta (New Query)
4. Copia el contenido del archivo `scripts/create_organizador_tables.sql`
5. Pégalo en el editor SQL
6. Haz clic en **Run** para ejecutar el script

Esto creará las siguientes tablas:
- `eventos_globales` - Para el calendario
- `tareas_globales` - Para el tablero de tareas

También creará índices y triggers para optimizar el rendimiento y actualizar automáticamente las fechas de modificación.

## 2. Verificar la Instalación

Una vez ejecutado el script SQL, el módulo Organizador estará completamente funcional.

Puedes acceder a él desde el menú lateral de WALLest > Organizador, o directamente en la URL:
```
/wallest/organizador
```

## 3. Características del Módulo

### Pestaña Calendario
- Vista mensual, semanal y diaria
- Crear, editar y eliminar eventos
- Vincular eventos con proyectos/reformas existentes
- **Sistema de recordatorios completo:**
  - Notificaciones del navegador (requiere permiso)
  - Alertas visuales en pantalla
  - Alertas sonoras
  - Verificación automática cada 30 segundos
  - Alerta 5 minutos antes del evento
- Navegación intuitiva entre fechas
- **Zona horaria local:** Todos los eventos se guardan y muestran en tu hora local

### Pestaña Tareas
- Tablero Kanban con tres columnas: Pendientes, En curso y Completadas
- Arrastrar y soltar tareas entre columnas
- Prioridades: Alta, Media, Baja
- Filtros por prioridad y fecha límite
- Alertas visuales para tareas vencidas
- Fechas próximas destacadas (7 días)

## 4. Estructura de Archivos Creados

```
app/wallest/organizador/
├── page.tsx                          # Página principal con tabs
└── components/
    ├── CalendarioTab.tsx             # Componente del calendario
    └── TareasTab.tsx                 # Componente del tablero de tareas

components/
└── Sidebar.tsx                       # Actualizado con el nuevo módulo

lib/
└── supabase.ts                       # Actualizado con tipos EventoGlobal y TareaGlobal

scripts/
└── create_organizador_tables.sql    # Script SQL para crear las tablas
```

## 5. Próximas Mejoras (Opcionales)

El módulo está preparado para futuras integraciones:
- Sincronización con Google Calendar
- Notificaciones por email o push
- Asignación de tareas a usuarios específicos
- Etiquetas y categorías personalizadas
- Vista de timeline/cronograma

## Soporte

Si tienes algún problema con la instalación o el funcionamiento del módulo, verifica:
1. Que el script SQL se ejecutó correctamente
2. Que las variables de entorno de Supabase están configuradas en `.env.local`
3. Que la tabla `reformas` existe (necesaria para la vinculación de eventos)
