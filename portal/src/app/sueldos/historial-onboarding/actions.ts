"use server";

// Historical liquidacion onboarding — lets an admin backfill up to 12 months
// of summarized payroll data per employee so SAC / plus vacacional / HE
// averaging queries (engine.ts) have data to work with from day one.
//
// IMPORTANT: rows created here use estado='confirmada' + origen='manual'
// (NOT estado='historico'). engine.ts:619 filters `estado = 'confirmada'`
// for the plus vacacional semester average — using a distinct 'historico'
// estado would silently exclude these rows from that calculation. See
// design doc "Historical Liquidation Onboarding" for the full rationale.

import { pool, withTransaction } from "@/lib/db";
import type { PoolClient } from "pg";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

const MAX_HISTORICAL_MONTHS = 12;

export interface HistorialEntry {
  empleado_id: number;
  periodo: string; // 'YYYY-MM-01'
  remuneracion_bruta: number;
  he_50?: number;
  he_100?: number;
  he_feriado?: number;
}

export interface HistorialResult {
  ok: number;
  errors: string[];
}

// ─── Lock policy ───────────────────────────────────────────────────────────
// Historical rows for an employee are editable/deletable ONLY IF no real
// (origen='sistema') liquidacion exists yet for that employee, in ANY period.
async function isLocked(empleadoId: number): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM app.liquidaciones_sueldo
     WHERE empleado_id = $1 AND origen != 'manual'
     LIMIT 1`,
    [empleadoId]
  );
  return rows.length > 0;
}

async function countHistorical(empleadoId: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM app.liquidaciones_sueldo
     WHERE empleado_id = $1 AND origen = 'manual' AND tipo = 'mensual'`,
    [empleadoId]
  );
  return rows[0]?.n ?? 0;
}

