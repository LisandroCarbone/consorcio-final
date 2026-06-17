import { pool } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Empleado {
  id: number;
  cuil: string;
  nombre: string;
  legajo: string | null;
  fecha_ingreso: string;
  consorcio_id: number;
  funcion: string;
  categoria_edificio: 1 | 2 | 3 | 4;
  jornada: "Completa" | "Media" | "Suplente";
  tiene_vivienda: boolean;
  retiro_residuos: boolean;
  clasificacion_residuos: boolean | null;
  plus_cocheras: boolean;
  plus_movimiento_coches: boolean;
  plus_jardin: boolean;
  plus_zona_desfavorable: boolean;
  plus_pileta: boolean;
  tiene_titulo: boolean;
  adicional_voluntario: number | null;
  obra_social: string | null;
  estado: string;
}

export interface Consorcio {
  id: number;
  nombre: string;
  cant_uf: number;
  categoria_edificio: number;
  tiene_cochera: boolean;
  tiene_movimiento_coches: boolean;
  tiene_jardin: boolean;
  zona_desfavorable: boolean;
  tiene_pileta: boolean;
  art_pct_variable: number | null;
  art_fijo: number | null;
  art_ffep: number | null;
  art_cant_cuiles: number | null;
  sv_compania: string | null;
  sv_costo_fijo: number | null;
  sv_cant_cuiles: number | null;
  sv_costo_emision: number | null;
  pct_contrib_jubilacion: number | null;
  pct_contrib_obra_social: number | null;
  pct_cct_suterh: number | null;
  pct_cct_fateryh: number | null;
  pct_cct_seracarh: number | null;
  fateryh_fijo_completa: number | null;
  fateryh_fijo_media: number | null;
  fateryh_fijo_suplente_hora: number | null;
}

export interface Novedades {
  empleado_id: number;
  periodo: string;
  dias_trabajados_suplente: number | null;
  horas_jornada: number | null;
  horas_extras_50: number | null;
  horas_extras_100: number | null;
  feriados_trabajados_hs: number | null;
  suplencia_100_hs: number | null;
  plus_vacaciones_dias: number | null;
  dias_no_trabajados: number | null;
  licencia_enfermedad: number | null;
  adicional_voluntario: number | null;
  embargo: number | null;
  anticipo: number | null;
  muerte: number | null;
}

