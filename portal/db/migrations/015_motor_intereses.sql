-- Motor de Intereses Real — Phase 1: new additive tables
-- Zero risk: no existing table is modified, no existing code references these yet.
-- Rollback: DROP TABLE IF EXISTS app.credito_unidad, app.imputacion_pagos, app.deuda_periodo, app.tasas_interes CASCADE;

CREATE TABLE IF NOT EXISTS app.tasas_interes (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  consorcio_cuit varchar(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
  tasa numeric(5,4) NOT NULL,
  fecha_desde date NOT NULL,
  fecha_hasta date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasas_interes_tasa_check CHECK (tasa >= 0),
  CONSTRAINT tasas_interes_fechas_check CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);

CREATE INDEX IF NOT EXISTS idx_tasas_interes_consorcio ON app.tasas_interes (consorcio_cuit, fecha_desde);

CREATE TABLE IF NOT EXISTS app.deuda_periodo (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unidad_id integer NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,
  periodo_id integer NOT NULL REFERENCES app.periodos_expensas(id) ON DELETE CASCADE,
  monto_original numeric(12,2) NOT NULL DEFAULT 0,
  monto_capital_pendiente numeric(12,2) NOT NULL DEFAULT 0,
  monto_intereses_acumulado numeric(12,2) NOT NULL DEFAULT 0,
  monto_intereses_pendiente numeric(12,2) NOT NULL DEFAULT 0,
  meses_atraso integer NOT NULL DEFAULT 0,
  estado varchar(20) NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT deuda_periodo_estado_check CHECK (estado IN ('pendiente', 'parcial', 'pagada')),
  CONSTRAINT deuda_periodo_unidad_periodo_key UNIQUE (unidad_id, periodo_id),
  CONSTRAINT deuda_periodo_monto_original_check CHECK (monto_original >= 0),
  CONSTRAINT deuda_periodo_monto_capital_check CHECK (monto_capital_pendiente >= 0),
  CONSTRAINT deuda_periodo_monto_intereses_check CHECK (monto_intereses_pendiente >= 0)
);

CREATE INDEX IF NOT EXISTS idx_deuda_periodo_unidad ON app.deuda_periodo (unidad_id);
CREATE INDEX IF NOT EXISTS idx_deuda_periodo_periodo ON app.deuda_periodo (periodo_id);
CREATE INDEX IF NOT EXISTS idx_deuda_periodo_estado ON app.deuda_periodo (estado);

CREATE TABLE IF NOT EXISTS app.imputacion_pagos (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pago_id integer NOT NULL REFERENCES app.pagos(id) ON DELETE RESTRICT,
  deuda_periodo_id integer NOT NULL REFERENCES app.deuda_periodo(id) ON DELETE RESTRICT,
  monto_a_interes numeric(12,2) NOT NULL DEFAULT 0,
  monto_a_capital numeric(12,2) NOT NULL DEFAULT 0,
  fecha timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT imputacion_pagos_pago_deuda_key UNIQUE (pago_id, deuda_periodo_id)
);

CREATE INDEX IF NOT EXISTS idx_imputacion_pagos_pago ON app.imputacion_pagos (pago_id);
CREATE INDEX IF NOT EXISTS idx_imputacion_pagos_deuda ON app.imputacion_pagos (deuda_periodo_id);

CREATE TABLE IF NOT EXISTS app.credito_unidad (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  unidad_id integer NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,
  consorcio_cuit varchar(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
  monto numeric(12,2) NOT NULL,
  origen varchar(30) NOT NULL DEFAULT 'sobrepago',
  pago_id integer REFERENCES app.pagos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  aplicado boolean NOT NULL DEFAULT false,
  aplicado_en_periodo_id integer REFERENCES app.periodos_expensas(id) ON DELETE SET NULL,
  CONSTRAINT credito_unidad_monto_check CHECK (monto > 0)
);

CREATE INDEX IF NOT EXISTS idx_credito_unidad_unidad ON app.credito_unidad (unidad_id, aplicado);
