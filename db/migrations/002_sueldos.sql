-- Payroll module for building employees (SUTERH CCT 589/10)
-- Depends on: 001_init.sql (consorcios table)

SET search_path TO app, public;

-- ============================================================
-- EMPLEADOS DE EDIFICIO
-- ============================================================
CREATE TABLE empleados_edificio (
    id                      SERIAL PRIMARY KEY,
    cuil                    BIGINT NOT NULL UNIQUE,
    nombre                  VARCHAR(255) NOT NULL,
    legajo                  VARCHAR(20),
    fecha_nacimiento        DATE,
    fecha_ingreso           DATE NOT NULL,
    consorcio_id            INTEGER NOT NULL REFERENCES consorcios(id),
    -- Función según CCT SUTERH
    funcion                 VARCHAR(100) NOT NULL,
    -- Categoría del edificio: 1, 2, 3, 4
    categoria_edificio      SMALLINT NOT NULL CHECK (categoria_edificio BETWEEN 1 AND 4),
    jornada                 VARCHAR(20) NOT NULL DEFAULT 'Completa'
                                CHECK (jornada IN ('Completa','Media','Suplente')),
    tiene_vivienda          BOOLEAN NOT NULL DEFAULT FALSE,
    -- Obra social
    obra_social             VARCHAR(100),
    cod_obra_social         INTEGER,
    -- Banco
    banco                   VARCHAR(100),
    cbu                     VARCHAR(22),
    -- Plus fijos (SI/NO)
    retiro_residuos         BOOLEAN NOT NULL DEFAULT FALSE,
    clasificacion_residuos  BOOLEAN NOT NULL DEFAULT FALSE,
    plus_cocheras           BOOLEAN NOT NULL DEFAULT FALSE,
    plus_movimiento_coches  BOOLEAN NOT NULL DEFAULT FALSE,
    plus_jardin             BOOLEAN NOT NULL DEFAULT FALSE,
    plus_zona_desfavorable  BOOLEAN NOT NULL DEFAULT FALSE,
    plus_pileta             BOOLEAN NOT NULL DEFAULT FALSE,
    tiene_titulo            BOOLEAN NOT NULL DEFAULT FALSE,
    adicional_voluntario    NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'activo'
                                CHECK (estado IN ('activo','inactivo')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_empleados_consorcio ON empleados_edificio(consorcio_id);
CREATE INDEX idx_empleados_estado    ON empleados_edificio(estado);

-- ============================================================
-- ESCALAS SUTERH (auto-actualizadas mensualmente)
-- ============================================================
CREATE TABLE escalas_suterh (
    id          SERIAL PRIMARY KEY,
    periodo     DATE NOT NULL,  -- primer día del mes: 2026-05-01
    funcion     VARCHAR(100) NOT NULL,
    cat_1       NUMERIC(14,2),
    cat_2       NUMERIC(14,2),
    cat_3       NUMERIC(14,2),
    cat_4       NUMERIC(14,2),
    fuente_url  VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodo, funcion)
);

CREATE INDEX idx_escalas_periodo ON escalas_suterh(periodo DESC);

-- ============================================================
-- ADICIONALES SUTERH (viaticos, residuos, vivienda, antiguedad, etc.)
-- ============================================================
CREATE TABLE adicionales_suterh (
    id          SERIAL PRIMARY KEY,
    periodo     DATE NOT NULL,
    concepto    VARCHAR(200) NOT NULL,
    valor       NUMERIC(14,4) NOT NULL,
    fuente_url  VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (periodo, concepto)
);

CREATE INDEX idx_adicionales_periodo ON adicionales_suterh(periodo DESC);

-- ============================================================
-- NOVEDADES MENSUALES (carga manual cada mes)
-- ============================================================
CREATE TABLE novedades_sueldo (
    id                      SERIAL PRIMARY KEY,
    empleado_id             INTEGER NOT NULL REFERENCES empleados_edificio(id),
    periodo                 DATE NOT NULL,  -- primer día del mes
    -- Suplente
    dias_trabajados_suplente NUMERIC(5,2) NOT NULL DEFAULT 0,
    horas_jornada           NUMERIC(5,2),   -- hs por día para suplentes
    -- Horas extras
    horas_extras_50         NUMERIC(6,2) NOT NULL DEFAULT 0,
    horas_extras_100        NUMERIC(6,2) NOT NULL DEFAULT 0,
    feriados_trabajados_hs  NUMERIC(6,2) NOT NULL DEFAULT 0,
    suplencia_100_hs        NUMERIC(6,2) NOT NULL DEFAULT 0,
    -- Vacaciones
    plus_vacaciones_dias    NUMERIC(4,1) NOT NULL DEFAULT 0,
    -- Descuentos y eventualidades
    dias_no_trabajados      NUMERIC(4,1) NOT NULL DEFAULT 0,
    licencia_enfermedad     NUMERIC(4,1) NOT NULL DEFAULT 0,
    adicional_voluntario    NUMERIC(14,2) NOT NULL DEFAULT 0,
    embargo                 NUMERIC(14,2) NOT NULL DEFAULT 0,
    anticipo                NUMERIC(14,2) NOT NULL DEFAULT 0,
    muerte                  NUMERIC(14,2) NOT NULL DEFAULT 0,
    observaciones           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (empleado_id, periodo)
);

CREATE INDEX idx_novedades_periodo    ON novedades_sueldo(periodo DESC);
CREATE INDEX idx_novedades_empleado   ON novedades_sueldo(empleado_id);

-- ============================================================
-- LIQUIDACIONES (recibos generados)
-- ============================================================
CREATE TABLE liquidaciones_sueldo (
    id                          SERIAL PRIMARY KEY,
    empleado_id                 INTEGER NOT NULL REFERENCES empleados_edificio(id),
    periodo                     DATE NOT NULL,
    remuneracion_bruta          NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_descuentos_empleado   NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_aportes_patronales    NUMERIC(14,2) NOT NULL DEFAULT 0,
    neto_a_pagar                NUMERIC(14,2) NOT NULL DEFAULT 0,
    pdf_path                    VARCHAR(500),
    estado                      VARCHAR(20) NOT NULL DEFAULT 'borrador'
                                    CHECK (estado IN ('borrador','confirmada','anulada')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (empleado_id, periodo)
);

CREATE INDEX idx_liquidaciones_periodo  ON liquidaciones_sueldo(periodo DESC);
CREATE INDEX idx_liquidaciones_empleado ON liquidaciones_sueldo(empleado_id);

-- ============================================================
-- CONCEPTOS DE LIQUIDACIÓN (detalle de cada recibo)
-- ============================================================
CREATE TABLE conceptos_liquidacion (
    id              SERIAL PRIMARY KEY,
    liquidacion_id  INTEGER NOT NULL REFERENCES liquidaciones_sueldo(id) ON DELETE CASCADE,
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('haber','descuento','no_remunerativo')),
    concepto        VARCHAR(200) NOT NULL,
    importe         NUMERIC(14,2) NOT NULL,
    orden           SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_conceptos_liquidacion ON conceptos_liquidacion(liquidacion_id);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
CREATE TRIGGER set_updated_at_empleados_edificio
    BEFORE UPDATE ON empleados_edificio
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_novedades_sueldo
    BEFORE UPDATE ON novedades_sueldo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_liquidaciones_sueldo
    BEFORE UPDATE ON liquidaciones_sueldo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
