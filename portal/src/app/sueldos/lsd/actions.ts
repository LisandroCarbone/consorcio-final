"use server";

import { pool, query, queryOne } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConceptoARCARow {
  id: number;
  consorcio_cuit: string;
  codigo_afip: string;
  descripcion_afip: string | null;
  codigo_contribuyente: string;
  descripcion_contribuyente: string | null;
  marca_repetible: number;
  aportes_sipa: number;
  contribuciones_sipa: number;
  aportes_inssjp: number;
  contribuciones_inssjp: number;
  aportes_os: number;
  contribuciones_os: number;
  aportes_fsr: number;
  contribuciones_fsr: number;
  codigo_interno: string | null;
  [key: string]: unknown;
}

interface EmpleadoLSD {
  id: number;
  cuil: string;
  legajo: string | null;
  jornada: string;
  cbu: string | null;
  conyuge: boolean;
  cantidad_hijos: number;
  marca_scvo: boolean;
  fecha_ingreso: string;
  fecha_egreso: string | null;
  [key: string]: unknown;
}

interface ConceptoLiquidacionRow {
  code: string | null;
  tipo: string;
  concepto: string;
  importe: string;
  [key: string]: unknown;
}

// ─── Helpers de formateo fixed-width ───────────────────────────────────────────

function padLeft(value: string | number, len: number, char = "0"): string {
  const s = String(value);
  return s.length >= len ? s.slice(-len) : char.repeat(len - s.length) + s;
}

function padRight(value: string | number, len: number, char = " "): string {
  const s = String(value ?? "");
  return s.length >= len ? s.slice(0, len) : s + char.repeat(len - s.length);
}

/** Multiplica por 100 y devuelve un entero zero-padded a la izquierda (sin signo). */
function montoField(value: number, len: number): string {
  const cents = Math.round(Math.abs(value) * 100);
  return padLeft(cents, len);
}

