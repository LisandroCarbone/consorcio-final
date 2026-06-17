-- Migration 003: extend consorcios with fields from Excel "Empleador" sheet

SET search_path TO app, public;

ALTER TABLE consorcios
  ADD COLUMN IF NOT EXISTS codigo_postal       VARCHAR(10),
  ADD COLUMN IF NOT EXISTS nro_cta_suterh      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS cant_uf             INTEGER,
  ADD COLUMN IF NOT EXISTS categoria_edificio  VARCHAR(10),  -- '1° Cat.','2° Cat.','3° Cat.','4° Cat.'
  ADD COLUMN IF NOT EXISTS banco               VARCHAR(100),
  -- Amenities (SI/NO) — used for payroll plus calculation
  ADD COLUMN IF NOT EXISTS tiene_cochera       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiene_movimiento_coches BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiene_jardin        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zona_desfavorable   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiene_pileta        BOOLEAN NOT NULL DEFAULT false,
  -- ART (Aseguradora de Riesgos del Trabajo)
  ADD COLUMN IF NOT EXISTS art_compania        VARCHAR(100),
  ADD COLUMN IF NOT EXISTS art_pct_variable    NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS art_fijo            NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS art_ffep            NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS art_cant_cuiles     INTEGER,
  -- Seguro de vida obligatorio
  ADD COLUMN IF NOT EXISTS sv_compania         VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sv_costo_fijo       NUMERIC(12,4),
  ADD COLUMN IF NOT EXISTS sv_cant_cuiles      INTEGER,
  ADD COLUMN IF NOT EXISTS sv_costo_emision    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS sv_renueva_mes      INTEGER,  -- 1-12
  -- Contribuciones patronales específicas (pueden diferir del default)
  ADD COLUMN IF NOT EXISTS pct_contrib_jubilacion   NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS pct_contrib_obra_social  NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS pct_cct_suterh           NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS pct_cct_fateryh          NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS pct_cct_seracarh         NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS fateryh_fijo_completa    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS fateryh_fijo_media       NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS fateryh_fijo_suplente_hora NUMERIC(12,4);

-- Seed the 15 consorcios from the Excel "Empleador" sheet
INSERT INTO consorcios (nombre, direccion, cuit, codigo_postal, nro_cta_suterh, cant_uf, categoria_edificio, banco,
  tiene_cochera, tiene_movimiento_coches, tiene_jardin, zona_desfavorable, tiene_pileta,
  art_compania, art_pct_variable, art_fijo, art_ffep, art_cant_cuiles,
  sv_compania, sv_costo_fijo, sv_cant_cuiles, sv_costo_emision, sv_renueva_mes,
  pct_contrib_jubilacion, pct_contrib_obra_social, pct_cct_suterh, pct_cct_fateryh, pct_cct_seracarh,
  fateryh_fijo_completa, fateryh_fijo_media, fateryh_fijo_suplente_hora)
