-- F3: Fondo de obra — fixed total amount per consorcio, prorated to each unit
-- by its %A coefficient. Stored at consorcio level (not periodo) because it
-- auto-repeats every month until deactivated or the amount changes.
ALTER TABLE app.consorcios ADD COLUMN IF NOT EXISTS fondo_obra NUMERIC(14,2) DEFAULT 0;
ALTER TABLE app.consorcios ADD COLUMN IF NOT EXISTS fondo_obra_activo BOOLEAN DEFAULT false;

-- Per-unit fondo de obra amount for the period, stored as a separate line
-- item (not folded into expensas_a).
ALTER TABLE app.res_cuenta_periodo ADD COLUMN IF NOT EXISTS fondo_obra NUMERIC(14,2) DEFAULT 0;
