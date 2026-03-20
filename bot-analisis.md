# Análisis del sistema de chat WOS
*Generado: 2026-03-20*

## Archivos clave
- `app/api/chat/route.ts` — Backend: Anthropic API + queries Supabase + ejecución de acciones (595 líneas)
- `components/WOSChat.tsx` — Frontend: widget flotante React (193 líneas)
- `lib/supabase.ts` — Tipos TypeScript y cliente Supabase

---

## Qué puede hacer hoy

### LECTURA (automática al detectar keywords)
El bot consulta datos de Supabase y los inyecta en el prompt como bloque `=== DATOS HASU ===` antes de responder.

### ESCRITURA — 22 acciones ejecutables
El bot responde con JSON → el backend lo detecta y ejecuta la acción en Supabase.

| Dominio | Acciones |
|---|---|
| Finanzas | `insert_movimiento` |
| Reformas | `update_partida_estado`, `update_item` |
| Tareas | `insert_tarea`, `update_tarea_estado`, `update_tarea` |
| Eventos | `insert_evento`, `update_evento`, `delete_evento` |
| Proveedores | `insert_proveedor`, `update_proveedor`, `delete_proveedor` |
| Materiales | `insert_material`, `update_material`, `delete_material` |
| Leads/CRM | `insert_lead`, `update_lead`, `delete_lead` |
| Comercialización | `insert_comercializacion`, `update_comercializacion` |
| Transacciones | `insert_transaccion` |
| Calculadora | `insert_simulacion` |

**No puede eliminar:** movimientos, reformas, inmuebles, tareas.

---

## Tablas de Supabase que usa

| Tabla | Para qué |
|---|---|
| `movimientos_empresa` | Finanzas: últimos 50 registros |
| `saldo_actual` | Vista con saldo total global |
| `inmuebles` | Listado de propiedades |
| `reformas` | Proyectos de reforma |
| `partidas_reforma_detalladas` | Partidas por reforma |
| `items_partida_reforma` | Items del planificador |
| `finanzas_proyecto` | Finanzas vinculadas a reforma |
| `eventos_globales` | Calendario (próximos 50) |
| `tareas_globales` | Tareas/kanban |
| `leads` | CRM pipeline |
| `proveedores` | Base de proveedores |
| `stock_materiales` | Inventario |
| `comercializacion` | Propiedades en venta |
| `transacciones` | Ventas cerradas |
| `proyectos_rentabilidad` | Simulaciones de calculadora |

---

## Keywords que activan contexto

Función `needsContext()` en `route.ts` — búsqueda case-insensitive. Cualquier coincidencia carga contexto de Supabase.

**Financiero:** saldo, dinero, caja, banco, plata, movimiento, ingreso, egreso, total, cuanto, balance, finanza, resumen, situación

**Inmuebles:** inmueble, piso, propiedad, olula, zurgena, cuevas, activo

**Reformas:** reforma, obra, presupuesto, gasto, pago, costo, partida, electricidad, fontanería, carpintería, pintura, albañilería, cerrajería, iluminación, suelo, puerta, ventana, cocina, baño, mobiliario, textil, limpieza, item, cuadro, cableado

**Calendario:** evento, reunión, visita, cita, agenda, calendario, hoy, mañana, ayer, semana, fecha, cuando

**Acciones:** registra, anota, añade, carga, apunta, actualiza, cambia, marca

**Comercial:** lead, cliente, comprador, venta, comercial, operación, proyecto, rentabilidad, beneficio, ganancia

**Otros:** empresa, hasu, wallest, proveedor, hassan, material

---

## Qué le falta para responder saldo por cuenta bancaria

### El problema
Dos limitaciones combinadas:
1. `saldo_actual` es una view con **un único número global** — no desglosa por cuenta bancaria.
2. Solo se cargan los **últimos 50 movimientos**, y el system prompt prohíbe calcular saldos manualmente ("El saldo real está en SALDO_ACTUAL, NUNCA calcularlo").

Si hay más de 50 movimientos (probable), sumar solo los últimos 50 daría un resultado incorrecto. Y `saldo_actual` no tiene el desglose por cuenta.

### Solución recomendada

**Paso 1 — Crear view en Supabase:**
```sql
CREATE VIEW saldo_por_cuenta AS
SELECT cuenta, SUM(monto) AS saldo
FROM movimientos_empresa
GROUP BY cuenta
ORDER BY cuenta;
```

**Paso 2 — Tres cambios en `route.ts`:**

1. Agregar query a `saldo_por_cuenta` dentro de `getContext()` en el bloque financiero:
```typescript
const { data: saldoCuenta } = await supabase.from('saldo_por_cuenta').select('*');
```

2. Agregar al template del bloque de contexto:
```
SALDO_POR_CUENTA: ${JSON.stringify(saldoCuenta)}
```

3. Agregar al `SYSTEM_PROMPT`:
```
El saldo desglosado por cuenta bancaria está en SALDO_POR_CUENTA. Úsalo cuando pregunten por una cuenta específica o por todas las cuentas.
```