VALUES
  ('CONS PROP SGO DEL ESTERO 336 46 CAP FED', 'Santiago del Estero 336/38/46 C.A.B.A.', '30519077635', '1075', '5183', 79, '3° Cat.', 'GALICIA',
   false, false, false, false, false,
   'BERKLEY', 0.1214, 0, 1765, 3448,
   'BERKLEY', 424.62, 849.24, 12, 9,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS LIMA 461/67/73', 'Lima 467 C.A.B.A.', '30532673484', '1073', '5073', 8, '3° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'BERKLEY', 0.1124, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 9,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS SAN JOSE 369', 'San José 369 C.A.B.A.', '30536354154', '1076', '5232', 12, '4° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'ASOCIART', 0, 0, 0, 0,
   'BERKLEY', 424.62, 424.62, 12, 11,
   null, null, null, null, null, null, null, null),

  ('CONS DE PROP AV BELGRANO 1266/70/76', 'Av. Belgrano 1266/70/76 C.A.B.A.', '30537480544', '1093', '5994', 24, '1° Cat.', 'GALICIA',
   false, false, false, false, false,
   'BERKLEY', 0.1214, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 12,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS RODRIGUEZ PEÑA 1351', 'Rodriguez Peña 1331/51 C.A.B.A', '30538590009', '1021', '2063', 7, '2° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'BERKLEY', 0.1011, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 1,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE COPROPIETARIOS ARENALES 2120 24', 'Arenales 2120 C.A.B.A.', '30540887752', '1124', '6853', 18, '1° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'EXPERTA ART', 0.0629, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 9,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS DEL EDIFICIO PALOS 285', 'Palos 285 C.A.B.A.', '30559333022', '1160', '58181', 15, '3° Cat.', 'BBVA',
   false, false, false, false, false,
   'BERKLEY', 0.074, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 9,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS URUGUAY 1025 27 29', 'Uruguay 1025 C.A.B.A.', '30580260906', '1016', '1542', 11, '1° Cat.', 'ICBC',
   false, false, false, false, false,
   'BERKLEY', 0.074, 0, 1765, 3448,
   'BERKLEY', 424.62, 849.24, 12, 5,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS ALTE BROWN 720', 'Av. Alte. Brown 720 C.A.B.A.', '30604528166', '1155', '44113', 39, '3° Cat.', 'BBVA',
   false, false, false, false, false,
   'BERKLEY', 0.1214, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 9,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO PROPIETARIOS DE LA FINCA CALLE ARENALES 1648 50', 'Arenales 1648/50 C.A.B.A.', '30630042670', '1061', '3382', 32, '1° Cat.', 'SANTANDER',
   true, true, false, false, false,
   'BERKLEY', 0.1214, 0, 1765, 5172,
   'BERKLEY', 424.62, 1273.86, 12, 3,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO AV MONTES DE OCA 1068', 'Montes de Oca 1068 C.A.B.A.', '30661488618', '1270', '23883', 21, '2° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'EXPERTA ART', 0, 0, 0, 0,
   'BERKLEY', 424.62, 424.62, 12, 12,
   null, null, null, null, null, null, null, null),

  ('CONS PROP DE LA AV HIPOLITO YRIGOYEN 3601 11 ESQ BOEDO 197 197A', 'H. Yrigoyen 3611 C.A.B.A.', '30707887628', '1206', '79631', 15, '3° Cat.', 'SANTANDER',
   false, false, false, false, false,
   null, 0, 0, 0, 0,
   'BERKLEY', 424.62, 424.62, 12, 9,
   null, null, null, null, null, null, null, null),

  ('CONSORCIO DE PROPIETARIOS SALTA 555 59', 'Salta 555 C.A.B.A.', '30711283338', '1074', '83849', 27, '3° Cat.', 'SANTANDER',
   false, false, false, false, false,
   'BERKLEY', 0.0429, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 12,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS AZCUENAGA 1570 IQ-RECOLETA', 'Azcuenaga 1570 C.A.B.A.', '30711553165', '1115', '84390', 30, '1° Cat.', 'GALICIA',
   true, false, true, false, true,
   'EXPERTA ART', 0.0522, 0, 1765, 3448,
   'BERKLEY', 424.62, 849.24, 12, 5,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81),

  ('CONSORCIO DE PROPIETARIOS CALLE SANCHEZ DE BUSTAMANTE 2466,2468 Y 2472, CABA', 'Sanchez de Bustamante 2466 C.A.B.A.', '30711776903', '1008', '85010', 16, '1° Cat.', 'SANTANDER',
   true, false, true, false, true,
   'BERKLEY', 0.0418, 0, 1765, 1724,
   'BERKLEY', 424.62, 424.62, 12, 6,
   0.18, 0.06, 0.015, 0.0475, 0.005, 44962, 22481, 224.81)

ON CONFLICT DO NOTHING;
