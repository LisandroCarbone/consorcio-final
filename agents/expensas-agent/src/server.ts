/**
 * Thin HTTP wrapper around the expensas agent.
 * n8n calls POST /run-expensas with { consorcio_id, anio, mes }
 * The agent creates/opens the period, calculates, generates PDFs, and sends emails.
 */

import http from "http";
import fs from "fs/promises";
import path from "path";
import { pool, query, queryOne } from "./db.js";
import { generatePdf, generateSueldoPdf, SueldoReceipt } from "./pdf.js";
import { sendExpensaEmail, sendSueldoEmail } from "./mailer.js";

const PORT = Number(process.env.AGENT_PORT ?? 3001);
const API_KEY = process.env.AGENT_API_KEY ?? "";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatMoney = (n: number) => `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface RunPayload {
  consorcio_id: number;
  anio: number;
  mes: number;
  dry_run?: boolean;
  periodo_id?: number;
}

async function runDistribution(payload: RunPayload): Promise<object> {
  const { consorcio_id, anio, mes, dry_run = false } = payload;

  const consorcio = await queryOne<{ id: number; nombre: string; direccion: string; cuit: string }>(
    "SELECT id, nombre, direccion, cuit FROM consorcios WHERE id=$1",
    [consorcio_id]
  );
  if (!consorcio) throw new Error(`Consorcio ${consorcio_id} not found`);

  // Get or create period
  let periodo = await queryOne<{ id: number; consorcio_cuit: string; anio: number; mes: number; estado: string; fecha_vencimiento: string | null }>(
    "SELECT id, consorcio_cuit, anio, mes, estado, fecha_vencimiento FROM periodos_expensas WHERE consorcio_cuit=$1 AND anio=$2 AND mes=$3",
    [consorcio.cuit, anio, mes]
  );

  if (!periodo) {
    // Auto-create period with vencimiento on day 10 of same month
    const vencimiento = `${anio}-${String(mes).padStart(2, "0")}-10`;
    periodo = await queryOne(
      "INSERT INTO periodos_expensas (consorcio_cuit, anio, mes, fecha_vencimiento) VALUES ($1,$2,$3,$4) RETURNING id, consorcio_cuit, anio, mes, estado, fecha_vencimiento",
      [consorcio.cuit, anio, mes, vencimiento]
    );
    if (!periodo) throw new Error("Could not create period in periodos_expensas");
  }

  // Calculate if not liquidated
  if (periodo.estado !== "liquidado") {
    const cons = await queryOne<{ divisor_a: number, divisor_b: number }>(
      "SELECT divisor_a, divisor_b FROM consorcios WHERE cuit = $1",
      [consorcio.cuit]
    );
    const divA = cons?.divisor_a || 100;
    const divB = cons?.divisor_b || 100;

    const totals = await queryOne<{ ord: string, ext: string, fondo: string }>(
      `SELECT
         COALESCE(SUM(monto) FILTER (WHERE tipo='A'), 0) AS ord,
         COALESCE(SUM(monto) FILTER (WHERE tipo='B'), 0) AS ext,
         COALESCE(SUM(monto) FILTER (WHERE tipo='Particular'), 0) AS fondo
       FROM gastos_periodo WHERE periodo_id = $1`,
      [periodo.id]
    );

    const ordVal = parseFloat(totals?.ord || "0");
    const extVal = parseFloat(totals?.ext || "0");

    await query(
      `INSERT INTO res_cuenta_periodo (periodo_id, unidad_id, coef_a, coef_b, expensas_a, expensas_b, gast_part, saldo_anterior, su_pago, deuda, intereses, estado)
       SELECT $2, u.id, u.coef_a, u.coef_b,
         ROUND(($3 * u.coef_a / $5)::numeric, 2),
         ROUND(($4 * u.coef_b / $6)::numeric, 2),
         0, 0, 0, 0, 0, 'pendiente'
       FROM unidades u
       WHERE u.consorcio_cuit = $1
       ON CONFLICT (periodo_id, unidad_id) DO UPDATE SET
         expensas_a = EXCLUDED.expensas_a,
         expensas_b = EXCLUDED.expensas_b,
         updated_at = now()`,
      [consorcio.cuit, periodo.id, ordVal, extVal, divA, divB]
    );

    await query(
      `UPDATE periodos_expensas SET
         total_prorrateo_a_b = $1,
         estado = 'liquidado',
         fecha_cierre = CURRENT_DATE,
         updated_at = now()
       WHERE id = $2`,
      [ordVal + extVal, periodo.id]
    );
  }

  const gastos = await query<{ concepto: string; monto: string; tipo: string }>(
    "SELECT descripcion AS concepto, monto, tipo FROM gastos_periodo WHERE periodo_id=$1",
    [periodo.id]
  );

  const expensas = await query<{
    id: number; unidad_id: number; unidad_numero: string; monto_ordinario: string; monto_extraordinario: string;
    monto_fondo_reserva: string; monto_total: string; enviada: boolean;
  }>(
    `SELECT e.id, e.unidad_id, u.uf AS unidad_numero,
            e.expensas_a AS monto_ordinario,
            e.expensas_b AS monto_extraordinario,
            (e.s_asamblea + e.otros + e.gast_part) AS monto_fondo_reserva,
            e.total_pagar AS monto_total,
            e.enviada
     FROM res_cuenta_periodo e
     JOIN unidades u ON u.id=e.unidad_id
     WHERE e.periodo_id=$1`,
    [periodo.id]
  );

  const pdfDir = `${process.env.PDF_OUTPUT_DIR ?? "./pdfs"}/${periodo.id}`;
  const mesNombre = MONTH_NAMES[mes] ?? String(mes);
  const stats = { sent: 0, skipped_no_email: 0, already_sent: 0, errors: 0, pdf_paths: [] as string[] };

  for (const exp of expensas) {
    if (exp.enviada) { stats.already_sent++; continue; }

    const occupants = await query<{
      ocupante_nombre: string;
      ocupante_email: string | null;
      ocupante_whatsapp: string | null;
      rol: string;
    }>(
      `SELECT p.nombre || ' ' || p.apellido AS ocupante_nombre, p.email AS ocupante_email, p.whatsapp AS ocupante_whatsapp, o.rol
       FROM ocupantes o
       JOIN personas p ON p.id = o.persona_id
       WHERE o.unidad_id = $1 AND o.activo = true`,
      [exp.unidad_id]
    );

    if (occupants.length === 0) { stats.skipped_no_email++; continue; }

    try {
      const primaryName = occupants.find(o => o.rol === 'propietario')?.ocupante_nombre || occupants[0].ocupante_nombre;

      const pdfPath = await generatePdf({
        consorcio_nombre: consorcio.nombre,
        consorcio_direccion: consorcio.direccion,
        consorcio_cuit: consorcio.cuit ?? undefined,
        unidad_numero: exp.unidad_numero,
        ocupante_nombre: primaryName,
        anio, mes,
        fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
        monto_ordinario: parseFloat(exp.monto_ordinario),
        monto_extraordinario: parseFloat(exp.monto_extraordinario),
        monto_fondo_reserva: parseFloat(exp.monto_fondo_reserva),
        monto_total: parseFloat(exp.monto_total),
        gastos: gastos.map((g) => ({ concepto: g.concepto, monto: parseFloat(g.monto), tipo: g.tipo })),
      }, pdfDir);

      stats.pdf_paths.push(pdfPath);

      const pdfFilename = path.basename(pdfPath);
      const downloadUrl = `http://host.docker.internal:3001/pdfs/${periodo.id}/${pdfFilename}`;

      if (!dry_run) {
        for (const occ of occupants) {
          if (occ.ocupante_email) {
            await sendExpensaEmail({
              to: occ.ocupante_email,
              ocupante_nombre: occ.ocupante_nombre,
              consorcio_nombre: consorcio.nombre,
              unidad_numero: exp.unidad_numero,
              mes_nombre: mesNombre,
              anio, monto_total: parseFloat(exp.monto_total),
              fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
              pdf_path: pdfPath,
            }).catch(e => console.error(`Error sending email to ${occ.ocupante_email}:`, e));
          }

          if (occ.ocupante_whatsapp) {
            const cleanPhone = occ.ocupante_whatsapp.replace(/[^+\d]/g, "");
            const waMessage = `Hola ${occ.ocupante_nombre.split(" ")[0]}! Ya está disponible la liquidación de expensas de ${mesNombre} ${anio} para la Unidad ${exp.unidad_numero} del consorcio ${consorcio.nombre}. Total a pagar: ${formatMoney(parseFloat(exp.monto_total))}.`;

            await fetch("http://comms-agent:3002/send-whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": process.env.AGENT_API_KEY ?? "changeme" },
              body: JSON.stringify({ to: cleanPhone, message: waMessage, mediaUrl: downloadUrl })
            }).catch(e => console.error(`Error sending WhatsApp to ${occ.ocupante_whatsapp}:`, e));
          }
        }
        await query("UPDATE res_cuenta_periodo SET enviada=true, pdf_url=$1 WHERE id=$2", [downloadUrl, exp.id]);
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
  const url = new URL(req.url ?? "", `http://${req.headers.host}`);

  // Static PDF serving (publicly accessible for WhatsApp downloads / client access)
  if (req.method === "GET" && url.pathname.startsWith("/pdfs/")) {
    const relativePath = decodeURIComponent(url.pathname.replace("/pdfs/", ""));
    const filePath = path.resolve(process.env.PDF_OUTPUT_DIR ?? "./pdfs", relativePath);
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": "application/pdf" });
      res.end(data);
    } catch (e) {
      res.writeHead(404);
      res.end("File not found");
    }
    return;
  }

  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/run-expensas") {
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

  if (req.method === "POST" && url.pathname === "/run-sueldo") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { liquidacion_id } = JSON.parse(body) as { liquidacion_id: number };
        if (!liquidacion_id) throw new Error("liquidacion_id is required");

        // 1. Fetch liquidación details
        const liq = await queryOne<any>(
          `SELECT l.*, e.nombre AS empleado_nombre, e.cuil AS empleado_cuil, e.legajo AS empleado_legajo,
                  e.funcion AS empleado_funcion, e.jornada AS empleado_jornada,
                  e.categoria_edificio AS empleado_categoria_edificio,
                  e.fecha_ingreso AS empleado_fecha_ingreso, e.obra_social, e.cod_obra_social, e.banco, e.cbu,
                  e.email AS empleado_email, e.whatsapp AS empleado_whatsapp,
                  c.nombre AS consorcio_nombre, c.direccion AS consorcio_direccion, c.cuit AS consorcio_cuit
           FROM liquidaciones_sueldo l
           JOIN empleados e ON e.cuil = l.empleado_cuil
           JOIN consorcios c ON c.cuit = e.consorcio_cuit
           WHERE l.id = $1`,
          [liquidacion_id]
        );

        if (!liq) throw new Error(`Liquidación ${liquidacion_id} not found`);

        // 2. Fetch concepts
        const conceptos = await query<any>(
          `SELECT code, concepto, cantidad::numeric AS cantidad, importe::numeric AS importe, tipo
           FROM conceptos_liquidacion
           WHERE liquidacion_id = $1
           ORDER BY orden`,
          [liquidacion_id]
        );

        // 3. Format payload for receipt generator
        const receipt: SueldoReceipt = {
          consorcio_nombre: liq.consorcio_nombre,
          consorcio_cuit: liq.consorcio_cuit,
          consorcio_direccion: liq.consorcio_direccion,
          empleado_nombre: liq.empleado_nombre,
          empleado_cuil: liq.empleado_cuil,
          empleado_legajo: liq.empleado_legajo ?? undefined,
          empleado_funcion: liq.empleado_funcion,
          empleado_jornada: liq.empleado_jornada,
          empleado_categoria_edificio: liq.empleado_categoria_edificio,
          empleado_fecha_ingreso: liq.empleado_fecha_ingreso,
          obra_social: liq.obra_social ?? undefined,
          cod_obra_social: liq.cod_obra_social ?? undefined,
          banco: liq.banco ?? undefined,
          cbu: liq.cbu ?? undefined,
          periodo: liq.periodo,
          tipo: liq.tipo,
          remuneracion_bruta: parseFloat(liq.remuneracion_bruta || "0"),
          total_descuentos_empleado: parseFloat(liq.total_descuentos_empleado || "0"),
          neto_a_pagar: parseFloat(liq.neto_a_pagar || "0"),
          conceptos: conceptos.map((c: any) => ({
            code: c.code,
            concepto: c.concepto,
            cantidad: parseFloat(c.cantidad || "0"),
            importe: parseFloat(c.importe || "0"),
            tipo: c.tipo
          }))
        };

        const pdfDir = `${process.env.PDF_OUTPUT_DIR ?? "./pdfs"}/sueldos`;
        const pdfPath = await generateSueldoPdf(receipt, pdfDir);

        const pdfFilename = path.basename(pdfPath);
        const downloadUrl = `http://host.docker.internal:3001/pdfs/sueldos/${pdfFilename}`;

        // 4. Send Email if registered
        let emailSent = false;
        if (liq.empleado_email) {
          const dateObj = new Date(liq.periodo);
          const mesNombre = MONTH_NAMES[dateObj.getUTCMonth() + 1] ?? "";
          await sendSueldoEmail({
            to: liq.empleado_email,
            empleado_nombre: liq.empleado_nombre,
            consorcio_nombre: liq.consorcio_nombre,
            mes_nombre: mesNombre,
            anio: dateObj.getUTCFullYear(),
            neto_a_pagar: receipt.neto_a_pagar,
            pdf_path: pdfPath
          });
          emailSent = true;
        }

        // 5. Send WhatsApp if registered
        let whatsappSent = false;
        if (liq.empleado_whatsapp) {
          const dateObj = new Date(liq.periodo);
          const mesNombre = MONTH_NAMES[dateObj.getUTCMonth() + 1] ?? "";
          const cleanPhone = liq.empleado_whatsapp.replace(/[^+\d]/g, "");
          const waMessage = `Hola ${liq.empleado_nombre.split(" ")[0]}! Ya está disponible tu recibo de haberes de ${mesNombre} ${dateObj.getUTCFullYear()} de ${liq.consorcio_nombre}. Neto a cobrar: ${formatMoney(receipt.neto_a_pagar)}.`;

          await fetch("http://comms-agent:3002/send-whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": process.env.AGENT_API_KEY ?? "changeme" },
            body: JSON.stringify({ to: cleanPhone, message: waMessage, mediaUrl: downloadUrl })
          });
          whatsappSent = true;
        }

        // Save URL in db
        await query("UPDATE liquidaciones_sueldo SET pdf_url = $1 WHERE id = $2", [downloadUrl, liquidacion_id]);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, emailSent, whatsappSent, downloadUrl }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: msg }));
      }
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/send-expensa") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { res_cuenta_id } = JSON.parse(body) as { res_cuenta_id: number };
        if (!res_cuenta_id) throw new Error("res_cuenta_id is required");

        // 1. Fetch res_cuenta_periodo row
        const exp = await queryOne<any>(
          `SELECT e.id, e.unidad_id, u.uf AS unidad_numero,
                  e.expensas_a AS monto_ordinario,
                  e.expensas_b AS monto_extraordinario,
                  (e.s_asamblea + e.otros + e.gast_part) AS monto_fondo_reserva,
                  e.total_pagar AS monto_total,
                  e.periodo_id
           FROM res_cuenta_periodo e
           JOIN unidades u ON u.id=e.unidad_id
           WHERE e.id=$1`,
          [res_cuenta_id]
        );
        if (!exp) throw new Error(`Expensa ${res_cuenta_id} not found`);

        // 2. Fetch period details
        const periodo = await queryOne<any>(
          "SELECT * FROM periodos_expensas WHERE id=$1",
          [exp.periodo_id]
        );
        if (!periodo) throw new Error(`Period ${exp.periodo_id} not found`);

        // 3. Fetch consorcio details
        const consorcio = await queryOne<any>(
          "SELECT id, nombre, direccion, cuit FROM consorcios WHERE cuit=$1",
          [periodo.consorcio_cuit]
        );
        if (!consorcio) throw new Error("Consorcio not found");

        // 4. Fetch gastos
        const gastos = await query<any>(
          "SELECT descripcion AS concepto, monto, tipo FROM gastos_periodo WHERE periodo_id=$1",
          [exp.periodo_id]
        );

        // 5. Fetch occupants
        const occupants = await query<any>(
          `SELECT p.nombre || ' ' || p.apellido AS ocupante_nombre, p.email AS ocupante_email, p.whatsapp AS ocupante_whatsapp, o.rol
           FROM ocupantes o
           JOIN personas p ON p.id = o.persona_id
           WHERE o.unidad_id = $1 AND o.activo = true`,
          [exp.unidad_id]
        );

        if (occupants.length === 0) throw new Error("No active occupants found for this unit");

        const pdfDir = `${process.env.PDF_OUTPUT_DIR ?? "./pdfs"}/${exp.periodo_id}`;
        const primaryName = occupants.find((o: any) => o.rol === 'propietario')?.ocupante_nombre || occupants[0].ocupante_nombre;

        // Generate PDF
        const pdfPath = await generatePdf({
          consorcio_nombre: consorcio.nombre,
          consorcio_direccion: consorcio.direccion,
          consorcio_cuit: consorcio.cuit ?? undefined,
          unidad_numero: exp.unidad_numero,
          ocupante_nombre: primaryName,
          anio: periodo.anio,
          mes: periodo.mes,
          fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
          monto_ordinario: parseFloat(exp.monto_ordinario),
          monto_extraordinario: parseFloat(exp.monto_extraordinario),
          monto_fondo_reserva: parseFloat(exp.monto_fondo_reserva),
          monto_total: parseFloat(exp.monto_total),
          gastos: gastos.map((g: any) => ({ concepto: g.concepto, monto: parseFloat(g.monto), tipo: g.tipo })),
        }, pdfDir);

        const pdfFilename = path.basename(pdfPath);
        const downloadUrl = `http://host.docker.internal:3001/pdfs/${exp.periodo_id}/${pdfFilename}`;

        const mesNombre = MONTH_NAMES[periodo.mes] ?? String(periodo.mes);

        let emailSent = false;
        let whatsappSent = false;

        for (const occ of occupants) {
          if (occ.ocupante_email) {
            await sendExpensaEmail({
              to: occ.ocupante_email,
              ocupante_nombre: occ.ocupante_nombre,
              consorcio_nombre: consorcio.nombre,
              unidad_numero: exp.unidad_numero,
              mes_nombre: mesNombre,
              anio: periodo.anio,
              monto_total: parseFloat(exp.monto_total),
              fecha_vencimiento: periodo.fecha_vencimiento ?? undefined,
              pdf_path: pdfPath,
            }).catch(e => console.error(`Error sending email:`, e));
            emailSent = true;
          }

          if (occ.ocupante_whatsapp) {
            const cleanPhone = occ.ocupante_whatsapp.replace(/[^+\d]/g, "");
            const waMessage = `Hola ${occ.ocupante_nombre.split(" ")[0]}! Ya está disponible la liquidación de expensas de ${mesNombre} ${periodo.anio} para la Unidad ${exp.unidad_numero} del consorcio ${consorcio.nombre}. Total a pagar: ${formatMoney(parseFloat(exp.monto_total))}.`;

            await fetch("http://comms-agent:3002/send-whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": process.env.AGENT_API_KEY ?? "changeme" },
              body: JSON.stringify({ to: cleanPhone, message: waMessage, mediaUrl: downloadUrl })
            }).catch(e => console.error(`Error sending WhatsApp:`, e));
            whatsappSent = true;
          }
        }

        // Save URL in db
        await query("UPDATE res_cuenta_periodo SET enviada=true, pdf_url=$1 WHERE id=$2", [downloadUrl, res_cuenta_id]);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, emailSent, whatsappSent, downloadUrl }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: msg }));
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`expensas-agent HTTP server listening on :${PORT}`);
  console.log(`  Run Expensas:  POST /run-expensas`);
  console.log(`  Run Sueldo:    POST /run-sueldo`);
  console.log(`  Send Expensa:  POST /send-expensa`);
  console.log(`  Static PDFs:   GET /pdfs/*`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await pool.end();
  server.close();
});
