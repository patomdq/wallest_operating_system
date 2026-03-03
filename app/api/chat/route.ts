if (action === 'insert_evento') {
  const { data: eventoInsertado, error } = await supabase
    .from('eventos_globales')
    .insert([data])
    .select()
    .single();

  if (error) return `Error al crear el evento: ${error.message}`;

  try {
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('access_token, refresh_token, token_expiry')
      .eq('user_id', 'fd619f67-92a0-48d6-b05a-36e8c5fcf521')
      .single();

    let accessToken = tokenData?.access_token;

    if (tokenData?.refresh_token) {
      const expiryTime = new Date(tokenData.token_expiry).getTime();
      if (expiryTime - Date.now() < 60 * 60 * 1000) {
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
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          await supabase.from('google_calendar_tokens').update({
            access_token: refreshData.access_token,
            token_expiry: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          }).eq('user_id', 'fd619f67-92a0-48d6-b05a-36e8c5fcf521');
        }
      }
    }

    if (accessToken) {
      await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: data.titulo,
          description: data.descripcion || '',
          start: { dateTime: data.fecha_inicio, timeZone: 'Europe/Madrid' },
          end: { dateTime: data.fecha_fin, timeZone: 'Europe/Madrid' },
        }),
      });
    }
  } catch (e) {
    console.error('Error sincronizando con Google:', e);
  }

  return `Evento creado: "${data.titulo}" — ${data.fecha_inicio}.`;
}