import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ isConnected: false });

    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('access_token, refresh_token, token_expiry')
      .eq('user_id', userId)
      .single();

    if (!tokenData) return NextResponse.json({ isConnected: false });

    // Verificar si el token está por expirar
    const expiryTime = new Date(tokenData.token_expiry).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiryTime - now < fiveMinutes && tokenData.refresh_token) {
      // Refrescar token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
        
        await supabase
          .from('google_calendar_tokens')
          .update({ access_token: data.access_token, token_expiry: newExpiry })
          .eq('user_id', userId);
      }
    }

    return NextResponse.json({ isConnected: true });
  } catch (error) {
    return NextResponse.json({ isConnected: false });
  }
}