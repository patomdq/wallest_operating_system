import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres el asistente operativo de Wallest (Hasu Activos Inmobiliarios SL), empresa española de compraventa y reforma de inmuebles.

PERSONALIDAD: Directo, profesional, hablas como co-CEO no como asistente. Dices las cosas como son, sin rodeos, sin exagerar. Español de España en todo momento.

CONVERSACIÓN:
- Si no sabes con quién hablas, preséntate brevemente y pregunta el nombre
- Responde solo lo que te preguntan
- Respuestas cortas y precisas salvo que pidan un resumen completo
- Nunca inventes números — usa solo los datos del contexto
- El saldo real está en SALDO_ACTUAL — nunca lo calcules tú
- El saldo desglosado por cuenta bancaria está en SALDO_POR_CUENTA — úsalo cuando pregunten por una cuenta específica o por todas las cuentas

ACCIONES DISPONIBLES — responde ÚNICAMENTE con el JSON exacto cuando el usuario quiera ejecutar una acción:

1. REGISTRAR MOVIMIENTO FINANCIERO:
{"action":"insert_movimiento","data":{"fecha":"YYYY-MM-DD","tipo":"Gasto","categoria":"","concepto":"","monto":0,"cuenta":"CaixaBank","forma_pago":"","proveedor":"","proyecto_id":null,"observaciones":""}}

2. ACTUALIZAR ESTADO DE PARTIDA DE REFORMA:
{"action":"update_partida_estado","data":{"partida_id":"","estado":"pendiente"}}

3. ACTUALIZAR ITEM DE PLANIFICADOR:
{"action":"update_item","data":{"item_id":"","coste":0,"proveedor":"","fecha_compra":"","fecha_entrega":"","fecha_instalacion":"","nota":""}}

4. CREAR TAREA:
{"action":"insert_tarea","data":{"titulo":"","descripcion":"","prioridad":"Media","fecha_limite":"YYYY-MM-DD","estado":"Pendiente"}}

5. ACTUALIZAR ESTADO DE TAREA:
{"action":"update_tarea_estado","data":{"tarea_id":"","estado":"Pendiente"}}

6. ACTUALIZAR TAREA:
{"action":"update_tarea","data":{"tarea_id":"","titulo":"","descripcion":"","prioridad":"","fecha_limite":"YYYY-MM-DD","estado":""}}

7. CREAR EVENTO:
{"action":"insert_evento","data":{"titulo":"","descripcion":"","fecha_inicio":"YYYY-MM-DDTHH:MM:00+01:00","fecha_fin":"YYYY-MM-DDTHH:MM:00+01:00","recordatorio":false,"reforma_id":null}}

8. EDITAR EVENTO:
{"action":"update_evento","data":{"evento_id":"","titulo":"","descripcion":"","fecha_inicio":"YYYY-MM-DDTHH:MM:00+01:00","fecha_fin":"YYYY-MM-DDTHH:MM:00+01:00"}}

9. ELIMINAR EVENTO:
{"action":"delete_evento","data":{"evento_id":""}}

10. CREAR PROVEEDOR:
{"action":"insert_proveedor","data":{"nombre":"","tipo":"Activo","rubro":"","contacto":"","cif":"","email":"","telefono":""}}

11. EDITAR PROVEEDOR:
{"action":"update_proveedor","data":{"proveedor_id":"","nombre":"","tipo":"","rubro":"","contacto":"","email":"","telefono":""}}

12. ELIMINAR PROVEEDOR:
{"action":"delete_proveedor","data":{"proveedor_id":""}}

13. CREAR MATERIAL:
{"action":"insert_material","data":{"nombre":"","proveedor_id":null,"costo_unitario":0,"cantidad":0,"stock_minimo":0}}

14. EDITAR MATERIAL:
{"action":"update_material","data":{"material_id":"","nombre":"","costo_unitario":0,"cantidad":0,"stock_minimo":0}}

15. ELIMINAR MATERIAL:
{"action":"delete_material","data":{"material_id":""}}

16. CREAR LEAD:
{"action":"insert_lead","data":{"nombre":"","email":"","telefono":"","estado":"Nuevo","notas":""}}

