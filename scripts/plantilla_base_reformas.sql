-- ========================================
-- PLANTILLA BASE DE PARTIDAS E ÍTEMS
-- ========================================
-- Este script inserta los datos base para el planificador de reformas

-- Limpiar datos existentes (solo para desarrollo/testing)
-- DESCOMENTA ESTAS LÍNEAS SI QUIERES REINICIAR LA PLANTILLA
-- DELETE FROM items_plantilla;
-- DELETE FROM partidas_plantilla;

-- ========================================
-- INSERTAR PARTIDAS BASE
-- ========================================

INSERT INTO partidas_plantilla (id, nombre, categoria, orden) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electricidad', 'obra', 1),
  ('22222222-2222-2222-2222-222222222222', 'Pintura', 'obra', 2),
  ('33333333-3333-3333-3333-333333333333', 'Albañilería', 'obra', 3),
  ('44444444-4444-4444-4444-444444444444', 'Fontanería', 'obra', 4),
  ('55555555-5555-5555-5555-555555555555', 'Carpintería', 'obra', 5),
  ('66666666-6666-6666-6666-666666666666', 'Cerrajería', 'obra', 6),
  ('77777777-7777-7777-7777-777777777777', 'Iluminación', 'materiales', 7),
  ('88888888-8888-8888-8888-888888888888', 'Suelos y rodapiés', 'materiales', 8),
  ('99999999-9999-9999-9999-999999999999', 'Puertas y herrajes', 'materiales', 9),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventanas / aluminio', 'materiales', 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cocina – mobiliario', 'mobiliario', 11),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cocina – encimera y fregadero', 'materiales', 12),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Electrodomésticos', 'electro', 13),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Baño – sanitarios y grifería', 'materiales', 14),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Baño – mobiliario y espejo', 'mobiliario', 15),
  ('10101010-1010-1010-1010-101010101010', 'Mobiliario salón', 'mobiliario', 16),
  ('20202020-2020-2020-2020-202020202020', 'Mobiliario comedor', 'mobiliario', 17),
  ('30303030-3030-3030-3030-303030303030', 'Mobiliario habitaciones', 'mobiliario', 18),
  ('40404040-4040-4040-4040-404040404040', 'Textiles y decoración', 'decoracion', 19),
  ('50505050-5050-5050-5050-505050505050', 'Limpieza final / retirada', 'otros', 20),
  ('60606060-6060-6060-6060-606060606060', 'Otros', 'otros', 21)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- INSERTAR ÍTEMS BASE POR PARTIDA
-- ========================================

-- 1. ELECTRICIDAD
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cuadro eléctrico', 1),
  ('11111111-1111-1111-1111-111111111111', 'Cableado general', 2),
  ('11111111-1111-1111-1111-111111111111', 'Enchufes', 3),
  ('11111111-1111-1111-1111-111111111111', 'Interruptores', 4),
  ('11111111-1111-1111-1111-111111111111', 'Puntos de luz', 5),
  ('11111111-1111-1111-1111-111111111111', 'Mano de obra electricista', 6)
ON CONFLICT DO NOTHING;

-- 2. PINTURA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Pintura paredes', 1),
  ('22222222-2222-2222-2222-222222222222', 'Pintura techos', 2),
  ('22222222-2222-2222-2222-222222222222', 'Lacado puertas', 3),
  ('22222222-2222-2222-2222-222222222222', 'Papel pintado (si aplica)', 4),
  ('22222222-2222-2222-2222-222222222222', 'Mano de obra pintor', 5)
ON CONFLICT DO NOTHING;

-- 3. ALBAÑILERÍA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Demoliciones', 1),
  ('33333333-3333-3333-3333-333333333333', 'Levantamiento tabiques', 2),
  ('33333333-3333-3333-3333-333333333333', 'Enfoscados', 3),
  ('33333333-3333-3333-3333-333333333333', 'Soleras', 4),
  ('33333333-3333-3333-3333-333333333333', 'Alicatados', 5),
  ('33333333-3333-3333-3333-333333333333', 'Mano de obra albañil', 6)
ON CONFLICT DO NOTHING;

-- 4. FONTANERÍA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Tuberías agua fría', 1),
  ('44444444-4444-4444-4444-444444444444', 'Tuberías agua caliente', 2),
  ('44444444-4444-4444-4444-444444444444', 'Desagües', 3),
  ('44444444-4444-4444-4444-444444444444', 'Llaves de paso', 4),
  ('44444444-4444-4444-4444-444444444444', 'Mano de obra fontanero', 5)
ON CONFLICT DO NOTHING;

-- 5. CARPINTERÍA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Armarios empotrados', 1),
  ('55555555-5555-5555-5555-555555555555', 'Estanterías', 2),
  ('55555555-5555-5555-5555-555555555555', 'Muebles a medida', 3),
  ('55555555-5555-5555-5555-555555555555', 'Mano de obra carpintero', 4)
ON CONFLICT DO NOTHING;

-- 6. CERRAJERÍA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('66666666-6666-6666-6666-666666666666', 'Puerta de entrada', 1),
  ('66666666-6666-6666-6666-666666666666', 'Cerradura blindada', 2),
  ('66666666-6666-6666-6666-666666666666', 'Mirilla', 3),
  ('66666666-6666-6666-6666-666666666666', 'Bombin', 4),
  ('66666666-6666-6666-6666-666666666666', 'Mano de obra cerrajero', 5)
ON CONFLICT DO NOTHING;

-- 7. ILUMINACIÓN
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Lámpara salón', 1),
  ('77777777-7777-7777-7777-777777777777', 'Lámpara comedor', 2),
  ('77777777-7777-7777-7777-777777777777', 'Lámparas habitaciones', 3),
  ('77777777-7777-7777-7777-777777777777', 'Focos LED empotrables', 4),
  ('77777777-7777-7777-7777-777777777777', 'Apliques', 5)
