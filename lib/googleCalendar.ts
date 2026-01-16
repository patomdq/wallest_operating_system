// ============================================
// Google Calendar Integration Service
// ============================================

import { supabase } from './supabase';

// Tipos
export interface GoogleCalendarToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  scope: string;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  status?: string;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  totalEvents: number;
  syncedEvents: number;
  pendingEvents: number;
  errorEvents: number;
}

// Configuración de Google OAuth
// En producción (Vercel), estas variables se leen de las Environment Variables del dashboard de Vercel
// En desarrollo, se leen del archivo .env.local
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''; // NO debe ser NEXT_PUBLIC (por seguridad)

// Redirect URI: DEBE coincidir EXACTAMENTE con el configurado en Google Console
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
  (typeof window !== 'undefined' 
    ? `${window.location.origin}/api/google/callback` 
    : 'https://wallest-operating-system.vercel.app/api/google/callback');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
].join(' ');

// ============================================
// Autenticación con Google
// ============================================

/**
 * Genera la URL de autenticación de Google OAuth2
 */
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: generateState()
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Genera un estado aleatorio para CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Intercambia el código de autorización por tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleCalendarToken | null> {
  try {
    // 🔍 LOGGING: Verificar que las variables NO sean undefined
    console.log('🔐 [OAuth Exchange] Iniciando intercambio de código por tokens');
    console.log('🔐 [OAuth Exchange] Variables de entorno:');
    console.log('  - GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : '❌ UNDEFINED');
    console.log('  - GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✓ Definido (no se muestra)' : '❌ UNDEFINED');
    console.log('  - REDIRECT_URI:', REDIRECT_URI || '❌ UNDEFINED');
    console.log('  - Code length:', code?.length || 0);

    // Verificar que todas las variables necesarias estén definidas
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
      console.error('❌ [OAuth Exchange] Variables de entorno faltantes:');
      if (!GOOGLE_CLIENT_ID) console.error('  - GOOGLE_CLIENT_ID no está definido');
      if (!GOOGLE_CLIENT_SECRET) console.error('  - GOOGLE_CLIENT_SECRET no está definido');
      if (!REDIRECT_URI) console.error('  - REDIRECT_URI no está definido');
      throw new Error('Missing required environment variables');
    }

    const requestBody = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    console.log('📤 [OAuth Exchange] Enviando request a Google con redirect_uri:', REDIRECT_URI);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    const data = await response.json();

    if (!response.ok) {
      // 🔍 LOGGING: Detalles completos del error de Google
      console.error('❌ [OAuth Exchange] Error de Google:');
      console.error('  - Status:', response.status);
      console.error('  - Status Text:', response.statusText);
      console.error('  - Error:', data.error);
      console.error('  - Error Description:', data.error_description);
      console.error('  - Body completo:', JSON.stringify(data, null, 2));
      
      throw new Error(`Google OAuth error: ${data.error} - ${data.error_description || 'No description'}`);
    }

    console.log('✅ [OAuth Exchange] Tokens recibidos exitosamente');
    
    // Calcular fecha de expiración
    const expiresIn = data.expires_in || 3600; // Default 1 hora
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Guardar tokens en Supabase
    const tokenData = {
      user_id: user.id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expiry: tokenExpiry,
      scope: SCOPES,
    };

    const { data: savedToken, error } = await supabase
      .from('google_calendar_tokens')
      .upsert(tokenData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return savedToken;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    
    // Calcular nueva fecha de expiración
    const expiresIn = data.expires_in || 3600;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Actualizar token en Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: data.access_token,
        token_expiry: tokenExpiry,
      })
      .eq('user_id', user.id);

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

/**
 * Obtiene el token válido (refresca si es necesario)
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: tokenData, error } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !tokenData) return null;

    // Verificar si el token está expirado o a punto de expirar (5 minutos antes)
    const expiryTime = new Date(tokenData.token_expiry).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiryTime - now < fiveMinutes) {
      // Token expirado o por expirar, refrescar
      return await refreshAccessToken(tokenData.refresh_token);
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
}

/**
 * Desconecta la cuenta de Google Calendar
 */
export async function disconnectGoogleCalendar(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Revocar token en Google
    const token = await getValidAccessToken();
    if (token) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
      });
    }

    // Eliminar tokens de Supabase
    const { error } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return false;
  }
}

// ============================================
// Operaciones con Google Calendar API
// ============================================

/**
 * Lista eventos de Google Calendar
 */
export async function listGoogleEvents(
  timeMin?: string,
  timeMax?: string
): Promise<GoogleEvent[]> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw new Error('No valid access token');

    const params = new URLSearchParams({
      maxResults: '250',
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error listing Google events:', error);
    return [];
  }
}

/**
 * Crea un evento en Google Calendar
 */
export async function createGoogleEvent(event: {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
}): Promise<GoogleEvent | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw new Error('No valid access token');

    const googleEvent = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Google event:', error);
    return null;
  }
}

/**
 * Actualiza un evento en Google Calendar
 */
export async function updateGoogleEvent(
  eventId: string,
  event: {
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
  }
): Promise<GoogleEvent | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw new Error('No valid access token');

    const googleEvent = {
      summary: event.title,
      description: event.description || '',
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating Google event:', error);
    return null;
  }
}

/**
 * Elimina un evento de Google Calendar
 */
export async function deleteGoogleEvent(eventId: string): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw new Error('No valid access token');

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting Google event:', error);
    return false;
  }
}

// ============================================
// Sincronización
// ============================================

