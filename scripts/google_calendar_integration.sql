-- ============================================
-- Script de Base de Datos para Integración Google Calendar
-- ============================================

-- Tabla para almacenar tokens de autenticación de Google
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_google_tokens_user ON google_calendar_tokens(user_id);

-- Tabla para mapear eventos entre WOS y Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_globales(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  google_calendar_id TEXT NOT NULL DEFAULT 'primary',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced', -- 'synced', 'pending', 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id),
  UNIQUE(google_event_id, user_id)
);

-- Índices para la tabla de sincronización
CREATE INDEX IF NOT EXISTS idx_sync_evento ON google_calendar_sync(evento_id);
CREATE INDEX IF NOT EXISTS idx_sync_google_event ON google_calendar_sync(google_event_id);
CREATE INDEX IF NOT EXISTS idx_sync_user ON google_calendar_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_status ON google_calendar_sync(sync_status);

-- Agregar columna para identificar eventos importados de Google
ALTER TABLE eventos_globales ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE eventos_globales ADD COLUMN IF NOT EXISTS is_google_event BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_eventos_google_id ON eventos_globales(google_event_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_calendar_tokens;
CREATE TRIGGER update_google_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_sync_updated_at ON google_calendar_sync;
CREATE TRIGGER update_google_sync_updated_at
  BEFORE UPDATE ON google_calendar_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Políticas RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_sync ENABLE ROW LEVEL SECURITY;

-- Políticas para google_calendar_tokens
DROP POLICY IF EXISTS "Users can view own tokens" ON google_calendar_tokens;
CREATE POLICY "Users can view own tokens"
  ON google_calendar_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tokens" ON google_calendar_tokens;
CREATE POLICY "Users can insert own tokens"
  ON google_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tokens" ON google_calendar_tokens;
CREATE POLICY "Users can update own tokens"
  ON google_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tokens" ON google_calendar_tokens;
CREATE POLICY "Users can delete own tokens"
  ON google_calendar_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para google_calendar_sync
DROP POLICY IF EXISTS "Users can view own sync records" ON google_calendar_sync;
CREATE POLICY "Users can view own sync records"
  ON google_calendar_sync
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sync records" ON google_calendar_sync;
CREATE POLICY "Users can insert own sync records"
  ON google_calendar_sync
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sync records" ON google_calendar_sync;
CREATE POLICY "Users can update own sync records"
  ON google_calendar_sync
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sync records" ON google_calendar_sync;
CREATE POLICY "Users can delete own sync records"
  ON google_calendar_sync
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Funciones de utilidad
-- ============================================

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM google_calendar_tokens
  WHERE token_expiry < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estado de sincronización de un usuario
CREATE OR REPLACE FUNCTION get_sync_status(p_user_id UUID)
RETURNS TABLE(
  total_events BIGINT,
  synced_events BIGINT,
  pending_events BIGINT,
  error_events BIGINT,
  is_connected BOOLEAN,
  last_sync TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT e.id) as total_events,
    COUNT(DISTINCT CASE WHEN s.sync_status = 'synced' THEN s.id END) as synced_events,
    COUNT(DISTINCT CASE WHEN s.sync_status = 'pending' THEN s.id END) as pending_events,
    COUNT(DISTINCT CASE WHEN s.sync_status = 'error' THEN s.id END) as error_events,
    EXISTS(SELECT 1 FROM google_calendar_tokens WHERE user_id = p_user_id AND token_expiry > NOW()) as is_connected,
    MAX(s.last_synced_at) as last_sync
  FROM eventos_globales e
  LEFT JOIN google_calendar_sync s ON s.evento_id = e.id AND s.user_id = p_user_id
  WHERE e.created_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Datos de ejemplo y verificación
-- ============================================

-- Comentar estas líneas después de verificar
-- SELECT 'Tablas creadas correctamente' as status;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%google%';
-- SELECT 'Índices creados' as status;
-- SELECT indexname FROM pg_indexes WHERE tablename LIKE '%google%';
