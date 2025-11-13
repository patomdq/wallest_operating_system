'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
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

  // Verificar si está montado (para evitar problemas con SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar si ya está autenticado
  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [mounted, router]);

  // Cargar credenciales guardadas si "Recordarme" está activado
  useEffect(() => {
    if (!mounted) return;
    
    const savedEmail = localStorage.getItem('wos-remember-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Credenciales incorrectas. Intenta nuevamente.');
      } else if (data.session) {
        // Guardar email si "Recordarme" está activado
        if (rememberMe) {
          localStorage.setItem('wos-remember-email', email);
        } else {
          localStorage.removeItem('wos-remember-email');
        }
        
        // Redirigir al dashboard
        router.push('/');
      }
    } catch (error) {
      console.error('Error de login:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // No renderizar nada hasta que esté montado
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-wos-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-wos-accent tracking-wider">
              WOS
            </h1>
            <p className="text-wos-text-muted text-lg mt-2">
              Wallest Operating System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-wos-card border border-wos-border rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-wos-text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-wos-border rounded-lg bg-wos-bg text-wos-text placeholder-wos-text-muted focus:ring-2 focus:ring-wos-accent focus:border-wos-accent transition-colors"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-wos-text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-wos-border rounded-lg bg-wos-bg text-wos-text placeholder-wos-text-muted focus:ring-2 focus:ring-wos-accent focus:border-wos-accent transition-colors"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-wos-text-muted hover:text-wos-text" />
                  ) : (
                    <Eye size={20} className="text-wos-text-muted hover:text-wos-text" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-wos-accent hover:bg-wos-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wos-accent focus:ring-offset-wos-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-wos-accent focus:ring-wos-accent border-wos-border rounded bg-wos-bg"
                />
                <span className="ml-2 text-wos-text-muted">Recordarme</span>
              </label>

              <a
                href="#"
                className="text-wos-accent hover:text-wos-accent/80 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Para recuperar tu contraseña, contacta al administrador del sistema.');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-wos-text-muted text-sm">
            Desarrollado por{' '}
            <span className="font-medium text-wos-accent">Berciamedia</span>{' '}
            para{' '}
            <span className="font-medium text-wos-accent">Hasu SL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
