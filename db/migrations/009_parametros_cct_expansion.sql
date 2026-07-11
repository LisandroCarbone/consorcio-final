-- Expand parametros_cct to hold all periodic values that were previously
-- hardcoded or stored per-consorcio without vigency tracking.

-- Sindicales (currently per-consorcio, moving to global with vigency)
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_suterh NUMERIC(6,4);
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_fateryh NUMERIC(6,4);
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_seracarh NUMERIC(6,4);

-- Seguro de vida colectivo (monto fijo por empleado)
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS sv_costo_fijo NUMERIC(12,4);

-- AFIP F.931 rates (currently hardcoded in engine.ts)
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_aportes_ss NUMERIC(6,4);       -- Jub 11% + Ley19032 3% + ANSSAL 0.45% = 14.45%
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_aportes_os NUMERIC(6,4);       -- Obra social aportes = 2.55%
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_contrib_os NUMERIC(6,4);       -- Obra social contrib patronal = 5.10%
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_contrib_ss NUMERIC(6,4);       -- SS contrib patronal (sobre base con detracción) = 18%
ALTER TABLE app.parametros_cct ADD COLUMN IF NOT EXISTS pct_contrib_anssal NUMERIC(6,4);   -- ANSSAL contrib patronal = 0.9%

-- Seed existing rows with current values
UPDATE app.parametros_cct SET
  pct_suterh        = COALESCE(pct_suterh, 0.045),
  pct_fateryh       = COALESCE(pct_fateryh, 0.065),
  pct_seracarh      = COALESCE(pct_seracarh, 0.005),
  sv_costo_fijo     = COALESCE(sv_costo_fijo, 430.62),
  pct_aportes_ss    = COALESCE(pct_aportes_ss, 0.1445),
  pct_aportes_os    = COALESCE(pct_aportes_os, 0.0255),
  pct_contrib_os    = COALESCE(pct_contrib_os, 0.051),
  pct_contrib_ss    = COALESCE(pct_contrib_ss, 0.18),
  pct_contrib_anssal = COALESCE(pct_contrib_anssal, 0.009);
