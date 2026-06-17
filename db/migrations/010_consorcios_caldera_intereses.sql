-- Add caldera amenity and late payment interest rate to consorcios
ALTER TABLE consorcios
  ADD COLUMN IF NOT EXISTS tiene_caldera BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS intereses_mora_pct NUMERIC(5,4) DEFAULT NULL;
