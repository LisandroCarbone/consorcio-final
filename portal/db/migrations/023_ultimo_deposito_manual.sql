-- Manual override for "último depósito de aportes y contribuciones" shown
-- on the recibo de sueldo. Falls back to automatic detection when no row
-- matches (see getUltimoDepositoAportes in portal/src/app/sueldos/liquidaciones/queries.ts).
CREATE TABLE IF NOT EXISTS app.ultimo_deposito_manual (
  id SERIAL PRIMARY KEY,
  consorcio_cuit TEXT NOT NULL REFERENCES app.consorcios(cuit),
  periodo_anio INT NOT NULL,
  periodo_mes INT NOT NULL,
  banco TEXT,
  fecha_deposito DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consorcio_cuit, periodo_anio, periodo_mes)
);
