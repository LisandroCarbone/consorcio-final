import { pool } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types and Layout Specifications
// ---------------------------------------------------------------------------

interface LsdField {
  from: number;
  long: number;
  type: 'AL' | 'AN' | 'EN' | 'DE' | 'FE' | 'BO';
}

const REGISTRO_4_LAYOUT: Record<string, LsdField> = {
  tipo_registro: { from: 1, long: 2, type: 'AL' },
  cuil: { from: 3, long: 11, type: 'EN' },
  conyuge: { from: 14, long: 1, type: 'EN' },
  hijos: { from: 15, long: 2, type: 'EN' },
  convencionado: { from: 17, long: 1, type: 'AL' },
  seguro_vida_obligatorio: { from: 18, long: 1, type: 'AL' },
  corresponde_reduccion: { from: 19, long: 1, type: 'AL' },
  tipo_empresa: { from: 20, long: 1, type: 'AL' },
  tipo_operacion: { from: 21, long: 1, type: 'AL' },
  situacion: { from: 22, long: 2, type: 'AL' },
  condicion: { from: 24, long: 2, type: 'AL' },
  actividad: { from: 26, long: 3, type: 'AL' },
  modalidad_contrato: { from: 29, long: 3, type: 'AL' },
  codigo_siniestrado: { from: 32, long: 2, type: 'AL' },
  zona: { from: 34, long: 2, type: 'AL' },
  situacion_1: { from: 36, long: 2, type: 'AL' },
  dia_sr1: { from: 38, long: 2, type: 'EN' },
  situacion_2: { from: 40, long: 2, type: 'AL' },
  dia_sr2: { from: 42, long: 2, type: 'EN' },
  situacion_3: { from: 44, long: 2, type: 'AL' },
  dia_sr3: { from: 46, long: 2, type: 'EN' },
  k_dias: { from: 48, long: 2, type: 'EN' },
  k_horas: { from: 50, long: 3, type: 'EN' },
  porcentaje_aporte_adicional_ss: { from: 53, long: 5, type: 'DE' },
  porc_contr_dif_ss: { from: 58, long: 5, type: 'DE' },
  obra_social: { from: 63, long: 6, type: 'AL' },
  adherentes: { from: 69, long: 2, type: 'EN' },
  aporte_adicional_os: { from: 71, long: 15, type: 'DE' },
  importe_adicional_os: { from: 86, long: 15, type: 'DE' },
  base_diferencial_aos: { from: 101, long: 15, type: 'DE' },
  base_diferencial_cos: { from: 116, long: 15, type: 'DE' },
  base_calculo_diferencial_lrt: { from: 131, long: 15, type: 'DE' },
  maternidad: { from: 146, long: 15, type: 'DE' },
  remuneracion_total: { from: 161, long: 15, type: 'DE' },
  remuneracion_01: { from: 176, long: 15, type: 'DE' },
  remuneracion_02: { from: 191, long: 15, type: 'DE' },
  remuneracion_03: { from: 206, long: 15, type: 'DE' },
  remuneracion_04: { from: 221, long: 15, type: 'DE' },
  remuneracion_05: { from: 236, long: 15, type: 'DE' },
  remuneracion_06: { from: 251, long: 15, type: 'DE' },
  remuneracion_07: { from: 266, long: 15, type: 'DE' },
  remuneracion_08: { from: 281, long: 15, type: 'DE' },
  remuneracion_09: { from: 296, long: 15, type: 'DE' },
  base_calculo_diferencial_aporte_ss: { from: 311, long: 15, type: 'DE' },
  base_calculo_diferencial_contribucion_ss: { from: 326, long: 15, type: 'DE' },
  remuneracion_10: { from: 341, long: 15, type: 'DE' },
  detraccion: { from: 356, long: 15, type: 'DE' },
};

// ---------------------------------------------------------------------------
// Positional Formatting Helpers
// ---------------------------------------------------------------------------

