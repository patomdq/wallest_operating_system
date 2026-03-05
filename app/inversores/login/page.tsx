'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function InversorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user is an inversor
        const { data } = await supabase
          .from('inversores')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        if (data) router.push('/inversores');
      }
    });
  }, [mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Credenciales incorrectas. Intenta nuevamente.');
        return;
      }
      if (data.session) {
        // Verify it's an inversor account
        const { data: inversorData } = await supabase
          .from('inversores')
          .select('id')
          .eq('user_id', data.session.user.id)
          .single();

        if (!inversorData) {
          await supabase.auth.signOut();
          setError('Esta cuenta no tiene acceso al portal de inversores.');
          return;
        }
        router.push('/inversores');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070705',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #c9a84c, #a07830)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#070705',
            margin: '0 auto 16px',
          }}>H</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#c9a84c', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Portal Inversor
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#444', letterSpacing: '0.5px' }}>
            Hasu Activos Inmobiliarios
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'linear-gradient(160deg, #0f0e0a, #0a0a08)',
          border: '1px solid #1a1812',
          borderRadius: 20,
          padding: 32,
        }}>
          {/* Top gold line */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, #c9a84c60, #c9a84c00)', marginBottom: 28, marginTop: -32, marginLeft: -32, marginRight: -32, borderRadius: '20px 20px 0 0' }} />

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                  <Mail size={16} color="#555" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    background: '#070705', border: '1px solid #1a1812',
                    borderRadius: 12, color: '#f0e6c8', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = '#c9a84c40'}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = '#1a1812'}
                />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                  <Lock size={16} color="#555" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  style={{
                    width: '100%', padding: '12px 40px 12px 40px',
                    background: '#070705', border: '1px solid #1a1812',
                    borderRadius: 12, color: '#f0e6c8', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = '#c9a84c40'}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = '#1a1812'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} color="#555" /> : <Eye size={16} color="#555" />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8717115', border: '1px solid #f8717130', borderRadius: 10 }}>
                  <AlertCircle size={15} color="#f87171" />
                  <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg, #c9a84c, #a07830)',
                  border: 'none', borderRadius: 12,
                  color: '#070705', fontSize: 13, fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  letterSpacing: '0.5px',
                  fontFamily: 'inherit',
                  marginTop: 4,
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #070705', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    Accediendo...
                  </span>
                ) : 'Acceder a mi cartera'}
              </button>

            </div>
          </form>
        </div>

        {/* Back to WOS */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            href="/login"
            style={{ fontSize: 11, color: '#333', textDecoration: 'none', letterSpacing: '0.5px' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c9a84c'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#333'}
          >
            ← Acceso equipo WOS
          </a>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
