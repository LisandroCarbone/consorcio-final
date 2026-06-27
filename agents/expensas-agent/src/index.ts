/**
 * Expensas Distribution Agent
 *
 * Usage:
 *   PERIODO_ID=5 node dist/index.js
 *   or via n8n HTTP Request node calling this agent as a child process / API
 *
 * Steps:
 *   1. Load period + consorcio data
 *   2. Load gastos for the period
 *   3. Call calcular_expensas if period is not yet liquidated
 *   4. For each unidad with an email: generate PDF → send email → mark enviada=true
 *   5. Print a summary report
 */

import path from "path";
import { pool, query, queryOne } from "./db.js";
import { generatePdf } from "./pdf.js";
import { sendExpensaEmail } from "./mailer.js";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DRY_RUN = process.env.DRY_RUN === "true";
const PDF_OUTPUT_DIR = process.env.PDF_OUTPUT_DIR ?? "./pdfs";

interface Periodo {
  id: number;
  consorcio_cuit: string;
  anio: number;
  mes: number;
  estado: string;
  fecha_vencimiento: string | null;
}

interface Consorcio {
  id: number;
  nombre: string;
  direccion: string;
  cuit: string | null;
}

interface Gasto {
  concepto: string;
  monto: string;
  tipo: string;
}

interface ExpensaRow {
  id: number;
  unidad_id: number;
  unidad_numero: string;
  monto_ordinario: string;
  monto_extraordinario: string;
  monto_fondo_reserva: string;
  monto_total: string;
  enviada: boolean;
  ocupante_nombre: string | null;
  ocupante_email: string | null;
  ocupante_whatsapp: string | null;
}

async function run(): Promise<void> {
  const periodoId = Number(process.env.PERIODO_ID);
  if (!periodoId) throw new Error("PERIODO_ID env var is required");

  // 1. Load period
  const periodo = await queryOne<Periodo>(
    "SELECT id, consorcio_cuit, anio, mes, estado, fecha_vencimiento FROM periodos_expensas WHERE id=$1",
    [periodoId]
  );
  if (!periodo) throw new Error(`Periodo ${periodoId} not found`);

  // 2. Load consorcio
  const consorcio = await queryOne<Consorcio>(
    "SELECT id, nombre, direccion, cuit FROM consorcios WHERE cuit=$1",
    [periodo.consorcio_cuit]
  );
  if (!consorcio) throw new Error(`Consorcio not found`);

  const mesNombre = MONTH_NAMES[periodo.mes] ?? String(periodo.mes);
  console.log(`\n📋 ${consorcio.nombre} — ${mesNombre} ${periodo.anio}`);
  console.log(`   Estado del período: ${periodo.estado}`);
  if (DRY_RUN) console.log("   ⚠️  DRY RUN — no emails will be sent\n");

  // 3. Ensure period is liquidated
  if (periodo.estado !== "liquidado") {
    console.log("   ⚙️  El período no está liquidado. Por favor, liquídelo en el portal primero.");
    return;
  }

  // 4. Load gastos for the receipt detail
  const gastos = await query<Gasto>(
    "SELECT descripcion AS concepto, monto, tipo FROM gastos_periodo WHERE periodo_id=$1 ORDER BY tipo, descripcion",
    [periodoId]
  );

  // 5. Load expensas with occupant info
  const expensas = await query<ExpensaRow>(
    `SELECT e.id, e.unidad_id, u.uf AS unidad_numero,
            e.expensas_a AS monto_ordinario,
            e.expensas_b AS monto_extraordinario,
            (e.s_asamblea + e.otros + e.gast_part) AS monto_fondo_reserva,
            e.total_pagar AS monto_total,
            e.enviada,
            p.nombre || ' ' || p.apellido AS ocupante_nombre,
            p.email AS ocupante_email,
            p.whatsapp AS ocupante_whatsapp
     FROM res_cuenta_periodo e
     JOIN unidades u ON u.id = e.unidad_id
     LEFT JOIN ocupantes o ON o.unidad_id = u.id AND o.activo=true AND o.rol='propietario'
     LEFT JOIN personas p ON p.id = o.persona_id
     WHERE e.periodo_id=$1
     ORDER BY u.uf`,
    [periodoId]
  );

  console.log(`\n   ${expensas.length} unidades a procesar\n`);

  const stats = { sent: 0, skipped_no_email: 0, skipped_already_sent: 0, errors: 0 };

  for (const exp of expensas) {
    const label = `Unidad ${exp.unidad_numero} — ${exp.ocupante_nombre ?? "Sin ocupante"}`;

    if (exp.enviada) {
      console.log(`   ⏩ ${label} — ya enviada`);
      stats.skipped_already_sent++;
      continue;
    }

    if (!exp.ocupante_email) {
      console.log(`   ⚠️  ${label} — sin email`);
      stats.skipped_no_email++;
      continue;
    }

    try {
      // Generate PDF
      const pdfPath = await generatePdf(
        {
          consorcio_nombre: consorcio.nombre,
          consorcio_direccion: consorcio.direccion,
          consorcio_cuit: consorcio.cuit ?? undefined,
          unidad_numero: exp.unidad_numero,
          ocupante_nombre: exp.ocupante_nombre ?? "Propietario",
          anio: periodo.anio,
          mes: periodo.mes,
          fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
          monto_ordinario: parseFloat(exp.monto_ordinario),
          monto_extraordinario: parseFloat(exp.monto_extraordinario),
          monto_fondo_reserva: parseFloat(exp.monto_fondo_reserva),
          monto_total: parseFloat(exp.monto_total),
          gastos: gastos.map((g) => ({ concepto: g.concepto, monto: parseFloat(g.monto), tipo: g.tipo })),
        },
        path.join(PDF_OUTPUT_DIR, String(periodoId))
      );

      if (!DRY_RUN) {
        await sendExpensaEmail({
          to: exp.ocupante_email,
          ocupante_nombre: exp.ocupante_nombre ?? "Propietario",
          consorcio_nombre: consorcio.nombre,
          unidad_numero: exp.unidad_numero,
          mes_nombre: mesNombre,
          anio: periodo.anio,
          monto_total: parseFloat(exp.monto_total),
          fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
          pdf_path: pdfPath,
        });

        // Mark as sent and store PDF path
        await query(
          "UPDATE res_cuenta_periodo SET enviada=true, pdf_url=$1 WHERE id=$2",
          [pdfPath, exp.id]
        );
      }

      console.log(`   ✅ ${label} — ${DRY_RUN ? "PDF generado (dry run)" : "enviada"} → ${pdfPath}`);
      stats.sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ ${label} — error: ${msg}`);
      stats.errors++;
    }
  }

  console.log(`
────────────────────────────────
  Resumen ${mesNombre} ${periodo.anio}
  ✅ Enviadas:         ${stats.sent}
  ⏩ Ya enviadas:      ${stats.skipped_already_sent}
  ⚠️  Sin email:        ${stats.skipped_no_email}
  ❌ Errores:          ${stats.errors}
────────────────────────────────
`);

  await pool.end();
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
