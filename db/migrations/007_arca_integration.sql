-- Migration 007_arca_integration.sql
-- Credenciales ARCA por consorcio
CREATE TABLE IF NOT EXISTS app.arca_credentials (
    cuit              VARCHAR(20) PRIMARY KEY,
    cert_pem          TEXT NOT NULL,
    private_key_pem   TEXT NOT NULL,
    punto_venta       INTEGER NOT NULL,
    ambiente          VARCHAR(20) DEFAULT 'homologation' NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Caché de tokens WSAA (válidos 12hs)
CREATE TABLE IF NOT EXISTS app.arca_tokens (
    cuit              VARCHAR(20) PRIMARY KEY,
    token             TEXT NOT NULL,
    sign              TEXT NOT NULL,
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arca_tokens_exp ON app.arca_tokens(expires_at);

-- Comprobantes emitidos (Factura C, etc.)
CREATE TABLE IF NOT EXISTS app.arca_comprobantes (
    id                SERIAL PRIMARY KEY,
    cuit_emisor       VARCHAR(20) NOT NULL,
    punto_venta       INTEGER NOT NULL,
    cbte_tipo         INTEGER NOT NULL, -- 11 = Factura C, etc.
    cbte_nro          INTEGER NOT NULL,
    cae               VARCHAR(20) NOT NULL,
    cae_vto           DATE NOT NULL,
    fecha             DATE NOT NULL,
    cuit_receptor     VARCHAR(20) NOT NULL,
    concepto_tipo     INTEGER DEFAULT 2 NOT NULL, -- 1=Productos, 2=Servicios, 3=Productos y Servicios
    monto_total       NUMERIC(12,2) NOT NULL,
    descripcion       TEXT NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(cuit_emisor, punto_venta, cbte_tipo, cbte_nro)
);
