-- ═══════════════════════════════════════════════════════════════════════
-- DEMO INVESTOR — PASO 2 (ejecutar DESPUÉS de crear el usuario en el Dashboard)
-- El usuario carlos.martinez@demo.com ya debe existir en Authentication → Users
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  -- Se busca automáticamente el user_id por email (no hace falta copiarlo)
  v_user_id      uuid := (SELECT id FROM auth.users WHERE email = 'carlos.martinez@demo.com');
  v_inversor_id  uuid := 'de000ca2-cafe-0001-0000-000000000002';
  v_inmueble_id  uuid := 'de000ca2-cafe-0001-0000-000000000003';
  v_reforma_id   uuid := 'de000ca2-cafe-0001-0000-000000000004';
  v_operacion_id uuid := 'de000ca2-cafe-0001-0000-000000000005';
BEGIN

IF v_user_id IS NULL THEN
  RAISE EXCEPTION 'Usuario carlos.martinez@demo.com no encontrado. Crealo primero en Dashboard → Authentication → Users.';
END IF;

RAISE NOTICE 'Usuario encontrado: %', v_user_id;

-- ── Inmueble ──────────────────────────────────────────────────────────────
INSERT INTO inmuebles (
  id, nombre, ciudad, direccion,
  tipo, precio_compra, precio_venta,
  estado, fecha_compra, created_at, updated_at
) VALUES (
  v_inmueble_id,
  'Edificio Nexo', 'Almería', 'Calle Mediterráneo 14',
  'Edificio', 190000, 330000,
  'COMPRADO', '2026-01-15', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- ── Reforma (nombre = nombre del inmueble — el portal hace match por nombre) ─
INSERT INTO reformas (
  id, inmueble_id, nombre, etapa,
  presupuesto, avance, estado,
  fecha_inicio, fecha_fin, created_at, updated_at
) VALUES (
  v_reforma_id, v_inmueble_id,
  'Edificio Nexo',
  'Ejecución', 55000, 62, 'en_curso',
  '2026-02-01', '2026-07-31', now(), now()
) ON CONFLICT (id) DO NOTHING;

-- ── Movimientos vinculados ────────────────────────────────────────────────
INSERT INTO movimientos_empresa (id, fecha, tipo, categoria, concepto, monto, cuenta, forma_pago, proyecto_id) VALUES
  ('de000ca2-cafe-0001-0000-000000000011', '2026-01-02', 'Ingreso', 'Saldo Inicial', 'Aportación Carlos Martínez',             98000,   'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000012', '2026-01-15', 'Gasto',   'Ventas',        'Compra inmueble Edificio Nexo',         -190000,  'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000013', '2026-01-15', 'Gasto',   'Notaría',       'Notaría y Registro',                   -7600,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000014', '2026-01-20', 'Gasto',   'Impuestos',     'ITP 2%',                               -3800,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000015', '2026-02-01', 'Gasto',   'Materiales',    'Reformas Mediterráneo anticipo',       -10000,   'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000016', '2026-02-10', 'Gasto',   'Servicios',     'Electricidad Almería factura 1',       -4200,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000017', '2026-03-01', 'Gasto',   'Materiales',    'Reformas Mediterráneo certificación',  -5000,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000018', '2026-03-15', 'Gasto',   'Servicios',     'Electricidad Almería factura 2',       -4300,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id),
  ('de000ca2-cafe-0001-0000-000000000019', '2026-03-18', 'Gasto',   'Servicios',     'Pinturas García',                     -3500,    'CaixaBank JV Nexo', 'Transferencia', v_reforma_id)
ON CONFLICT (id) DO NOTHING;

-- ── Inversor ──────────────────────────────────────────────────────────────
INSERT INTO inversores (id, user_id, nombre, desde) VALUES
  (v_inversor_id, v_user_id, 'Carlos Martínez', '2026-01-02')
ON CONFLICT (id) DO UPDATE SET user_id = v_user_id;

-- ── Operación ─────────────────────────────────────────────────────────────
--   Capital Carlos:   98.000 € (40%)  |  Capital total: 245.000 €
--   Venta realista:  330.000 €        |  Beneficio bruto: 85.000 €
--   Retorno Carlos:   34.000 €        |  ROI: 34.7%
INSERT INTO inversor_operaciones (
  id, inversor_id, inmueble_id,
  capital_invertido, capital_total_operacion, participacion,
  valor_estimado_venta, retorno_estimado, retorno_propio, roi,
  duracion_meses, fecha_entrada, fecha_salida_estimada, avance
) VALUES (
  v_operacion_id, v_inversor_id, v_inmueble_id,
  98000, 245000, 40,
  330000, 85000, 34000, 34.7,
  8, '2026-01-02', '2026-09-30', 62
) ON CONFLICT (id) DO NOTHING;

-- ── Hitos (Hoja de Ruta) ──────────────────────────────────────────────────
INSERT INTO inversor_hitos (operacion_id, label, done, fecha, orden) VALUES
  (v_operacion_id, 'Firma escritura compra',     true,  '2026-01-15', 1),
  (v_operacion_id, 'Inicio reforma',             true,  '2026-02-01', 2),
  (v_operacion_id, 'Albañilería finalizada',     true,  '2026-03-10', 3),
  (v_operacion_id, 'Instalaciones completadas',  false, '2026-04-30', 4),
  (v_operacion_id, 'Carpintería y acabados',     false, '2026-05-31', 5),
  (v_operacion_id, 'Certificado final de obra',  false, '2026-06-30', 6),
  (v_operacion_id, 'Comercialización y venta',   false, '2026-09-30', 7);

-- ── Bitácora de obra ──────────────────────────────────────────────────────
INSERT INTO inversor_bitacora (operacion_id, partida, estado, fecha, orden) VALUES
  (v_operacion_id, 'Albañilería',  'finalizada', '2026-03-10', 1),
  (v_operacion_id, 'Electricidad', 'en_curso',   '2026-03-15', 2),
  (v_operacion_id, 'Fontanería',   'finalizada', '2026-03-05', 3),
  (v_operacion_id, 'Carpintería',  'pendiente',  '2026-05-01', 4),
  (v_operacion_id, 'Pintura',      'en_curso',   '2026-03-18', 5);

RAISE NOTICE '✅ Setup completo. Login en /inversores/login';
RAISE NOTICE '   Email:    carlos.martinez@demo.com';
RAISE NOTICE '   Password: Demo2026!';

END $$;
