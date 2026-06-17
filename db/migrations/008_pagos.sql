-- Tabla de pagos de expensas
-- Permite registrar pagos formales contra unidades, opcionalmente vinculados a una expensa

CREATE TABLE app.pagos (
    id              SERIAL PRIMARY KEY,
    consorcio_id    INTEGER NOT NULL REFERENCES app.consorcios(id) ON DELETE CASCADE,
    unidad_id       INTEGER NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,
    expensa_id      INTEGER REFERENCES app.expensas(id) ON DELETE SET NULL,
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    medio_pago      VARCHAR(30) NOT NULL DEFAULT 'transferencia'
                        CHECK (medio_pago IN ('transferencia','deposito','efectivo','debito_automatico','cheque','otro')),
    referencia      VARCHAR(255),
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagos_unidad     ON app.pagos(unidad_id);
CREATE INDEX idx_pagos_consorcio  ON app.pagos(consorcio_id);
CREATE INDEX idx_pagos_expensa    ON app.pagos(expensa_id) WHERE expensa_id IS NOT NULL;

CREATE TRIGGER trg_pagos_updated_at
    BEFORE UPDATE ON app.pagos
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
