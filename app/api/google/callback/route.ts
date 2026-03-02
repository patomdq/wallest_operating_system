import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  console.log('CALLBACK STATE:', state);
  console.log('CALLBACK CODE:', code?.substring(0, 20));

  if (error) {
    return NextResponse.redirect(
      new URL(`/wallest/organizador?google_error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=no_code', request.url)
    );
  }

  // Extraer userId del state (formato: randomstring_userId)
  const parts = state?.split('_') || [];
  const userId = state?.substring(state.indexOf('_') + 1) || '';

  if (!userId) {
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=no_user', request.url)
    );
  }

  try {
    const token = await exchangeCodeForTokens(code, userId);

    if (!token) {
      throw new Error('Failed to exchange code for tokens');
    }

    return NextResponse.redirect(
      new URL('/wallest/organizador?google_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error en OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/wallest/organizador?google_error=exchange_failed', request.url)
    );
  }
}