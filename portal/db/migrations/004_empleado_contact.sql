-- Add email and whatsapp contact fields to empleados table
ALTER TABLE app.empleados ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE app.empleados ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