async function insertConceptos(
  client: PoolClient,
  liquidacionId: number,
  entry: HistorialEntry
) {
  let orden = 0;
  const rows: { code: string; concepto: string; importe: number }[] = [
    { code: "1000", concepto: "Sueldo Básico", importe: entry.remuneracion_bruta },
  ];
  if (entry.he_50) rows.push({ code: "1800", concepto: "HE al 50%", importe: entry.he_50 });
  if (entry.he_100) rows.push({ code: "1850", concepto: "HE al 100%", importe: entry.he_100 });
  if (entry.he_feriado) rows.push({ code: "1900", concepto: "Feriados Trabajados", importe: entry.he_feriado });

  for (const r of rows) {
    await client.query(
      `INSERT INTO app.conceptos_liquidacion (liquidacion_id, code, tipo, concepto, importe, orden)
       VALUES ($1, $2, 'haber', $3, $4, $5)`,
      [liquidacionId, r.code, r.concepto, r.importe, orden++]
    );
  }
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function guardarHistorial(entries: HistorialEntry[]): Promise<HistorialResult> {
  const filled = entries.filter(
    (e) => e.remuneracion_bruta != null && e.remuneracion_bruta > 0
  );

  const result: HistorialResult = { ok: 0, errors: [] };
  if (filled.length === 0) return result;

  for (const entry of filled) {
    try {
      const liquidacionId = await withTransaction(async (client) => {
        // Duplicate-period check (covers both real and historical rows).
        const dup = await client.query(
          `SELECT 1 FROM app.liquidaciones_sueldo
           WHERE empleado_id = $1 AND periodo = $2 AND tipo = 'mensual'`,
          [entry.empleado_id, entry.periodo]
        );
        if (dup.rows.length > 0) {
          throw new Error("duplicate-period");
        }

        // 12-month cap.
        const existing = await countHistorical(entry.empleado_id);
        if (existing >= MAX_HISTORICAL_MONTHS) {
          throw new Error("max-history-exceeded");
        }

        const neto = entry.remuneracion_bruta; // onboarding summary: bruto used as neto placeholder for display purposes only
        const liqRes = await client.query<{ id: number }>(
          `INSERT INTO app.liquidaciones_sueldo
             (empleado_id, periodo, tipo, remuneracion_bruta, neto_a_pagar, estado, origen)
           VALUES ($1, $2, 'mensual', $3, $4, 'confirmada', 'manual')
           RETURNING id`,
          [entry.empleado_id, entry.periodo, entry.remuneracion_bruta, neto]
        );
        const id = liqRes.rows[0].id;

        await insertConceptos(client, id, entry);
        return id;
      });

      result.ok++;
      logAudit("historico_create", "liquidacion", liquidacionId, {
        after: { empleado_id: entry.empleado_id, periodo: entry.periodo, remuneracion_bruta: entry.remuneracion_bruta },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error desconocido";
      const label =
        msg === "duplicate-period"
          ? "ya existe una liquidación para este período"
          : msg === "max-history-exceeded"
          ? `se alcanzó el máximo de ${MAX_HISTORICAL_MONTHS} meses históricos`
          : msg;
      result.errors.push(`${entry.periodo}: ${label}`);
    }
  }

  if (result.ok > 0) {
    revalidatePath("/sueldos/historial-onboarding");
    revalidatePath("/sueldos/liquidaciones");
  }

  return result;
}

// ─── Edit ───────────────────────────────────────────────────────────────────

export async function actualizarHistorial(
  liquidacionId: number,
  entry: Omit<HistorialEntry, "periodo"> & { periodo?: string }
): Promise<{ error?: string }> {
  const row = await pool.query(
    `SELECT empleado_id, periodo::text AS periodo, origen FROM app.liquidaciones_sueldo WHERE id = $1`,
    [liquidacionId]
  );
  if (row.rows.length === 0) return { error: "no_encontrado" };
  const liq = row.rows[0];
  if (liq.origen !== "manual") return { error: "no_es_historico" };

  if (await isLocked(liq.empleado_id)) {
    return { error: "locked-historical-data" };
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE app.liquidaciones_sueldo
       SET remuneracion_bruta = $1, updated_at = now()
       WHERE id = $2`,
      [entry.remuneracion_bruta, liquidacionId]
    );
    await client.query(`DELETE FROM app.conceptos_liquidacion WHERE liquidacion_id = $1`, [liquidacionId]);
    await insertConceptos(client, liquidacionId, { ...entry, empleado_id: liq.empleado_id, periodo: liq.periodo });
  });

  revalidatePath("/sueldos/historial-onboarding");
  revalidatePath("/sueldos/liquidaciones");
  logAudit("historico_update", "liquidacion", liquidacionId, {
    after: { remuneracion_bruta: entry.remuneracion_bruta },
  });
  return {};
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function eliminarHistorial(liquidacionId: number): Promise<{ error?: string }> {
  const row = await pool.query(
    `SELECT empleado_id, origen FROM app.liquidaciones_sueldo WHERE id = $1`,
    [liquidacionId]
  );
  if (row.rows.length === 0) return { error: "no_encontrado" };
  const liq = row.rows[0];
  if (liq.origen !== "manual") return { error: "no_es_historico" };

  if (await isLocked(liq.empleado_id)) {
    return { error: "locked-historical-data" };
  }

  await pool.query(`DELETE FROM app.liquidaciones_sueldo WHERE id = $1`, [liquidacionId]);

  revalidatePath("/sueldos/historial-onboarding");
  revalidatePath("/sueldos/liquidaciones");
  logAudit("historico_delete", "liquidacion", liquidacionId, {});
  return {};
}

// ─── Read ───────────────────────────────────────────────────────────────────

export interface HistorialMonthRow {
  periodo: string; // YYYY-MM-01
  liquidacion_id: number | null;
  remuneracion_bruta: number | null;
  he_50: number | null;
  he_100: number | null;
  he_feriado: number | null;
  origen: "sistema" | "manual" | null;
  locked: boolean;
}

export async function getHistorialEmpleado(empleadoId: number): Promise<HistorialMonthRow[]> {
  const locked = await isLocked(empleadoId);

  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 10));
  }

  const { rows: liqRows } = await pool.query(
    `SELECT l.id, l.periodo::text AS periodo, l.remuneracion_bruta::numeric AS remuneracion_bruta, l.origen,
            COALESCE(SUM(cl.importe) FILTER (WHERE cl.code = '1800'), 0)::numeric AS he_50,
            COALESCE(SUM(cl.importe) FILTER (WHERE cl.code = '1850'), 0)::numeric AS he_100,
            COALESCE(SUM(cl.importe) FILTER (WHERE cl.code = '1900'), 0)::numeric AS he_feriado
     FROM app.liquidaciones_sueldo l
     LEFT JOIN app.conceptos_liquidacion cl ON cl.liquidacion_id = l.id
     WHERE l.empleado_id = $1 AND l.tipo = 'mensual' AND l.periodo = ANY($2::date[])
     GROUP BY l.id, l.periodo, l.remuneracion_bruta, l.origen`,
    [empleadoId, months]
  );

  const byPeriodo = new Map<string, (typeof liqRows)[number]>();
  for (const r of liqRows) byPeriodo.set(r.periodo, r);

  return months.map((periodo) => {
    const r = byPeriodo.get(periodo);
    if (!r) {
      return {
        periodo,
        liquidacion_id: null,
        remuneracion_bruta: null,
        he_50: null,
        he_100: null,
        he_feriado: null,
        origen: null,
        locked: false,
      };
    }
    return {
      periodo,
      liquidacion_id: r.id,
      remuneracion_bruta: Number(r.remuneracion_bruta),
      he_50: Number(r.he_50) || null,
      he_100: Number(r.he_100) || null,
      he_feriado: Number(r.he_feriado) || null,
      origen: r.origen,
      locked: r.origen === "manual" ? locked : true, // real rows are always non-editable here
    };
  });
}
