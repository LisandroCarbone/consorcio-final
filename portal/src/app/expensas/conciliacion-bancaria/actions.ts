"use server";

import { query, queryOne, pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { categorizeBankCharge } from "@/lib/conciliacion/categorizeBankCharge";
import { runCalculateExpenses } from "@/lib/expenses/engine";

const BASE_PATH = "/expensas/conciliacion-bancaria";
const RUBRO_GASTOS_BANCARIOS = 6;

// ─────────────────────────────────────────────────────────────────────────
// CSV parsing
// ─────────────────────────────────────────────────────────────────────────

type ParsedMovimiento = {
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  referencia: string | null;
  monto: number; // negative = debit, positive = credit
  cbu_origen: string | null;
  cuit_origen: string | null;
  nombre_origen: string | null;
};

type ParsedExtracto = {
  movimientos: ParsedMovimiento[];
  saldo_apertura: number | null;
  saldo_cierre: number | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
};

function detectDelimiter(headerLine: string): string {
  const counts = [",", ";", "\t"].map((d) => ({ d, n: headerLine.split(d).length }));
  counts.sort((a, b) => b.n - a.n);
  return counts[0].n > 1 ? counts[0].d : ",";
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  const negative = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()]/g, "").replace(/^-/, "");
  s = s.replace(/[^\d.,]/g, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    s = s.replace(/,/g, "");
  } else {
    s = s.replace(/,/g, "");
  }
  const n = Number(s);
  if (isNaN(n)) return null;
  return negative ? -n : n;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    return `${m[3]}-${mm}-${dd}`;
  }
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    const yy = Number(m[3]) < 50 ? `20${m[3]}` : `19${m[3]}`;
    return `${yy}-${mm}-${dd}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

const HEADER_MAP: Record<string, string[]> = {
  fecha: ["fecha", "date", "dia"],
  descripcion: ["descripcion", "concepto", "detalle", "description"],
  monto: ["monto", "importe", "amount"],
  credito: ["credito", "haber", "credit"],
  debito: ["debito", "debe", "debit"],
  referencia: ["referencia", "comprobante", "nrooperacion", "ref", "numerocomprobante"],
  cbu: ["cbu", "cbuorigen", "cbucuit"],
  cuit: ["cuit", "cuitorigen", "origen"],
  nombre: ["nombreorigen", "nombre", "titular", "ordenante"],
};

function mapColumns(headers: string[]): Record<string, number> {
  const normalized = headers.map(normalizeHeader);
  const map: Record<string, number> = {};
  for (const [key, aliases] of Object.entries(HEADER_MAP)) {
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias);
      if (idx !== -1) {
        map[key] = idx;
        break;
      }
    }
  }
  return map;
}

function parseExtractoCsv(text: string): ParsedExtracto {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { movimientos: [], saldo_apertura: null, saldo_cierre: null, fecha_desde: null, fecha_hasta: null };

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const cols = mapColumns(headers);

  const movimientos: ParsedMovimiento[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    if (cells.every((c) => !c)) continue;

    const fechaRaw = cols.fecha !== undefined ? cells[cols.fecha] : "";
    const fecha = parseDate(fechaRaw);
    if (!fecha) continue;

    const descripcion = cols.descripcion !== undefined ? cells[cols.descripcion] : "";

    let monto: number | null = null;
    if (cols.credito !== undefined || cols.debito !== undefined) {
      const credito = cols.credito !== undefined ? parseAmount(cells[cols.credito]) : null;
      const debito = cols.debito !== undefined ? parseAmount(cells[cols.debito]) : null;
      if (credito && credito !== 0) monto = Math.abs(credito);
      else if (debito && debito !== 0) monto = -Math.abs(debito);
    } else if (cols.monto !== undefined) {
      monto = parseAmount(cells[cols.monto]);
    }
    if (monto === null || monto === 0) continue;

    const referencia = cols.referencia !== undefined ? cells[cols.referencia] || null : null;
    const cbu_origen = cols.cbu !== undefined ? cells[cols.cbu] || null : null;
    const cuit_origen = cols.cuit !== undefined ? cells[cols.cuit] || null : null;
    const nombre_origen = cols.nombre !== undefined ? cells[cols.nombre] || null : null;

    movimientos.push({
      fecha,
      descripcion,
      referencia,
      monto,
      cbu_origen,
      cuit_origen,
      nombre_origen,
    });
  }

  const fechas = movimientos.map((m) => m.fecha).sort();
  return {
    movimientos,
    saldo_apertura: null,
    saldo_cierre: null,
    fecha_desde: fechas.length > 0 ? fechas[0] : null,
    fecha_hasta: fechas.length > 0 ? fechas[fechas.length - 1] : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// XLS / XLSX parsing
// ─────────────────────────────────────────────────────────────────────────

function rowText(row: unknown[]): string {
  return row.map((c) => String(c ?? "")).join(" ");
}

function extractSaldoCierre(metadataRows: unknown[][]): number | null {
  for (const row of metadataRows) {
    const text = rowText(row);
    const m = text.match(/(?<!Disponible[:\s]*)\bSaldo\s*:?\s*([\d.,]+)/i);
    if (m) {
      const amount = parseAmount(m[1]);
      if (amount !== null) return amount;
    }
  }
  return null;
}

function extractFechaRange(metadataRows: unknown[][]): { desde: string | null; hasta: string | null } {
  for (const row of metadataRows) {
    const text = rowText(row);
    const m = text.match(/Movimientos\s*de:?\s*([\d/-]+)\s*a\s*([\d/-]+)/i);
    if (m) {
      return { desde: parseDate(m[1]), hasta: parseDate(m[2]) };
    }
  }
  return { desde: null, hasta: null };
}

function extractSaldoDisponible(row: unknown[]): number | null {
  const text = rowText(row);
  const m = text.match(/Saldo\s*Disponible\s*:?\s*([\d.,]+)/i);
  if (m) {
    return parseAmount(m[1]);
  }
  return null;
}

function parseExtractoXls(buffer: ArrayBuffer): ParsedExtracto {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });

  if (rawRows.length === 0) {
    return { movimientos: [], saldo_apertura: null, saldo_cierre: null, fecha_desde: null, fecha_hasta: null };
  }

  // Find the header row by scanning for a row containing "Fecha"
  let headerIdx = -1;
  for (let i = 0; i < Math.min(20, rawRows.length); i++) {
    const cells = rawRows[i].map((c) => String(c ?? "").toLowerCase().trim());
    if (cells.some((c) => c === "fecha")) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) {
    return { movimientos: [], saldo_apertura: null, saldo_cierre: null, fecha_desde: null, fecha_hasta: null };
  }

  const metadataRows = rawRows.slice(0, headerIdx);
  const saldo_cierre = extractSaldoCierre(metadataRows);
  const { desde: fecha_desde, hasta: fecha_hasta } = extractFechaRange(metadataRows);

  const headers = rawRows[headerIdx].map((c) => String(c ?? "").toLowerCase().trim());

  const findCol = (...candidates: string[]) => {
    const idx = headers.findIndex((h) => candidates.some((c) => h.includes(c)));
    return idx >= 0 ? idx : -1;
  };

  const iF = findCol("fecha");
  const iDesc = findCol("concepto", "descripcion", "descripción", "detalle", "movimiento");
  const iRef = findCol("referencia", "comprobante", "numero documento", "número documento", "nro");
  const iMonto = findCol("importe", "monto", "amount");
  const iCred = findCol("credito", "crédito", "haber", "credit");
  const iDeb = findCol("debito", "débito", "debe", "debit");
  const iCbu = findCol("cbu");
  const iCuit = findCol("cuit", "cuil");
  const iNombre = findCol("nombre", "titular", "ordenante", "originante");
  const iDetalle = headers.indexOf("detalle") >= 0 && iDesc !== headers.indexOf("detalle")
    ? headers.indexOf("detalle") : -1;

  if (iF < 0 || (iMonto < 0 && iCred < 0)) {
    return { movimientos: [], saldo_apertura: null, saldo_cierre, fecha_desde, fecha_hasta };
  }

  const result: ParsedMovimiento[] = [];
  let saldo_apertura: number | null = null;
  let lastDataRow: unknown[] | null = null;

  for (let r = headerIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const cell = (i: number) => (i >= 0 && i < row.length ? row[i] : null);

    const fechaRaw = cell(iF);
    let fecha = "";
    if (fechaRaw instanceof Date) {
      fecha = fechaRaw.toISOString().slice(0, 10);
    } else {
      const s = String(fechaRaw ?? "").trim();
      const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (dmy) {
        const y = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
        fecha = `${y}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
      } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        fecha = s.slice(0, 10);
      }
    }
    if (!fecha) continue;

    let monto = 0;
    if (iMonto >= 0) {
      monto = parseAmount(String(cell(iMonto) ?? "0")) ?? 0;
    } else {
      const cred = iCred >= 0 ? parseAmount(String(cell(iCred) ?? "0")) ?? 0 : 0;
      const deb = iDeb >= 0 ? parseAmount(String(cell(iDeb) ?? "0")) ?? 0 : 0;
      monto = cred > 0 ? cred : deb !== 0 ? -Math.abs(deb) : 0;
    }
    if (monto === 0) continue;

    const desc = iDesc >= 0 ? String(cell(iDesc) ?? "").trim() : "";
    const detalle = iDetalle >= 0 ? String(cell(iDetalle) ?? "").trim() : "";
    const descripcion = desc || detalle || "Sin descripción";

    const refRaw = iRef >= 0 ? String(cell(iRef) ?? "").trim() : "";
    const referencia = refRaw || `${fecha}_${Math.abs(monto).toFixed(2)}_${descripcion.slice(0, 20)}`;

    result.push({
      fecha,
      descripcion,
      referencia,
      monto,
      cbu_origen: iCbu >= 0 ? String(cell(iCbu) ?? "").trim() || null : null,
      cuit_origen: iCuit >= 0 ? String(cell(iCuit) ?? "").trim() || null : null,
      nombre_origen: iNombre >= 0 ? String(cell(iNombre) ?? "").trim() || null : null,
    });

    lastDataRow = row;
  }

  // Rows are ordered newest-first: the last data row (oldest date) carries
  // the "Saldo Disponible" opening balance.
  if (lastDataRow) {
    saldo_apertura = extractSaldoDisponible(lastDataRow);
  }

  return { movimientos: result, saldo_apertura, saldo_cierre, fecha_desde, fecha_hasta };
}

