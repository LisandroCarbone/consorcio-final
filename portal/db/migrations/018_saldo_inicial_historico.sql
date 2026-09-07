ALTER TABLE app.unidades ADD COLUMN IF NOT EXISTS saldo_inicial_historico NUMERIC(12,2) DEFAULT 0 NOT NULL;

-- Allow periodos_expensas.estado = 'historico' for manually-entered legacy
-- account-statement periods (see cuenta-corriente history redesign).
ALTER TABLE app.periodos_expensas DROP CONSTRAINT IF EXISTS periodos_expensas_estado_check;
ALTER TABLE app.periodos_expensas ADD CONSTRAINT periodos_expensas_estado_check
    CHECK (estado IN ('abierto','cerrado','liquidado','historico'));
