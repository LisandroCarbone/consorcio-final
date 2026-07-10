-- Tabla de administradores de consorcio
CREATE TABLE IF NOT EXISTS app.administradores (
    id                  SERIAL PRIMARY KEY,
    -- Identidad
    nombre_sociedad     VARCHAR(255),
    nombre_administrador VARCHAR(255) NOT NULL,
    cuit                VARCHAR(20) NOT NULL UNIQUE,
    matricula_rpa       VARCHAR(50),
    -- Contacto
    email               VARCHAR(255),
    telefono            VARCHAR(50),
    celular_urgencias   VARCHAR(50),
    domicilio           VARCHAR(500),
    horario_atencion    VARCHAR(255),
    -- Fiscal
    categoria_afip      VARCHAR(50),
    situacion_iva       VARCHAR(50),
    fecha_inicio_actividades DATE,
    registro_publico    VARCHAR(100),
    -- Operativo
    logo_url            VARCHAR(500),
    firma_digital_url   VARCHAR(500),
    whatsapp_urgencias  VARCHAR(50),
    sitio_web           VARCHAR(255),

    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trg_administradores_updated_at ON app.administradores;
CREATE TRIGGER trg_administradores_updated_at BEFORE UPDATE ON app.administradores
    FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.consorcios ADD COLUMN IF NOT EXISTS administrador_id INTEGER REFERENCES app.administradores(id);
