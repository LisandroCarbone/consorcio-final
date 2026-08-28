import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const log: string[] = [];
  try {
    log.push("Step 1: ADD COLUMN id SERIAL");
    await pool.query("ALTER TABLE app.empleados ADD COLUMN IF NOT EXISTS id SERIAL");
    log.push("OK");

    log.push("Step 2: Check current PK");
    const pkCheck = await pool.query(`
      SELECT c.conname, array_agg(a.attname) AS cols
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
      WHERE n.nspname = 'app' AND t.relname = 'empleados' AND c.contype = 'p'
      GROUP BY c.conname
    `);
    log.push("Current PK: " + JSON.stringify(pkCheck.rows));

    log.push("Step 3: Switch PK to id (if cuil-based)");
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE n.nspname = 'app' AND t.relname = 'empleados'
            AND c.contype = 'p' AND c.conname = 'empleados_pkey'
            AND (SELECT array_agg(a.attname) FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum)::text[] = ARRAY['cuil']
        ) THEN
          ALTER TABLE app.empleados DROP CONSTRAINT empleados_pkey;
          ALTER TABLE app.empleados ADD PRIMARY KEY (id);
        END IF;
      END $$;
    `);
    log.push("OK");

    log.push("Step 4: UNIQUE(cuil, consorcio_cuit)");
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_empleados_cuil_consorcio') THEN
          ALTER TABLE app.empleados ADD CONSTRAINT uq_empleados_cuil_consorcio UNIQUE (cuil, consorcio_cuit);
        END IF;
      END $$;
    `);
    log.push("OK");

    log.push("Step 5: ADD empleado_id to child tables");
    await pool.query("ALTER TABLE app.novedades_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER");
    await pool.query("ALTER TABLE app.liquidaciones_sueldo ADD COLUMN IF NOT EXISTS empleado_id INTEGER");
    log.push("OK");

    log.push("Step 6: Backfill empleado_id");
    const r1 = await pool.query(`UPDATE app.novedades_sueldo n SET empleado_id = e.id FROM app.empleados e WHERE e.cuil = n.empleado_cuil AND n.empleado_id IS NULL`);
    const r2 = await pool.query(`UPDATE app.liquidaciones_sueldo l SET empleado_id = e.id FROM app.empleados e WHERE e.cuil = l.empleado_cuil AND l.empleado_id IS NULL`);
    log.push(`Backfilled: novedades=${r1.rowCount}, liquidaciones=${r2.rowCount}`);

    log.push("Step 7: NOT NULL + FK constraints");
    await pool.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM app.novedades_sueldo WHERE empleado_id IS NULL) THEN ALTER TABLE app.novedades_sueldo ALTER COLUMN empleado_id SET NOT NULL; END IF; END $$;`);
    await pool.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_novedades_empleado_id') THEN ALTER TABLE app.novedades_sueldo ADD CONSTRAINT fk_novedades_empleado_id FOREIGN KEY (empleado_id) REFERENCES app.empleados(id) ON DELETE CASCADE; END IF; END $$;`);
    await pool.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM app.liquidaciones_sueldo WHERE empleado_id IS NULL) THEN ALTER TABLE app.liquidaciones_sueldo ALTER COLUMN empleado_id SET NOT NULL; END IF; END $$;`);
    await pool.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_liquidaciones_empleado_id') THEN ALTER TABLE app.liquidaciones_sueldo ADD CONSTRAINT fk_liquidaciones_empleado_id FOREIGN KEY (empleado_id) REFERENCES app.empleados(id) ON DELETE CASCADE; END IF; END $$;`);
    log.push("OK");

    log.push("Step 8: Indexes");
    await pool.query("ALTER TABLE app.novedades_sueldo DROP CONSTRAINT IF EXISTS novedades_sueldo_empleado_cuil_periodo_key");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS uq_novedades_empleado_id_periodo ON app.novedades_sueldo(empleado_id, periodo)");
    await pool.query("ALTER TABLE app.liquidaciones_sueldo DROP CONSTRAINT IF EXISTS liquidaciones_sueldo_empleado_cuil_periodo_tipo_key");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS uq_liquidaciones_empleado_id_periodo_tipo ON app.liquidaciones_sueldo(empleado_id, periodo, tipo)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_novedades_empleado_id ON app.novedades_sueldo(empleado_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado_id ON app.liquidaciones_sueldo(empleado_id)");
    log.push("OK");

    log.push("MIGRATION COMPLETE");
    return NextResponse.json({ ok: true, log });
  } catch (err: any) {
    log.push(`ERROR: ${err.message}`);
    return NextResponse.json({ ok: false, log, error: err.message }, { status: 500 });
  }
}
