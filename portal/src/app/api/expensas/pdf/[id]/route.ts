import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CATEGORIAS: Record<number, string> = {
  1: "Sueldos y Cargas Sociales",
  2: "Servicios Públicos y Tasas",
  3: "Abonos de Servicios",
  4: "Mantenimiento de Partes Comunes",
  5: "Reparaciones en Unidades",
  6: "Gastos Bancarios",
  7: "Limpieza",
  8: "Gastos de Administración",
  9: "Seguros",
  10: "Otros",
};

function money(n: number | string | null): string {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type ReceiptRow = {
  id: number;
  periodo_id: number;
  unidad_id: number;
  expensas_a: string;
  expensas_b: string;
  fondo_otros: string;
  total_pagar: string;
  total_mes: string;
  su_pago: string;
  saldo_anterior: string;
  deuda: string;
  intereses: string;
  uf: string;
  uf_numero: number | null;
  coef_a: string;
  coef_b: string;
  consorcio_nombre: string;
  consorcio_direccion: string;
  consorcio_cuit: string;
  interest_rate: string | null;
  anio: number;
  mes: number;
  fecha_vencimiento: string | null;
  fecha_vencimiento_2: string | null;
  interest_rate_2: string | null;
  propietario: string | null;
  banco: string | null;
  bank_titular: string | null;
  bank_account_number: string | null;
  cbu: string | null;
  bank_alias: string | null;
  admin_sociedad: string | null;
  admin_nombre: string | null;
  admin_cuit: string | null;
  admin_matricula: string | null;
  admin_email: string | null;
  admin_telefono: string | null;
  admin_celular: string | null;
  admin_domicilio: string | null;
  admin_horario: string | null;
  admin_categoria_afip: string | null;
}

type GastoRow = {
  descripcion: string;
  monto: string;
  tipo: string;
  categoria: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rcpId = Number(id);
  if (!Number.isInteger(rcpId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const receipt = await queryOne<ReceiptRow>(
    `SELECT rcp.id, rcp.periodo_id, rcp.unidad_id, rcp.expensas_a::numeric, rcp.expensas_b::numeric,
            (rcp.s_asamblea + rcp.otros + rcp.gast_part)::numeric AS fondo_otros,
            rcp.total_pagar::numeric, rcp.total_mes::numeric, rcp.su_pago::numeric,
            rcp.saldo_anterior::numeric, rcp.deuda::numeric, rcp.intereses::numeric,
            u.uf, u.uf_numero, u.coef_a, u.coef_b,
            c.nombre AS consorcio_nombre, c.direccion AS consorcio_direccion, c.cuit AS consorcio_cuit,
            c.interest_rate, c.banco, c.bank_titular, c.bank_account_number, c.cbu, c.bank_alias,
            p2.anio, p2.mes, p2.fecha_vencimiento, p2.fecha_vencimiento_2, p2.interest_rate_2,
            NULLIF(TRIM(COALESCE(per.nombre,'') || ' ' || COALESCE(per.apellido,'')), '') AS propietario,
            a.nombre_sociedad AS admin_sociedad, a.nombre_administrador AS admin_nombre,
            a.cuit AS admin_cuit, a.matricula_rpa AS admin_matricula,
            a.email AS admin_email, a.telefono AS admin_telefono,
            a.celular_urgencias AS admin_celular, a.domicilio AS admin_domicilio,
            a.horario_atencion AS admin_horario, a.categoria_afip AS admin_categoria_afip
     FROM app.res_cuenta_periodo rcp
     JOIN app.unidades u ON u.id = rcp.unidad_id
     JOIN app.periodos_expensas p2 ON p2.id = rcp.periodo_id
     JOIN app.consorcios c ON c.cuit = p2.consorcio_cuit
     LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
     LEFT JOIN app.personas per ON per.id = o.persona_id
     LEFT JOIN app.administradores a ON a.id = c.administrador_id
     WHERE rcp.id = $1`,
    [rcpId]
  );

  if (!receipt) {
    return new Response("<h1>Liquidación no encontrada</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const gastos = await query<GastoRow>(
    `SELECT descripcion, monto::numeric, tipo, categoria
     FROM app.gastos_periodo
     WHERE periodo_id = $1
     ORDER BY categoria, descripcion`,
    [receipt.periodo_id]
  );

  const gastosPorCategoria = new Map<number, GastoRow[]>();
  for (const g of gastos) {
    const list = gastosPorCategoria.get(g.categoria) ?? [];
    list.push(g);
    gastosPorCategoria.set(g.categoria, list);
  }

  const categoriaRows = [...gastosPorCategoria.entries()]
    .sort(([a], [b]) => a - b)
    .map(([categoria, items]) => {
      const subtotal = items.reduce((sum, g) => sum + Number(g.monto), 0);
      const itemRows = items.map(g => `
        <tr>
          <td class="gasto-desc">${esc(g.descripcion)}</td>
          <td class="r mono">${g.tipo === "A" ? money(g.monto) : ""}</td>
          <td class="r mono">${g.tipo === "B" ? money(g.monto) : ""}</td>
        </tr>`).join("");
      return `
        <tr class="cat-row">
          <td><strong>${categoria}. ${esc(CATEGORIAS[categoria] ?? "Otros")}</strong></td>
          <td class="r mono" colspan="2"><strong>${money(subtotal)}</strong></td>
        </tr>
        ${itemRows}`;
    }).join("");

  const periodoLabel = `${MONTH_NAMES[receipt.mes] ?? receipt.mes} ${receipt.anio}`;

  const vencimientoSection = receipt.fecha_vencimiento_2
    ? `
    <div style="display:flex; gap:0;">
      <div class="vencimiento-bar" style="flex:1; background:#222;">
        1er VTO: ${formatDate(receipt.fecha_vencimiento)}${receipt.interest_rate ? ` — Interés: ${Number(receipt.interest_rate)}%` : ""}
      </div>
      <div class="vencimiento-bar" style="flex:1; background:#555;">
        2do VTO: ${formatDate(receipt.fecha_vencimiento_2)}${receipt.interest_rate_2 ? ` — Interés: ${Number(receipt.interest_rate_2)}%` : ""}
      </div>
    </div>`
    : `
    <div class="vencimiento-bar">
      FECHA DE VENCIMIENTO: ${formatDate(receipt.fecha_vencimiento)}${receipt.interest_rate ? ` — Interés: ${Number(receipt.interest_rate)}%` : ""}
    </div>`;

  const hasAdmin = Boolean(receipt.admin_sociedad || receipt.admin_nombre);
  const adminHeader = hasAdmin
    ? `
    <div>
      <h1>${esc(receipt.admin_sociedad || receipt.admin_nombre)}</h1>
      ${receipt.admin_sociedad && receipt.admin_nombre ? `<div class="meta">${esc(receipt.admin_nombre)}</div>` : ""}
      ${(receipt.admin_cuit || receipt.admin_matricula) ? `<div class="meta">${receipt.admin_cuit ? `CUIT: ${esc(receipt.admin_cuit)}` : ""}${receipt.admin_cuit && receipt.admin_matricula ? " | " : ""}${receipt.admin_matricula ? `Mat. RPA: ${esc(receipt.admin_matricula)}` : ""}</div>` : ""}
      ${receipt.admin_domicilio ? `<div class="meta">${esc(receipt.admin_domicilio)}</div>` : ""}
      ${(receipt.admin_telefono || receipt.admin_celular) ? `<div class="meta">${receipt.admin_telefono ? `Tel: ${esc(receipt.admin_telefono)}` : ""}${receipt.admin_telefono && receipt.admin_celular ? " | " : ""}${receipt.admin_celular ? `Cel: ${esc(receipt.admin_celular)}` : ""}</div>` : ""}
      ${receipt.admin_email ? `<div class="meta">Email: ${esc(receipt.admin_email)}</div>` : ""}
      ${(receipt.admin_categoria_afip || receipt.admin_horario) ? `<div class="meta">${receipt.admin_categoria_afip ? esc(receipt.admin_categoria_afip) : ""}${receipt.admin_categoria_afip && receipt.admin_horario ? " | " : ""}${receipt.admin_horario ? `Horario: ${esc(receipt.admin_horario)}` : ""}</div>` : ""}
    </div>`
    : `
    <div>
      <h1>${esc(receipt.consorcio_nombre)}</h1>
      <div class="meta">${esc(receipt.consorcio_direccion)}</div>
      <div class="meta">CUIT: ${esc(receipt.consorcio_cuit)}</div>
    </div>`;

  const periodoBox = `
    <div class="periodo-box">
      ${hasAdmin ? `
      <div style="font-weight:700;font-size:14px;">${esc(receipt.consorcio_nombre)}</div>
      <div class="meta">${esc(receipt.consorcio_direccion)}</div>
      <div class="meta">CUIT: ${esc(receipt.consorcio_cuit)}</div>
      <div style="margin-top:8px;">Aviso de Pago</div>` : `<div>Aviso de Pago</div>`}
      <div class="periodo-value">${periodoLabel}</div>
    </div>`;

  const paymentSection = (receipt.banco || receipt.cbu)
    ? `
    <div class="section-title">FORMAS DE PAGO</div>
    <table class="payment-table">
      <tr>
        ${receipt.banco ? `<td><span class="lbl">Banco:</span> ${esc(receipt.banco)}</td>` : ""}
        ${receipt.bank_titular ? `<td><span class="lbl">Titular:</span> ${esc(receipt.bank_titular)}</td>` : ""}
      </tr>
      <tr>
        ${receipt.bank_account_number ? `<td><span class="lbl">Cuenta:</span> ${esc(receipt.bank_account_number)}</td>` : ""}
        ${receipt.cbu ? `<td><span class="lbl">CBU:</span> <strong>${esc(receipt.cbu)}</strong></td>` : ""}
      </tr>
      ${receipt.bank_alias ? `<tr><td><span class="lbl">Alias:</span> <strong>${esc(receipt.bank_alias)}</strong></td><td></td></tr>` : ""}
    </table>`
    : "";

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Expensas UF ${receipt.uf_numero ?? ""} — ${esc(receipt.uf)} — ${periodoLabel}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    color: #222;
    max-width: 780px;
    margin: 0 auto;
    padding: 24px;
    background: #fff;
    font-size: 12px;
    line-height: 1.4;
  }

  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #222;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .doc-header h1 { font-size: 16px; letter-spacing: -0.3px; }
  .doc-header .meta { font-size: 10px; color: #444; margin-top: 2px; }
  .doc-header .periodo-box { text-align: right; font-size: 10px; color: #444; }
  .doc-header .periodo-value {
    font-size: 18px; font-weight: 700; color: #222; letter-spacing: -0.5px;
  }

  .uf-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 20px;
    background: #f7f7f7;
    padding: 10px 14px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 12px;
  }
  .uf-info .lbl { color: #666; }
  .uf-info .val { font-weight: 700; }

  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #444;
    border-bottom: 1px solid #bbb;
    padding-bottom: 3px;
    margin: 16px 0 6px;
  }

  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th {
    font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px;
    color: #555; font-weight: 600; padding: 4px 6px;
    border-bottom: 1px solid #999; text-align: left;
  }
  td { padding: 4px 6px; border-bottom: 1px solid #e8e8e8; }
  .r { text-align: right; }
  .mono { font-family: "Consolas", "Courier New", monospace; }

  .cat-row td {
    background: #f4f4f4; border-top: 1px solid #ccc;
    border-bottom: 1px solid #ddd; padding: 4px 6px;
  }
  .gasto-desc { padding-left: 14px; color: #333; }

  .summary-table { margin: 12px 0; }
  .summary-table td { padding: 6px 8px; font-size: 13px; }
  .summary-table .total-row td {
    font-weight: 700; font-size: 15px;
    border-top: 2px solid #222; border-bottom: 2px solid #222;
    background: #f4f4f4;
  }

  .vencimiento-bar {
    background: #222; color: #fff; text-align: center;
    padding: 8px; font-size: 12px; font-weight: 700;
    letter-spacing: 0.3px; margin: 16px 0 4px;
  }
  .interest-note {
    text-align: center; font-size: 9px; color: #666;
    text-transform: uppercase; letter-spacing: 0.3px;
  }

  .payment-table { font-size: 11px; margin: 4px 0; }
  .payment-table td { border: none; padding: 2px 12px 2px 0; }
  .payment-table .lbl { color: #666; }

  @media print {
    body { padding: 0; max-width: 100%; }
    .no-print { display: none !important; }
  }
  .no-print { margin-top: 14px; }
  .no-print button {
    background: #222; color: #fff; border: none;
    padding: 8px 20px; font-size: 12px; cursor: pointer; border-radius: 4px;
  }
  .no-print button:hover { background: #444; }
</style>
</head>
<body>

  <div class="doc-header">
    ${adminHeader}
    ${periodoBox}
  </div>

  <div class="uf-info">
    <div><span class="lbl">UF:</span> <span class="val">${receipt.uf_numero ?? "—"}</span></div>
    <div><span class="lbl">Unidad:</span> <span class="val">${esc(receipt.uf)}</span></div>
    <div><span class="lbl">Propietario:</span> <span class="val">${esc(receipt.propietario) || "—"}</span></div>
    <div><span class="lbl">Coef. A:</span> <span class="val">${(Number(receipt.coef_a) * 100).toFixed(2)}%</span> · <span class="lbl">Coef. B:</span> <span class="val">${(Number(receipt.coef_b) * 100).toFixed(2)}%</span></div>
  </div>

  <div class="section-title">RESUMEN DE CUENTA</div>
  <table class="summary-table">
    <tbody>
      <tr><td>Saldo anterior</td><td class="r mono">${money(receipt.saldo_anterior)}</td></tr>
      <tr><td>Su pago del mes</td><td class="r mono">${money(receipt.su_pago)}</td></tr>
      <tr><td>Ordinario (A)</td><td class="r mono">${money(receipt.expensas_a)}</td></tr>
      <tr><td>Extraordinario (B)</td><td class="r mono">${money(receipt.expensas_b)}</td></tr>
      <tr><td>Fondo / Otros</td><td class="r mono">${money(receipt.fondo_otros)}</td></tr>
      <tr><td>Deuda</td><td class="r mono">${money(receipt.deuda)}</td></tr>
      <tr><td>Intereses</td><td class="r mono">${money(receipt.intereses)}</td></tr>
      <tr class="total-row"><td>TOTAL A PAGAR</td><td class="r mono">${money(receipt.total_pagar)}</td></tr>
    </tbody>
  </table>

  ${vencimientoSection}

  ${paymentSection}

  <div class="section-title">DETALLE DE GASTOS DEL PERÍODO</div>
  <table>
    <thead>
      <tr>
        <th style="width:60%">Descripción</th>
        <th class="r">Gastos "A"</th>
        <th class="r">Gastos "B"</th>
      </tr>
    </thead>
    <tbody>
      ${categoriaRows || `<tr><td colspan="3">Sin gastos registrados</td></tr>`}
    </tbody>
  </table>

  <div class="no-print">
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
