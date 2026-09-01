-- F4: Compensación automática de crédito en cuenta corriente — stores how
-- much of this period's total_pagar was discounted by consuming unapplied
-- rows from app.credito_unidad (see portal/src/lib/expenses/engine.ts).
ALTER TABLE app.res_cuenta_periodo ADD COLUMN IF NOT EXISTS credito_aplicado NUMERIC(14,2) DEFAULT 0;

-- F5: Conciliación — split de un depósito entre múltiples unidades
-- funcionales. Cada fila es un tramo de auditoría del split manual hecho
-- por el administrador; el pago real por unidad se crea en app.pagos.
CREATE TABLE IF NOT EXISTS app.pago_splits (
  id SERIAL PRIMARY KEY,
  movimiento_id INTEGER NOT NULL,
  unidad_id INTEGER NOT NULL,
  monto NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pago_splits_movimiento ON app.pago_splits (movimiento_id);
CREATE INDEX IF NOT EXISTS idx_pago_splits_unidad ON app.pago_splits (unidad_id);
