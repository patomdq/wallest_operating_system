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
    // Intercambiar código por tokens
    const token = await exchangeCodeForTokens(code);

    if (!token) {
      throw new Error('Failed to exchange code for tokens');
    }

    // Redirigir de vuelta al calendario con éxito
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=exchange_failed', request.url)
    );
  }
}