// ─────────────────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────────────────

export async function uploadExtracto(formData: FormData) {
  const file = formData.get("file") as File | null;
  const consorcioCuit = formData.get("consorcio_cuit") as string;
  const periodoId = Number(formData.get("periodo_id"));
  const anio = Number(formData.get("anio"));
  const mes = Number(formData.get("mes"));
  const corteLabel = (formData.get("corte_label") as string) || null;

  if (!file || !consorcioCuit || !periodoId) {
    throw new Error("Faltan datos requeridos para el extracto.");
  }

  const ext = file.name.toLowerCase().split(".").pop();
  if (!ext || !["csv", "xls", "xlsx"].includes(ext)) {
    throw new Error("Solo se aceptan archivos CSV, XLS o XLSX");
  }

  let parsed: ParsedExtracto;

  if (ext === "csv") {
    let text = await file.text();
    if (text.includes("�") || /Ã[©¡³ºñ]/.test(text)) {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder("windows-1252");
      text = decoder.decode(buffer);
    }
    parsed = parseExtractoCsv(text);
  } else {
    const buffer = await file.arrayBuffer();
    parsed = parseExtractoXls(buffer);
  }

  const movimientos = parsed.movimientos;

  if (movimientos.length === 0) {
    throw new Error("No se pudieron leer movimientos del archivo. Verifique el formato.");
  }

  const totalCreditos = movimientos.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0);
  const totalDebitos = movimientos.filter((m) => m.monto < 0).reduce((s, m) => s + Math.abs(m.monto), 0);

  const client = await pool.connect();
  let extractoId: number;
  let inserted = 0;
  try {
    await client.query("BEGIN");

    const extractoRes = await client.query<{ id: number }>(
      `INSERT INTO app.extractos_bancarios
        (consorcio_cuit, periodo_id, anio, mes, archivo_nombre, corte_label, fecha_carga, estado,
         total_creditos, total_debitos, movimientos_count, matcheados_count,
         saldo_apertura, saldo_cierre, fecha_desde, fecha_hasta)
       VALUES ($1,$2,$3,$4,$5,$6, now(), 'pendiente', $7, $8, $9, 0, $10, $11, $12, $13)
       RETURNING id`,
      [
        consorcioCuit,
        periodoId,
        anio,
        mes,
        file.name,
        corteLabel,
        totalCreditos,
        totalDebitos,
        movimientos.length,
        parsed.saldo_apertura,
        parsed.saldo_cierre,
        parsed.fecha_desde,
        parsed.fecha_hasta,
      ]
    );
    extractoId = extractoRes.rows[0].id;

    for (const m of movimientos) {
      const syntheticRef =
        m.referencia || `${m.fecha || "nodate"}_${m.monto}_${(m.descripcion || "").slice(0, 20)}`;
      const categoriaBancaria = m.monto < 0 ? categorizeBankCharge(m.descripcion) : null;
      const absM = Math.abs(m.monto);

      const dup = await client.query(
        `SELECT 1 FROM app.extracto_movimientos em
         JOIN app.extractos_bancarios eb ON eb.id = em.extracto_id
         WHERE eb.periodo_id = $1 AND em.fecha = $2 AND em.monto = $3 AND em.referencia = $4
         LIMIT 1`,
        [periodoId, m.fecha, absM, syntheticRef]
      );
      if ((dup.rowCount ?? 0) > 0) continue;

      const res = await client.query(
        `INSERT INTO app.extracto_movimientos
          (extracto_id, fecha, descripcion, referencia, monto, es_credito, cbu_origen, cuit_origen, nombre_origen, estado_match, categoria_bancaria, match_tipo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pendiente',$10,$11)
         ON CONFLICT (extracto_id, referencia, monto, fecha) DO NOTHING`,
        [
          extractoId,
          m.fecha,
          m.descripcion,
          syntheticRef,
          absM,
          m.monto > 0,
          m.cbu_origen,
          m.cuit_origen,
          m.nombre_origen,
          categoriaBancaria,
          categoriaBancaria ? "gasto_bancario" : null,
        ]
      );
      inserted += res.rowCount ?? 0;
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  if (inserted !== movimientos.length) {
    const totals = await queryOne<{ tc: number; td: number; cnt: number }>(
      `SELECT COALESCE(SUM(CASE WHEN es_credito THEN monto ELSE 0 END), 0)::numeric AS tc,
              COALESCE(SUM(CASE WHEN NOT es_credito THEN ABS(monto) ELSE 0 END), 0)::numeric AS td,
              COUNT(*)::int AS cnt
       FROM app.extracto_movimientos WHERE extracto_id = $1`,
      [extractoId]
    );
    if (totals) {
      await query(
        `UPDATE app.extractos_bancarios SET total_creditos = $1, total_debitos = $2, movimientos_count = $3 WHERE id = $4`,
        [totals.tc, totals.td, totals.cnt, extractoId]
      );
    }
  }

  await runAutoMatch(extractoId);
  revalidatePath(BASE_PATH);
  return extractoId;
}

// ─────────────────────────────────────────────────────────────────────────
// Auto matching
// ─────────────────────────────────────────────────────────────────────────

function normalizeName(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function nameMatches(a: string, b: string): boolean {
  if (!a || !b) return false;
  const partsA = normalizeName(a).split(/\s+/).filter((p) => p.length > 2);
  const partsB = normalizeName(b).split(/\s+/).filter((p) => p.length > 2);
  if (partsA.length === 0 || partsB.length === 0) return false;
  let matches = 0;
  for (const p of partsA) {
    if (partsB.includes(p)) matches++;
  }
  return matches >= 1 && (matches / Math.min(partsA.length, partsB.length)) >= 0.5;
}

function onlyDigits(s: string | null | undefined): string {
  return (s || "").replace(/\D/g, "");
}

export async function runAutoMatch(extractoId: number) {
  const extracto = await queryOne<{
    consorcio_cuit: string;
    periodo_id: number;
  }>(
    "SELECT consorcio_cuit, periodo_id FROM app.extractos_bancarios WHERE id = $1",
    [extractoId]
  );
  if (!extracto) return;

  const consorcio = await queryOne<{ formato_cobro: string | null }>(
    "SELECT formato_cobro FROM app.consorcios WHERE cuit = $1",
    [extracto.consorcio_cuit]
  );

  const movimientos = await query<{
    id: number;
    monto: string;
    es_credito: boolean;
    descripcion: string;
    cbu_origen: string | null;
    cuit_origen: string | null;
    nombre_origen: string | null;
    categoria_bancaria: string | null;
    fecha: string;
  }>(
    `SELECT id, monto::numeric, es_credito, descripcion, cbu_origen, cuit_origen, nombre_origen, categoria_bancaria, fecha
     FROM app.extracto_movimientos
     WHERE extracto_id = $1 AND estado_match IN ('pendiente', 'sugerido', 'rechazado')`,
    [extractoId]
  );
  if (movimientos.length === 0) return;

  const unidades = await query<{
    id: number;
    uf: string;
    uf_numero: number | null;
    total_pagar: string | null;
    propietario_nombre: string | null;
    propietario_cuit: string | null;
  }>(
    `SELECT u.id, u.uf::text, u.uf_numero,
            rcp.total_pagar::text,
            NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario_nombre,
            p.dni AS propietario_cuit
     FROM app.unidades u
     LEFT JOIN app.res_cuenta_periodo rcp ON rcp.unidad_id = u.id AND rcp.periodo_id = $2
     LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
     LEFT JOIN app.personas p ON p.id = o.persona_id
     WHERE u.consorcio_cuit = $1`,
    [extracto.consorcio_cuit, extracto.periodo_id]
  );

  const cbuMap = await query<{ cbu_o_cuit: string; unidad_id: number }>(
    "SELECT cbu_o_cuit, unidad_id FROM app.cbu_unidad_map WHERE consorcio_cuit = $1",
    [extracto.consorcio_cuit]
  );

  const allPeriodoIds = await query<{ id: number }>(
    "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1",
    [extracto.consorcio_cuit]
  );
  const periodoIds = allPeriodoIds.map((p) => p.id);

  const gastos = await query<{ id: number; descripcion: string; monto: string; periodo_id: number; periodo_anio: number; periodo_mes: number }>(
    `SELECT gp.id, gp.descripcion, gp.monto::numeric, gp.periodo_id, pe.anio AS periodo_anio, pe.mes AS periodo_mes
     FROM app.gastos_periodo gp
     JOIN app.periodos_expensas pe ON pe.id = gp.periodo_id
     WHERE gp.periodo_id = ANY($1)`,
    [periodoIds]
  );

  const formatoCobro = consorcio?.formato_cobro || "";

  for (const mov of movimientos) {
    const monto = Number(mov.monto);

    if (!mov.categoria_bancaria && !mov.es_credito) {
      const cat = categorizeBankCharge(mov.descripcion);
      if (cat) {
        await query(
          `UPDATE app.extracto_movimientos
           SET categoria_bancaria = $1, match_tipo = NULL, match_id = NULL, match_confianza = NULL, estado_match = 'pendiente'
           WHERE id = $2`,
          [cat, mov.id]
        );
        mov.categoria_bancaria = cat;
      }
    }

    if (mov.categoria_bancaria) {
      continue;
    }

    if (mov.es_credito) {
      let cuitExtraido: string | null = mov.cuit_origen;
      if (!cuitExtraido && !mov.cbu_origen) {
        const cuitMatch = mov.descripcion.match(/\b(20|23|24|27|30)\d{9}\b/);
        if (cuitMatch) cuitExtraido = cuitMatch[0];
      }

      let matched: { unidad_id: number; confianza: number } | null = null;
      const cbuKeys = [onlyDigits(mov.cbu_origen), onlyDigits(mov.cuit_origen), onlyDigits(cuitExtraido)].filter(Boolean);
      for (const key of cbuKeys) {
        const found = cbuMap.find((c) => onlyDigits(c.cbu_o_cuit) === key);
        if (found) {
          matched = { unidad_id: found.unidad_id, confianza: 0.95 };
          break;
        }
      }

      if (!matched && cuitExtraido) {
        const found = unidades.find((u) => u.propietario_cuit && onlyDigits(u.propietario_cuit) === onlyDigits(cuitExtraido));
        if (found) matched = { unidad_id: found.id, confianza: 0.9 };
      }

      if (!matched && formatoCobro === "identificacion_uf") {
        const cents = Math.round((monto - Math.floor(monto)) * 100);
        if (cents > 0) {
          const found = unidades.find((u) => u.uf_numero === cents);
          if (found) matched = { unidad_id: found.id, confianza: 0.9 };
        }
      }

      if (!matched) {
        const candidates = unidades.filter(
          (u) => u.total_pagar !== null && Math.abs(Number(u.total_pagar) - monto) < 0.01
        );
        if (candidates.length === 1) {
          matched = { unidad_id: candidates[0].id, confianza: 0.85 };
        } else if (candidates.length > 1) {
          const byName = candidates.find(
            (u) =>
              nameMatches(u.propietario_nombre || "", mov.nombre_origen || "") ||
              nameMatches(u.propietario_nombre || "", mov.descripcion || "")
          );
          if (byName) matched = { unidad_id: byName.id, confianza: 0.85 };
        }
      }

      if (!matched) {
        const found = unidades.find(
          (u) =>
            u.propietario_nombre &&
            (nameMatches(u.propietario_nombre, mov.nombre_origen || "") ||
              nameMatches(u.propietario_nombre, mov.descripcion || ""))
        );
        if (found) matched = { unidad_id: found.id, confianza: 0.7 };
      }

      if (matched) {
        await query(
          `UPDATE app.extracto_movimientos
           SET match_tipo = 'cobranza', match_id = $1, match_confianza = $2, estado_match = 'sugerido'
           WHERE id = $3`,
          [matched.unidad_id, matched.confianza, mov.id]
        );
      }
    } else {
      let matched: { gasto_id: number; confianza: number } | null = null;
      const descNorm = normalizeName(mov.descripcion);

      for (const g of gastos) {
        const gastoDescNorm = normalizeName(g.descripcion);
        const gastoTokens = gastoDescNorm.split(/\s+/).filter((t) => t.length > 2);
        const matchedTokens = gastoTokens.filter((t) => descNorm.includes(t));
        if (gastoTokens.length > 0 && matchedTokens.length >= Math.ceil(gastoTokens.length * 0.5)) {
          matched = { gasto_id: g.id, confianza: 0.8 };
          break;
        }
      }

      if (!matched) {
        const candidates = gastos.filter((g) => Math.abs(Number(g.monto) - monto) < 0.01);
        if (candidates.length === 1) {
          matched = { gasto_id: candidates[0].id, confianza: 0.75 };
        }
      }

      if (!matched && /AFIP|VEP/i.test(mov.descripcion)) {
        const afipGastos = gastos.filter((g) => /AFIP|ARCA/i.test(g.descripcion) && Number(g.monto) > 0);
        const byPeriodo = new Map<number, typeof afipGastos>();
        for (const g of afipGastos) {
          const arr = byPeriodo.get(g.periodo_id) || [];
          arr.push(g);
          byPeriodo.set(g.periodo_id, arr);
        }
        const movDate = new Date(mov.fecha);
        const movYM = movDate.getFullYear() * 12 + movDate.getMonth();
        const entries = Array.from(byPeriodo.entries())
          .map(([pid, items]) => {
            const g0 = items[0];
            const pYM = g0.periodo_anio * 12 + (g0.periodo_mes - 1);
            return { pid, items, dist: Math.abs(movYM - pYM) };
          })
          .sort((a, b) => a.dist - b.dist);
        for (const { items } of entries) {
          if (items.length > 1) {
            const sum = items.reduce((s, g) => s + Number(g.monto), 0);
            if (Math.abs(sum - monto) < 1.0) {
              matched = { gasto_id: items[0].id, confianza: 0.85 };
              break;
            }
            const f931 = items.filter((g) => /F\.\s*931/i.test(g.descripcion));
            if (f931.length > 1) {
              const f931Sum = f931.reduce((s, g) => s + Number(g.monto), 0);
              if (Math.abs(f931Sum - monto) < 1.0) {
                matched = { gasto_id: f931[0].id, confianza: 0.85 };
                break;
              }
            }
          }
        }
      }

      if (matched) {
        await query(
          `UPDATE app.extracto_movimientos
           SET match_tipo = 'gasto', match_id = $1, match_confianza = $2, estado_match = 'sugerido'
           WHERE id = $3`,
          [matched.gasto_id, matched.confianza, mov.id]
        );
      }
    }
  }

  revalidatePath(BASE_PATH);
}

// ─────────────────────────────────────────────────────────────────────────
// Confirm / reject / manual assign
// ─────────────────────────────────────────────────────────────────────────

async function updateExtractoMatchedCount(extractoId: number) {
  await query(
    `UPDATE app.extractos_bancarios
     SET matcheados_count = (SELECT COUNT(*) FROM app.extracto_movimientos WHERE extracto_id = $1 AND estado_match = 'confirmado')
     WHERE id = $1`,
    [extractoId]
  );
}

export async function confirmarMatch(movimientoId: number) {
  const mov = await queryOne<{
    extracto_id: number;
    match_tipo: string | null;
    match_id: number | null;
    cbu_origen: string | null;
    cuit_origen: string | null;
    nombre_origen: string | null;
  }>(
    "SELECT extracto_id, match_tipo, match_id, cbu_origen, cuit_origen, nombre_origen FROM app.extracto_movimientos WHERE id = $1",
    [movimientoId]
  );
  if (!mov) return;

  await query("UPDATE app.extracto_movimientos SET estado_match = 'confirmado' WHERE id = $1", [movimientoId]);

  if (mov.match_tipo === "cobranza" && mov.match_id) {
    const extracto = await queryOne<{ consorcio_cuit: string }>(
      "SELECT consorcio_cuit FROM app.extractos_bancarios WHERE id = $1",
      [mov.extracto_id]
    );
    const key = onlyDigits(mov.cbu_origen) || onlyDigits(mov.cuit_origen);
    if (extracto && key) {
      await query(
        `INSERT INTO app.cbu_unidad_map (consorcio_cuit, cbu_o_cuit, unidad_id, nombre_referencia, veces_matcheado, ultimo_match)
         VALUES ($1,$2,$3,$4,1, now())
         ON CONFLICT (consorcio_cuit, cbu_o_cuit)
         DO UPDATE SET veces_matcheado = app.cbu_unidad_map.veces_matcheado + 1, ultimo_match = now(), unidad_id = $3`,
        [extracto.consorcio_cuit, key, mov.match_id, mov.nombre_origen]
      );
    }
  }

  await updateExtractoMatchedCount(mov.extracto_id);
  revalidatePath(BASE_PATH);
}

export async function rechazarMatch(movimientoId: number) {
  const mov = await queryOne<{ extracto_id: number }>(
    "SELECT extracto_id FROM app.extracto_movimientos WHERE id = $1",
    [movimientoId]
  );
  await query(
    `UPDATE app.extracto_movimientos
     SET match_tipo = NULL, match_id = NULL, match_confianza = NULL, estado_match = 'rechazado'
     WHERE id = $1`,
    [movimientoId]
  );
  if (mov) await updateExtractoMatchedCount(mov.extracto_id);
  revalidatePath(BASE_PATH);
}

export async function desconfirmarMatch(movimientoId: number) {
  await query(
    `UPDATE app.extracto_movimientos SET estado_match = 'sugerido' WHERE id = $1`,
    [movimientoId]
  );
  revalidatePath(BASE_PATH);
}

export async function descartarMovimiento(movimientoId: number) {
  const mov = await queryOne<{ extracto_id: number }>(
    "SELECT extracto_id FROM app.extracto_movimientos WHERE id = $1",
    [movimientoId]
  );
  await query(
    `UPDATE app.extracto_movimientos
     SET estado_match = 'descartado', match_tipo = NULL, match_id = NULL, match_confianza = NULL
     WHERE id = $1`,
    [movimientoId]
  );
  if (mov) await updateExtractoMatchedCount(mov.extracto_id);
  revalidatePath(BASE_PATH);
}

export async function asignarManual(movimientoId: number, tipo: "cobranza" | "gasto", targetId: number) {
  const mov = await queryOne<{
    extracto_id: number;
    cbu_origen: string | null;
    cuit_origen: string | null;
    nombre_origen: string | null;
  }>(
    "SELECT extracto_id, cbu_origen, cuit_origen, nombre_origen FROM app.extracto_movimientos WHERE id = $1",
    [movimientoId]
  );
  if (!mov) return;

  await query(
    `UPDATE app.extracto_movimientos
     SET match_tipo = $1, match_id = $2, match_confianza = 1.0, estado_match = 'confirmado', categoria_bancaria = NULL
     WHERE id = $3`,
    [tipo, targetId, movimientoId]
  );

  if (tipo === "cobranza") {
    const extracto = await queryOne<{ consorcio_cuit: string }>(
      "SELECT consorcio_cuit FROM app.extractos_bancarios WHERE id = $1",
      [mov.extracto_id]
    );
    const key = onlyDigits(mov.cbu_origen) || onlyDigits(mov.cuit_origen);
    if (extracto && key) {
      await query(
        `INSERT INTO app.cbu_unidad_map (consorcio_cuit, cbu_o_cuit, unidad_id, nombre_referencia, veces_matcheado, ultimo_match)
         VALUES ($1,$2,$3,$4,1, now())
         ON CONFLICT (consorcio_cuit, cbu_o_cuit)
         DO UPDATE SET veces_matcheado = app.cbu_unidad_map.veces_matcheado + 1, ultimo_match = now(), unidad_id = $3`,
        [extracto.consorcio_cuit, key, targetId, mov.nombre_origen]
      );
    }
  }

  await updateExtractoMatchedCount(mov.extracto_id);
  revalidatePath(BASE_PATH);
}

// ─────────────────────────────────────────────────────────────────────────
// Apply reconciliation — credits
// ─────────────────────────────────────────────────────────────────────────

export async function aplicarCreditos(extractoId: number) {
  const extracto = await queryOne<{ consorcio_cuit: string; estado: string; periodo_id: number | null }>(
    "SELECT consorcio_cuit, estado, periodo_id FROM app.extractos_bancarios WHERE id = $1",
    [extractoId]
  );
  if (!extracto) throw new Error("Extracto no encontrado");

  let count = 0;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete previously applied pagos from this extracto so re-apply works
    const { rows: prevApplied } = await client.query<{ referencia: string }>(
      `SELECT DISTINCT referencia FROM app.extracto_movimientos
       WHERE extracto_id = $1 AND comprobante_ref IS NOT NULL AND match_tipo = 'cobranza' AND es_credito = true`,
      [extractoId]
    );
    if (prevApplied.length > 0) {
      const refs = prevApplied.map(r => r.referencia).filter(Boolean);
      if (refs.length > 0) {
        await client.query(
          `DELETE FROM app.pagos WHERE consorcio_cuit = $1 AND medio_pago = 'transferencia' AND referencia = ANY($2)`,
          [extracto.consorcio_cuit, refs]
        );
      }
      await client.query(
        `UPDATE app.extracto_movimientos SET comprobante_ref = NULL
         WHERE extracto_id = $1 AND comprobante_ref IS NOT NULL AND match_tipo = 'cobranza' AND es_credito = true`,
        [extractoId]
      );
    }

    const { rows: confirmados } = await client.query<{
      id: number;
      fecha: string;
      monto: string;
      match_id: number;
      referencia: string | null;
    }>(
      `SELECT id, fecha::text, monto::numeric, match_id, referencia
       FROM app.extracto_movimientos
       WHERE extracto_id = $1 AND estado_match = 'confirmado' AND match_tipo = 'cobranza' AND es_credito = true
         AND comprobante_ref IS NULL
       FOR UPDATE`,
      [extractoId]
    );
    for (const m of confirmados) {
      await client.query(
        `INSERT INTO app.pagos (consorcio_cuit, unidad_id, fecha, monto, medio_pago, referencia)
         VALUES ($1,$2,$3,$4,'transferencia',$5)`,
        [extracto.consorcio_cuit, m.match_id, m.fecha, m.monto, m.referencia]
      );
      await client.query(
        "UPDATE app.extracto_movimientos SET comprobante_ref = $1 WHERE id = $2",
        [m.referencia, m.id]
      );
      count++;
    }
    await client.query(
      `UPDATE app.extractos_bancarios SET estado = 'creditos_aplicados' WHERE id = $1 AND estado NOT IN ('aplicado')`,
      [extractoId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  if (extracto.periodo_id) {
    await query(
      `UPDATE app.res_cuenta_periodo rcp
       SET su_pago = COALESCE((
         SELECT SUM(p.monto) FROM app.pagos p
         WHERE p.unidad_id = rcp.unidad_id
           AND p.consorcio_cuit = (SELECT consorcio_cuit FROM app.periodos_expensas WHERE id = rcp.periodo_id)
       ), 0)
       WHERE rcp.periodo_id = $1`,
      [extracto.periodo_id]
    );
  }

  revalidatePath(BASE_PATH);
  revalidatePath("/expensas");
  revalidatePath("/finanzas/cuenta-corriente");
  return count;
}

// Backwards-compatible alias kept during the route rename transition period.
export const aplicarConciliacion = aplicarCreditos;

// ─────────────────────────────────────────────────────────────────────────
// Apply reconciliation — debits (bank charges + gasto linking)
// ─────────────────────────────────────────────────────────────────────────

export async function aplicarDebitos(extractoId: number): Promise<{ chargesCreated: number; gastosLinked: number }> {
  const extracto = await queryOne<{ consorcio_cuit: string; periodo_id: number; mes: number; anio: number }>(
    `SELECT e.consorcio_cuit, e.periodo_id, p.mes, p.anio
     FROM app.extractos_bancarios e
     JOIN app.periodos_expensas p ON p.id = e.periodo_id
     WHERE e.id = $1`,
    [extractoId]
  );
  if (!extracto) throw new Error("Extracto no encontrado");

  let chargesCreated = 0;
  let gastosLinked = 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: bankCharges } = await client.query<{
      id: number;
      fecha: string;
      descripcion: string;
      monto: string;
      categoria_bancaria: string;
    }>(
      `SELECT em.id, em.fecha::text, em.descripcion, em.monto::numeric, em.categoria_bancaria
       FROM app.extracto_movimientos em
       WHERE em.extracto_id = $1 AND em.estado_match = 'confirmado' AND em.es_credito = false
         AND em.categoria_bancaria IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM app.gastos_periodo gp WHERE gp.extracto_movimiento_id = em.id)
       FOR UPDATE OF em`,
      [extractoId]
    );

    const { rows: matchedGastos } = await client.query<{
      id: number;
      match_id: number;
    }>(
      `SELECT id, match_id
       FROM app.extracto_movimientos
       WHERE extracto_id = $1 AND estado_match = 'confirmado' AND es_credito = false
         AND match_tipo = 'gasto' AND match_id IS NOT NULL
       FOR UPDATE`,
      [extractoId]
    );

    if (bankCharges.length > 0) {
      const total = bankCharges.reduce((sum, mov) => sum + Math.abs(Number(mov.monto)), 0);
      const mesStr = String(extracto.mes).padStart(2, "0");
      const anioStr = String(extracto.anio);
      await client.query(
        `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo, debitado)
         VALUES ($1, $2, $3, $4, 'A', true)`,
        [extracto.periodo_id, RUBRO_GASTOS_BANCARIOS, `Gastos Bancarios período ${mesStr}/${anioStr}`, total]
      );
      chargesCreated = 1;
    }

    for (const mov of matchedGastos) {
      const res = await client.query(
        `UPDATE app.gastos_periodo SET debitado = true, extracto_movimiento_id = $1 WHERE id = $2`,
        [mov.id, mov.match_id]
      );
      gastosLinked += res.rowCount ?? 0;
    }

    if (bankCharges.length > 0 || matchedGastos.length > 0) {
      await client.query(
        `UPDATE app.extractos_bancarios
         SET estado = CASE
           WHEN estado = 'creditos_aplicados' THEN 'aplicado'
           WHEN estado IN ('pendiente', 'parcial') AND NOT EXISTS (
             SELECT 1 FROM app.extracto_movimientos
             WHERE extracto_id = $1 AND es_credito = true AND comprobante_ref IS NULL
           ) THEN 'aplicado'
           ELSE estado
         END
         WHERE id = $1`,
        [extractoId]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  revalidatePath(BASE_PATH);
  revalidatePath("/expensas");
  return { chargesCreated, gastosLinked };
}

// ─────────────────────────────────────────────────────────────────────────
// Pending debit detection (query-time, no materialized table)
// ─────────────────────────────────────────────────────────────────────────

export type PendingDebit = {
  id: number;
  descripcion: string;
  monto: string;
  periodo_id: number;
};

export async function getPendingDebits(periodoIds: number[]): Promise<PendingDebit[]> {
  if (periodoIds.length === 0) return [];
  return query<PendingDebit>(
    `SELECT gp.id, gp.descripcion, gp.monto::text, gp.periodo_id
     FROM app.gastos_periodo gp
     WHERE gp.periodo_id = ANY($1::int[]) AND gp.debitado = false
     ORDER BY gp.descripcion`,
    [periodoIds]
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Reconciliation summary
// ─────────────────────────────────────────────────────────────────────────

export type ReconciliacionSummary = {
  saldoBanco: number | null;
  totalCreditos: number;
  totalDebitos: number;
  gastosBancarios: number;
  pendingCount: number;
};

export async function getReconciliacionSummary(
  consorcioCuit: string,
  periodoId: number,
  periodoAnteriorId: number | null
): Promise<ReconciliacionSummary> {
  const extractos = await query<{
    total_creditos: string;
    total_debitos: string;
    saldo_cierre: string | null;
  }>(
    `SELECT total_creditos::text, total_debitos::text, saldo_cierre::text
     FROM app.extractos_bancarios WHERE consorcio_cuit = $1 AND periodo_id = $2
     ORDER BY fecha_carga ASC`,
    [consorcioCuit, periodoId]
  );

  const totalCreditos = extractos.reduce((s, e) => s + Number(e.total_creditos), 0);
  const totalDebitos = extractos.reduce((s, e) => s + Number(e.total_debitos), 0);
  const saldoBanco = extractos.length > 0 && extractos[extractos.length - 1].saldo_cierre !== null
    ? Number(extractos[extractos.length - 1].saldo_cierre)
    : null;

  const gastosBancariosRow = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(m.monto), 0)::text AS total
     FROM app.extracto_movimientos m
     JOIN app.extractos_bancarios e ON e.id = m.extracto_id
     WHERE e.periodo_id = $1 AND m.categoria_bancaria IS NOT NULL`,
    [periodoId]
  );
  const gastosBancarios = gastosBancariosRow ? Number(gastosBancariosRow.total) : 0;

  const periodoIds = [periodoId, periodoAnteriorId].filter((p): p is number => p !== null);
  const pending = await getPendingDebits(periodoIds);

  return {
    saldoBanco,
    totalCreditos,
    totalDebitos,
    gastosBancarios,
    pendingCount: pending.length,
  };
}

export async function cargarGastosBancarios(periodoId: number) {
  const movs = await query<{ monto: string; descripcion: string }>(
    `SELECT m.monto::text, m.descripcion
     FROM app.extracto_movimientos m
     JOIN app.extractos_bancarios e ON e.id = m.extracto_id
     WHERE e.periodo_id = $1 AND m.categoria_bancaria IS NOT NULL`,
    [periodoId]
  );
  if (movs.length === 0) throw new Error("No hay gastos bancarios para cargar");

  const total = movs.reduce((s, m) => s + Number(m.monto), 0);

  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM app.gastos_periodo WHERE periodo_id = $1 AND categoria = 6 AND tipo = 'A' LIMIT 1",
    [periodoId]
  );

  const descripcion = `Gastos bancarios extracto (${movs.length} movimientos)`;

  if (existing) {
    await query(
      "UPDATE app.gastos_periodo SET monto = $1, descripcion = $2 WHERE id = $3",
      [total, descripcion, existing.id]
    );
  } else {
    await query(
      `INSERT INTO app.gastos_periodo (periodo_id, categoria, descripcion, monto, tipo)
       VALUES ($1, 6, $2, $3, 'A')`,
      [periodoId, descripcion, total]
    );
  }

  revalidatePath(BASE_PATH);
}

export async function eliminarExtracto(extractoId: number) {
  const ext = await queryOne<{ estado: string }>(
    "SELECT estado FROM app.extractos_bancarios WHERE id = $1",
    [extractoId]
  );
  if (ext?.estado === "aplicado") throw new Error("No se puede eliminar un extracto ya aplicado");
  await query("DELETE FROM app.extractos_bancarios WHERE id = $1", [extractoId]);
  revalidatePath(BASE_PATH);
}
