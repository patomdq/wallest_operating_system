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

    if (!tokenData?.refresh_token) return NextResponse.json({ isConnected: false });

    const expiryTime = new Date(tokenData.token_expiry).getTime();
    const isExpired = expiryTime - Date.now() < 60 * 60 * 1000;

    if (isExpired) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) return NextResponse.json({ isConnected: false });

      const refreshData = await refreshResponse.json();
      await supabase.from('google_calendar_tokens').update({
        access_token: refreshData.access_token,
        token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      }).eq('user_id', userId);
    }

    return NextResponse.json({ isConnected: true });
  } catch {
    return NextResponse.json({ isConnected: false });
  }
}