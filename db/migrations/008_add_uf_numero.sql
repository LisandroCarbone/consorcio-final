-- Migration 008_add_uf_numero.sql
-- Add missing uf_numero column to app.unidades table
ALTER TABLE app.unidades ADD COLUMN IF NOT EXISTS uf_numero INTEGER;
