ALTER TABLE app.consorcios ADD COLUMN IF NOT EXISTS tipo_expensas VARCHAR(10) DEFAULT 'variable' NOT NULL;
ALTER TABLE app.periodos_expensas ADD COLUMN IF NOT EXISTS monto_fijo NUMERIC(14,2);
