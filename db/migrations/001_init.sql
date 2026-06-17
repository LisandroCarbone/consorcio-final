-- Schema for consorcio administration platform
-- All timestamps are stored in UTC

CREATE SCHEMA IF NOT EXISTS app;

SET search_path TO app, public;

-- ============================================================
-- CONSORCIOS
-- ============================================================
CREATE TABLE consorcios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    direccion   VARCHAR(500) NOT NULL,
    cuit        VARCHAR(20),
    cbu         VARCHAR(22),
    -- Coeficiente total debe sumar 100 (verificado por constraint en unidades)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- UNIDADES FUNCIONALES
-- ============================================================
CREATE TABLE unidades (
    id              SERIAL PRIMARY KEY,
    consorcio_id    INTEGER NOT NULL REFERENCES consorcios(id) ON DELETE CASCADE,
    numero          VARCHAR(20) NOT NULL,   -- "1A", "PH2", etc.
    piso            VARCHAR(10),
    departamento    VARCHAR(10),
    coeficiente     NUMERIC(7, 4) NOT NULL CHECK (coeficiente > 0),
    tipo            VARCHAR(50) DEFAULT 'departamento', -- departamento, cochera, local, etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (consorcio_id, numero)
);

-- ============================================================
-- PROPIETARIOS / INQUILINOS
-- ============================================================
CREATE TABLE personas (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    apellido        VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    telefono        VARCHAR(50),
    whatsapp        VARCHAR(50),
    dni             VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ocupantes (
    id              SERIAL PRIMARY KEY,
    unidad_id       INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    persona_id      INTEGER NOT NULL REFERENCES personas(id),
    rol             VARCHAR(20) NOT NULL DEFAULT 'propietario' CHECK (rol IN ('propietario', 'inquilino')),
    activo          BOOLEAN NOT NULL DEFAULT true,
    desde           DATE NOT NULL DEFAULT CURRENT_DATE,
    hasta           DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PERIODOS DE LIQUIDACION
-- ============================================================
CREATE TABLE periodos (
    id              SERIAL PRIMARY KEY,
    consorcio_id    INTEGER NOT NULL REFERENCES consorcios(id) ON DELETE CASCADE,
    anio            SMALLINT NOT NULL,
    mes             SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    estado          VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado', 'liquidado')),
    fecha_cierre    DATE,
    fecha_vencimiento DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (consorcio_id, anio, mes)
);

-- ============================================================
-- GASTOS DEL PERIODO (inputs para el cálculo de expensas)
-- ============================================================
CREATE TABLE gastos (
    id              SERIAL PRIMARY KEY,
    periodo_id      INTEGER NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
    concepto        VARCHAR(255) NOT NULL,
    monto           NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    tipo            VARCHAR(50) NOT NULL DEFAULT 'ordinario' CHECK (tipo IN ('ordinario', 'extraordinario', 'fondo_reserva')),
    comprobante_url TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EXPENSAS POR UNIDAD
-- ============================================================
CREATE TABLE expensas (
    id              SERIAL PRIMARY KEY,
    periodo_id      INTEGER NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
    unidad_id       INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    monto_ordinario NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monto_extraordinario NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monto_fondo_reserva  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monto_total     NUMERIC(12, 2) GENERATED ALWAYS AS (
                        monto_ordinario + monto_extraordinario + monto_fondo_reserva
                    ) STORED,
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
    fecha_pago      DATE,
    pdf_url         TEXT,
    enviada         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodo_id, unidad_id)
);

-- ============================================================
-- TICKETS / RECLAMOS
-- ============================================================
CREATE TABLE tickets (
    id              SERIAL PRIMARY KEY,
    consorcio_id    INTEGER NOT NULL REFERENCES consorcios(id) ON DELETE CASCADE,
    unidad_id       INTEGER REFERENCES unidades(id),
    persona_id      INTEGER REFERENCES personas(id),
    titulo          VARCHAR(255) NOT NULL,
    descripcion     TEXT,
    categoria       VARCHAR(50) DEFAULT 'general' CHECK (categoria IN ('general', 'plomeria', 'electricidad', 'limpieza', 'ascensor', 'administracion', 'otro')),
    prioridad       VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
    estado          VARCHAR(30) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_proceso', 'esperando_proveedor', 'resuelto', 'cerrado')),
    canal_origen    VARCHAR(30) DEFAULT 'manual' CHECK (canal_origen IN ('manual', 'whatsapp', 'email', 'portal')),
    resolucion      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at       TIMESTAMPTZ
);

CREATE TABLE ticket_mensajes (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    autor       VARCHAR(100) NOT NULL,
    contenido   TEXT NOT NULL,
    es_interno  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROVEEDORES
-- ============================================================
CREATE TABLE proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    rubro       VARCHAR(100),
    telefono    VARCHAR(50),
    email       VARCHAR(255),
    whatsapp    VARCHAR(50),
    cuit        VARCHAR(20),
    activo      BOOLEAN NOT NULL DEFAULT true,
    notas       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ORDENES DE TRABAJO
-- ============================================================
CREATE TABLE ordenes_trabajo (
    id              SERIAL PRIMARY KEY,
    consorcio_id    INTEGER NOT NULL REFERENCES consorcios(id) ON DELETE CASCADE,
    ticket_id       INTEGER REFERENCES tickets(id),
    proveedor_id    INTEGER REFERENCES proveedores(id),
    descripcion     TEXT NOT NULL,
    estado          VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada')),
    fecha_programada DATE,
    fecha_realizada  DATE,
    monto_presupuesto NUMERIC(12, 2),
    monto_final      NUMERIC(12, 2),
    comprobante_url  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_unidades_consorcio ON unidades(consorcio_id);
CREATE INDEX idx_ocupantes_unidad ON ocupantes(unidad_id) WHERE activo = true;
CREATE INDEX idx_periodos_consorcio ON periodos(consorcio_id);
CREATE INDEX idx_gastos_periodo ON gastos(periodo_id);
CREATE INDEX idx_expensas_periodo ON expensas(periodo_id);
CREATE INDEX idx_expensas_unidad ON expensas(unidad_id);
CREATE INDEX idx_tickets_consorcio ON tickets(consorcio_id);
CREATE INDEX idx_tickets_estado ON tickets(estado) WHERE estado NOT IN ('resuelto', 'cerrado');
CREATE INDEX idx_ordenes_consorcio ON ordenes_trabajo(consorcio_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consorcios_updated_at   BEFORE UPDATE ON consorcios   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_unidades_updated_at     BEFORE UPDATE ON unidades     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_personas_updated_at     BEFORE UPDATE ON personas     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_periodos_updated_at     BEFORE UPDATE ON periodos     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_expensas_updated_at     BEFORE UPDATE ON expensas     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tickets_updated_at      BEFORE UPDATE ON tickets      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_proveedores_updated_at  BEFORE UPDATE ON proveedores  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ordenes_updated_at      BEFORE UPDATE ON ordenes_trabajo FOR EACH ROW EXECUTE FUNCTION set_updated_at();
