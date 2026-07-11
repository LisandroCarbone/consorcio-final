-- 1. FATERYH Art.19bis → global en parametros_cct con vigencia
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS fateryh_art19bis NUMERIC(12,4) DEFAULT 0;

-- Seed from the max value found across consorcios (all share the same rate)
UPDATE app.parametros_cct
SET fateryh_art19bis = COALESCE((SELECT MAX(fateryh_art19bis_mensual) FROM app.consorcios WHERE fateryh_art19bis_mensual > 0), 0)
WHERE fateryh_art19bis = 0 OR fateryh_art19bis IS NULL;

-- 2. ART params per consorcio with vigency
CREATE TABLE IF NOT EXISTS app.parametros_art_consorcio (
  id SERIAL PRIMARY KEY,
  consorcio_cuit TEXT NOT NULL REFERENCES app.consorcios(cuit),
  fecha_desde DATE NOT NULL,
  art_pct_variable NUMERIC(6,4) NOT NULL,
  art_costo_fijo NUMERIC(12,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consorcio_cuit, fecha_desde)
);

-- Seed from existing consorcio values
INSERT INTO app.parametros_art_consorcio (consorcio_cuit, fecha_desde, art_pct_variable, art_costo_fijo)
SELECT cuit, '2024-01-01'::date, COALESCE(art_pct_variable, 0.0639), COALESCE(art_costo_fijo, 0)
FROM app.consorcios
WHERE art_pct_variable IS NOT NULL AND art_pct_variable > 0
ON CONFLICT DO NOTHING;

-- 3. Remove migrated fields from consorcios (keep columns but they become legacy)
-- We don't drop columns to avoid breaking existing code during transition
-- COMMENT ON COLUMN app.consorcios.art_pct_variable IS 'LEGACY: migrated to parametros_art_consorcio';
-- COMMENT ON COLUMN app.consorcios.art_costo_fijo IS 'LEGACY: migrated to parametros_art_consorcio';
-- COMMENT ON COLUMN app.consorcios.fateryh_art19bis_mensual IS 'LEGACY: migrated to parametros_cct.fateryh_art19bis';
