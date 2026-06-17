/**
 * Thin HTTP wrapper around the expensas agent.
 * n8n calls POST /run-expensas with { consorcio_id, anio, mes }
 * The agent creates/opens the period, calculates, generates PDFs, and sends emails.
 */

import http from "http";
import { pool, query, queryOne } from "./db.js";
import { generatePdf } from "./pdf.js";
import { sendExpensaEmail } from "./mailer.js";

const PORT = Number(process.env.AGENT_PORT ?? 3001);
const API_KEY = process.env.AGENT_API_KEY ?? "";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface RunPayload {
  consorcio_id: number;
  anio: number;
  mes: number;
  dry_run?: boolean;
  periodo_id?: number;
}

async function runDistribution(payload: RunPayload): Promise<object> {
  const { consorcio_id, anio, mes, dry_run = false } = payload;

  const consorcio = await queryOne<{ id: number; nombre: string; direccion: string; cuit: string | null }>(
    "SELECT * FROM consorcios WHERE id=$1",
    [consorcio_id]
  );
  if (!consorcio) throw new Error(`Consorcio ${consorcio_id} not found`);

  // Get or create period
  let periodo = await queryOne<{ id: number; consorcio_id: number; anio: number; mes: number; estado: string; fecha_vencimiento: string | null }>(
    "SELECT * FROM periodos WHERE consorcio_id=$1 AND anio=$2 AND mes=$3",
    [consorcio_id, anio, mes]
  );

  if (!periodo) {
    // Auto-create period with vencimiento on day 10 of same month
    const vencimiento = `${anio}-${String(mes).padStart(2, "0")}-10`;
    periodo = await queryOne(
      "INSERT INTO periodos (consorcio_id, anio, mes, fecha_vencimiento) VALUES ($1,$2,$3,$4) RETURNING *",
      [consorcio_id, anio, mes, vencimiento]
    );
    if (!periodo) throw new Error("Could not create periodo");
  }

  // Calculate if not liquidated
  if (periodo.estado !== "liquidado") {
    await query(
      `WITH coef_total AS (SELECT SUM(coeficiente) AS total FROM unidades WHERE consorcio_id=$1),
       totales AS (
         SELECT
           COALESCE(SUM(monto) FILTER (WHERE tipo='ordinario'),0) AS ord,
           COALESCE(SUM(monto) FILTER (WHERE tipo='extraordinario'),0) AS ext,
           COALESCE(SUM(monto) FILTER (WHERE tipo='fondo_reserva'),0) AS fondo
         FROM gastos WHERE periodo_id=$2
       )
       INSERT INTO expensas (periodo_id, unidad_id, monto_ordinario, monto_extraordinario, monto_fondo_reserva)
       SELECT $2, u.id,
         ROUND((totales.ord * u.coeficiente / coef_total.total)::numeric, 2),
         ROUND((totales.ext * u.coeficiente / coef_total.total)::numeric, 2),
         ROUND((totales.fondo * u.coeficiente / coef_total.total)::numeric, 2)
       FROM unidades u, totales, coef_total
       WHERE u.consorcio_id=$1
       ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
         monto_ordinario=EXCLUDED.monto_ordinario,
         monto_extraordinario=EXCLUDED.monto_extraordinario,
         monto_fondo_reserva=EXCLUDED.monto_fondo_reserva`,
      [consorcio_id, periodo.id]
    );
    await query(
      "UPDATE periodos SET estado='liquidado', fecha_cierre=CURRENT_DATE WHERE id=$1",
      [periodo.id]
    );
  }

  const gastos = await query<{ concepto: string; monto: string; tipo: string }>(
    "SELECT concepto, monto, tipo FROM gastos WHERE periodo_id=$1",
    [periodo.id]
  );

  const expensas = await query<{
    id: number; unidad_numero: string; monto_ordinario: string; monto_extraordinario: string;
    monto_fondo_reserva: string; monto_total: string; enviada: boolean;
    ocupante_nombre: string | null; ocupante_email: string | null;
  }>(
    `SELECT e.*, u.numero AS unidad_numero,
            p.nombre||' '||p.apellido AS ocupante_nombre, p.email AS ocupante_email
     FROM expensas e
     JOIN unidades u ON u.id=e.unidad_id
     LEFT JOIN ocupantes o ON o.unidad_id=u.id AND o.activo=true AND o.rol='propietario'
     LEFT JOIN personas p ON p.id=o.persona_id
     WHERE e.periodo_id=$1`,
    [periodo.id]
  );

  const pdfDir = `${process.env.PDF_OUTPUT_DIR ?? "./pdfs"}/${periodo.id}`;
  const mesNombre = MONTH_NAMES[mes] ?? String(mes);
  const stats = { sent: 0, skipped_no_email: 0, already_sent: 0, errors: 0, pdf_paths: [] as string[] };

  for (const exp of expensas) {
    if (exp.enviada) { stats.already_sent++; continue; }
    if (!exp.ocupante_email) { stats.skipped_no_email++; continue; }

    try {
      const pdfPath = await generatePdf({
        consorcio_nombre: consorcio.nombre,
        consorcio_direccion: consorcio.direccion,
        consorcio_cuit: consorcio.cuit ?? undefined,
        unidad_numero: exp.unidad_numero,
        ocupante_nombre: exp.ocupante_nombre ?? "Propietario",
        anio, mes,
        fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
        monto_ordinario: parseFloat(exp.monto_ordinario),
        monto_extraordinario: parseFloat(exp.monto_extraordinario),
        monto_fondo_reserva: parseFloat(exp.monto_fondo_reserva),
        monto_total: parseFloat(exp.monto_total),
        gastos: gastos.map((g) => ({ concepto: g.concepto, monto: parseFloat(g.monto), tipo: g.tipo })),
      }, pdfDir);

      stats.pdf_paths.push(pdfPath);

      if (!dry_run) {
        await sendExpensaEmail({
          to: exp.ocupante_email,
          ocupante_nombre: exp.ocupante_nombre ?? "Propietario",
          consorcio_nombre: consorcio.nombre,
          unidad_numero: exp.unidad_numero,
          mes_nombre: mesNombre,
          anio, monto_total: parseFloat(exp.monto_total),
          fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
          pdf_path: pdfPath,
        });
        await query("UPDATE expensas SET enviada=true, pdf_url=$1 WHERE id=$2", [pdfPath, exp.id]);
      }

      stats.sent++;
    } catch (err) {
      console.error(`Error for unidad ${exp.unidad_numero}:`, err);
      stats.errors++;
    }
  }

  return { success: true, periodo_id: periodo.id, stats };
}

const server = http.createServer(async (req, res) => {
  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  if (req.method === "POST" && req.url === "/run-expensas") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload: RunPayload = JSON.parse(body);
        const result = await runDistribution(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: msg }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`expensas-agent HTTP server listening on :${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await pool.end();
  server.close();
});