function soloDigitos(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function fechaAAAAMMDD(date: string | Date | null): string {
  if (!date) return "        ";
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

// ─── a) Upload de conceptos ARCA ────────────────────────────────────────────

export async function uploadConceptosARCA(
  consorcio_cuit: string,
  fileContent: string
): Promise<{ count: number }> {
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("El archivo no contiene datos (se esperaba encabezado + filas).");
  }

  // La primera línea es el encabezado, se descarta.
  const dataLines = lines.slice(1);

  const client = await pool.connect();
  let count = 0;
  try {
    await client.query("BEGIN");
    for (const line of dataLines) {
      const cols = line.split(";").map((c) => c.trim());
      if (cols.length < 4) continue;

      const [
        codigoAfip,
        descripcionAfip,
        codigoContribuyente,
        descripcionContribuyente,
        marcaRepetible,
        aportesSipa,
        contribucionesSipa,
        aportesInssjp,
        contribucionesInssjp,
        aportesOs,
        contribucionesOs,
        aportesFsr,
        contribucionesFsr,
      ] = cols;

      if (!codigoAfip || !codigoContribuyente) continue;

      await client.query(
        `INSERT INTO app.lsd_conceptos_consorcio (
           consorcio_cuit, codigo_afip, descripcion_afip,
           codigo_contribuyente, descripcion_contribuyente,
           marca_repetible, aportes_sipa, contribuciones_sipa,
           aportes_inssjp, contribuciones_inssjp,
           aportes_os, contribuciones_os,
           aportes_fsr, contribuciones_fsr
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (consorcio_cuit, codigo_contribuyente) DO UPDATE SET
           codigo_afip = EXCLUDED.codigo_afip,
           descripcion_afip = EXCLUDED.descripcion_afip,
           descripcion_contribuyente = EXCLUDED.descripcion_contribuyente,
           marca_repetible = EXCLUDED.marca_repetible,
           aportes_sipa = EXCLUDED.aportes_sipa,
           contribuciones_sipa = EXCLUDED.contribuciones_sipa,
           aportes_inssjp = EXCLUDED.aportes_inssjp,
           contribuciones_inssjp = EXCLUDED.contribuciones_inssjp,
           aportes_os = EXCLUDED.aportes_os,
           contribuciones_os = EXCLUDED.contribuciones_os,
           aportes_fsr = EXCLUDED.aportes_fsr,
           contribuciones_fsr = EXCLUDED.contribuciones_fsr`,
        [
          consorcio_cuit,
          codigoAfip,
          descripcionAfip || null,
          codigoContribuyente,
          descripcionContribuyente || null,
          Number(marcaRepetible ?? 1) || 0,
          Number(aportesSipa ?? 0) || 0,
          Number(contribucionesSipa ?? 0) || 0,
          Number(aportesInssjp ?? 0) || 0,
          Number(contribucionesInssjp ?? 0) || 0,
          Number(aportesOs ?? 0) || 0,
          Number(contribucionesOs ?? 0) || 0,
          Number(aportesFsr ?? 0) || 0,
          Number(contribucionesFsr ?? 0) || 0,
        ]
      );
      count++;
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  logAudit("create", "lsd_conceptos_consorcio", consorcio_cuit, { count });

  return { count };
}

// ─── b) Obtener conceptos mapeados ──────────────────────────────────────────

export async function getConceptosARCA(consorcio_cuit: string): Promise<ConceptoARCARow[]> {
  return query<ConceptoARCARow>(
    `SELECT * FROM app.lsd_conceptos_consorcio
     WHERE consorcio_cuit = $1
     ORDER BY codigo_contribuyente`,
    [consorcio_cuit]
  );
}

// ─── Actualizar el mapeo código interno <-> código ARCA ─────────────────────

export async function updateMapeoConcepto(
  id: number,
  codigo_interno: string | null
): Promise<void> {
  await query(
    `UPDATE app.lsd_conceptos_consorcio SET codigo_interno = $2 WHERE id = $1`,
    [id, codigo_interno]
  );
}

// ─── c) Generar el archivo LSD ──────────────────────────────────────────────

function codModalidad(jornada: string): string {
  if (jornada === "Media") return "001";
  if (jornada === "Suplente") return "012";
  return "008"; // Completa
}

export async function generateLSDFile(
  consorcio_cuit: string,
  periodo: string // YYYY-MM
): Promise<string> {
  const periodoDate = `${periodo}-01`;
  const periodoAAAAMM = periodo.replace("-", "");

  const consorcio = await queryOne<{
    cuit: string;
    codigo_localidad: string;
  }>(`SELECT cuit, codigo_localidad FROM app.consorcios WHERE cuit = $1`, [consorcio_cuit]);

  if (!consorcio) {
    throw new Error(`No se encontró el consorcio ${consorcio_cuit}`);
  }

  const conceptosMap = await getConceptosARCA(consorcio_cuit);
  const mapByCodigoInterno = new Map(
    conceptosMap.filter((c) => c.codigo_interno).map((c) => [c.codigo_interno as string, c])
  );

  const liquidaciones = await query<{
    id: number;
    empleado_id: number;
    remuneracion_bruta: string;
    fecha_pago: string | null;
  }>(
    `SELECT l.id, l.empleado_id, l.remuneracion_bruta, l.fecha_pago
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados e ON e.id = l.empleado_id
     WHERE e.consorcio_cuit = $1 AND l.periodo = $2 AND l.estado != 'anulada'
     ORDER BY e.legajo NULLS LAST, e.id`,
    [consorcio_cuit, periodoDate]
  );

  if (liquidaciones.length === 0) {
    throw new Error(`No hay liquidaciones confirmadas para el período ${periodo}`);
  }

  const empleadoIds = liquidaciones.map((l) => l.empleado_id);
  const empleados = await query<EmpleadoLSD>(
    `SELECT id, cuil, legajo, jornada, cbu, conyuge, cantidad_hijos, marca_scvo,
            fecha_ingreso, fecha_egreso
     FROM app.empleados WHERE id = ANY($1::int[])`,
    [empleadoIds]
  );
  const empleadoById = new Map(empleados.map((e) => [e.id, e]));

  const lines: string[] = [];
  let cantReg04 = 0;
  const reg03Lines: string[] = [];
  const reg04Lines: string[] = [];
  const reg02Lines: string[] = [];

  for (const liq of liquidaciones) {
    const empleado = empleadoById.get(liq.empleado_id);
    if (!empleado) continue;

    const cuil = soloDigitos(empleado.cuil);
    const hasCbu = !!empleado.cbu && soloDigitos(empleado.cbu).length > 0;

    // Reg 02 — datos de pago
    reg02Lines.push(
      "02" +
        padLeft(cuil, 11) +
        padRight(empleado.legajo ?? "", 10) +
        padRight("", 50) + // dependencia
        padRight(hasCbu ? soloDigitos(empleado.cbu) : "", 22) +
        padLeft("0", 3) + // dias_tope
        fechaAAAAMMDD(liq.fecha_pago) +
        padRight("", 8) + // fecha_rubrica
        (hasCbu ? "3" : "1")
    );

    // Reg 03 — conceptos de la liquidación
    const conceptos = await query<ConceptoLiquidacionRow>(
      `SELECT code, tipo, concepto, importe FROM app.conceptos_liquidacion
       WHERE liquidacion_id = $1 ORDER BY orden`,
      [liq.id]
    );

    let remBruta = 0;
    for (const c of conceptos) {
      const mapeo = c.code ? mapByCodigoInterno.get(c.code) : undefined;
      if (!mapeo) continue; // concepto sin mapeo ARCA — se omite del TXT

      const importe = Number(c.importe);
      const esDebito = c.tipo === "descuento";
      if (!esDebito) remBruta += importe;

      reg03Lines.push(
        "03" +
          padLeft(cuil, 11) +
          padRight(mapeo.codigo_contribuyente, 10) +
          padLeft(100, 5) + // cantidad = 1.00 por defecto
          "$" +
          montoField(importe, 15) +
          (esDebito ? "D" : "C") +
          padRight("", 6) // periodo_ajuste
      );
    }

    // Reg 04 — datos previsionales/aportes
    reg04Lines.push(
      "04" +
        padLeft(cuil, 11) +
        (empleado.conyuge ? "1" : "0") +
        padLeft(empleado.cantidad_hijos, 2) +
        "1" + // marca_cct
        (empleado.marca_scvo ? "1" : "0") +
        "0" + // marca_reduccion
        "1" + // tipo_empresa (Decreto 814)
        "0" + // tipo_operacion
        padLeft("01", 2) + // cod_situacion (activo)
        padRight("01", 2) + // cod_condicion
        padLeft("001", 3) + // cod_actividad
        padRight(codModalidad(empleado.jornada), 3) +
        padRight("01", 2) + // cod_siniestrado
        padLeft(consorcio.codigo_localidad.slice(0, 2) || "00", 2) +
        padLeft("01", 2) + // sit_revista_1
        padLeft("01", 2) + // dia_inicio_1
        padLeft("00", 2) + // sit_revista_2
        padLeft("00", 2) + // dia_inicio_2
        padLeft("00", 2) + // sit_revista_3
        padLeft("00", 2) + // dia_inicio_3
        padLeft(30, 2) + // dias_trabajados
        padLeft(0, 3) + // horas_trabajadas
        padLeft(0, 5) + // pct_aporte_adic_ss
        padLeft(0, 5) + // contrib_tarea_dif
        padLeft(0, 6) + // cod_obra_social
        padLeft(0, 2) + // cant_adherentes
        montoField(0, 15) + // aporte_adic_os
        montoField(0, 15) + // contrib_adic_os
        montoField(0, 15) + // base_dif_aportes_os_fsr
        montoField(0, 15) + // base_dif_os_fsr
        montoField(0, 15) + // base_dif_lrt
        montoField(0, 15) + // rem_maternidad
        montoField(remBruta, 15) + // rem_bruta
        montoField(remBruta, 15) + // base_imp_1
        montoField(remBruta, 15) + // base_imp_2
        montoField(remBruta, 15) + // base_imp_3
        montoField(remBruta, 15) + // base_imp_4
        montoField(remBruta, 15) + // base_imp_5
        montoField(remBruta, 15) + // base_imp_6
        montoField(remBruta, 15) + // base_imp_7
        montoField(remBruta, 15) + // base_imp_8
        montoField(remBruta, 15) + // base_imp_9
        montoField(0, 15) + // base_dif_aporte_seg
        montoField(0, 15) + // base_dif_contrib_seg
        montoField(remBruta, 15) + // base_imp_10
        montoField(0, 15) // importe_detraer
    );
    cantReg04++;
  }

  // Reg 01 — cabecera
  const reg01 =
    "01" +
    padLeft(soloDigitos(consorcio_cuit), 11) +
    padRight("SJ", 2) +
    periodoAAAAMM +
    "M" +
    padLeft("1", 5) +
    "30" +
    padLeft(cantReg04, 6);

  lines.push(reg01, ...reg02Lines, ...reg03Lines, ...reg04Lines);

  return lines.join("\r\n") + "\r\n";
}