/**
 * Obtiene el estado de sincronización del usuario
 */
export async function getSyncStatus(): Promise<SyncStatus | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Verificar si hay token válido
    const token = await getValidAccessToken();
    const isConnected = !!token;

    // Obtener estadísticas de sincronización
    const { data, error } = await supabase
      .rpc('get_sync_status', { p_user_id: user.id });

    if (error) throw error;

    if (data && data.length > 0) {
      const stats = data[0];
      return {
        isConnected,
        lastSync: stats.last_sync,
        totalEvents: parseInt(stats.total_events) || 0,
        syncedEvents: parseInt(stats.synced_events) || 0,
        pendingEvents: parseInt(stats.pending_events) || 0,
        errorEvents: parseInt(stats.error_events) || 0,
      };
    }

    return {
      isConnected,
      lastSync: null,
      totalEvents: 0,
      syncedEvents: 0,
      pendingEvents: 0,
      errorEvents: 0,
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return null;
  }
}

/**
 * Sincroniza eventos desde WOS a Google Calendar
 */
export async function syncEventToGoogle(eventoId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Obtener evento de WOS
    const { data: evento, error: eventoError } = await supabase
      .from('eventos_globales')
      .select('*')
      .eq('id', eventoId)
      .single();

    if (eventoError || !evento) throw new Error('Event not found');

    // No sincronizar eventos que vienen de Google
    if (evento.is_google_event) return true;

    // Verificar si ya existe sincronización
    const { data: existingSync } = await supabase
      .from('google_calendar_sync')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('user_id', user.id)
      .single();

    let googleEventId: string;

    if (existingSync) {
      // Actualizar evento existente en Google
      const updated = await updateGoogleEvent(existingSync.google_event_id, {
        title: evento.titulo,
        description: evento.descripcion || '',
        startDateTime: evento.fecha_inicio,
        endDateTime: evento.fecha_fin,
      });

      if (!updated) throw new Error('Failed to update Google event');
      googleEventId = updated.id;
    } else {
      // Crear nuevo evento en Google
      const created = await createGoogleEvent({
        title: evento.titulo,
        description: evento.descripcion || '',
        startDateTime: evento.fecha_inicio,
        endDateTime: evento.fecha_fin,
      });

      if (!created) throw new Error('Failed to create Google event');
      googleEventId = created.id;

      // Crear registro de sincronización
      await supabase.from('google_calendar_sync').insert({
        evento_id: eventoId,
        google_event_id: googleEventId,
        user_id: user.id,
        sync_status: 'synced',
      });
    }

    // Actualizar registro de sincronización
    await supabase
      .from('google_calendar_sync')
      .update({
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('evento_id', eventoId)
      .eq('user_id', user.id);

    return true;
  } catch (error) {
    console.error('Error syncing event to Google:', error);
    
    // Registrar error en la sincronización
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('google_calendar_sync')
        .update({
          sync_status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('evento_id', eventoId)
        .eq('user_id', user.id);
    }

    return false;
  }
}

/**
 * Sincroniza eventos desde Google Calendar a WOS
 */
export async function syncEventsFromGoogle(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Obtener eventos de Google de los próximos 3 meses
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const googleEvents = await listGoogleEvents(timeMin, timeMax);
    let syncedCount = 0;

    for (const googleEvent of googleEvents) {
      // Verificar si el evento ya existe en WOS
      const { data: existingEvent } = await supabase
        .from('eventos_globales')
        .select('*')
        .eq('google_event_id', googleEvent.id)
        .single();

      const startDateTime = googleEvent.start.dateTime || googleEvent.start.date || '';
      const endDateTime = googleEvent.end.dateTime || googleEvent.end.date || '';

      if (!startDateTime || !endDateTime) continue;

      if (existingEvent) {
        // Actualizar evento existente
        await supabase
          .from('eventos_globales')
          .update({
            titulo: googleEvent.summary || 'Sin título',
            descripcion: googleEvent.description || null,
            fecha_inicio: startDateTime,
            fecha_fin: endDateTime,
          })
          .eq('id', existingEvent.id);
      } else {
        // Crear nuevo evento
        const { data: newEvent } = await supabase
          .from('eventos_globales')
          .insert({
            titulo: googleEvent.summary || 'Sin título',
            descripcion: googleEvent.description || null,
            fecha_inicio: startDateTime,
            fecha_fin: endDateTime,
            is_google_event: true,
            google_event_id: googleEvent.id,
            recordatorio: false,
          })
          .select()
          .single();

        if (newEvent) {
          // Crear registro de sincronización
          await supabase.from('google_calendar_sync').insert({
            evento_id: newEvent.id,
            google_event_id: googleEvent.id,
            user_id: user.id,
            sync_status: 'synced',
          });
        }
      }

      syncedCount++;
    }

    return syncedCount;
  } catch (error) {
    console.error('Error syncing events from Google:', error);
    return 0;
  }
}

/**
 * Elimina sincronización de un evento
 */
export async function unsyncEvent(eventoId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Obtener información de sincronización
    const { data: syncData } = await supabase
      .from('google_calendar_sync')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('user_id', user.id)
      .single();

    if (syncData) {
      // Eliminar evento de Google Calendar
      await deleteGoogleEvent(syncData.google_event_id);

      // Eliminar registro de sincronización
      await supabase
        .from('google_calendar_sync')
        .delete()
        .eq('evento_id', eventoId)
        .eq('user_id', user.id);
    }

    return true;
  } catch (error) {
    console.error('Error unsyncing event:', error);
    return false;
  }
}
