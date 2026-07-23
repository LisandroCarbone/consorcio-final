"use server";

import { query, queryOne, pool } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  // Determine decimal separator: last comma or dot wins as decimal sep
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
  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD/MM/YYYY or DD-MM-YYYY
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    return `${m[3]}-${mm}-${dd}`;
  }
  // DD/MM/YY
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

function parseExtractoCsv(text: string): ParsedMovimiento[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

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

  return movimientos;
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

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Solo se aceptan archivos CSV");
  }

  let text = await file.text();
  // Detect mojibake from ISO-8859-1/Windows-1252 encoded files
  if (text.includes("�") || /Ã[©¡³ºñ]/.test(text)) {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("windows-1252");
    text = decoder.decode(buffer);
  }
  const movimientos = parseExtractoCsv(text);
  if (movimientos.length === 0) {
    throw new Error("No se pudieron leer movimientos del archivo. Verifique el formato CSV.");
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
        (consorcio_cuit, periodo_id, anio, mes, archivo_nombre, corte_label, fecha_carga, estado, total_creditos, total_debitos, movimientos_count, matcheados_count)
       VALUES ($1,$2,$3,$4,$5,$6, now(), 'pendiente', $7, $8, $9, 0)
       RETURNING id`,
      [consorcioCuit, periodoId, anio, mes, file.name, corteLabel, totalCreditos, totalDebitos, movimientos.length]
    );
    extractoId = extractoRes.rows[0].id;

    for (const m of movimientos) {
      const syntheticRef =
        m.referencia || `${m.fecha || "nodate"}_${m.monto}_${(m.descripcion || "").slice(0, 20)}`;
      const res = await client.query(
        `INSERT INTO app.extracto_movimientos
          (extracto_id, fecha, descripcion, referencia, monto, es_credito, cbu_origen, cuit_origen, nombre_origen, estado_match)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pendiente')
         ON CONFLICT (extracto_id, referencia, monto, fecha) DO NOTHING`,
        [
          extractoId,
          m.fecha,
          m.descripcion,
          syntheticRef,
          Math.abs(m.monto),
          m.monto > 0,
          m.cbu_origen,
          m.cuit_origen,
          m.nombre_origen,
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
  revalidatePath("/expensas/extracto-bancario");
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
  }>(
    `SELECT id, monto::numeric, es_credito, descripcion, cbu_origen, cuit_origen, nombre_origen
     FROM app.extracto_movimientos
     WHERE extracto_id = $1 AND estado_match IN ('pendiente', 'sugerido')`,
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
            p.cuit AS propietario_cuit
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

  const gastos = await query<{ id: number; descripcion: string; monto: string }>(
    "SELECT id, descripcion, monto::numeric FROM app.gastos_periodo WHERE periodo_id = $1",
    [extracto.periodo_id]
  );

  const formatoCobro = consorcio?.formato_cobro || "";

  for (const mov of movimientos) {
    const monto = Number(mov.monto);

    if (mov.es_credito) {
      // 1. CBU/CUIT match
      let matched: { unidad_id: number; confianza: number } | null = null;
      const cbuKeys = [onlyDigits(mov.cbu_origen), onlyDigits(mov.cuit_origen)].filter(Boolean);
      for (const key of cbuKeys) {
        const found = cbuMap.find((c) => onlyDigits(c.cbu_o_cuit) === key);
        if (found) {
          matched = { unidad_id: found.unidad_id, confianza: 0.95 };
          break;
        }
      }

      // 2. Formato cobro identificacion_uf: cents = uf_numero
      if (!matched && formatoCobro === "identificacion_uf") {
        const cents = Math.round((monto - Math.floor(monto)) * 100);
        if (cents > 0) {
          const found = unidades.find((u) => u.uf_numero === cents);
          if (found) matched = { unidad_id: found.id, confianza: 0.9 };
        }
      }

      // 3. Exact amount match against total_pagar
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

      // 4. Name fuzzy match
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
      // Debits: match against gastos_periodo
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

  revalidatePath("/expensas/extracto-bancario");
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
  revalidatePath("/expensas/extracto-bancario");
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
  revalidatePath("/expensas/extracto-bancario");
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
     SET match_tipo = $1, match_id = $2, match_confianza = 1.0, estado_match = 'confirmado'
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
  revalidatePath("/expensas/extracto-bancario");
}

// ─────────────────────────────────────────────────────────────────────────
// Apply reconciliation
// ─────────────────────────────────────────────────────────────────────────

export async function aplicarConciliacion(extractoId: number) {
  const extracto = await queryOne<{ consorcio_cuit: string; estado: string }>(
    "SELECT consorcio_cuit, estado FROM app.extractos_bancarios WHERE id = $1",
    [extractoId]
  );
  if (!extracto) throw new Error("Extracto no encontrado");
  if (extracto.estado === "aplicado") return;

  const confirmados = await query<{
    id: number;
    fecha: string;
    monto: string;
    match_id: number;
    referencia: string | null;
  }>(
    `SELECT id, fecha::text, monto::numeric, match_id, referencia
     FROM app.extracto_movimientos
     WHERE extracto_id = $1 AND estado_match = 'confirmado' AND match_tipo = 'cobranza' AND es_credito = true
       AND comprobante_ref IS NULL`,
    [extractoId]
  );

  let count = 0;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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
      "UPDATE app.extractos_bancarios SET estado = 'aplicado' WHERE id = $1",
      [extractoId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  revalidatePath("/expensas/extracto-bancario");
  revalidatePath("/expensas");
  return count;
}

export async function eliminarExtracto(extractoId: number) {
  const ext = await queryOne<{ estado: string }>(
    "SELECT estado FROM app.extractos_bancarios WHERE id = $1",
    [extractoId]
  );
  if (ext?.estado === "aplicado") throw new Error("No se puede eliminar un extracto ya aplicado");
  await query("DELETE FROM app.extractos_bancarios WHERE id = $1", [extractoId]);
  revalidatePath("/expensas/extracto-bancario");
}
