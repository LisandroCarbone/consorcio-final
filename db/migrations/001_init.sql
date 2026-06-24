-- ============================================================
-- SCHEMA UNIFICADO — ConsorcioApp
-- Reglas de fusión:
--   - Expensas/Prorrateo: modelo de Lisandro (coef A/B, rubros 1-10)
--   - Sueldos/Liquidaciones: modelo de Nacho (normalizado)
--   - PK de consorcios: CUIT (decisión validada con Nacho y Lisandro)
-- ============================================================

CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================
-- CONSORCIOS (PK natural = CUIT, decisión tomada con el equipo)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.consorcios (
    cuit                    VARCHAR(20) PRIMARY KEY,
    nombre                  VARCHAR(255) NOT NULL,
    direccion               VARCHAR(500) NOT NULL,
    codigo_postal           VARCHAR(10),
    cant_uf                 INTEGER,
    categoria_edificio      VARCHAR(10),        -- de Nacho: 1° a 4° (afecta escalas SUTERH)
    suterh_key              VARCHAR(255),        -- de Lisandro

    -- Datos bancarios
    banco                   VARCHAR(255),
    bank_titular            VARCHAR(255),
    bank_account_number     VARCHAR(255),
    cbu                     VARCHAR(22),
    bank_alias              VARCHAR(255),

    -- Amenities (afectan plus de sueldos y rubros de gasto)
    tiene_cochera           BOOLEAN DEFAULT false NOT NULL,
    tiene_movimiento_coches BOOLEAN DEFAULT false NOT NULL,
    tiene_jardin            BOOLEAN DEFAULT false NOT NULL,
    tiene_pileta            BOOLEAN DEFAULT false NOT NULL,
    tiene_caldera           BOOLEAN DEFAULT false NOT NULL,
    zona_desfavorable       BOOLEAN DEFAULT false NOT NULL,

    -- Prorrateo (modelo Lisandro)
    divisor_a               INTEGER DEFAULT 100 NOT NULL,
    divisor_b               INTEGER DEFAULT 100 NOT NULL,
    interest_rate           NUMERIC(5,4) DEFAULT 0.03 NOT NULL,
    due_day                 INTEGER DEFAULT 10 NOT NULL,

    -- ART / Seguro de vida obligatorio (afecta cálculo de cargas patronales)
    art_compania            VARCHAR(100),
    art_pct_variable        NUMERIC(8,4),
    art_fijo                NUMERIC(12,2),
    art_ffep                NUMERIC(12,2),
    art_cant_cuiles         INTEGER,
    sv_compania             VARCHAR(100),
    sv_costo_fijo           NUMERIC(12,4),
    sv_cant_cuiles          INTEGER,
    sv_costo_emision        NUMERIC(12,2),
    sv_renueva_mes          INTEGER,

    -- Porcentajes de contribución (overrides por consorcio; default va en escalas/config global)
    pct_contrib_jubilacion  NUMERIC(6,4),
    pct_contrib_obra_social NUMERIC(6,4),
    pct_cct_suterh          NUMERIC(6,4),
    pct_cct_fateryh         NUMERIC(6,4),
    pct_cct_seracarh        NUMERIC(6,4),
    fateryh_fijo_completa   NUMERIC(12,2),
    fateryh_fijo_media      NUMERIC(12,2),
    fateryh_fijo_suplente_hora NUMERIC(12,4),

    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_consorcios_updated_at ON app.consorcios;
CREATE TRIGGER trg_consorcios_updated_at BEFORE UPDATE ON app.consorcios
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- PERSONAS (de Nacho — normalizado; sirve a propietarios, inquilinos)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.personas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    apellido    VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    telefono    VARCHAR(50),
    whatsapp    VARCHAR(50),
    dni         VARCHAR(20),
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_personas_updated_at ON app.personas;
CREATE TRIGGER trg_personas_updated_at BEFORE UPDATE ON app.personas
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- UNIDADES (coef_a + coef_b — modelo Lisandro adoptado en su totalidad)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.unidades (
    id                SERIAL PRIMARY KEY,
    consorcio_cuit    VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    uf                VARCHAR(50) NOT NULL,       -- número/identificador de unidad funcional
    piso              VARCHAR(10),
    depto             VARCHAR(10),
    coef_a            NUMERIC(7,4) NOT NULL CHECK (coef_a >= 0),
    coef_b            NUMERIC(7,4) NOT NULL DEFAULT 0 CHECK (coef_b >= 0),
    tipo              VARCHAR(50) DEFAULT 'departamento',
    created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_unidades_updated_at ON app.unidades;
CREATE TRIGGER trg_unidades_updated_at BEFORE UPDATE ON app.unidades
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- OCUPANTES (de Nacho — historial propietario/inquilino por unidad)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.ocupantes (
    id          SERIAL PRIMARY KEY,
    unidad_id   INTEGER NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,
    persona_id  INTEGER NOT NULL REFERENCES app.personas(id) ON DELETE CASCADE,
    rol         VARCHAR(20) NOT NULL DEFAULT 'propietario'
                CHECK (rol IN ('propietario', 'inquilino')),
    activo      BOOLEAN DEFAULT true NOT NULL,
    desde       DATE DEFAULT CURRENT_DATE NOT NULL,
    hasta       DATE,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ocupantes_unidad_activo ON app.ocupantes(unidad_id) WHERE activo = true;

-- ============================================================
-- EMPLEADOS (modelo Nacho — normalizado, soporta egresos)
-- PK = CUIL para alinear con AFIP/Libro de Sueldos (de Lisandro)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.empleados (
    cuil                    VARCHAR(20) PRIMARY KEY,
    nombre                  VARCHAR(255) NOT NULL,
    legajo                  VARCHAR(20),
    fecha_nacimiento        DATE,
    fecha_ingreso           DATE NOT NULL,
    fecha_egreso            DATE,
    tipo_egreso             VARCHAR(30)
        CHECK (tipo_egreso IN ('despido_sin_causa','despido_con_causa','renuncia','mutuo_acuerdo','muerte','jubilacion')),
    consorcio_cuit          VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,

    funcion                 VARCHAR(100) NOT NULL,
    categoria_edificio      SMALLINT NOT NULL CHECK (categoria_edificio BETWEEN 1 AND 4),
    jornada                 VARCHAR(20) NOT NULL DEFAULT 'Completa'
        CHECK (jornada IN ('Completa','Media','Suplente')),
    tiene_vivienda          BOOLEAN DEFAULT false NOT NULL,

    obra_social             VARCHAR(100),
    cod_obra_social         INTEGER,
    banco                   VARCHAR(100),
    cbu                     VARCHAR(22),

    -- Plus salariales (afectan escala SUTERH aplicable)
    retiro_residuos         BOOLEAN DEFAULT false NOT NULL,
    clasificacion_residuos  BOOLEAN DEFAULT false NOT NULL,
    plus_cocheras           BOOLEAN DEFAULT false NOT NULL,
    plus_movimiento_coches  BOOLEAN DEFAULT false NOT NULL,
    plus_jardin             BOOLEAN DEFAULT false NOT NULL,
    plus_zona_desfavorable  BOOLEAN DEFAULT false NOT NULL,
    plus_pileta             BOOLEAN DEFAULT false NOT NULL,
    tiene_titulo             BOOLEAN DEFAULT false NOT NULL,
    adicional_voluntario     NUMERIC(14,2) DEFAULT 0 NOT NULL,

    estado                  VARCHAR(20) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo','inactivo')),

    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_empleados_updated_at ON app.empleados;
CREATE TRIGGER trg_empleados_updated_at BEFORE UPDATE ON app.empleados
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_empleados_consorcio ON app.empleados(consorcio_cuit);

-- ============================================================
-- ESCALAS SUTERH (modelo Nacho — básicos por función y categoría)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.escalas_suterh (
    id          SERIAL PRIMARY KEY,
    periodo     DATE NOT NULL,
    funcion     VARCHAR(100) NOT NULL,
    cat_1       NUMERIC(14,2),
    cat_2       NUMERIC(14,2),
    cat_3       NUMERIC(14,2),
    cat_4       NUMERIC(14,2),
    fuente_url  VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (periodo, funcion)
);

CREATE TABLE IF NOT EXISTS app.adicionales_suterh (
    id            SERIAL PRIMARY KEY,
    periodo       DATE NOT NULL,
    concepto      VARCHAR(200) NOT NULL,
    concepto_key  VARCHAR(50),
    valor         NUMERIC(14,4) NOT NULL,
    fuente_url    VARCHAR(500),
    created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (periodo, concepto)
);

-- ============================================================
-- NOVEDADES DE SUELDO (modelo Nacho)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.novedades_sueldo (
    id                       SERIAL PRIMARY KEY,
    empleado_cuil            VARCHAR(20) NOT NULL REFERENCES app.empleados(cuil) ON DELETE CASCADE,
    periodo                  DATE NOT NULL,
    dias_trabajados_suplente NUMERIC(5,2) DEFAULT 0 NOT NULL,
    horas_jornada            NUMERIC(5,2),
    horas_extras_50          NUMERIC(6,2) DEFAULT 0 NOT NULL,
    horas_extras_100         NUMERIC(6,2) DEFAULT 0 NOT NULL,
    feriados_trabajados_hs   NUMERIC(6,2) DEFAULT 0 NOT NULL,
    suplencia_100_hs         NUMERIC(6,2) DEFAULT 0 NOT NULL,
    plus_vacaciones_dias     NUMERIC(4,1) DEFAULT 0 NOT NULL,
    dias_no_trabajados       NUMERIC(4,1) DEFAULT 0 NOT NULL,
    licencia_enfermedad      NUMERIC(4,1) DEFAULT 0 NOT NULL,
    adicional_voluntario     NUMERIC(14,2) DEFAULT 0 NOT NULL,
    embargo                  NUMERIC(14,2) DEFAULT 0 NOT NULL,
    anticipo                 NUMERIC(14,2) DEFAULT 0 NOT NULL,
    muerte                   NUMERIC(14,2) DEFAULT 0 NOT NULL,
    observaciones            TEXT,
    created_at               TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at               TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (empleado_cuil, periodo)
);

DROP TRIGGER IF EXISTS trg_novedades_updated_at ON app.novedades_sueldo;
CREATE TRIGGER trg_novedades_updated_at BEFORE UPDATE ON app.novedades_sueldo
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- LIQUIDACIONES DE SUELDO (modelo Nacho)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.liquidaciones_sueldo (
    id                          SERIAL PRIMARY KEY,
    empleado_cuil               VARCHAR(20) NOT NULL REFERENCES app.empleados(cuil) ON DELETE CASCADE,
    periodo                     DATE NOT NULL,
    tipo                        VARCHAR(20) NOT NULL DEFAULT 'mensual'
        CHECK (tipo IN ('mensual','sac_1','sac_2','indemnizacion')),
    remuneracion_bruta          NUMERIC(14,2) DEFAULT 0 NOT NULL,
    total_descuentos_empleado   NUMERIC(14,2) DEFAULT 0 NOT NULL,
    total_aportes_patronales    NUMERIC(14,2) DEFAULT 0 NOT NULL,  -- F.931 + ART + SCVO + sindicales
    neto_a_pagar                NUMERIC(14,2) DEFAULT 0 NOT NULL,
    pdf_path                    VARCHAR(500),
    estado                      VARCHAR(20) NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador','confirmada','anulada')),

    -- NUEVO: vínculo con expensas — se completa cuando se confirma
    -- y se generan los gastos categoría 1 automáticamente
    gastos_generados            BOOLEAN DEFAULT false NOT NULL,

    created_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (empleado_cuil, periodo, tipo)
);

DROP TRIGGER IF EXISTS trg_liquidaciones_updated_at ON app.liquidaciones_sueldo;
CREATE TRIGGER trg_liquidaciones_updated_at BEFORE UPDATE ON app.liquidaciones_sueldo
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado ON app.liquidaciones_sueldo(empleado_cuil);
CREATE INDEX IF NOT EXISTS idx_liquidaciones_periodo ON app.liquidaciones_sueldo(periodo);

-- ============================================================
-- CONCEPTOS DE LIQUIDACIÓN (modelo Nacho — detalle de cada recibo)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.conceptos_liquidacion (
    id              SERIAL PRIMARY KEY,
    liquidacion_id  INTEGER NOT NULL REFERENCES app.liquidaciones_sueldo(id) ON DELETE CASCADE,
    code            VARCHAR(10),         -- de Lisandro: código de concepto AFIP (1000, 2200, 5150...)
    tipo            VARCHAR(20) NOT NULL
        CHECK (tipo IN ('haber','descuento','no_remunerativo')),
    concepto        VARCHAR(200) NOT NULL,
    importe         NUMERIC(14,2) NOT NULL,
    orden           SMALLINT DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conceptos_liquidacion ON app.conceptos_liquidacion(liquidacion_id);

-- ============================================================
-- PERIODOS DE EXPENSAS (modelo Lisandro — totales pre-calculados
-- + estado de apertura/cierre del modelo Nacho)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.periodos_expensas (
    id                          SERIAL PRIMARY KEY,
    consorcio_cuit              VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    anio                        SMALLINT NOT NULL,
    mes                         SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    estado                      VARCHAR(20) NOT NULL DEFAULT 'abierto'
        CHECK (estado IN ('abierto','cerrado','liquidado')),
    fecha_cierre                DATE,
    fecha_vencimiento           DATE,
    is_sac_separate             BOOLEAN DEFAULT false NOT NULL,

    -- Totales calculados (cache, recalculables desde gastos_periodo + res_cuenta_periodo)
    total_pagos_a_b             NUMERIC(12,2) DEFAULT 0,
    total_gastos_particulares   NUMERIC(12,2) DEFAULT 0,
    total_previsiones           NUMERIC(12,2) DEFAULT 0,
    total_prorrateo_a_b         NUMERIC(12,2) DEFAULT 0,

    created_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (consorcio_cuit, anio, mes)
);

DROP TRIGGER IF EXISTS trg_periodos_expensas_updated_at ON app.periodos_expensas;
CREATE TRIGGER trg_periodos_expensas_updated_at BEFORE UPDATE ON app.periodos_expensas
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- GASTOS DEL PERÍODO (modelo Lisandro — rubros 1-10, tipo A/B/Particular)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.gastos_periodo (
    id              SERIAL PRIMARY KEY,
    periodo_id      INTEGER NOT NULL REFERENCES app.periodos_expensas(id) ON DELETE CASCADE,
    categoria       SMALLINT NOT NULL CHECK (categoria BETWEEN 1 AND 10),
    descripcion     VARCHAR(500) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL,
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('A','B','Particular')),

    -- Si tipo = 'Particular', a qué unidad se asigna
    unidad_id       INTEGER REFERENCES app.unidades(id) ON DELETE SET NULL,

    -- Trazabilidad: si este gasto vino de una liquidación de sueldo confirmada
    liquidacion_id  INTEGER REFERENCES app.liquidaciones_sueldo(id) ON DELETE SET NULL,
    comprobante_url TEXT,

    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gastos_periodo ON app.gastos_periodo(periodo_id);
CREATE INDEX IF NOT EXISTS idx_gastos_liquidacion ON app.gastos_periodo(liquidacion_id);

-- ============================================================
-- DETALLE DE CUENTA CORRIENTE POR UNIDAD (modelo Lisandro)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.res_cuenta_periodo (
    id              SERIAL PRIMARY KEY,
    periodo_id      INTEGER NOT NULL REFERENCES app.periodos_expensas(id) ON DELETE CASCADE,
    unidad_id       INTEGER NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,

    coef_a          NUMERIC(7,4) NOT NULL,
    coef_b          NUMERIC(7,4) NOT NULL,
    saldo_anterior  NUMERIC(12,2) DEFAULT 0 NOT NULL,
    su_pago         NUMERIC(12,2) DEFAULT 0 NOT NULL,
    expensas_a      NUMERIC(12,2) DEFAULT 0 NOT NULL,
    expensas_b      NUMERIC(12,2) DEFAULT 0 NOT NULL,
    s_asamblea      NUMERIC(12,2) DEFAULT 0 NOT NULL,
    otros           NUMERIC(12,2) DEFAULT 0 NOT NULL,
    gast_part       NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_mes       NUMERIC(12,2) GENERATED ALWAYS AS
        (expensas_a + expensas_b + s_asamblea + otros + gast_part) STORED,
    deuda           NUMERIC(12,2) DEFAULT 0 NOT NULL,
    intereses       NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_pagar     NUMERIC(12,2) GENERATED ALWAYS AS
        (expensas_a + expensas_b + s_asamblea + otros + gast_part + deuda + intereses) STORED,

    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','pagada','vencida')),
    fecha_pago      DATE,
    pdf_url         TEXT,
    enviada         BOOLEAN DEFAULT false NOT NULL,

    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (periodo_id, unidad_id)
);

DROP TRIGGER IF EXISTS trg_res_cuenta_updated_at ON app.res_cuenta_periodo;
CREATE TRIGGER trg_res_cuenta_updated_at BEFORE UPDATE ON app.res_cuenta_periodo
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_res_cuenta_periodo ON app.res_cuenta_periodo(periodo_id);

-- ============================================================
-- PAGOS (modelo Nacho — registro de pagos con medio/referencia)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.pagos (
    id              SERIAL PRIMARY KEY,
    consorcio_cuit  VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    unidad_id       INTEGER NOT NULL REFERENCES app.unidades(id) ON DELETE CASCADE,
    res_cuenta_id   INTEGER REFERENCES app.res_cuenta_periodo(id) ON DELETE SET NULL,
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    medio_pago      VARCHAR(30) NOT NULL DEFAULT 'transferencia'
        CHECK (medio_pago IN ('transferencia','deposito','efectivo','debito_automatico','cheque','otro')),
    referencia      VARCHAR(255),
    notas           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_pagos_updated_at ON app.pagos;
CREATE TRIGGER trg_pagos_updated_at BEFORE UPDATE ON app.pagos
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ============================================================
-- CONCILIACIÓN DE COMPROBANTES POR MAIL (modelo Lisandro)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.pending_payments (
    id                      VARCHAR(100) PRIMARY KEY,
    sender                  VARCHAR(255) NOT NULL,
    subject                 VARCHAR(500) NOT NULL,
    body                    TEXT,
    attachment_name         VARCHAR(255),

    extracted_amount        NUMERIC(12,2),
    extracted_date          VARCHAR(100),
    extracted_cuit          VARCHAR(20),
    extracted_sender_name   VARCHAR(255),
    extracted_target_cbu    VARCHAR(22),

    matched_cuit_consorcio  VARCHAR(20) REFERENCES app.consorcios(cuit) ON DELETE SET NULL,
    matched_unidad_id       INTEGER REFERENCES app.unidades(id) ON DELETE SET NULL,
    matched_confidence      VARCHAR(50) CHECK (matched_confidence IN ('high','medium','low','none')),
    matched_reason    TEXT,

    status                  VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','resolved','approved','rejected')),
    timestamp                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TICKETS Y MENSAJES (modelo Nacho — sin cambios)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.tickets (
    id              SERIAL PRIMARY KEY,
    consorcio_cuit  VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    unidad_id       INTEGER REFERENCES app.unidades(id) ON DELETE SET NULL,
    persona_id      INTEGER REFERENCES app.personas(id) ON DELETE SET NULL,
    titulo          VARCHAR(255) NOT NULL,
    descripcion     TEXT,
    categoria       VARCHAR(50) DEFAULT '10'
        CHECK (categoria IN ('2','3','4','5','6','7','8','9','10')),
    prioridad       VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (prioridad IN ('baja','normal','alta','urgente')),
    estado          VARCHAR(30) NOT NULL DEFAULT 'abierto'
        CHECK (estado IN ('abierto','en_proceso','esperando_proveedor','resuelto','cerrado')),
    canal_origen    VARCHAR(30) DEFAULT 'manual'
        CHECK (canal_origen IN ('manual','whatsapp','email','portal')),
    resolucion      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    closed_at       TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON app.tickets;
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON app.tickets
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE IF NOT EXISTS app.ticket_mensajes (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER NOT NULL REFERENCES app.tickets(id) ON DELETE CASCADE,
    autor       VARCHAR(100) NOT NULL,
    contenido   TEXT NOT NULL,
    es_interno  BOOLEAN DEFAULT false NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- PROVEEDORES Y ÓRDENES DE TRABAJO (modelo Nacho — sin cambios)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    rubro       VARCHAR(100),
    telefono    VARCHAR(50),
    email       VARCHAR(255),
    whatsapp    VARCHAR(50),
    cuit        VARCHAR(20),
    activo      BOOLEAN DEFAULT true NOT NULL,
    notas       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON app.proveedores;
CREATE TRIGGER trg_proveedores_updated_at BEFORE UPDATE ON app.proveedores
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE IF NOT EXISTS app.ordenes_trabajo (
    id                  SERIAL PRIMARY KEY,
    consorcio_cuit      VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    ticket_id           INTEGER REFERENCES app.tickets(id) ON DELETE SET NULL,
    proveedor_id        INTEGER REFERENCES app.proveedores(id) ON DELETE SET NULL,
    descripcion         TEXT NOT NULL,
    estado              VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','confirmada','en_curso','completada','cancelada')),
    fecha_programada    DATE,
    fecha_realizada      DATE,
    monto_presupuesto    NUMERIC(12,2),
    monto_final          NUMERIC(12,2),
    comprobante_url      TEXT,
    created_at           TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_ordenes_updated_at ON app.ordenes_trabajo;
CREATE TRIGGER trg_ordenes_updated_at BEFORE UPDATE ON app.ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Índices de Optimización de Rendimiento
CREATE INDEX IF NOT EXISTS idx_tickets_consorcio ON app.tickets (consorcio_cuit);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON app.tickets (estado);
CREATE INDEX IF NOT EXISTS idx_unidades_consorcio ON app.unidades (consorcio_cuit);
CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_consorcio ON app.ordenes_trabajo (consorcio_cuit);
CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_proveedor ON app.ordenes_trabajo (proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_trabajo_ticket ON app.ordenes_trabajo (ticket_id);
CREATE INDEX IF NOT EXISTS idx_pagos_unidad ON app.pagos (unidad_id);
CREATE INDEX IF NOT EXISTS idx_res_cuenta_periodo_unidad ON app.res_cuenta_periodo (unidad_id);
CREATE INDEX IF NOT EXISTS idx_ticket_mensajes_ticket ON app.ticket_mensajes (ticket_id);

-- ============================================================
-- CIRCULARES DE COMUNICACIÓN INTERNA (agregado para bitácora/historial)
-- ============================================================
CREATE TABLE IF NOT EXISTS app.circulares (
    id              SERIAL PRIMARY KEY,
    consorcio_cuit  VARCHAR(20) REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
    mensaje         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_circulares_consorcio ON app.circulares (consorcio_cuit);

CREATE INDEX IF NOT EXISTS idx_pagos_consorcio_fecha ON app.pagos (consorcio_cuit, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_res_cuenta_periodo_estado ON app.res_cuenta_periodo (estado);
CREATE INDEX IF NOT EXISTS idx_novedades_sueldo_periodo ON app.novedades_sueldo (periodo);

