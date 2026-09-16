-- ============================================================
-- LSD (Libro de Sueldos Digital) — mapeo de conceptos ARCA
-- por consorcio + campos adicionales requeridos para el TXT
-- ============================================================

-- Mapeo de conceptos ARCA (subidos por el admin desde el TXT de conceptos
-- validados) hacia el código interno de nuestro sistema (conceptos_liquidacion.code)
CREATE TABLE IF NOT EXISTS app.lsd_conceptos_consorcio (
  id                          SERIAL PRIMARY KEY,
  consorcio_cuit              VARCHAR(20) NOT NULL REFERENCES app.consorcios(cuit) ON DELETE CASCADE,
  codigo_afip                 VARCHAR(10) NOT NULL,
  descripcion_afip            VARCHAR(100),
  codigo_contribuyente        VARCHAR(10) NOT NULL,
  descripcion_contribuyente   VARCHAR(100),
  marca_repetible             SMALLINT DEFAULT 1,
  aportes_sipa                SMALLINT DEFAULT 0,
  contribuciones_sipa         SMALLINT DEFAULT 0,
  aportes_inssjp              SMALLINT DEFAULT 0,
  contribuciones_inssjp       SMALLINT DEFAULT 0,
  aportes_os                  SMALLINT DEFAULT 0,
  contribuciones_os           SMALLINT DEFAULT 0,
  aportes_fsr                 SMALLINT DEFAULT 0,
  contribuciones_fsr          SMALLINT DEFAULT 0,
  -- código interno (conceptos_liquidacion.code) que este concepto ARCA representa;
  -- lo completa el admin al mapear, permite matchear contra nuestras liquidaciones
  codigo_interno              VARCHAR(50),
  created_at                  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (consorcio_cuit, codigo_contribuyente)
);

CREATE INDEX IF NOT EXISTS idx_lsd_conceptos_consorcio ON app.lsd_conceptos_consorcio(consorcio_cuit);

-- Datos adicionales de empleados requeridos por el registro 04 del LSD
ALTER TABLE app.empleados
  ADD COLUMN IF NOT EXISTS conyuge          BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS cantidad_hijos   SMALLINT DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS marca_scvo       BOOLEAN DEFAULT FALSE NOT NULL;

-- Código de localidad (SICOSS) requerido por el registro 04 del LSD
ALTER TABLE app.consorcios
  ADD COLUMN IF NOT EXISTS codigo_localidad VARCHAR(5) DEFAULT '00000' NOT NULL;