ON CONFLICT DO NOTHING;

-- 8. SUELOS Y RODAPIÉS
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('88888888-8888-8888-8888-888888888888', 'Tarima flotante', 1),
  ('88888888-8888-8888-8888-888888888888', 'Rodapiés', 2),
  ('88888888-8888-8888-8888-888888888888', 'Mano de obra instalación', 3)
ON CONFLICT DO NOTHING;

-- 9. PUERTAS Y HERRAJES
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('99999999-9999-9999-9999-999999999999', 'Puerta interior habitación 1', 1),
  ('99999999-9999-9999-9999-999999999999', 'Puerta interior habitación 2', 2),
  ('99999999-9999-9999-9999-999999999999', 'Puerta interior habitación 3', 3),
  ('99999999-9999-9999-9999-999999999999', 'Puerta baño', 4),
  ('99999999-9999-9999-9999-999999999999', 'Puerta cocina', 5),
  ('99999999-9999-9999-9999-999999999999', 'Manillas y bisagras', 6)
ON CONFLICT DO NOTHING;

-- 10. VENTANAS / ALUMINIO
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana salón', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana cocina', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana habitación 1', 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana habitación 2', 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana habitación 3', 5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ventana baño', 6)
ON CONFLICT DO NOTHING;

-- 11. COCINA – MOBILIARIO
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Muebles bajos', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Muebles altos', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Columna horno/frigo', 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tirador', 4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mano de obra montaje', 5)
ON CONFLICT DO NOTHING;

-- 12. COCINA – ENCIMERA Y FREGADERO
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Encimera', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fregadero', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Grifo cocina', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sifón', 4)
ON CONFLICT DO NOTHING;

-- 13. ELECTRODOMÉSTICOS (⚠️ OBLIGATORIO Y DETALLADO)
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Frigorífico', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Horno', 2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Vitrocerámica', 3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Campana extractora', 4),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lavadora', 5),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lavavajillas', 6),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Termo / calentador', 7),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Microondas', 8),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'TV', 9)
ON CONFLICT DO NOTHING;

-- 14. BAÑO – SANITARIOS Y GRIFERÍA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Inodoro', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Lavabo', 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Plato ducha', 3),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mampara', 4),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Grifo lavabo', 5),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Grifo ducha', 6),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Accesorios (toallero, portarrollos, etc.)', 7)
ON CONFLICT DO NOTHING;

-- 15. BAÑO – MOBILIARIO Y ESPEJO
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mueble lavabo', 1),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Espejo', 2),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Aplique iluminación espejo', 3)
ON CONFLICT DO NOTHING;

-- 16. MOBILIARIO SALÓN
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('10101010-1010-1010-1010-101010101010', 'Sofá', 1),
  ('10101010-1010-1010-1010-101010101010', 'Mesa centro', 2),
  ('10101010-1010-1010-1010-101010101010', 'Estantería/Librería', 3),
  ('10101010-1010-1010-1010-101010101010', 'Mueble TV', 4)
ON CONFLICT DO NOTHING;

-- 17. MOBILIARIO COMEDOR
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('20202020-2020-2020-2020-202020202020', 'Mesa comedor', 1),
  ('20202020-2020-2020-2020-202020202020', 'Sillas comedor', 2),
  ('20202020-2020-2020-2020-202020202020', 'Aparador', 3)
ON CONFLICT DO NOTHING;

-- 18. MOBILIARIO HABITACIONES
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('30303030-3030-3030-3030-303030303030', 'Cama habitación principal', 1),
  ('30303030-3030-3030-3030-303030303030', 'Mesillas noche', 2),
  ('30303030-3030-3030-3030-303030303030', 'Cómoda', 3),
  ('30303030-3030-3030-3030-303030303030', 'Cama habitación 2', 4),
  ('30303030-3030-3030-3030-303030303030', 'Cama habitación 3', 5),
  ('30303030-3030-3030-3030-303030303030', 'Escritorio', 6)
ON CONFLICT DO NOTHING;

-- 19. TEXTILES Y DECORACIÓN
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('40404040-4040-4040-4040-404040404040', 'Cortinas / estores', 1),
  ('40404040-4040-4040-4040-404040404040', 'Alfombras', 2),
  ('40404040-4040-4040-4040-404040404040', 'Cojines', 3),
  ('40404040-4040-4040-4040-404040404040', 'Cuadros / decoración pared', 4),
  ('40404040-4040-4040-4040-404040404040', 'Plantas', 5)
ON CONFLICT DO NOTHING;

-- 20. LIMPIEZA FINAL / RETIRADA
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('50505050-5050-5050-5050-505050505050', 'Limpieza final obra', 1),
  ('50505050-5050-5050-5050-505050505050', 'Retirada escombros', 2),
  ('50505050-5050-5050-5050-505050505050', 'Transporte residuos', 3)
ON CONFLICT DO NOTHING;

-- 21. OTROS
INSERT INTO items_plantilla (partida_plantilla_id, nombre, orden) VALUES
  ('60606060-6060-6060-6060-606060606060', 'Otros gastos', 1)
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Contar partidas insertadas
SELECT COUNT(*) as total_partidas FROM partidas_plantilla;

-- Contar ítems insertados por partida
SELECT 
  pp.nombre as partida,
  COUNT(ip.id) as total_items
FROM partidas_plantilla pp
LEFT JOIN items_plantilla ip ON ip.partida_plantilla_id = pp.id
GROUP BY pp.id, pp.nombre
ORDER BY pp.orden;
