'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/hub');
    });
  }, [mounted, router]);

  useEffect(() => {
    if (!mounted) return;
    const savedEmail = localStorage.getItem('wos-remember-email');
    if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Credenciales incorrectas. Intenta nuevamente.');
      } else if (data.session) {
        if (rememberMe) {
          localStorage.setItem('wos-remember-email', email);
        } else {
          localStorage.removeItem('wos-remember-email');
        }
        router.push('/hub');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}
    >
      <div className="w-full max-w-md space-y-4">

        {/* Logo — solo texto, sin ícono */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-white tracking-wider mb-1">WOS</h1>
          <p className="text-sm" style={{ color: '#888' }}>
            Wallest by Hasu Activos Inmobiliarios SL
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-8"
          style={{ background: '#161616', border: '1px solid #252525' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} color="#888" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}
                placeholder="Correo electrónico"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} color="#888" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm focus:outline-none"
                style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}
                placeholder="Contraseña"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f8717120', border: '1px solid #f8717140' }}>
                <AlertCircle size={18} color="#f87171" />
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-sm font-bold rounded-xl text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: '#F15A29' }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#c44a20'; }}
              onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#F15A29'; }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </span>
              ) : 'Iniciar sesión'}
            </button>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: '#F15A29' }}
                />
                <span style={{ color: '#888' }}>Recordarme</span>
              </label>
              <button
                type="button"
                style={{ color: '#888' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F15A29'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#888'}
                onClick={() => alert('Para recuperar tu contraseña, contacta al administrador.\n\nEmail: patricio@wallest.pro')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Solicitar acceso */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: '#161616', border: '1px solid #252525' }}
        >
          <p className="text-sm mb-3" style={{ color: '#888' }}>¿No tienes una cuenta?</p>
          <button
            onClick={() => alert('Para crear una cuenta, contacta al administrador.\n\nEmail: patricio@wallest.pro')}
            className="w-full py-2.5 px-4 text-sm font-medium rounded-xl border transition-all duration-200 text-white"
            style={{ borderColor: '#333', background: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#F15A29';
              (e.currentTarget as HTMLElement).style.color = '#F15A29';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#333';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
          >
            Solicitar acceso
          </button>
        </div>

        {/* Acceso Inversores */}
        <div className="text-center">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: '#222' }} />
            <span className="text-xs" style={{ color: '#555' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#222' }} />
          </div>
          <button
            onClick={() => router.push('/inversores/login')}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200"
            style={{ borderColor: '#c9a84c40', color: '#c9a84c', background: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#c9a84c12';
              (e.currentTarget as HTMLElement).style.borderColor = '#c9a84c70';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = '#c9a84c40';
            }}
          >
            <TrendingUp size={16} color="#c9a84c" />
            Acceso Inversores
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: '#333' }}>
          Desarrollado por{' '}
          <span style={{ color: '#F15A29' }}>Berciamedia</span>{' '}
          para{' '}
          <span style={{ color: '#F15A29' }}>Hasu SL</span>
        </p>

      </div>
    </div>
  );
}
