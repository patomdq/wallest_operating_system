'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Hito = { label: string; done: boolean; fecha: string; orden: number; };
type Bitacora = { partida: string; estado: 'pendiente' | 'en_curso' | 'finalizada'; fecha: string; orden: number; };
type Movimiento = { fecha: string; concepto: string; importe: number; saldo: number; tipo: 'Ingreso' | 'Gasto'; };

type Operacion = {
  id: string;
  inmueble_nombre: string;
  inmueble_ubicacion: string;
  tipo: string;
  capital_invertido: number;
  capital_total_operacion: number;
  participacion: number;
  valor_estimado_venta: number;
  retorno_estimado: number;
  retorno_propio: number;
  roi: number;
  duracion_meses: number;
  estado: string;
  fecha_entrada: string;
  fecha_salida_estimada: string;
  avance: number;
  hitos: Hito[];
  bitacora: Bitacora[];
  movimientos: Movimiento[];
};

type Inversor = { nombre: string; desde: string; operaciones: Operacion[]; };

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const fmtFecha = (f: string) => {
  try { return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return f; }
};

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ hitos }: { hitos: Hito[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 28 }}>
      <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1, background: 'linear-gradient(180deg, #c9a84c60, #c9a84c10)' }} />
      {[...hitos].sort((a, b) => a.orden - b.orden).map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 15, height: 15, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            background: h.done ? '#c9a84c' : '#1a1a1a',
            border: h.done ? '2px solid #c9a84c' : '2px solid #2a2a2a',
            boxShadow: h.done ? '0 0 10px #c9a84c50' : 'none',
            position: 'relative', left: -21,
          }} />
          <div style={{ flex: 1, marginLeft: -12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: h.done ? 600 : 400, color: h.done ? '#f0e6c8' : '#888' }}>{h.label}</p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: h.done ? '#c9a84c' : '#555' }}>{h.fecha}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bitácora ─────────────────────────────────────────────────────────────────
