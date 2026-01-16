import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Si el usuario canceló o hubo un error
  if (error) {
    return NextResponse.redirect(
      new URL(`/wallest/organizador?google_error=${error}`, request.url)
    );
  }

  // Si no hay código, error
  if (!code) {
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=no_code', request.url)
    );
  }

  try {
    console.log('🔄 [Callback] Procesando callback de Google OAuth');
    console.log('🔄 [Callback] Code recibido:', code.substring(0, 20) + '...');
    
    // Intercambiar código por tokens
    const token = await exchangeCodeForTokens(code);

    if (!token) {
      console.error('❌ [Callback] exchangeCodeForTokens devolvió null');
      throw new Error('Failed to exchange code for tokens - token is null');
    }

    console.log('✅ [Callback] Token guardado exitosamente, redirigiendo...');
    
    // Redirigir de vuelta al calendario con éxito
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_connected=true', request.url)
    );
  } catch (error) {
    // 🔍 LOGGING DETALLADO del error
    console.error('❌ [Callback] Error completo en OAuth callback:');
    console.error('  - Message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('  - Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('  - Full error object:', error);
    
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=exchange_failed', request.url)
    );
  }
}