interface EscalaRow {
  funcion: string;
  cat_1: number;
  cat_2: number;
  cat_3: number;
  cat_4: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Antigüedad y vivienda — mayo 2026
const PLUS_ANTIG_1PCT_SUPLENTE = 10505.8;
const PLUS_ANTIG_2PCT_NO_SUPLENTE = 21011.6;
const VALOR_VIVIENDA = 7130.4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safe(v: number, fallback = 0): number {
  return isNaN(v) || !isFinite(v) ? fallback : v;
}

function calcAniosAntigüedad(fechaIngreso: string, periodo: string): number {
  // Use last day of the period month so anniversaries within the month are credited
  const [y, m] = periodo.split("-").map(Number);
  const lastDay = new Date(y, m, 0); // day 0 of next month = last day of current month
  const ingreso = new Date(fechaIngreso);
  const diff = lastDay.getFullYear() - ingreso.getFullYear()
    - (lastDay.getMonth() * 100 + lastDay.getDate() < ingreso.getMonth() * 100 + ingreso.getDate() ? 1 : 0);
  return Math.max(0, diff);
}

function esFuncionEncargado(funcion: string): boolean {
  const f = funcion.toLowerCase();
  return f.includes("encargado") || f.includes("mayordomo");
}

function esFuncionVigilNocturna(funcion: string): boolean {
  return funcion.toLowerCase().includes("vigilancia nocturna");
}

// ---------------------------------------------------------------------------
// Shared descuentos / contribuciones helpers
// ---------------------------------------------------------------------------

interface DescuentosEmpleado {
  jubilacion: number;
  pami: number;
  obraSocial: number;
  difObraSocial: number;
  suterh: number;
  cajaProtFlia: number;
  fateryh: number;
  seguroVital: number;
  total: number;
}

interface ContribPatronal {
  jubilacion: number;
  obraSocial: number;
  suterh: number;
  fateryh: number;
  seracarh: number;
  art: number;
  scvo: number;
  total: number;
}

function calcDescuentosEmpleado(
  base: number,
  esSuplente: boolean,
  difObraSocial = 0
): DescuentosEmpleado {
  const jubilacion    = base * 0.11;
  const pami          = base * 0.03;
  const obraSocial    = base * 0.03;
  const suterh        = !esSuplente ? base * 0.02 : 0;
  const cajaProtFlia  = base * 0.01;
  const fateryh       = !esSuplente ? base * 0.01 : 0;
  const seguroVital   = base * 0.0075;
  const total = jubilacion + pami + obraSocial + difObraSocial + suterh + cajaProtFlia + fateryh + seguroVital;
  return { jubilacion, pami, obraSocial, difObraSocial, suterh, cajaProtFlia, fateryh, seguroVital, total };
}

function calcContribPatronal(base: number, cons: Consorcio): ContribPatronal {
  const jubilacion  = base * Number(cons.pct_contrib_jubilacion ?? 0.18);
  const obraSocial  = base * Number(cons.pct_contrib_obra_social ?? 0.06);
  const suterh      = base * Number(cons.pct_cct_suterh ?? 0.015);
  const fateryh     = base * Number(cons.pct_cct_fateryh ?? 0.0475);
  const seracarh    = base * Number(cons.pct_cct_seracarh ?? 0.005);
  const art         = base * Number(cons.art_pct_variable ?? 0);
  const scvo        = cons.sv_costo_fijo ? Number(cons.sv_costo_fijo) * (cons.sv_cant_cuiles ?? 1) : 0;
  const total = jubilacion + obraSocial + suterh + fateryh + seracarh + art + scvo;
  return { jubilacion, obraSocial, suterh, fateryh, seracarh, art, scvo, total };
}

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

export async function calcularLiquidacion(
  empleadoId: number,
  periodo: string
): Promise<void> {
  // 1. Load master data in parallel
  const [empRows, adicionalesRows, novedadesRows] = await Promise.all([
    pool.query<Empleado>(
      `SELECT * FROM app.empleados_edificio WHERE id = $1`,
      [empleadoId]
    ),
    pool.query<{ concepto: string; concepto_key: string | null; valor: number }>(
      `SELECT concepto, concepto_key, valor::numeric AS valor FROM app.adicionales_suterh WHERE periodo = $1`,
      [periodo]
    ),
    pool.query<Novedades>(
      `SELECT * FROM app.novedades_sueldo WHERE empleado_id = $1 AND periodo = $2`,
      [empleadoId, periodo]
    ),
  ]);

  if (empRows.rows.length === 0) {
    throw new Error(`Empleado ${empleadoId} no encontrado`);
  }

  const emp = empRows.rows[0];

  // Load consorcio and escalas (depend on emp)
  const [consRow, escalaRows] = await Promise.all([
    pool.query<Consorcio>(
      `SELECT * FROM app.consorcios WHERE id = $1`,
      [emp.consorcio_id]
    ),
    pool.query<EscalaRow>(
      `SELECT funcion, cat_1::numeric, cat_2::numeric, cat_3::numeric, cat_4::numeric
       FROM app.escalas_suterh WHERE periodo = $1`,
      [periodo]
    ),
  ]);

  if (consRow.rows.length === 0) {
    throw new Error(`Consorcio ${emp.consorcio_id} no encontrado`);
  }

  const cons = consRow.rows[0];

  // Build lookup maps: by concepto_key (stable) and by concepto name (legacy fallback)
  const adicionales: Record<string, number> = {};
  const adicionalesByKey: Record<string, number> = {};
  for (const row of adicionalesRows.rows) {
    adicionales[row.concepto] = Number(row.valor);
    if (row.concepto_key) adicionalesByKey[row.concepto_key] = Number(row.valor);
  }
  const adic = (key: string, fallback: number) => adicionalesByKey[key] ?? fallback;

  const escalaMap: Record<string, Record<string, number>> = {};
  for (const row of escalaRows.rows) {
    escalaMap[row.funcion] = {
      cat_1: Number(row.cat_1),
      cat_2: Number(row.cat_2),
      cat_3: Number(row.cat_3),
      cat_4: Number(row.cat_4),
    };
  }

  // Novedades (empty object if none)
  const nov: Novedades =
    novedadesRows.rows[0] ??
    ({
      empleado_id: empleadoId,
      periodo,
      dias_trabajados_suplente: null,
      horas_jornada: null,
      horas_extras_50: null,
      horas_extras_100: null,
      feriados_trabajados_hs: null,
      suplencia_100_hs: null,
      plus_vacaciones_dias: null,
      dias_no_trabajados: null,
      licencia_enfermedad: null,
      adicional_voluntario: null,
      embargo: null,
      anticipo: null,
      muerte: null,
    } as Novedades);

  // Coerce numeric DB fields to JS numbers (pg returns NUMERIC as strings)
  const novN = {
    dias_trabajados_suplente: Number(nov.dias_trabajados_suplente ?? 0),
    horas_jornada: nov.horas_jornada != null ? Number(nov.horas_jornada) : null,
    horas_extras_50: Number(nov.horas_extras_50 ?? 0),
    horas_extras_100: Number(nov.horas_extras_100 ?? 0),
    feriados_trabajados_hs: Number(nov.feriados_trabajados_hs ?? 0),
    suplencia_100_hs: Number(nov.suplencia_100_hs ?? 0),
    plus_vacaciones_dias: Number(nov.plus_vacaciones_dias ?? 0),
    dias_no_trabajados: Number(nov.dias_no_trabajados ?? 0),
    licencia_enfermedad: Number(nov.licencia_enfermedad ?? 0),
    adicional_voluntario: Number(nov.adicional_voluntario ?? 0),
    embargo: Number(nov.embargo ?? 0),
    anticipo: Number(nov.anticipo ?? 0),
    muerte: Number(nov.muerte ?? 0),
  };

  // ---------------------------------------------------------------------------
  // 2. Sueldo básico
  // ---------------------------------------------------------------------------

  const catKey = `cat_${emp.categoria_edificio}` as "cat_1" | "cat_2" | "cat_3" | "cat_4";

  // Find escala for this function
  let escalaFuncion = escalaMap[emp.funcion];
  if (!escalaFuncion) {
    // Suplente fallback
    escalaFuncion =
      escalaMap["Suplente con horario por dia"] ??
      escalaMap["Suplente eventual"] ??
      null;
    if (!escalaFuncion) {
      throw new Error(
        `No se encontró escala para función '${emp.funcion}' en período ${periodo} (empleado ${empleadoId})`
      );
    }
  }

  const valorEscalaRaw = escalaFuncion?.[catKey] ?? 0;
  const valorEscala = Number(valorEscalaRaw);

  let sueldoBasico = 0;
  if (emp.jornada === "Suplente") {
    const hs = novN.horas_jornada ?? 8;
    sueldoBasico = (valorEscala / 8) * hs * novN.dias_trabajados_suplente;
  } else {
    sueldoBasico = valorEscala;
  }

  // ---------------------------------------------------------------------------
  // 3. Antigüedad
  // ---------------------------------------------------------------------------

  const aniosAntig = Math.max(0, calcAniosAntigüedad(emp.fecha_ingreso, periodo));

  // For suplentes, total hours = regular days × hs + suplencia_100_hs hours
  const horasTotalesSuplente =
    novN.dias_trabajados_suplente * (novN.horas_jornada ?? 8) +
    novN.suplencia_100_hs;

  const plusAntig1pct = adic("plus_antig_1pct", PLUS_ANTIG_1PCT_SUPLENTE);
  const plusAntig2pct = adic("plus_antig_2pct", PLUS_ANTIG_2PCT_NO_SUPLENTE);

  let plusAntig = 0;
  if (emp.jornada === "Suplente") {
    plusAntig = plusAntig1pct * aniosAntig * (horasTotalesSuplente / 200);
  } else {
    plusAntig = plusAntig2pct * aniosAntig;
  }

  // ---------------------------------------------------------------------------
  // 4-5. Residuos
  // ---------------------------------------------------------------------------

  const retiroResKey =
    "Retiro de residuos por unidad destinada a vivienda u oficina";
  const clasifResKey =
    "Clasificación de residuos Resol. 2013 243 SSRT-GCABA";

  const retiroResiduos = emp.retiro_residuos
    ? adic("retiro_residuos", adicionales[retiroResKey] ?? 0) * (cons.cant_uf ?? 0)
    : 0;

  let clasifResiduos = 0;
  if (emp.clasificacion_residuos) {
    const base = adic("clasif_residuos", adicionales[clasifResKey] ?? 0);
    const uf = cons.cant_uf ?? 0;
    clasifResiduos =
      uf <= 25 ? base : base + (base / 3 / 25) * (uf - 25);
  }

  // ---------------------------------------------------------------------------
  // 6. Valor vivienda
  // ---------------------------------------------------------------------------

  const valorVivienda = emp.tiene_vivienda ? adic("valor_vivienda", VALOR_VIVIENDA) : 0;

  // ---------------------------------------------------------------------------
  // 7. Plus cocheras / mov coches / jardín / piletas
  // ---------------------------------------------------------------------------

  const esEncargado = esFuncionEncargado(emp.funcion);

  const cochKey = "Plus limpieza de cocheras";
  const movKey = "Plus movimiento de coches hasta 20 unidades";
  const jardinKey = "Plus Jardin";
  const piletaKey = "Plus limpieza de piletas y mantenimiento del agua";

  const plusCocheras =
    esEncargado && cons.tiene_cochera && emp.plus_cocheras
      ? adic("plus_cocheras", adicionales[cochKey] ?? 0)
      : 0;

  const plusMovCoches =
    esEncargado && cons.tiene_movimiento_coches && emp.plus_movimiento_coches
      ? adic("plus_movimiento_coches", adicionales[movKey] ?? 0)
      : 0;

  const plusJardin =
    esEncargado && cons.tiene_jardin && emp.plus_jardin
      ? adic("plus_jardin", adicionales[jardinKey] ?? 0)
      : 0;

  const plusPileta =
    esEncargado && cons.tiene_pileta && emp.plus_pileta
      ? adic("plus_pileta", adicionales[piletaKey] ?? 0)
      : 0;

  // ---------------------------------------------------------------------------
  // 8. Zona desfavorable
  // ---------------------------------------------------------------------------

  const plusZonaDesf =
    cons.zona_desfavorable && emp.plus_zona_desfavorable
      ? sueldoBasico * 0.5
      : 0;

  // ---------------------------------------------------------------------------
  // 9. Título
  // ---------------------------------------------------------------------------

  const plusTitulo = emp.tiene_titulo ? sueldoBasico * 0.1 : 0;

  // ---------------------------------------------------------------------------
  // 10. Viáticos
  // ---------------------------------------------------------------------------

  const viaticosKey = "Adicional Viaticos";
  const tieneViaticos =
    !emp.tiene_vivienda && emp.jornada !== "Suplente";
  const adicionalViaticos = tieneViaticos
    ? (adicionales[viaticosKey] ?? 0)
    : 0;

  // ---------------------------------------------------------------------------
  // 11. Adicional remuneratorio mensual
  // ---------------------------------------------------------------------------

  const adicRemKey = "Adicional Remuneratorio Mensual";
  const adicRemBase = adicionales[adicRemKey] ?? 0;

  let adicionalRemEfectivo = 0;
  if (emp.jornada === "Completa") {
    adicionalRemEfectivo = adicRemBase;
  } else if (emp.jornada === "Media") {
    adicionalRemEfectivo = adicRemBase * 0.5;
  } else {
    // Suplente: proportional to total hours worked (including suplencia_100_hs)
    adicionalRemEfectivo = (adicRemBase / 200) * horasTotalesSuplente;
  }

  // ---------------------------------------------------------------------------
  // 12. Adicional voluntario
  // ---------------------------------------------------------------------------

  const empAdicionalVoluntario =
    emp.jornada === "Suplente" && horasTotalesSuplente === 0
      ? 0
      : Number(emp.adicional_voluntario ?? 0);
  const adicionalVoluntario = novN.adicional_voluntario || empAdicionalVoluntario;

  // ---------------------------------------------------------------------------
  // 13. Suplencia al 100%
  // ---------------------------------------------------------------------------

  const suplencia100 =
    emp.jornada === "Suplente"
      ? (valorEscala / 8) * 2 * novN.suplencia_100_hs
      : 0;

  // ---------------------------------------------------------------------------
  // 14. Total haberes fijos
  // ---------------------------------------------------------------------------

  const haberesFijos =
    sueldoBasico +
    suplencia100 +
    retiroResiduos +
    clasifResiduos +
    valorVivienda +
    plusAntig +
    plusCocheras +
    plusMovCoches +
    plusJardin +
    plusZonaDesf +
    plusTitulo +
    plusPileta +
    adicionalViaticos +
    adicionalRemEfectivo +
    adicionalVoluntario;

  // ---------------------------------------------------------------------------
  // 15. Horas extras y feriados
  // ---------------------------------------------------------------------------

  const esVigilNocturna = esFuncionVigilNocturna(emp.funcion);
  const esMediaJornada = emp.jornada === "Media";

  // HE base: haberesFijos minus adicionalRem and viáticos (same for all function types).
  // Vigilancia nocturna uses 175 monthly hours; media jornada uses 100; default 200.
  const baseHE = haberesFijos - adicionalRemEfectivo - adicionalViaticos;

  let valorHora: number;
  if (esVigilNocturna) {
    // Vigilancia nocturna: 175 horas mensuales
    valorHora = baseHE / 175;
  } else if (esMediaJornada) {
    // Media jornada: 100 horas mensuales
    valorHora = baseHE / 100;
  } else {
    valorHora = baseHE / 200;
  }

  const importeHE50 = novN.horas_extras_50 * valorHora * 1.5;
  const importeHE100 = novN.horas_extras_100 * valorHora * 2.0;
  const importeFeriados = novN.feriados_trabajados_hs * valorHora * 2.0;

  // ---------------------------------------------------------------------------
  // 16. Días no trabajados / licencia enfermedad
  // ---------------------------------------------------------------------------

  const valorDiario = haberesFijos / 30;
  const descuentoDias = -novN.dias_no_trabajados * valorDiario;
  const licenciaEnfermedad = novN.licencia_enfermedad * valorDiario;

  // ---------------------------------------------------------------------------
  // 17. Plus vacacional
  // ---------------------------------------------------------------------------

  const totalHaberesPreVac =
    haberesFijos -
    adicionalRemEfectivo +
    importeHE50 +
    importeHE100 +
    importeFeriados +
    descuentoDias +
    licenciaEnfermedad;

  const plusVacacional =
    novN.plus_vacaciones_dias > 0
      ? totalHaberesPreVac * (1 / 25 - 1 / 30) * novN.plus_vacaciones_dias
      : 0;

  // ---------------------------------------------------------------------------
  // 18. Total remunerativo
  // ---------------------------------------------------------------------------

  const totalRemunerativo =
    haberesFijos +
    importeHE50 +
    importeHE100 +
    importeFeriados +
    descuentoDias +
    licenciaEnfermedad +
    plusVacacional;

  // ---------------------------------------------------------------------------
  // 18b. Diferencia SAC (diciembre: si bruto dic > mejor bruto jul-nov del SAC2)
  // ---------------------------------------------------------------------------

  let diferenciaSAC = 0;
  const [periodoYear, periodoMonth] = periodo.split("-").map(Number);
  if (periodoMonth === 12) {
    const sac2Row = await pool.query<{ remuneracion_bruta: string }>(
      `SELECT remuneracion_bruta FROM app.liquidaciones_sueldo
       WHERE empleado_id = $1 AND tipo = 'sac_2'
         AND EXTRACT(YEAR FROM periodo::date) = $2
         AND estado != 'anulada'
       LIMIT 1`,
      [empleadoId, periodoYear]
    );
    if (sac2Row.rows.length > 0) {
      // Find the actual best monthly bruto used for SAC2 (months 7-11 of the same year)
      const mejorBrutoRow = await pool.query<{ mejor_bruto: string }>(
        `SELECT MAX(remuneracion_bruta::numeric) AS mejor_bruto
         FROM app.liquidaciones_sueldo
         WHERE empleado_id = $1
           AND tipo = 'mensual'
           AND estado != 'anulada'
           AND EXTRACT(YEAR FROM periodo::date) = $2
           AND EXTRACT(MONTH FROM periodo::date) BETWEEN 7 AND 11`,
        [empleadoId, periodoYear]
      );
      const mejorBruto = Number(mejorBrutoRow.rows[0]?.mejor_bruto ?? 0);
      if (mejorBruto > 0 && totalRemunerativo > mejorBruto) {
        diferenciaSAC = safe((totalRemunerativo - mejorBruto) / 2);
      }
    }
  }

  const totalRemunerativoFinal = totalRemunerativo + diferenciaSAC;

  // ---------------------------------------------------------------------------
  // 20. Descuentos empleado
  // ---------------------------------------------------------------------------

  const descVivienda = emp.tiene_vivienda ? adic("valor_vivienda", VALOR_VIVIENDA) : 0;

  // Diferencia Obra Social Ley 26475: for part-time workers, OS must be based on the
  // full-time equivalent salary.
  let difObraSocial = 0;
  if (emp.jornada === "Media") {
    const catKey2 = `cat_${emp.categoria_edificio}` as "cat_1" | "cat_2" | "cat_3" | "cat_4";
    let baseOSCompleta: number;
    if (emp.funcion.includes("No Permanente Sin vivienda")) {
      baseOSCompleta = escalaMap["Encargado Permanente sin vivienda"]?.[catKey2] ?? sueldoBasico * 2;
    } else if (emp.funcion.includes("No Permanente Con vivienda")) {
      baseOSCompleta = escalaMap["Encargado Permanente con vivienda"]?.[catKey2] ?? sueldoBasico * 2;
    } else {
      baseOSCompleta = sueldoBasico * 2;
    }
    difObraSocial = Math.max(0, baseOSCompleta * 0.03 - totalRemunerativoFinal * 0.03);
  }

  const esSuplente = emp.jornada === "Suplente";
  const embargo = novN.embargo;
  const anticipo = novN.anticipo;

  const desc = calcDescuentosEmpleado(totalRemunerativoFinal, esSuplente, difObraSocial);
  const { jubilacion, pami, obraSocial, suterh, cajaProtFlia, fateryh, seguroVital } = desc;
  const totalDescuentos = desc.total + descVivienda + embargo + anticipo;

  // ---------------------------------------------------------------------------
  // 21. Contribuciones patronales
  // ---------------------------------------------------------------------------

  const patron = calcContribPatronal(totalRemunerativoFinal, cons);
  const totalPatronal = patron.total;
  const { jubilacion: contribJubilacion, obraSocial: contribOS, suterh: contribSuterh,
          fateryh: contribFateryh, seracarh: contribSeracarh, art: contribART, scvo: scvoFijo } = patron;

  // ---------------------------------------------------------------------------
  // 22. Neto a pagar
  // ---------------------------------------------------------------------------

  const netoAPagar = totalRemunerativoFinal - totalDescuentos;

  // Debug: detect NaN sources
  const debugValues: Record<string, number> = {
    sueldoBasico, plusAntig, retiroResiduos, clasifResiduos, valorVivienda,
    plusCocheras, plusMovCoches, plusJardin, plusZonaDesf, plusTitulo, plusPileta,
    adicionalViaticos, adicionalRemEfectivo, adicionalVoluntario, suplencia100,
    haberesFijos, importeHE50, importeHE100, importeFeriados, descuentoDias,
    licenciaEnfermedad, plusVacacional, diferenciaSAC, totalRemunerativoFinal,
    jubilacion, pami, obraSocial, difObraSocial, suterh, cajaProtFlia, fateryh, seguroVital,
    totalDescuentos, totalPatronal, netoAPagar,
  };
  const nanFields = Object.entries(debugValues).filter(([, v]) => isNaN(v));
  if (nanFields.length > 0) {
    console.warn(`[engine] NaN detected for empleado ${empleadoId} (${emp.nombre}):`,
      nanFields.map(([k]) => k).join(", "));
  }

  // ---------------------------------------------------------------------------
  // Persist: upsert liquidacion + rebuild conceptos
  // ---------------------------------------------------------------------------

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const upsertResult = await client.query<{ id: number }>(
      `INSERT INTO app.liquidaciones_sueldo
         (empleado_id, periodo, tipo, remuneracion_bruta, total_descuentos_empleado,
          total_aportes_patronales, neto_a_pagar, estado)
       VALUES ($1, $2, 'mensual', $3, $4, $5, $6, 'borrador')
       ON CONFLICT (empleado_id, periodo, tipo) DO UPDATE SET
         remuneracion_bruta         = EXCLUDED.remuneracion_bruta,
         total_descuentos_empleado  = EXCLUDED.total_descuentos_empleado,
         total_aportes_patronales   = EXCLUDED.total_aportes_patronales,
         neto_a_pagar               = EXCLUDED.neto_a_pagar,
         estado                     = CASE
           WHEN app.liquidaciones_sueldo.estado = 'confirmada' THEN 'confirmada'
           ELSE 'borrador'
         END
       RETURNING id`,
      [
        empleadoId,
        periodo,
        safe(totalRemunerativoFinal),
        safe(totalDescuentos),
        safe(totalPatronal),
        safe(netoAPagar),
      ]
    );

    const liquidacionId = upsertResult.rows[0].id;

    // Delete and rebuild conceptos
    await client.query(
      `DELETE FROM app.conceptos_liquidacion WHERE liquidacion_id = $1`,
      [liquidacionId]
    );

    // Build concept rows — skip zero-value entries
    type ConceptoInput = [
      number,   // liquidacion_id
      string,   // tipo
      string,   // concepto
      number,   // importe
      number    // orden
    ];

    const conceptos: ConceptoInput[] = [];

    const addHaber = (
      concepto: string,
      importe: number,
      orden: number
    ) => {
      const v = safe(importe);
      if (v === 0) return;
      if (v < 0) {
        conceptos.push([liquidacionId, "descuento", concepto, Math.abs(v), orden]);
      } else {
        conceptos.push([liquidacionId, "haber", concepto, v, orden]);
      }
    };

    const addDescuento = (
      concepto: string,
      importe: number,
      orden: number
    ) => {
      const v = safe(importe);
      if (v === 0) return;
      conceptos.push([liquidacionId, "descuento", concepto, v, orden]);
    };

    // Haberes
    addHaber("Sueldo Básico", sueldoBasico, 1);
    addHaber("Suplencia 100%", suplencia100, 2);
    addHaber("Retiro de Residuos", retiroResiduos, 3);
    addHaber("Clasificación de Residuos", clasifResiduos, 4);
    addHaber("Valor Vivienda", valorVivienda, 5);
    addHaber("Plus Antigüedad", plusAntig, 6);
    addHaber("Plus Cocheras", plusCocheras, 7);
    addHaber("Plus Movimiento de Coches", plusMovCoches, 8);
    addHaber("Plus Jardín", plusJardin, 9);
    addHaber("Plus Zona Desfavorable", plusZonaDesf, 10);
    addHaber("Plus Título", plusTitulo, 11);
    addHaber("Plus Piletas", plusPileta, 12);
    addHaber("Adicional Viáticos", adicionalViaticos, 13);
    addHaber("Adicional Remuneratorio Mensual", adicionalRemEfectivo, 14);
    addHaber("Adicional Voluntario", adicionalVoluntario, 15);
    if (novN.horas_extras_50 > 0)  addHaber(`Horas Extras 50% (${novN.horas_extras_50}hs)`, importeHE50, 16);
    if (novN.horas_extras_100 > 0) addHaber(`Horas Extras 100% (${novN.horas_extras_100}hs)`, importeHE100, 17);
    if (novN.feriados_trabajados_hs > 0) addHaber(`Feriados Trabajados (${novN.feriados_trabajados_hs}hs)`, importeFeriados, 18);

    // Días no trabajados — stored as negative haber so it appears in the Remunerativo column
    if (descuentoDias !== 0) {
      conceptos.push([
        liquidacionId,
        "haber",
        "Días No Trabajados",
        descuentoDias, // negative value
        19,
      ]);
    }

    addHaber("Licencia por Enfermedad", licenciaEnfermedad, 20);
    addHaber("Plus Vacacional", plusVacacional, 21);
    addHaber("Diferencia SAC", diferenciaSAC, 22);

    // Descuentos empleado
    addDescuento("Jubilación", jubilacion, 30);
    addDescuento("PAMI", pami, 31);
    addDescuento("Obra Social", obraSocial, 32);
    addDescuento("Diferencia Obra Social Ley 26475", difObraSocial, 33);
    addDescuento("SUTERH", suterh, 34);
    addDescuento("Caja Protección Familiar", cajaProtFlia, 35);
    addDescuento("FATERYH", fateryh, 36);
    addDescuento("Seguro Vitalicio", seguroVital, 37);
    addDescuento("Descuento Vivienda", descVivienda, 38);
    addDescuento("Embargo", embargo, 39);
    addDescuento("Anticipo", anticipo, 40);

    if (conceptos.length > 0) {
      const placeholders = conceptos
        .map(
          (_, i) =>
            `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
        )
        .join(", ");

      await client.query(
        `INSERT INTO app.conceptos_liquidacion
           (liquidacion_id, tipo, concepto, importe, orden)
         VALUES ${placeholders}`,
        conceptos.flat()
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// SAC (Sueldo Anual Complementario)
// ---------------------------------------------------------------------------

export interface SACPreview {
  empleadoNombre: string;
  mejorBruto: number;
  mesesTrabajados: number;
  mesesTotales: number;
  sacBase: number;
  jubilacion: number;
  pami: number;
  obraSocial: number;
  suterh: number;
  cajaProtFlia: number;
  fateryh: number;
  seguroVital: number;
  totalDescuentos: number;
  totalPatronal: number;
  netoAPagar: number;
  periodo: string;
  tipo: "sac_1" | "sac_2";
}

export async function calcularSACPreview(
  empleadoId: number,
  anio: number,
  semestre: 1 | 2
): Promise<SACPreview> {
  const meses = semestre === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11];
  const mesesTotales = meses.length;

  const [empRow, consRows, liqRows] = await Promise.all([
    pool.query<Empleado>(`SELECT * FROM app.empleados_edificio WHERE id = $1`, [empleadoId]),
    pool.query<Consorcio>(`SELECT c.* FROM app.consorcios c JOIN app.empleados_edificio e ON e.consorcio_id = c.id WHERE e.id = $1`, [empleadoId]),
    pool.query<{ remuneracion_bruta: string }>(
      `SELECT remuneracion_bruta
       FROM app.liquidaciones_sueldo
       WHERE empleado_id = $1
         AND tipo = 'mensual'
         AND estado != 'anulada'
         AND EXTRACT(YEAR FROM periodo::date) = $2
         AND EXTRACT(MONTH FROM periodo::date) = ANY($3)
       ORDER BY remuneracion_bruta::numeric DESC`,
      [empleadoId, anio, meses]
    ),
  ]);

  if (empRow.rows.length === 0) throw new Error(`Empleado ${empleadoId} no encontrado`);
  if (liqRows.rows.length === 0) throw new Error(`Sin liquidaciones mensuales para SAC ${semestre}° ${anio}`);

  const emp = empRow.rows[0];
  const cons = consRows.rows[0];
  const mejorBruto = Number(liqRows.rows[0].remuneracion_bruta);
  const mesesTrabajados = liqRows.rows.length;

  const sacBase = safe((mejorBruto / 2) * (mesesTrabajados / mesesTotales));

  const esSuplente = emp.jornada === "Suplente";
  const desc = calcDescuentosEmpleado(sacBase, esSuplente);
  const { jubilacion, pami, obraSocial, suterh, cajaProtFlia, fateryh, seguroVital } = desc;
  const totalDescuentos = desc.total;
  const totalPatronal = cons ? calcContribPatronal(sacBase, cons).total : 0;

  return {
    empleadoNombre: emp.nombre,
    mejorBruto,
    mesesTrabajados,
    mesesTotales,
    sacBase,
    jubilacion,
    pami,
    obraSocial,
    suterh,
    cajaProtFlia,
    fateryh,
    seguroVital,
    totalDescuentos,
    totalPatronal,
    netoAPagar: sacBase - totalDescuentos,
    periodo: semestre === 1 ? `${anio}-06-01` : `${anio}-12-01`,
    tipo: semestre === 1 ? "sac_1" : "sac_2",
  };
}

export async function liquidarSAC(
  empleadoId: number,
  anio: number,
  semestre: 1 | 2
): Promise<void> {
  const p = await calcularSACPreview(empleadoId, anio, semestre);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const res = await client.query<{ id: number }>(
      `INSERT INTO app.liquidaciones_sueldo
         (empleado_id, periodo, tipo, remuneracion_bruta, total_descuentos_empleado,
          total_aportes_patronales, neto_a_pagar, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'borrador')
       ON CONFLICT (empleado_id, periodo, tipo) DO UPDATE SET
         remuneracion_bruta        = EXCLUDED.remuneracion_bruta,
         total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
         total_aportes_patronales  = EXCLUDED.total_aportes_patronales,
         neto_a_pagar              = EXCLUDED.neto_a_pagar,
         estado = CASE WHEN app.liquidaciones_sueldo.estado = 'confirmada' THEN 'confirmada' ELSE 'borrador' END
       RETURNING id`,
      [empleadoId, p.periodo, p.tipo, safe(p.sacBase), safe(p.totalDescuentos), safe(p.totalPatronal), safe(p.netoAPagar)]
    );

    const liqId = res.rows[0].id;
    await client.query(`DELETE FROM app.conceptos_liquidacion WHERE liquidacion_id = $1`, [liqId]);

    const conceptos: [number, string, string, number, number][] = [
      [liqId, "haber", "Sueldo Anual Complementario", safe(p.sacBase), 1],
    ];
    if (p.jubilacion > 0)    conceptos.push([liqId, "descuento", "Jubilación", safe(p.jubilacion), 30]);
    if (p.pami > 0)          conceptos.push([liqId, "descuento", "PAMI", safe(p.pami), 31]);
    if (p.obraSocial > 0)    conceptos.push([liqId, "descuento", "Obra Social", safe(p.obraSocial), 32]);
    if (p.suterh > 0)        conceptos.push([liqId, "descuento", "SUTERH", safe(p.suterh), 34]);
    if (p.cajaProtFlia > 0)  conceptos.push([liqId, "descuento", "Caja Protección Familiar", safe(p.cajaProtFlia), 35]);
    if (p.fateryh > 0)       conceptos.push([liqId, "descuento", "FATERYH", safe(p.fateryh), 36]);
    if (p.seguroVital > 0)   conceptos.push([liqId, "descuento", "Seguro Vitalicio", safe(p.seguroVital), 37]);

    const placeholders = conceptos
      .map((_, i) => `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`)
      .join(",");
    await client.query(
      `INSERT INTO app.conceptos_liquidacion (liquidacion_id,tipo,concepto,importe,orden) VALUES ${placeholders}`,
      conceptos.flat()
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Indemnización por egreso
// ---------------------------------------------------------------------------

function diasVacacionesPorAntigüedad(anios: number): number {
  if (anios < 5) return 12;
  if (anios < 10) return 20;
  if (anios < 20) return 24;
  return 28;
}

function diasPreaviso(anios: number): number {
  if (anios < 1) return 15;
  if (anios < 5) return 30;
  return 60;
}

export interface IndemnizacionConcepto {
  label: string;
  importe: number;
  remunerativo: boolean;
}

export interface IndemnizacionPreview {
  empleadoNombre: string;
  mejorBruto: number;
  aniosServicio: number;
  conceptos: IndemnizacionConcepto[];
  totalRemunerativo: number;
  totalNoRemunerativo: number;
  descuentosSobreRem: {
    jubilacion: number; pami: number; obraSocial: number;
    suterh: number; cajaProtFlia: number; fateryh: number; seguroVital: number;
    total: number;
  };
  totalPatronal: number;
  netoAPagar: number;
  periodo: string;
}

export async function calcularIndemnizacionPreview(
  empleadoId: number,
  fechaEgreso: string,
  tipoEgreso: string
): Promise<IndemnizacionPreview> {
  const egreso = new Date(fechaEgreso);
  const [empRow, consRows] = await Promise.all([
    pool.query<Empleado>(`SELECT * FROM app.empleados_edificio WHERE id = $1`, [empleadoId]),
    pool.query<Consorcio>(`SELECT c.* FROM app.consorcios c JOIN app.empleados_edificio e ON e.consorcio_id = c.id WHERE e.id = $1`, [empleadoId]),
  ]);

  if (empRow.rows.length === 0) throw new Error(`Empleado ${empleadoId} no encontrado`);
  const emp = empRow.rows[0];
  const cons = consRows.rows[0];

  const aniosServicio = calcAniosAntigüedad(emp.fecha_ingreso, fechaEgreso);

  // Best bruto from the 6 most recent completed monthly liquidaciones (by date, not by amount)
  const liqRows = await pool.query<{ mejor_bruto: string }>(
    `SELECT MAX(remuneracion_bruta::numeric) AS mejor_bruto
     FROM (
       SELECT remuneracion_bruta
       FROM app.liquidaciones_sueldo
       WHERE empleado_id = $1 AND tipo = 'mensual' AND estado != 'anulada'
         AND periodo < $2
       ORDER BY periodo DESC
       LIMIT 6
     ) sub`,
    [empleadoId, `${egreso.getFullYear()}-${String(egreso.getMonth() + 1).padStart(2, "0")}-01`]
  );

  const mejorBruto = liqRows.rows.length > 0 ? Number(liqRows.rows[0].mejor_bruto ?? 0) : 0;
  const valorDiario = mejorBruto / 30;

  const conceptos: IndemnizacionConcepto[] = [];

  const esDespidoSinCausa = tipoEgreso === "despido_sin_causa";
  const esDespidoConCausa = tipoEgreso === "despido_con_causa";
  const esRenuncia = tipoEgreso === "renuncia";

  // Preaviso (Rem) — employer pays substitution when no prior notice given
  // Despido sin causa y renuncia (en renuncia el empleado lo debe dar, pero si no lo da lo pierde — aquí calculamos el que corresponde al empleador pagar)
  const diasPre = diasPreaviso(aniosServicio);
  const importePreaviso = safe(diasPre <= 15 ? mejorBruto / 2 : diasPre <= 30 ? mejorBruto : mejorBruto * 2);
  if (esDespidoSinCausa) {
    conceptos.push({ label: `Preaviso (${diasPre} días)`, importe: importePreaviso, remunerativo: true });
  }

  // Integración mes de despido (Rem) — days remaining in month after firing
  if (esDespidoSinCausa) {
    const diaEgreso = egreso.getDate();
    const diasIntegracion = Math.max(0, 30 - diaEgreso);
    const importeIntegracion = safe(diasIntegracion * valorDiario);
    if (importeIntegracion > 0) {
      conceptos.push({ label: `Integración mes de despido (${diasIntegracion} días)`, importe: importeIntegracion, remunerativo: true });
    }
  }

  // SAC proporcional (Rem) — fraction of current semester already worked
  const mes = egreso.getMonth() + 1; // 1-12
  const semesterStart = mes <= 6 ? 1 : 7;
  const mesesEnSemestre = mes - semesterStart + 1;
  const sacProp = safe((mejorBruto / 2) * (mesesEnSemestre / 6));
  if (sacProp > 0) {
    conceptos.push({ label: `SAC Proporcional (${mesesEnSemestre}/6 meses)`, importe: sacProp, remunerativo: true });
  }

  // Indemnización por antigüedad (No Rem) — only despido sin causa
  // CHECK PENDING: ¿es remunerativo? Excel=NO, LCT art 245 = exento. Implementado como No Rem.
  if (esDespidoSinCausa) {
    const aniosIndemnizacion = Math.max(1, aniosServicio);
    const importeIndem = safe(mejorBruto * aniosIndemnizacion);
    conceptos.push({ label: `Indemnización por Antigüedad (${aniosIndemnizacion} año/s × mejor bruto)`, importe: importeIndem, remunerativo: false });
  }

  // Vacaciones proporcionales (No Rem)
  const ingreso = new Date(emp.fecha_ingreso);
  const inicioAnio = new Date(egreso.getFullYear(), 0, 1);
  const inicioCalculo = ingreso > inicioAnio ? ingreso : inicioAnio;
  const mesesVac = Math.ceil((egreso.getTime() - inicioCalculo.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const diasVacAnuales = diasVacacionesPorAntigüedad(aniosServicio);
  const diasVacProp = Math.round((diasVacAnuales / 12) * Math.min(mesesVac, 12));
  const importeVac = safe(diasVacProp * (mejorBruto / 25));
  if (importeVac > 0) {
    conceptos.push({ label: `Vacaciones proporcionales (${diasVacProp} días)`, importe: importeVac, remunerativo: false });
  }

  // SAC s/preaviso and SAC s/vacaciones (No Rem)
  if (esDespidoSinCausa && importePreaviso > 0) {
    conceptos.push({ label: "SAC s/Preaviso", importe: safe(importePreaviso / 6), remunerativo: false });
  }
  if (importeVac > 0) {
    conceptos.push({ label: "SAC s/Vacaciones no gozadas", importe: safe(importeVac / 6), remunerativo: false });
  }

  // Totals
  const totalRemunerativo = conceptos.filter((c) => c.remunerativo).reduce((s, c) => s + c.importe, 0);
  const totalNoRemunerativo = conceptos.filter((c) => !c.remunerativo).reduce((s, c) => s + c.importe, 0);

  const esSuplente = emp.jornada === "Suplente";
  const descResult = calcDescuentosEmpleado(totalRemunerativo, esSuplente);
  const { jubilacion, pami, obraSocial, suterh, cajaProtFlia, fateryh, seguroVital } = descResult;
  const totalDesc = descResult.total;

  const pctJubilPatronal = Number(cons?.pct_contrib_jubilacion ?? 0.18);
  const pctOSPatronal = Number(cons?.pct_contrib_obra_social ?? 0.06);
  const pctSuterh = Number(cons?.pct_cct_suterh ?? 0.015);
  const pctFateryh = Number(cons?.pct_cct_fateryh ?? 0.0475);
  const pctSeracarh = Number(cons?.pct_cct_seracarh ?? 0.005);
  const pctART = Number(cons?.art_pct_variable ?? 0);
  const scvoFijo = cons?.sv_costo_fijo ? Number(cons.sv_costo_fijo) * (cons.sv_cant_cuiles ?? 1) : 0;
  const totalPatronal = totalRemunerativo * (pctJubilPatronal + pctOSPatronal + pctSuterh + pctFateryh + pctSeracarh + pctART) + scvoFijo;

  const periodo = `${egreso.getFullYear()}-${String(egreso.getMonth() + 1).padStart(2, "0")}-01`;

  return {
    empleadoNombre: emp.nombre,
    mejorBruto,
    aniosServicio,
    conceptos,
    totalRemunerativo: safe(totalRemunerativo),
    totalNoRemunerativo: safe(totalNoRemunerativo),
    descuentosSobreRem: { jubilacion: safe(jubilacion), pami: safe(pami), obraSocial: safe(obraSocial), suterh: safe(suterh), cajaProtFlia: safe(cajaProtFlia), fateryh: safe(fateryh), seguroVital: safe(seguroVital), total: safe(totalDesc) },
    totalPatronal: safe(totalPatronal),
    netoAPagar: safe(totalRemunerativo + totalNoRemunerativo - totalDesc),
    periodo,
  };
}

export async function liquidarIndemnizacion(
  empleadoId: number,
  fechaEgreso: string,
  tipoEgreso: string
): Promise<void> {
  const p = await calcularIndemnizacionPreview(empleadoId, fechaEgreso, tipoEgreso);
  const totalBruto = p.totalRemunerativo + p.totalNoRemunerativo;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update employee with egreso info
    await client.query(
      `UPDATE app.empleados_edificio SET fecha_egreso=$1, tipo_egreso=$2, estado='inactivo', updated_at=now() WHERE id=$3`,
      [fechaEgreso, tipoEgreso, empleadoId]
    );

    const res = await client.query<{ id: number }>(
      `INSERT INTO app.liquidaciones_sueldo
         (empleado_id, periodo, tipo, remuneracion_bruta, total_descuentos_empleado,
          total_aportes_patronales, neto_a_pagar, estado)
       VALUES ($1, $2, 'indemnizacion', $3, $4, $5, $6, 'borrador')
       ON CONFLICT (empleado_id, periodo, tipo) DO UPDATE SET
         remuneracion_bruta        = EXCLUDED.remuneracion_bruta,
         total_descuentos_empleado = EXCLUDED.total_descuentos_empleado,
         total_aportes_patronales  = EXCLUDED.total_aportes_patronales,
         neto_a_pagar              = EXCLUDED.neto_a_pagar,
         estado = CASE WHEN app.liquidaciones_sueldo.estado = 'confirmada' THEN 'confirmada' ELSE 'borrador' END
       RETURNING id`,
      [empleadoId, p.periodo, safe(totalBruto), safe(p.descuentosSobreRem.total), safe(p.totalPatronal), safe(p.netoAPagar)]
    );

    const liqId = res.rows[0].id;
    await client.query(`DELETE FROM app.conceptos_liquidacion WHERE liquidacion_id = $1`, [liqId]);

    const conceptos: [number, string, string, number, number][] = [];
    p.conceptos.forEach((c, i) => {
      conceptos.push([liqId, c.remunerativo ? "haber" : "haber_no_rem", c.label, safe(c.importe), i + 1]);
    });

    // Descuentos sobre remunerativo
    const d = p.descuentosSobreRem;
    if (d.jubilacion > 0)   conceptos.push([liqId, "descuento", "Jubilación", safe(d.jubilacion), 30]);
    if (d.pami > 0)         conceptos.push([liqId, "descuento", "PAMI", safe(d.pami), 31]);
    if (d.obraSocial > 0)   conceptos.push([liqId, "descuento", "Obra Social", safe(d.obraSocial), 32]);
    if (d.suterh > 0)       conceptos.push([liqId, "descuento", "SUTERH", safe(d.suterh), 34]);
    if (d.cajaProtFlia > 0) conceptos.push([liqId, "descuento", "Caja Protección Familiar", safe(d.cajaProtFlia), 35]);
    if (d.fateryh > 0)      conceptos.push([liqId, "descuento", "FATERYH", safe(d.fateryh), 36]);
    if (d.seguroVital > 0)  conceptos.push([liqId, "descuento", "Seguro Vitalicio", safe(d.seguroVital), 37]);

    if (conceptos.length > 0) {
      const ph = conceptos.map((_, i) => `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`).join(",");
      await client.query(
        `INSERT INTO app.conceptos_liquidacion (liquidacion_id,tipo,concepto,importe,orden) VALUES ${ph}`,
        conceptos.flat()
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Batch: calculate all active employees for a period
// ---------------------------------------------------------------------------

export async function calcularPeriodo(
  periodo: string
): Promise<{ ok: number; errores: string[] }> {
  const result = await pool.query<{ id: number; nombre: string }>(
    `SELECT id, nombre FROM app.empleados_edificio WHERE estado = 'activo'`
  );

  const empleados = result.rows;

  // Process in batches of 5 to avoid exhausting the pg connection pool
  const BATCH_SIZE = 5;
  let ok = 0;
  const errores: string[] = [];
  for (let i = 0; i < empleados.length; i += BATCH_SIZE) {
    const batch = empleados.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((emp) => calcularLiquidacion(emp.id, periodo))
    );
    batchResults.forEach((r, j) => {
      const emp = batch[j];
      if (r.status === "fulfilled") {
        ok++;
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        errores.push(`Empleado ${emp.id} (${emp.nombre}): ${msg}`);
        console.error(`[engine] Error en empleado ${emp.id}:`, r.reason);
      }
    });
  }

  return { ok, errores };
}
