import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SYSTEM_PROMPT = `Eres el asistente operativo de Wallest (Hasu Activos Inmobiliarios SL), empresa española de compraventa y reforma de inmuebles.

PERSONALIDAD: Directo, profesional, hablas como co-CEO no como asistente. Dices las cosas como son, sin rodeos, sin exagerar. Español de España en todo momento.

CONVERSACIÓN:
- Si no sabes con quién hablas, preséntate brevemente y pregunta el nombre
- Responde solo lo que te preguntan
- Respuestas cortas y precisas salvo que pidan un resumen completo
- Nunca inventes números — usa solo los datos del contexto
- El saldo real está en SALDO_ACTUAL — nunca lo calcules tú

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

7. CREAR EVENTO EN CALENDARIO:
{"action":"insert_evento","data":{"titulo":"","descripcion":"","fecha_inicio":"YYYY-MM-DDTHH:MM:00+01:00","fecha_fin":"YYYY-MM-DDTHH:MM:00+01:00","recordatorio":false,"reforma_id":null}}

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
- tarea_id: búscalo en TAREAS por el título que mencione el usuario

REGLAS:
- Si falta monto o concepto en un movimiento, pregunta antes de generar el JSON
- Si el usuario menciona una partida por nombre (ej: "electricidad"), búscala en PARTIDAS y usa su id
- Si el usuario menciona un item por nombre (ej: "cuadro eléctrico"), búscalo en ITEMS y usa su id
- Solo un JSON por respuesta, nunca texto adicional junto al JSON

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
  ];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

async function getContext() {
  const fechaHoy = new Date().toISOString().split('T')[0];

  const [
    { data: inmuebles },
    { data: movimientos_empresa },
    { data: reformas },
    { data: partidas },
    { data: items },
    { data: leads },
    { data: proveedores },
    { data: comercializacion },
    { data: finanzas },
    { data: saldo_actual },
    { data: tareas },
    { data: eventos },
  ] = await Promise.all([
    supabase.from('inmuebles').select('*'),
    supabase.from('movimientos_empresa').select('*'),
    supabase.from('reformas').select('*'),
    supabase.from('partidas_reforma_detalladas').select('*'),
    supabase.from('items_partida_reforma').select('*'),
    supabase.from('leads').select('*'),
    supabase.from('proveedores').select('*'),
    supabase.from('comercializacion').select('*'),
    supabase.from('finanzas').select('*'),
    supabase.from('saldo_actual').select('*'),
    supabase.from('tareas_globales').select('*'),
    supabase.from('eventos_globales').select('*'),
  ]);

  return `
=== DATOS HASU ===
FECHA_HOY: ${fechaHoy}
SALDO_ACTUAL: ${JSON.stringify(saldo_actual)}
INMUEBLES: ${JSON.stringify(inmuebles)}
MOVIMIENTOS: ${JSON.stringify(movimientos_empresa)}
REFORMAS: ${JSON.stringify(reformas)}
PARTIDAS: ${JSON.stringify(partidas)}
ITEMS: ${JSON.stringify(items)}
LEADS: ${JSON.stringify(leads)}
PROVEEDORES: ${JSON.stringify(proveedores)}
COMERCIALIZACION: ${JSON.stringify(comercializacion)}
FINANZAS: ${JSON.stringify(finanzas)}
TAREAS: ${JSON.stringify(tareas)}
EVENTOS: ${JSON.stringify(eventos)}
=== FIN ===`;
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
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('access_token')
      .eq('user_id', 'fd619f67-92a0-48d6-b05a-36e8c5fcf521')
      .single();

    if (tokenData?.access_token) {
      await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: data.titulo,
          description: data.descripcion || '',
          start: { dateTime: data.fecha_inicio, timeZone: 'Europe/Madrid' },
          end: { dateTime: data.fecha_fin, timeZone: 'Europe/Madrid' },
        }),
      });
    }
  } catch (e) {
    console.error('Error sincronizando con Google:', e);
  }

  return `Evento creado: "${data.titulo}" — ${data.fecha_inicio}.`;
}
  return 'Acción no reconocida.';
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    const requiresContext = needsContext(message);
    const contextBlock = requiresContext ? await getContext() : '';

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