function BitacoraView({ items }: { items: Bitacora[] }) {
  const colorEstado = (e: string) => e === 'finalizada' ? '#4ade80' : e === 'en_curso' ? '#c9a84c' : '#555';
  const labelEstado = (e: string) => e === 'finalizada' ? '✓ Finalizada' : e === 'en_curso' ? '⚡ En curso' : '○ Pendiente';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...items].sort((a, b) => a.orden - b.orden).map((b, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d0d0a', borderRadius: 10, padding: '12px 16px',
          border: `1px solid ${b.estado === 'finalizada' ? '#4ade8020' : b.estado === 'en_curso' ? '#c9a84c20' : '#1a1a14'}`,
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = colorEstado(b.estado) + '50'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = b.estado === 'finalizada' ? '#4ade8020' : b.estado === 'en_curso' ? '#c9a84c20' : '#1a1a14'}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: b.estado === 'pendiente' ? '#888' : '#f0e6c8' }}>{b.partida}</p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: '#555' }}>{b.fecha}</p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '1px',
            color: colorEstado(b.estado), background: colorEstado(b.estado) + '15',
            padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase', flexShrink: 0,
          }}>{labelEstado(b.estado)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Movimientos ──────────────────────────────────────────────────────────────
function MovimientosView({ movimientos }: { movimientos: Movimiento[] }) {
  const totalGastos = movimientos.filter(m => m.tipo === 'Gasto').reduce((s, m) => s + Math.abs(m.importe), 0);
  const totalIngresos = movimientos.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.importe, 0);
  const saldoActual = movimientos.length > 0 ? movimientos[0].saldo : 0;

  return (
    <div>
      {/* Mini KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Saldo actual', v: fmt(saldoActual), c: '#c9a84c' },
          { l: 'Total ingresos', v: fmt(totalIngresos), c: '#4ade80' },
          { l: 'Total gastos', v: fmt(totalGastos), c: '#f87171' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#0a0a08', borderRadius: 10, padding: '12px 14px', border: '1px solid #1a1812' }}>
            <p style={{ margin: 0, fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>{k.l}</p>
            <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 800, color: k.c }}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1a1812' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px 90px', background: '#0a0a08', padding: '10px 14px', borderBottom: '1px solid #1a1812' }}>
          {['Fecha', 'Concepto', 'Importe', 'Saldo'].map((h, i) => (
            <span key={i} style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', textAlign: i > 1 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {movimientos.map((m, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '100px 1fr 90px 90px',
              padding: '10px 14px',
              borderBottom: '1px solid #0f0f0c',
              background: i % 2 === 0 ? '#0d0d0a' : '#0a0a08',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#141410'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#0d0d0a' : '#0a0a08'}
            >
              <span style={{ fontSize: 11, color: '#888' }}>{m.fecha}</span>
              <span style={{ fontSize: 11, color: '#ccc', paddingRight: 8 }}>{m.concepto}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: m.tipo === 'Ingreso' ? '#4ade80' : '#f87171', textAlign: 'right' }}>
                {m.tipo === 'Ingreso' ? '+' : '-'}{fmt(Math.abs(m.importe))}
              </span>
              <span style={{ fontSize: 11, color: '#888', textAlign: 'right' }}>{fmt(m.saldo)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Operación Card ───────────────────────────────────────────────────────────
function OperacionCard({ op, expanded, onToggle }: { op: Operacion; expanded: boolean; onToggle: () => void }) {
  const [tab, setTab] = useState<'ruta' | 'bitacora' | 'movimientos'>('ruta');
  const retornoAnualizado = op.duracion_meses > 0
    ? ((op.retorno_propio / op.capital_invertido) / (op.duracion_meses / 12) * 100).toFixed(1) : '—';

  return (
    <div style={{
      background: 'linear-gradient(160deg, #111008 0%, #0c0c0a 100%)',
      border: `1px solid ${expanded ? '#c9a84c50' : '#1e1c16'}`,
      borderRadius: 20, overflow: 'hidden',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: expanded ? '0 0 40px #c9a84c10' : 'none',
    }}>
      {/* Header — siempre visible */}
      <div onClick={onToggle} style={{ padding: '24px 28px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: '#c9a84c', background: '#c9a84c15', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                {op.tipo} · {op.participacion}% participación
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#fb923c', background: '#fb923c10', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                ● En ejecución
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0e6c8' }}>{op.inmueble_nombre}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>📍 {op.inmueble_ubicacion}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>TU RETORNO EST.</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#4ade80' }}>+{fmt(op.retorno_propio)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4ade80aa' }}>+{op.roi.toFixed(1)}% ROI</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Avance de obra</span>
            <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 700 }}>{op.avance}%</span>
          </div>
          <div style={{ height: 3, background: '#1a1a14', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${op.avance}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #c9a84c, #e8c97a)', transition: 'width 1.2s ease' }} />
          </div>
        </div>

        {/* Mini metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
          {[
            { l: 'Tu capital invertido', v: fmt(op.capital_invertido), c: '#c9a84c' },
            { l: 'Capital total operación', v: fmt(op.capital_total_operacion), c: '#aaa' },
            { l: 'Valor estimado venta', v: fmt(op.valor_estimado_venta), c: '#f0e6c8' },
            { l: 'Retorno operación total', v: fmt(op.retorno_estimado), c: '#aaa' },
            { l: 'Duración estimada', v: `${op.duracion_meses} meses`, c: '#aaa' },
            { l: 'Retorno anualizado', v: `+${retornoAnualizado}%`, c: '#60a5fa' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#0d0d0a', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.l}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: m.c }}>{m.v}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 10, color: '#555', letterSpacing: '1px' }}>
            {expanded ? '▲ OCULTAR DETALLE' : '▼ VER DETALLE'}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a14' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #2a2a20', background: '#0d0d0a' }}>
            {([
              { key: 'ruta', label: '📍 Hoja de ruta' },
              { key: 'bitacora', label: '🔨 Bitácora de obra' },
              { key: 'movimientos', label: '💳 Movimientos' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={(e) => { e.stopPropagation(); setTab(t.key); }}
                style={{
                  padding: '16px 22px',
                  background: tab === t.key ? '#111008' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
                  color: tab === t.key ? '#c9a84c' : '#aaa',
                  borderBottom: tab === t.key ? '2px solid #c9a84c' : '2px solid transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  transition: 'color 0.2s, background 0.2s',
                  letterSpacing: '0.3px',
                  marginBottom: '-1px',
                }}
                onMouseEnter={e => { if (tab !== t.key) { (e.currentTarget as HTMLElement).style.color = '#c9a84c'; (e.currentTarget as HTMLElement).style.background = '#111008'; }}}
                onMouseLeave={e => { if (tab !== t.key) { (e.currentTarget as HTMLElement).style.color = '#aaa'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '24px 28px' }}>
            {tab === 'ruta' && (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 10, color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Ciclo completo de la operación
                </p>
                <Timeline hitos={op.hitos} />
                <p style={{ margin: '20px 0 0', fontSize: 11, color: '#666', borderTop: '1px solid #15130d', paddingTop: 16 }}>
                  Salida estimada: <span style={{ color: '#c9a84c' }}>{op.fecha_salida_estimada}</span>
                   ·  Para consultas contactá con tu gestor Hasu.
                </p>
              </>
            )}

            {tab === 'bitacora' && (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 10, color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Estado de partidas de obra
                </p>
                <BitacoraView items={op.bitacora} />
              </>
            )}

            {tab === 'movimientos' && (
              <>
                <p style={{ margin: '0 0 16px', fontSize: 10, color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Movimientos cuenta JV · ES65 2100 1977 30 0047 3068
                </p>
                <MovimientosView movimientos={op.movimientos} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e0a, #0a0a08)',
      border: '1px solid #1a1812', borderRadius: 16, padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color + '40'; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}08`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1812'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${color}60, ${color}00)` }} />
      <p style={{ margin: 0, fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</p>
      <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ margin: '5px 0 0', fontSize: 10, color: '#666' }}>{sub}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InversorPortal() {
  const [inversor, setInversor] = useState<Inversor | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { loadInversorData(); }, []);

  const loadInversorData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/inversores/login'); return; }

      const { data: inversorData, error: invError } = await supabase
        .from('inversores').select('id, nombre, desde')
        .eq('user_id', session.user.id).single();
      if (invError || !inversorData) { router.push('/inversores/login'); return; }

      const { data: operacionesData } = await supabase
        .from('inversor_operaciones')
        .select(`id, inmueble_id, capital_invertido, capital_total_operacion, participacion,
          valor_estimado_venta, retorno_estimado, retorno_propio, roi,
          duracion_meses, fecha_entrada, fecha_salida_estimada, avance,
          inmuebles ( nombre, estado )`)
        .eq('inversor_id', inversorData.id);

      const operacionesConDatos: Operacion[] = [];
      for (const op of operacionesData || []) {
        // Buscar el proyecto en reformas usando el nombre del inmueble
        const inmuebleNombre = (op.inmuebles as any)?.nombre || '';
        const { data: reformaData } = await supabase
          .from('reformas')
          .select('id')
          .eq('nombre', inmuebleNombre)
          .single();

        const reformaId = reformaData?.id || null;

        const [{ data: hitos }, { data: bitacora }, { data: movRaw }] = await Promise.all([
          supabase.from('inversor_hitos').select('label, done, fecha, orden').eq('operacion_id', op.id).order('orden'),
          supabase.from('inversor_bitacora').select('partida, estado, fecha, orden').eq('operacion_id', op.id).order('orden'),
          reformaId
            ? supabase.from('movimientos_empresa').select('fecha, concepto, monto, tipo').eq('proyecto_id', reformaId).order('fecha', { ascending: false })
            : Promise.resolve({ data: [] }),
        ]);

        // Calcular saldo acumulado desde la BD
        const movsOrdenados = [...(movRaw || [])].reverse();
        let saldoAcumulado = 0;
        const movsConSaldo = movsOrdenados.map((m: any) => {
          saldoAcumulado += m.monto;
          return { ...m, saldoAcum: saldoAcumulado };
        }).reverse();

        const movimientos: Movimiento[] = movsConSaldo.map((m: any) => ({
          fecha: new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          concepto: m.concepto,
          importe: m.monto,
          saldo: Math.round(m.saldoAcum * 100) / 100,
          tipo: m.tipo as 'Ingreso' | 'Gasto',
        }));

        operacionesConDatos.push({
          id: op.id,
          inmueble_nombre: inmuebleNombre || 'Operación',
          inmueble_ubicacion: 'Zurgena, Almería',
          tipo: 'JV',
          capital_invertido: op.capital_invertido,
          capital_total_operacion: op.capital_total_operacion || 0,
          participacion: op.participacion,
          valor_estimado_venta: op.valor_estimado_venta,
          retorno_estimado: op.retorno_estimado,
          retorno_propio: op.retorno_propio || 0,
          roi: op.roi,
          duracion_meses: op.duracion_meses || 0,
          estado: 'en_curso',
          fecha_entrada: op.fecha_entrada,
          fecha_salida_estimada: op.fecha_salida_estimada,
          avance: op.avance,
          hitos: hitos || [],
          bitacora: (bitacora || []) as Bitacora[],
          movimientos,
        });
      }
            setInversor({ nombre: inversorData.nombre, desde: inversorData.desde, operaciones: operacionesConDatos });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/inversores/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070705', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #c9a84c', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!inversor) return null;

  const miCapital = inversor.operaciones.reduce((a, b) => a + b.capital_invertido, 0);
  const capitalTotal = inversor.operaciones.reduce((a, b) => a + b.capital_total_operacion, 0);
  const miRetorno = inversor.operaciones.reduce((a, b) => a + b.retorno_propio, 0);
  const retornoTotal = inversor.operaciones.reduce((a, b) => a + b.retorno_estimado, 0);
  const roiMedio = miCapital > 0 ? ((miRetorno / miCapital) * 100).toFixed(1) : '0.0';
  const duracionMedia = inversor.operaciones.length > 0
    ? Math.round(inversor.operaciones.reduce((a, b) => a + b.duracion_meses, 0) / inversor.operaciones.length) : 0;
  const retornoAnualizadoGlobal = duracionMedia > 0 && miCapital > 0
    ? ((miRetorno / miCapital) / (duracionMedia / 12) * 100).toFixed(1) : '0.0';

  const kpis = [
    { label: 'Capital total operación', value: fmt(capitalTotal), sub: 'Inversión total JV', color: '#888' },
    { label: 'Tu capital invertido', value: fmt(miCapital), sub: `${inversor.operaciones.length} operación${inversor.operaciones.length !== 1 ? 'es' : ''} activa${inversor.operaciones.length !== 1 ? 's' : ''}`, color: '#c9a84c' },
    { label: 'ROI estimado', value: `+${roiMedio}%`, sub: 'Sobre tu capital', color: '#60a5fa' },
    { label: 'Retorno total operación', value: fmt(retornoTotal), sub: 'Beneficio bruto total', color: '#888' },
    { label: 'Tu retorno estimado', value: fmt(miRetorno), sub: 'Al cierre de operaciones', color: '#4ade80' },
    { label: 'Retorno anualizado', value: `+${retornoAnualizadoGlobal}%`, sub: `Base ${duracionMedia} meses`, color: '#a78bfa' },
    { label: 'Tiempo estimado', value: `${duracionMedia} meses`, sub: 'Duración media', color: '#fb923c' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#070705', color: '#f0e6c8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #15130d', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #c9a84c, #a07830)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#070705' }}>H</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase' }}>Hasu · Portal Inversor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c30, #a0783020)', border: '1px solid #c9a84c40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#c9a84c' }}>
              {inversor.nombre.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e8d5a3' }}>{inversor.nombre}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Inversor desde {inversor.desde}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid #1a1a14', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#777', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c9a84c40'; (e.currentTarget as HTMLElement).style.color = '#c9a84c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a14'; (e.currentTarget as HTMLElement).style.color = '#777'; }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#777', letterSpacing: '2px', textTransform: 'uppercase' }}>Bienvenido de vuelta</p>
          <h1 style={{ margin: '8px 0 0', fontSize: 36, fontWeight: 300, color: '#f0e6c8', fontFamily: "'Georgia', serif", letterSpacing: '-1px' }}>
            {inversor.nombre.split(' ')[0]}, <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>tu cartera.</span>
          </h1>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {kpis.slice(0, 4).map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}>
          {kpis.slice(4).map((k, i) => <KpiCard key={i} {...k} />)}
        </div>

        {/* Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 3, height: 16, background: '#c9a84c', borderRadius: 2 }} />
          <p style={{ margin: 0, fontSize: 10, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '2px' }}>Tus operaciones</p>
          <div style={{ flex: 1, height: 1, background: '#15130d' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inversor.operaciones.map(op => (
            <OperacionCard key={op.id} op={op} expanded={expanded === op.id} onToggle={() => setExpanded(expanded === op.id ? null : op.id)} />
          ))}
          {inversor.operaciones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#666', fontSize: 13 }}>No hay operaciones asignadas todavía.</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: '20px 24px', background: '#0a0a08', borderRadius: 12, border: '1px solid #15130d', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
          <p style={{ margin: 0, fontSize: 11, color: '#777', lineHeight: 1.7 }}>
            Los datos mostrados son estimaciones basadas en valoraciones de mercado actuales y pueden variar.
            Para consultas contactá con tu gestor en <span style={{ color: '#c9a84c' }}>patricio@wallest.pro</span>
          </p>
        </div>
      </div>
    </div>
  );
}