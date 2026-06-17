import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

export interface ExpensaReceipt {
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit?: string;
  unidad_numero: string;
  ocupante_nombre: string;
  anio: number;
  mes: number;
  fecha_vencimiento?: string;
  monto_ordinario: number;
  monto_extraordinario: number;
  monto_fondo_reserva: number;
  monto_total: number;
  gastos?: Array<{ concepto: string; monto: number; tipo: string }>;
}

function buildHtml(d: ExpensaReceipt): string {
  const mesNombre = MONTH_NAMES[d.mes] ?? String(d.mes);
  const gastosRows = (d.gastos ?? [])
    .map((g) => `<tr><td>${g.concepto}</td><td class="tipo">${g.tipo}</td><td class="monto">${formatMoney(g.monto)}</td></tr>`)
    .join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12px;color:#333;padding:32px}
.header{border-bottom:3px solid #1a3c5e;padding-bottom:16px;margin-bottom:24px}
.header h1{font-size:20px;color:#1a3c5e}
.badge{display:inline-block;background:#1a3c5e;color:white;padding:4px 12px;border-radius:4px;font-size:11px;margin-top:8px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.card{background:#f5f7fa;border-radius:6px;padding:14px}
.card h3{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:8px}
.card p{font-size:14px;font-weight:600;color:#1a3c5e}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#1a3c5e;color:white;padding:8px 10px;text-align:left;font-size:11px}
td{padding:7px 10px;border-bottom:1px solid #e8ecf0}
.monto{text-align:right;font-family:monospace}
.tipo{font-size:10px;color:#888}
.summary{background:#1a3c5e;color:white;border-radius:6px;padding:16px}
.summary table{margin-bottom:0}
.summary td{border-color:rgba(255,255,255,0.15);color:white}
.total-row td{font-size:16px;font-weight:700;border-top:2px solid rgba(255,255,255,0.4)}
.footer{margin-top:24px;font-size:10px;color:#aaa;text-align:center}
</style></head><body>
<div class="header">
  <h1>${d.consorcio_nombre}</h1>
  <p>${d.consorcio_direccion}</p>
  ${d.consorcio_cuit ? `<p>CUIT: ${d.consorcio_cuit}</p>` : ""}
  <span class="badge">Liquidación de Expensas — ${mesNombre} ${d.anio}</span>
</div>
<div class="grid">
  <div class="card"><h3>Unidad</h3><p>Depto. ${d.unidad_numero}</p></div>
  <div class="card"><h3>Propietario / Inquilino</h3><p>${d.ocupante_nombre}</p></div>
  <div class="card"><h3>Período</h3><p>${mesNombre} ${d.anio}</p></div>
  <div class="card"><h3>Vencimiento</h3><p>${d.fecha_vencimiento ?? "—"}</p></div>
</div>
${gastosRows ? `<table><thead><tr><th>Concepto</th><th>Tipo</th><th style="text-align:right">Monto</th></tr></thead><tbody>${gastosRows}</tbody></table>` : ""}
<div class="summary"><table>
  <tr><td>Expensas ordinarias</td><td class="monto">${formatMoney(d.monto_ordinario)}</td></tr>
  ${d.monto_extraordinario > 0 ? `<tr><td>Expensas extraordinarias</td><td class="monto">${formatMoney(d.monto_extraordinario)}</td></tr>` : ""}
  ${d.monto_fondo_reserva > 0 ? `<tr><td>Fondo de reserva</td><td class="monto">${formatMoney(d.monto_fondo_reserva)}</td></tr>` : ""}
  <tr class="total-row"><td><strong>TOTAL A PAGAR</strong></td><td class="monto"><strong>${formatMoney(d.monto_total)}</strong></td></tr>
</table></div>
<div class="footer">Generado automáticamente — ${d.consorcio_nombre}</div>
</body></html>`;
}

export async function generatePdf(data: ExpensaReceipt, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const safeUnidad = data.unidad_numero.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `expensa_${data.anio}_${String(data.mes).padStart(2, "0")}_u${safeUnidad}.pdf`;
  const filePath = path.join(outputDir, filename);

  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(data), { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }

  return filePath;
}