17. EDITAR LEAD:
{"action":"update_lead","data":{"lead_id":"","nombre":"","email":"","telefono":"","estado":"","notas":""}}

18. ELIMINAR LEAD:
{"action":"delete_lead","data":{"lead_id":""}}

19. CREAR COMERCIALIZACIÓN:
{"action":"insert_comercializacion","data":{"inmueble_id":"","agente":"","precio_salida":0,"precio_quiebre":0,"precio_minimo":0,"estado":"Activo","fecha_publicacion":"YYYY-MM-DD","en_portales":false}}

20. EDITAR COMERCIALIZACIÓN:
{"action":"update_comercializacion","data":{"comercializacion_id":"","agente":"","precio_salida":0,"precio_quiebre":0,"precio_minimo":0,"estado":"","en_portales":false}}

21. CREAR TRANSACCIÓN:
{"action":"insert_transaccion","data":{"inmueble_id":"","comprador":"","precio_final":0,"fecha_cierre":"YYYY-MM-DD","notas":""}}

22. CREAR SIMULACIÓN CALCULADORA:
{"action":"insert_simulacion","data":{"nombre":"","direccion":"","ciudad":"","tipo_inmueble":"","duracion_meses":12,"precio_compra_estimado":0,"reforma_estimado":0,"gastos_compraventa_estimado":0,"itp_estimado":0,"precio_venta_pesimista":0,"precio_venta_realista":0,"precio_venta_optimista":0,"observaciones":""}}

VALORES VÁLIDOS:
- tipo movimiento: "Gasto" o "Ingreso"
- categoria movimiento: Materiales, Servicios, Impuestos, Sueldos, Honorarios, Suministros, Seguros, Gestoría, Notaría, Registro, Comunidad, Legal, Contable, Marketing, Comisiones, Arras, Ventas, Saldo Inicial, Otros
- cuenta: Banco Sabadell, BBVA, CaixaBank, Santander, Caja, Otra — por defecto "CaixaBank"
- forma_pago: Efectivo, Débito, Crédito, Transferencia, Bizum, Cheque
- proyecto_id para Olula: "347d78d9-1de8-4639-8853-8262b0b962e9"
- estado partida: "pendiente", "en_curso", "ok"
- fecha: usa FECHA_HOY si no especifican
- prioridad tarea: "Alta", "Media", "Baja"
- estado tarea: "Pendiente", "En curso", "Completada"
- estado lead: "Nuevo", "Contactado", "En Oferta", "Cerrado"
- tarea_id: búscalo en TAREAS por el título que mencione el usuario
- evento_id: búscalo en EVENTOS por el título, usa SIEMPRE el campo "id" UUID completo, nunca un número
- proveedor_id: búscalo en PROVEEDORES por el nombre que mencione el usuario
- lead_id: búscalo en LEADS por el nombre que mencione el usuario

- evento_id: SIEMPRE usa el UUID completo del evento (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), nunca uses números de posición

REGLAS:
- Si falta monto o concepto en un movimiento, pregunta antes de generar el JSON
- Si el usuario menciona una partida por nombre, búscala en PARTIDAS y usa su id
- Si el usuario menciona un item por nombre, búscalo en ITEMS y usa su id
- Solo un JSON por respuesta, nunca texto adicional junto al JSON
- NUNCA inventes eventos, tareas, leads ni ningún dato — usa SOLO lo que aparece en el contexto
- Si no encuentras un evento por nombre, dilo claramente en lugar de inventar

