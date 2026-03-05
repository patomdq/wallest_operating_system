'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

type Hito = {
  label: string;
  done: boolean;
  fecha: string;
  orden: number;
};

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
};

type Inversor = {
  nombre: string;
  desde: string;
  operaciones: Operacion[];
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, step);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{Math.floor(val).toLocaleString('es-ES')}{suffix}</span>;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ hitos }: { hitos: Hito[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1, background: 'linear-gradient(180deg, #c9a84c40, #c9a84c10)' }} />
      {hitos.sort((a, b) => a.orden - b.orden).map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 2,
            background: h.done ? '#c9a84c' : '#1a1a1a',
            border: h.done ? '2px solid #c9a84c' : '2px solid #333',
            boxShadow: h.done ? '0 0 8px #c9a84c60' : 'none',
            position: 'relative', left: -17,
          }} />
          <div style={{ flex: 1, marginLeft: -14 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: h.done ? 600 : 400, color: h.done ? '#e8d5a3' : '#aaa' }}>{h.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: h.done ? '#c9a84c' : '#666' }}>{h.fecha}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, animated = false }: { label: string; value: string; sub: string; color: string; animated?: boolean }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e0a, #0a0a08)',
      border: '1px solid #1a1812', borderRadius: 16, padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${color}60, ${color}00)` }} />
      <p style={{ margin: 0, fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</p>
      <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ margin: '5px 0 0', fontSize: 10, color: '#444' }}>{sub}</p>
    </div>
  );
}

// ─── Operación Card ───────────────────────────────────────────────────────────
function OperacionCard({ op, expanded, onToggle }: { op: Operacion; expanded: boolean; onToggle: () => void }) {
  // Retorno anualizado = (retorno_propio / capital_invertido) / (duracion_meses / 12) * 100
  const retornoAnualizado = op.duracion_meses > 0
    ? ((op.retorno_propio / op.capital_invertido) / (op.duracion_meses / 12) * 100).toFixed(1)
    : '—';

  return (
    <div style={{
      background: 'linear-gradient(160deg, #111008 0%, #0c0c0a 100%)',
      border: `1px solid ${expanded ? '#c9a84c50' : '#1e1c16'}`,
      borderRadius: 20, overflow: 'hidden',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: expanded ? '0 0 40px #c9a84c10' : 'none',
    }}>
      {/* Header */}
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
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0e6c8', letterSpacing: '-0.3px' }}>{op.inmueble_nombre}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>📍 {op.inmueble_ubicacion}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>TU RETORNO EST.</p>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, color: '#4ade80' }}>+{fmt(op.retorno_propio)}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4ade80aa' }}>+{op.roi.toFixed(1)}% ROI</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Avance de obra</span>
            <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 700 }}>{op.avance}%</span>
          </div>
          <div style={{ height: 3, background: '#1a1a14', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${op.avance}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #c9a84c, #e8c97a)', transition: 'width 1.2s ease' }} />
          </div>
        </div>

        {/* 6 mini metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
          {[
            { l: 'Tu capital invertido', v: fmt(op.capital_invertido), c: '#c9a84c' },
            { l: 'Capital total operación', v: fmt(op.capital_total_operacion), c: '#888' },
            { l: 'Valor estimado venta', v: fmt(op.valor_estimado_venta), c: '#f0e6c8' },
            { l: 'Retorno operación total', v: fmt(op.retorno_estimado), c: '#888' },
            { l: 'Duración estimada', v: `${op.duracion_meses} meses`, c: '#888' },
            { l: 'Retorno anualizado', v: `+${retornoAnualizado}%`, c: '#60a5fa' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#0d0d0a', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.l}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: m.c }}>{m.v}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 10, color: '#444', letterSpacing: '1px' }}>
            {expanded ? '▲ OCULTAR DETALLE' : '▼ VER DETALLE'}
          </span>
        </div>
      </div>

      {/* Expanded timeline */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a14', padding: '24px 28px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Hoja de ruta de la operación
          </p>
          <Timeline hitos={op.hitos} />
          <p style={{ margin: '20px 0 0', fontSize: 11, color: '#888', borderTop: '1px solid #15130d', paddingTop: 16 }}>
            Salida estimada: <span style={{ color: '#c9a84c' }}>{op.fecha_salida_estimada}</span>
            &nbsp;·&nbsp; Para consultas contactá con tu gestor Hasu.
          </p>
        </div>
      )}
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
        .from('inversores')
        .select('id, nombre, desde')
        .eq('user_id', session.user.id)
        .single();

      if (invError || !inversorData) { router.push('/inversores/login'); return; }

      const { data: operacionesData } = await supabase
        .from('inversor_operaciones')
        .select(`
          id, capital_invertido, capital_total_operacion, participacion,
          valor_estimado_venta, retorno_estimado, retorno_propio, roi,
          duracion_meses, fecha_entrada, fecha_salida_estimada, avance,
          inmuebles ( nombre, estado )
        `)
        .eq('inversor_id', inversorData.id);

      const operacionesConHitos: Operacion[] = [];
      for (const op of operacionesData || []) {
        const { data: hitos } = await supabase
          .from('inversor_hitos')
          .select('label, done, fecha, orden')
          .eq('operacion_id', op.id)
          .order('orden');

        operacionesConHitos.push({
          id: op.id,
          inmueble_nombre: (op.inmuebles as any)?.nombre || 'Operación',
          inmueble_ubicacion: 'Almería',
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
        });
      }

      setInversor({ nombre: inversorData.nombre, desde: inversorData.desde, operaciones: operacionesConHitos });
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

  // KPIs globales
  const miCapital = inversor.operaciones.reduce((a, b) => a + b.capital_invertido, 0);
  const capitalTotal = inversor.operaciones.reduce((a, b) => a + b.capital_total_operacion, 0);
  const miRetorno = inversor.operaciones.reduce((a, b) => a + b.retorno_propio, 0);
  const retornoTotal = inversor.operaciones.reduce((a, b) => a + b.retorno_estimado, 0);
  const roiMedio = miCapital > 0 ? ((miRetorno / miCapital) * 100).toFixed(1) : '0.0';
  const duracionMedia = inversor.operaciones.length > 0
    ? Math.round(inversor.operaciones.reduce((a, b) => a + b.duracion_meses, 0) / inversor.operaciones.length)
    : 0;
  const retornoAnualizadoGlobal = duracionMedia > 0
    ? ((miRetorno / miCapital) / (duracionMedia / 12) * 100).toFixed(1)
    : '0.0';

  const kpis = [
    { label: 'Capital total operación', value: fmt(capitalTotal), sub: 'Inversión total de la JV', color: '#888' },
    { label: 'Tu capital invertido', value: fmt(miCapital), sub: `${inversor.operaciones.length} operación${inversor.operaciones.length !== 1 ? 'es' : ''} activa${inversor.operaciones.length !== 1 ? 's' : ''}`, color: '#c9a84c' },
    { label: 'ROI estimado', value: `+${roiMedio}%`, sub: 'Sobre tu capital', color: '#60a5fa' },
    { label: 'Retorno operación total', value: fmt(retornoTotal), sub: 'Beneficio bruto total', color: '#888' },
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
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid #1a1a14', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c9a84c40'; (e.currentTarget as HTMLElement).style.color = '#c9a84c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a14'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#999', letterSpacing: '2px', textTransform: 'uppercase' }}>Bienvenido de vuelta</p>
          <h1 style={{ margin: '8px 0 0', fontSize: 36, fontWeight: 300, color: '#f0e6c8', fontFamily: "'Georgia', serif", letterSpacing: '-1px' }}>
            {inversor.nombre.split(' ')[0]}, <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>tu cartera.</span>
          </h1>
        </div>

        {/* KPI grid — 4 cols top row, 3 cols bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {kpis.slice(0, 4).map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}>
          {kpis.slice(4).map((k, i) => <KpiCard key={i} {...k} />)}
        </div>

        {/* Operaciones */}
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
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', fontSize: 13 }}>No hay operaciones asignadas todavía.</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: '20px 24px', background: '#0a0a08', borderRadius: 12, border: '1px solid #15130d', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
          <p style={{ margin: 0, fontSize: 11, color: '#888', lineHeight: 1.7 }}>
            Los datos mostrados son estimaciones basadas en valoraciones de mercado actuales y pueden variar.
            Para consultas contactá con tu gestor en <span style={{ color: '#c9a84c' }}>patricio@wallest.pro</span>
          </p>
        </div>
      </div>
    </div>
  );
}