function formatField(val: any, len: number, type: 'AL' | 'AN' | 'EN' | 'DE' | 'FE' | 'BO'): string {
  if (val === undefined || val === null) {
    if (type === 'AL' || type === 'AN') return ''.padEnd(len, ' ');
    return '0'.padStart(len, '0');
  }

  if (type === 'BO') {
    return val ? '1' : '0';
  }

  if (type === 'FE') {
    const str = String(val).replace(/-/g, '');
    return str.substring(0, len).padEnd(len, ' ');
  }

  if (type === 'DE') {
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    const cent = Math.round(num * 100);
    return cent.toString().padStart(len, '0');
  }

  if (type === 'EN') {
    const num = typeof val === 'number' ? val : parseInt(String(val), 10);
    return num.toString().padStart(len, '0');
  }

  // AL or AN
  const str = String(val);
  if (str.length > len) {
    return str.substring(0, len);
  }
  return str.padEnd(len, ' ');
}

// ---------------------------------------------------------------------------
// Concept Quantity Parsing
// ---------------------------------------------------------------------------

function inferConceptoCantidad(conceptoNombre: string, antiguedadAnios?: number): number {
  const c = conceptoNombre.toLowerCase();

  // Percentage-based deductions
  if (c.includes("jubilación") || c.includes("jubilacion")) return 11;
  if (c.includes("pami") || c.includes("ley 19032")) return 3;
  if (c.includes("obra social") && !c.includes("diferencia")) return 3;
  if (c.includes("suterh") && !c.includes("contrib")) return 2;
  if (c.includes("caja protección") || c.includes("caja proteccion")) return 1;
  if (c.includes("fateryh") && !c.includes("contrib")) return 1;
  if (c.includes("seguro vitalicio")) return 0.75;

  // Horas extras, e.g. "Horas Extras 50% (36hs)"
  const hsMatch = conceptoNombre.match(/\((\d+(?:\.\d+)?)\s*hs?\)/i);
  if (hsMatch) {
    return parseFloat(hsMatch[1]);
  }

  // Plus Antigüedad, e.g. "Plus Antigüedad (18 año/s)"
  const antigMatch = conceptoNombre.match(/\((\d+)\s+año/i);
  if (antigMatch) {
    return parseInt(antigMatch[1], 10);
  }

  // If it's plus antigüedad without years in name
  if (c === "plus antigüedad" && antiguedadAnios) {
    return antiguedadAnios;
  }

  // Vacaciones, e.g. "Plus Vacaciones (15 días)"
  const diasMatch = conceptoNombre.match(/\((\d+)\s+días\)/i) || conceptoNombre.match(/\((\d+)\s+dias\)/i);
  if (diasMatch) {
    return parseInt(diasMatch[1], 10);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Main Generator Service
// ---------------------------------------------------------------------------

export async function generateLsdTxt(periodo: string, tipo: string, consorcioCuit: string): Promise<string> {
  const db = pool;

  // 1. Fetch confirmed liquidaciones for the given period and CUIT
  const { rows: liqRows } = await db.query(
    `SELECT l.*, e.cuil, e.nombre AS empleado_nombre, e.legajo, e.jornada, e.funcion, e.cod_obra_social, e.cbu,
            EXTRACT(YEAR FROM AGE(l.periodo::date, e.fecha_ingreso))::int AS antiguedad_anios
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.cuil = l.empleado_cuil
     WHERE l.periodo = $1 AND l.tipo = $2 AND e.consorcio_cuit = $3 AND l.estado = 'confirmada'
     ORDER BY e.nombre`,
    [periodo, tipo, consorcioCuit]
  );

  if (liqRows.length === 0) {
    throw new Error("No hay liquidaciones confirmadas en este período para exportar.");
  }

  // Fetch consorcio details (needed for zona desfavorable check)
  const { rows: consRows } = await db.query(
    "SELECT cuit, nombre, zona_desfavorable FROM app.consorcios WHERE cuit = $1",
    [consorcioCuit]
  );
  const cons = consRows[0] || { cuit: consorcioCuit, nombre: "", zona_desfavorable: false };

  const qEmpleados = liqRows.length;
  // Default liquidation number: 1 for mensual, 2 for SAC, 3 for others
  const nroLiq = tipo === "mensual" ? 1 : 2;

  // Build period AAAAMM format
  const [y, m] = periodo.split("-");
  const periodoStr = `${y}${m}`;

  // ---------------------------------------------------------------------------
  // Build REGISTRO 1 (Header) — 35 characters
  // ---------------------------------------------------------------------------
  let resTxt = "";
  resTxt += "01";                                               // Identificador (1-2)
  resTxt += formatField(consorcioCuit, 11, "EN");               // CUIT (3-13)
  resTxt += "SJ";                                               // Identificación envío (14-15)
  resTxt += formatField(periodoStr, 6, "EN");                   // Periodo (16-21)
  resTxt += "M";                                                // Tipo liq: M=mensual (22)
  resTxt += formatField(nroLiq, 5, "EN");                       // Nro liq (23-27)
  resTxt += "30";                                               // Dias base (28-29)
  resTxt += formatField(qEmpleados, 6, "EN");                   // Cantidad trabajadores (30-35)

  // ---------------------------------------------------------------------------
  // Build REGISTRO 2, 3 and 4 per employee
  // ---------------------------------------------------------------------------
  const reg2Lines: string[] = [];
  const reg3Lines: string[] = [];
  const reg4Lines: string[] = [];

  for (const liq of liqRows) {
    const cuil = liq.cuil;
    const legajo = liq.legajo || "";
    const cbu = liq.cbu || "";
    const formaPago = cbu && cbu.length === 22 ? "3" : "1"; // 3=CBU, 1=Cash

    // Determine payment date
    let fechaPago = "";
    if (tipo === "sac_1") {
      fechaPago = `${y}0630`;
    } else if (tipo === "sac_2") {
      fechaPago = `${y}1218`;
    } else {
      const lastDay = new Date(Number(y), Number(m), 0);
      const dayStr = String(lastDay.getDate()).padStart(2, "0");
      fechaPago = `${y}${m}${dayStr}`;
    }

    // ── Build REGISTRO 2 (Datos del Trabajador) — 115 characters ─────────────
    let r2 = "02";
    r2 += formatField(cuil, 11, "EN");
    r2 += formatField(legajo, 10, "AN");
    r2 += formatField("", 50, "AN"); // Dependencia / Area
    r2 += formatField(formaPago === "3" ? cbu : "", 22, "AN");
    r2 += "030"; // dias_tope = 30
    r2 += formatField(fechaPago, 8, "FE");
    r2 += formatField("", 8, "AL"); // fecha_rubrica
    r2 += formatField(formaPago, 1, "AL");
    reg2Lines.push(r2);

    // Fetch concepts for this liquidación
    const { rows: conceptRows } = await db.query(
      `SELECT code, tipo, concepto, importe::numeric AS importe
       FROM app.conceptos_liquidacion
       WHERE liquidacion_id = $1 AND tipo IN ('haber', 'descuento', 'no_remunerativo')
       ORDER BY orden`,
      [liq.id]
    );

    // Calculate non-remunerative sum and total remuneration
    let totalRemunerativo = Number(liq.remuneracion_bruta);
    let totalNoRemunerativo = 0;
    let diffOsVal = 0;

    for (const c of conceptRows) {
      if (c.tipo === "no_remunerativo") {
        totalNoRemunerativo += Number(c.importe);
      }
      if (c.code === "5150" || c.concepto.toLowerCase().includes("diferencia obra social")) {
        diffOsVal += Number(c.importe);
      }
    }

    const totalRemuneracion = totalRemunerativo + totalNoRemunerativo;

    // ── Build REGISTRO 3 (Conceptos) — 51 characters ────────────────────────
    for (const c of conceptRows) {
      const code = c.code || "";
      const amount = Number(c.importe);
      const absAmount = Math.abs(amount);
      const isCredit = amount >= 0;
      const indicator = isCredit ? "C" : "D";

      const qty = inferConceptoCantidad(c.concepto, liq.antiguedad_anios);

      let r3 = "03";
      r3 += formatField(cuil, 11, "EN");
      r3 += formatField(code, 10, "AN");
      r3 += formatField(qty, 5, "DE"); // qty * 100, zfill 5
      r3 += "D"; // units = Days / hours (default 'D')
      r3 += formatField(absAmount, 15, "DE");
      r3 += indicator;
      r3 += formatField("", 6, "AL"); // periodo_ajuste
      reg3Lines.push(r3);
    }

    // ── Build REGISTRO 4 (Bases) — 370 characters ───────────────────────────
    // Calculate detracción
    let detraccion = 0;
    const isSuplente = String(liq.funcion || "").toLowerCase().includes("suplente");

    let diasTrabajados = 30;
    if (isSuplente) {
      const { rows: novRows } = await db.query(
        "SELECT dias_trabajados_suplente FROM app.novedades_sueldo WHERE empleado_cuil = $1 AND periodo = $2",
        [cuil, periodo]
      );
      if (novRows.length > 0 && novRows[0].dias_trabajados_suplente !== null) {
        diasTrabajados = Number(novRows[0].dias_trabajados_suplente);
      }
    }

    if (String(liq.funcion || "").toLowerCase().includes("media") ||
        String(liq.jornada || "").toLowerCase().includes("media")) {
      detraccion = 3501.84;
    } else if (isSuplente) {
      detraccion = Math.round((7003.68 * diasTrabajados / 30) * 100) / 100;
    } else {
      detraccion = 7003.68;
    }

    const base1 = totalRemunerativo;
    const base4 = totalRemunerativo + (diffOsVal > 0 ? (diffOsVal / 0.03) : 0);
    const base10 = Math.max(0, totalRemunerativo - detraccion);

    const modContrato = liq.jornada === "Completa" ? "001" : liq.jornada === "Media" ? "002" : "020";

    const r4Info: Record<string, any> = {
      conyuge: 0,
      hijos: 0,
      convencionado: "1",
      seguro_vida_obligatorio: "1",
      corresponde_reduccion: "0",
      tipo_empresa: "1",
      tipo_operacion: "0",
      situacion: "01",
      condicion: "01",
      actividad: "049",
      modalidad_contrato: modContrato,
      codigo_siniestrado: "00",
      zona: cons.zona_desfavorable ? "18" : "01",
      situacion_1: "01",
      dia_sr1: isSuplente ? diasTrabajados : 30,
      situacion_2: "00",
      dia_sr2: 0,
      situacion_3: "00",
      dia_sr3: 0,
      k_dias: isSuplente ? diasTrabajados : 30,
      k_horas: 0,
      porcentaje_aporte_adicional_ss: 0,
      porc_contr_dif_ss: 0,
      obra_social: liq.cod_obra_social || "126205",
      adherentes: 0,
      aporte_adicional_os: 0,
      importe_adicional_os: 0,
      base_diferencial_aos: 0,
      base_diferencial_cos: 0,
      base_calculo_diferencial_lrt: 0,
      maternidad: 0,
      remuneracion_total: totalRemuneracion,
      remuneracion_01: base1,
      remuneracion_02: base1,
      remuneracion_03: base1,
      remuneracion_04: base4,
      remuneracion_05: base1, // INSSJyP Aportes
      remuneracion_06: 0,
      remuneracion_07: 0,
      remuneracion_08: base4, // Obra Social Contribuciones
      remuneracion_09: totalRemuneracion, // ART Base
      remuneracion_10: base10,
      detraccion: detraccion,
    };

    let r4 = "";
    for (const [key, field] of Object.entries(REGISTRO_4_LAYOUT)) {
      if (key === "tipo_registro") {
        r4 += "04";
      } else if (key === "cuil") {
        r4 += formatField(cuil, 11, "EN");
      } else {
        r4 += formatField(r4Info[key], field.long, field.type);
      }
    }
    reg4Lines.push(r4);
  }

  // ---------------------------------------------------------------------------
  // Assemble the Final file contents
  // ---------------------------------------------------------------------------
  resTxt += "\r\n" + reg2Lines.join("\r\n");
  resTxt += "\r\n" + reg3Lines.join("\r\n");
  resTxt += "\r\n" + reg4Lines.join("\r\n");
  resTxt += "\r\n"; // Final newline

  return resTxt;
}
