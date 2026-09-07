-- 2do vencimiento and notes on periodos_expensas
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS fecha_vencimiento_2 DATE;
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS interest_rate_2 NUMERIC(5,4);
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS notas TEXT;