FORMATO RESPUESTAS NORMALES:
- Sin markdown complejo
- Sin asteriscos dobles
- Listas simples con guión cuando sea necesario
- Máximo 5 líneas salvo que pidan más detalle`;

function needsContext(message: string): boolean {
  const keywords = [
    'saldo', 'dinero', 'caja', 'banco', 'plata',
    'inmueble', 'piso', 'propiedad', 'olula', 'zurgena', 'cuevas',
    'reforma', 'obra', 'presupuesto', 'gasto', 'pago', 'costo',
    'partida', 'electricidad', 'fontanería', 'carpintería', 'pintura',
    'albañilería', 'cerrajería', 'iluminación', 'suelo', 'puerta',
    'ventana', 'cocina', 'electrodoméstico', 'baño', 'mobiliario',
    'textil', 'limpieza', 'item', 'cuadro', 'cableado',
    'operación', 'proyecto', 'rentabilidad', 'beneficio', 'ganancia',
    'lead', 'cliente', 'comprador', 'venta', 'comercial',
    'proveedor', 'hassan', 'material',
    'finanza', 'movimiento', 'ingreso', 'egreso',
    'resumen', 'estado', 'situación', 'empresa', 'hasu', 'wallest',
    'registra', 'anota', 'añade', 'carga', 'apunta', 'actualiza', 'cambia', 'marca',
    'evento', 'reunión', 'visita', 'cita', 'agenda', 'calendario',
    'hoy', 'mañana', 'ayer', 'semana', 'fecha', 'cuando', 'hoy?', 'reunion',
    'finanza', 'movimiento', 'ingreso', 'egreso', 'inversión', 'inversion', 'total', 'cuanto', 'cuánto', 'balance', 'resumen', 'situación',     'situacion',
  ];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

async function getContext(message: string) {
  const fechaHoy = new Date().toISOString().split('T')[0];
  const lower = message.toLowerCase();

  const isFinanzas = /saldo|movimiento|gasto|ingreso|pago|dinero|banco|caja|finanza|inversión|inversion|total|cuanto|balance|resumen|situación|situacion/.test(lower);
  const isReforma = /reforma|partida|item|obra|presupuesto|electricidad|fontanería|carpintería|pintura|albañilería|cerrajería|iluminación|suelo|puerta|ventana|cocina|baño|mobiliario|cuadro|cableado|planificador/.test(lower);
  const isInmueble = /inmueble|piso|propiedad|olula|zurgena|cuevas|activo/.test(lower);
  const isCalendario = /evento|reunión|reunion|visita|cita|agenda|calendario|hoy|mañana|ayer|semana|cuando/.test(lower);
  const isTareas = /tarea|kanban|pendiente|completada|prioridad/.test(lower);
  const isLead = /lead|cliente|comprador|comercial|crm/.test(lower);
  const isProveedor = /proveedor|contratista|hassan|material|stock/.test(lower);
  const isComercial = /comercialización|comercializacion|venta|transaccion|transacción|portal/.test(lower);

  const queries: Promise<any>[] = [];
  const labels: string[] = [];

  queries.push(Promise.resolve({ data: [{ fecha_hoy: fechaHoy }] }));
  labels.push('FECHA_HOY');

  if (isFinanzas) {
    queries.push(supabase.from('movimientos_empresa').select('*').order('fecha', { ascending: false }).limit(50));
    labels.push('MOVIMIENTOS');
    queries.push(supabase.from('saldo_actual').select('*'));
    labels.push('SALDO_ACTUAL');
    queries.push(supabase.from('saldo_por_cuenta').select('*'));
    labels.push('SALDO_POR_CUENTA');
  }

  if (isInmueble || isReforma) {
    queries.push(supabase.from('inmuebles').select('*'));
    labels.push('INMUEBLES');
  }

  if (isReforma) {
    queries.push(supabase.from('reformas').select('*'));
    labels.push('REFORMAS');
    queries.push(supabase.from('partidas_reforma_detalladas').select('*'));
    labels.push('PARTIDAS');
    queries.push(supabase.from('items_partida_reforma').select('*'));
    labels.push('ITEMS');
  }

  if (isCalendario) {
    queries.push(supabase.from('eventos_globales').select('*').order('fecha_inicio', { ascending: true }).limit(50));
    labels.push('EVENTOS');
  }

  if (isTareas) {
    queries.push(supabase.from('tareas_globales').select('*'));
    labels.push('TAREAS');
  }

  if (isLead) {
    queries.push(supabase.from('leads').select('*'));
    labels.push('LEADS');
  }

  if (isProveedor) {
    queries.push(supabase.from('proveedores').select('*'));
    labels.push('PROVEEDORES');
    queries.push(supabase.from('stock_materiales').select('*'));
    labels.push('MATERIALES');
  }

  if (isComercial) {
    queries.push(supabase.from('comercializacion').select('*'));
    labels.push('COMERCIALIZACION');
    queries.push(supabase.from('transacciones').select('*'));
    labels.push('TRANSACCIONES');
  }

  // Si no hay nada específico, carga mínimo
  if (!isFinanzas && !isReforma && !isInmueble && !isCalendario && !isTareas && !isLead && !isProveedor && !isComercial) {
    queries.push(supabase.from('saldo_actual').select('*'));
    labels.push('SALDO_ACTUAL');
    queries.push(supabase.from('inmuebles').select('id, nombre, estado'));
    labels.push('INMUEBLES');
  }

  const results = await Promise.all(queries);

  let context = `=== DATOS HASU ===\nFECHA_HOY: ${fechaHoy}\n`;
  results.slice(1).forEach((result, i) => {
    context += `${labels[i + 1]}: ${JSON.stringify(result.data)}\n`;
  });
  context += '=== FIN ===';

  return context;
}
async function getValidGoogleToken(): Promise<string | null> {
  try {
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('access_token, refresh_token, token_expiry')
      .eq('user_id', 'fd619f67-92a0-48d6-b05a-36e8c5fcf521')
      .single();

    if (!tokenData) return null;

    const expiryTime = new Date(tokenData.token_expiry).getTime();
    const isExpired = expiryTime - Date.now() < 60 * 60 * 1000;

    if (isExpired && tokenData.refresh_token) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        await supabase.from('google_calendar_tokens').update({
          access_token: refreshData.access_token,
          token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        }).eq('user_id', 'fd619f67-92a0-48d6-b05a-36e8c5fcf521');
        return refreshData.access_token;
      }
      return null;
    }

    return tokenData.access_token;
  } catch {
    return null;
  }
}

async function handleAction(action: string, data: Record<string, unknown>): Promise<string> {
  if (action === 'insert_movimiento') {
    const { error } = await supabase
      .from('movimientos_empresa')
      .insert([data]);

    if (error) return `Error al registrar el movimiento: ${error.message}`;

    if (data.proyecto_id) {
      const finanzasData = {
        reforma_id: data.proyecto_id,
        fecha: data.fecha,
        tipo: (data.tipo as string).toLowerCase(),
        categoria: data.categoria,
        descripcion: data.concepto,
        proveedor: data.proveedor || '',
        cantidad: 1,
        precio_unitario: data.monto,
        total: data.monto,
        forma_pago: data.forma_pago,
        observaciones: data.observaciones || ''
      };
      await supabase.from('finanzas_proyecto').insert([finanzasData]);
    }

    return `Registrado. ${data.tipo} de ${data.monto}€ — ${data.concepto} (${data.fecha})`;
  }

  if (action === 'update_partida_estado') {
    const { error } = await supabase
      .from('partidas_reforma_detalladas')
      .update({ estado: data.estado })
      .eq('id', data.partida_id);

    if (error) return `Error al actualizar la partida: ${error.message}`;
    return `Partida actualizada a "${data.estado}".`;
  }

  if (action === 'update_item') {
    const updates: Record<string, unknown> = {};
    if (data.coste) updates.coste = data.coste;
    if (data.proveedor) updates.proveedor = data.proveedor;
    if (data.fecha_compra) updates.fecha_compra = data.fecha_compra;
    if (data.fecha_entrega) updates.fecha_entrega = data.fecha_entrega;
    if (data.fecha_instalacion) updates.fecha_instalacion = data.fecha_instalacion;
    if (data.nota) updates.nota = data.nota;

    const { error } = await supabase
      .from('items_partida_reforma')
      .update(updates)
      .eq('id', data.item_id);

    if (error) return `Error al actualizar el item: ${error.message}`;
    return `Item actualizado correctamente.`;
  }

  if (action === 'insert_tarea') {
    const { error } = await supabase
      .from('tareas_globales')
      .insert([data]);

    if (error) return `Error al crear la tarea: ${error.message}`;
    return `Tarea creada: "${data.titulo}" — ${data.prioridad}, ${data.fecha_limite || 'sin fecha límite'}.`;
  }

  if (action === 'update_tarea_estado') {
    const { error } = await supabase
      .from('tareas_globales')
      .update({ estado: data.estado })
      .eq('id', data.tarea_id);

    if (error) return `Error al actualizar la tarea: ${error.message}`;
    return `Tarea actualizada a "${data.estado}".`;
  }

  if (action === 'update_tarea') {
    const updates: Record<string, unknown> = {};
    if (data.titulo) updates.titulo = data.titulo;
    if (data.descripcion) updates.descripcion = data.descripcion;
    if (data.prioridad) updates.prioridad = data.prioridad;
    if (data.fecha_limite) updates.fecha_limite = data.fecha_limite;
    if (data.estado) updates.estado = data.estado;

    const { error } = await supabase
      .from('tareas_globales')
      .update(updates)
      .eq('id', data.tarea_id);

    if (error) return `Error al actualizar la tarea: ${error.message}`;
    return `Tarea actualizada correctamente.`;
  }

if (action === 'insert_evento') {
    const { data: eventoInsertado, error } = await supabase
      .from('eventos_globales')
      .insert([data])
      .select()
      .single();

    if (error) return `Error al crear el evento: ${error.message}`;

    try {
      const accessToken = await getValidGoogleToken();
      if (accessToken) {
        const googleResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: data.titulo,
            description: data.descripcion || '',
            start: { dateTime: data.fecha_inicio, timeZone: 'Europe/Madrid' },
            end: { dateTime: data.fecha_fin, timeZone: 'Europe/Madrid' },
          }),
        });

        if (googleResponse.ok) {
          const googleEvent = await googleResponse.json();
          await supabase.from('eventos_globales')
            .update({ google_event_id: googleEvent.id })
            .eq('id', eventoInsertado.id);
        }
      }
    } catch (e) {
      console.error('Error sincronizando con Google:', e);
    }

    return `Evento creado: "${data.titulo}" — ${data.fecha_inicio}.`;
  }
if (action === 'update_evento') {
    const updates: Record<string, unknown> = {};
    if (data.titulo) updates.titulo = data.titulo;
    if (data.descripcion) updates.descripcion = data.descripcion;
    if (data.fecha_inicio) updates.fecha_inicio = data.fecha_inicio;
    if (data.fecha_fin) updates.fecha_fin = data.fecha_fin;
    const { error } = await supabase.from('eventos_globales').update(updates).eq('id', data.evento_id);
    if (error) return `Error al editar el evento: ${error.message}`;
    return `Evento actualizado correctamente.`;
  }

if (action === 'delete_evento') {
    const { data: evento } = await supabase
      .from('eventos_globales')
      .select('google_event_id')
      .eq('id', data.evento_id)
      .single();

    const { error } = await supabase.from('eventos_globales').delete().eq('id', data.evento_id);
    if (error) return `Error al eliminar el evento: ${error.message}`;

    if (evento?.google_event_id) {
      try {
        const accessToken = await getValidGoogleToken();
        if (accessToken) {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${evento.google_event_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        }
      } catch (e) {
        console.error('Error eliminando de Google:', e);
      }
    }

    return `Evento eliminado correctamente.`;
}

  if (action === 'insert_proveedor') {
    const { error } = await supabase.from('proveedores').insert([data]);
    if (error) return `Error al crear el proveedor: ${error.message}`;
    return `Proveedor "${data.nombre}" creado correctamente.`;
  }

  if (action === 'update_proveedor') {
    const updates: Record<string, unknown> = {};
    if (data.nombre) updates.nombre = data.nombre;
    if (data.tipo) updates.tipo = data.tipo;
    if (data.rubro) updates.rubro = data.rubro;
    if (data.contacto) updates.contacto = data.contacto;
    if (data.email) updates.email = data.email;
    if (data.telefono) updates.telefono = data.telefono;
    const { error } = await supabase.from('proveedores').update(updates).eq('id', data.proveedor_id);
    if (error) return `Error al editar el proveedor: ${error.message}`;
    return `Proveedor actualizado correctamente.`;
  }

  if (action === 'delete_proveedor') {
    const { error } = await supabase.from('proveedores').delete().eq('id', data.proveedor_id);
    if (error) return `Error al eliminar el proveedor: ${error.message}`;
    return `Proveedor eliminado correctamente.`;
  }

  if (action === 'insert_material') {
    const { error } = await supabase.from('stock_materiales').insert([data]);
    if (error) return `Error al crear el material: ${error.message}`;
    return `Material "${data.nombre}" creado correctamente.`;
  }

  if (action === 'update_material') {
    const updates: Record<string, unknown> = {};
    if (data.nombre) updates.nombre = data.nombre;
    if (data.costo_unitario) updates.costo_unitario = data.costo_unitario;
    if (data.cantidad) updates.cantidad = data.cantidad;
    if (data.stock_minimo) updates.stock_minimo = data.stock_minimo;
    const { error } = await supabase.from('stock_materiales').update(updates).eq('id', data.material_id);
    if (error) return `Error al editar el material: ${error.message}`;
    return `Material actualizado correctamente.`;
  }

  if (action === 'delete_material') {
    const { error } = await supabase.from('stock_materiales').delete().eq('id', data.material_id);
    if (error) return `Error al eliminar el material: ${error.message}`;
    return `Material eliminado correctamente.`;
  }

  if (action === 'insert_lead') {
    const { error } = await supabase.from('leads').insert([data]);
    if (error) return `Error al crear el lead: ${error.message}`;
    return `Lead "${data.nombre}" creado correctamente.`;
  }

  if (action === 'update_lead') {
    const updates: Record<string, unknown> = {};
    if (data.nombre) updates.nombre = data.nombre;
    if (data.email) updates.email = data.email;
    if (data.telefono) updates.telefono = data.telefono;
    if (data.estado) updates.estado = data.estado;
    if (data.notas) updates.notas = data.notas;
    const { error } = await supabase.from('leads').update(updates).eq('id', data.lead_id);
    if (error) return `Error al editar el lead: ${error.message}`;
    return `Lead actualizado correctamente.`;
  }

  if (action === 'delete_lead') {
    const { error } = await supabase.from('leads').delete().eq('id', data.lead_id);
    if (error) return `Error al eliminar el lead: ${error.message}`;
    return `Lead eliminado correctamente.`;
  }

  if (action === 'insert_comercializacion') {
    const { error } = await supabase.from('comercializacion').insert([data]);
    if (error) return `Error al crear la comercialización: ${error.message}`;
    return `Comercialización creada correctamente.`;
  }

  if (action === 'update_comercializacion') {
    const updates: Record<string, unknown> = {};
    if (data.agente) updates.agente = data.agente;
    if (data.precio_salida) updates.precio_salida = data.precio_salida;
    if (data.precio_quiebre) updates.precio_quiebre = data.precio_quiebre;
    if (data.precio_minimo) updates.precio_minimo = data.precio_minimo;
    if (data.estado) updates.estado = data.estado;
    if (data.en_portales !== undefined) updates.en_portales = data.en_portales;
    const { error } = await supabase.from('comercializacion').update(updates).eq('id', data.comercializacion_id);
    if (error) return `Error al editar la comercialización: ${error.message}`;
    return `Comercialización actualizada correctamente.`;
  }

  if (action === 'insert_transaccion') {
    const { error } = await supabase.from('transacciones').insert([data]);
    if (error) return `Error al crear la transacción: ${error.message}`;
    return `Transacción creada correctamente.`;
  }

  if (action === 'insert_simulacion') {
    const { error } = await supabase.from('proyectos_rentabilidad').insert([data]);
    if (error) return `Error al crear la simulación: ${error.message}`;
    return `Simulación "${data.nombre}" creada correctamente.`;
  }
  return 'Acción no reconocida.';
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    const requiresContext = needsContext(message);
    const contextBlock = requiresContext ? await getContext(message) : '';

    const userContent = requiresContext
      ? `${contextBlock}\n\nMensaje: ${message}`
      : message;

    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userContent }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const parsed = JSON.parse(responseText.trim());
      if (parsed.action && parsed.data) {
        const result = await handleAction(parsed.action, parsed.data);
        return NextResponse.json({ response: result, success: true });
      }
    } catch {
      // Respuesta normal de texto
    }

    return NextResponse.json({ response: responseText, success: true });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje', success: false },
      { status: 500 }
    );
  }
}