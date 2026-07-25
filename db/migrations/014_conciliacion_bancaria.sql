ALTER TABLE app.extractos_bancarios
  ADD COLUMN IF NOT EXISTS saldo_apertura numeric(14,2),
  ADD COLUMN IF NOT EXISTS saldo_cierre numeric(14,2),
  ADD COLUMN IF NOT EXISTS fecha_desde date,
  ADD COLUMN IF NOT EXISTS fecha_hasta date;

ALTER TABLE app.extracto_movimientos
  ADD COLUMN IF NOT EXISTS categoria_bancaria varchar(30);

ALTER TABLE app.gastos_periodo
  ADD COLUMN IF NOT EXISTS debitado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS extracto_movimiento_id int REFERENCES app.extracto_movimientos(id);
