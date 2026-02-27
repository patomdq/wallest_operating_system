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
- Si no sabes con quién hablas, preséntate brevemente y pregnta el nombre. Ejemplo: "Buenas, soy el asistente de Wallest. ¿Con quién hablo? 
- Responde solo lo que te preguntan — si preguntan el saldo, solo el saldo
- Si preguntan por una operación específica, solo esa operación
- Respuestas cortas y precisas salvo que pidan un resumen completo
- Nunca inventes números — usa solo los datos del contexto
- El saldo real está en SALDO_ACTUAL — nunca lo calcules tú

FORMATO:
- Sin markdown complejo
- Sin asteriscos dobles
- Listas simples con guión cuando sea necesario
- Máximo 5 líneas salvo que pidan más detalle`;

function needsContext(message: string): boolean {
  const keywords = [
    'saldo', 'dinero', 'caja', 'banco', 'plata',
    'inmueble', 'piso', 'propiedad', 'olula', 'zurgena', 'cuevas',
    'reforma', 'obra', 'presupuesto', 'gasto', 'pago', 'costo',
    'operación', 'proyecto', 'rentabilidad', 'beneficio', 'ganancia',
    'lead', 'cliente', 'comprador', 'venta', 'comercial',
    'proveedor', 'hassan', 'material',
    'finanza', 'movimiento', 'ingreso', 'egreso',
    'resumen', 'estado', 'situación', 'empresa', 'hasu', 'wallest'
  ];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

async function getContext() {
  const [
    { data: inmuebles },
    { data: movimientos_empresa },
    { data: reformas },
    { data: planificacion_reforma },
    { data: leads },
    { data: proveedores },
    { data: comercializacion },
    { data: finanzas },
    { data: saldo_actual },
  ] = await Promise.all([
    supabase.from('inmuebles').select('*'),
    supabase.from('movimientos_empresa').select('*'),
    supabase.from('reformas').select('*'),
    supabase.from('planificacion_reforma').select('*'),
    supabase.from('leads').select('*'),
    supabase.from('proveedores').select('*'),
    supabase.from('comercializacion').select('*'),
    supabase.from('finanzas').select('*'),
    supabase.from('saldo_actual').select('*'),
  ]);

  return `
=== DATOS HASU ===
SALDO_ACTUAL: ${JSON.stringify(saldo_actual)}
INMUEBLES: ${JSON.stringify(inmuebles)}
MOVIMIENTOS: ${JSON.stringify(movimientos_empresa)}
REFORMAS: ${JSON.stringify(reformas)}
PLANIFICACION_REFORMA: ${JSON.stringify(planificacion_reforma)}
LEADS: ${JSON.stringify(leads)}
PROVEEDORES: ${JSON.stringify(proveedores)}
COMERCIALIZACION: ${JSON.stringify(comercializacion)}
FINANZAS: ${JSON.stringify(finanzas)}
=== FIN ===`;
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

    return NextResponse.json({
      response: response.content[0].type === 'text' ? response.content[0].text : '',
      success: true
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje', success: false },
      { status: 500 }
    );
  }
}