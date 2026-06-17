"use server";

import { pool, query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calcularLiquidacion as engineCalcLiquidacion, calcularPeriodo } from "@/lib/liquidacion/engine";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmpleadoForm {
  cuil: string;
  nombre: string;
  legajo?: string;
  fecha_nacimiento?: string;
  fecha_ingreso: string;
  consorcio_id: number;
  funcion: string;
  categoria_edificio: number;
  jornada: "Completa" | "Media" | "Suplente";
  tiene_vivienda: boolean;
  obra_social?: string;
  cod_obra_social?: number;
  banco?: string;
  cbu?: string;
  retiro_residuos: boolean;
  clasificacion_residuos: boolean;
  plus_cocheras: boolean;
  plus_movimiento_coches: boolean;
  plus_jardin: boolean;
  plus_zona_desfavorable: boolean;
  plus_pileta: boolean;
  tiene_titulo: boolean;
  adicional_voluntario: number;
}

export interface NovedadesForm {
  empleado_id: number;
  periodo: string; // YYYY-MM-01
  dias_trabajados_suplente: number;
  horas_jornada?: number;
  horas_extras_50: number;
  horas_extras_100: number;
  feriados_trabajados_hs: number;
  suplencia_100_hs: number;
  plus_vacaciones_dias: number;
  dias_no_trabajados: number;
  licencia_enfermedad: number;
  adicional_voluntario: number;
  embargo: number;
  anticipo: number;
  muerte: number;
  observaciones?: string;
}

// ─── Empleados ────────────────────────────────────────────────────────────────

export interface EmpleadoRow {
  id: number;
  nombre: string;
  legajo: string | null;
  funcion: string;
  jornada: string;
  consorcio_id: number;
  consorcio_nombre: string;
  antiguedad_anios: number;
  [key: string]: unknown;
}

export async function getEmpleados(consorcioId?: number): Promise<EmpleadoRow[]> {
  return query<EmpleadoRow>(
    `SELECT e.*, c.nombre AS consorcio_nombre,
            EXTRACT(YEAR FROM AGE(NOW(), e.fecha_ingreso))::int AS antiguedad_anios
     FROM app.empleados_edificio e
     JOIN app.consorcios c ON c.id = e.consorcio_id
     WHERE e.estado = 'activo'
     ${consorcioId ? "AND e.consorcio_id = $1" : ""}
     ORDER BY c.nombre, e.nombre`,
    consorcioId ? [consorcioId] : []
  );
}

export async function createEmpleado(data: EmpleadoForm) {
  if (!data.nombre?.trim()) throw new Error("Nombre requerido");
  if (!data.cuil?.trim()) throw new Error("CUIL requerido");
  if (!data.consorcio_id || data.consorcio_id <= 0) throw new Error("Consorcio inválido");
  if (!data.fecha_ingreso) throw new Error("Fecha de ingreso requerida");

  const db = pool;
  await db.query(
    `INSERT INTO app.empleados_edificio
       (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
        funcion, categoria_edificio, jornada, tiene_vivienda,
        obra_social, cod_obra_social, banco, cbu,
        retiro_residuos, clasificacion_residuos, plus_cocheras,
        plus_movimiento_coches, plus_jardin, plus_zona_desfavorable,
        plus_pileta, tiene_titulo, adicional_voluntario)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
             $15,$16,$17,$18,$19,$20,$21,$22,$23)`,
    [
      data.cuil, data.nombre, data.legajo || null,
      data.fecha_nacimiento || null, data.fecha_ingreso, data.consorcio_id,
      data.funcion, data.categoria_edificio, data.jornada, data.tiene_vivienda,
      data.obra_social || null, data.cod_obra_social || null,
      data.banco || null, data.cbu || null,
      data.retiro_residuos, data.clasificacion_residuos, data.plus_cocheras,
      data.plus_movimiento_coches, data.plus_jardin, data.plus_zona_desfavorable,
      data.plus_pileta, data.tiene_titulo, data.adicional_voluntario,
    ]
  );
  revalidatePath("/sueldos/empleados");
}

// ─── Novedades ────────────────────────────────────────────────────────────────

export async function getNovedadesPeriodo(periodo: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query<any>(
    `SELECT n.*, e.nombre AS empleado_nombre, e.funcion,
            c.nombre AS consorcio_nombre
     FROM app.novedades_sueldo n
     JOIN app.empleados_edificio e ON e.id = n.empleado_id
     JOIN app.consorcios c ON c.id = e.consorcio_id
     WHERE n.periodo = $1
     ORDER BY c.nombre, e.nombre`,
    [periodo]
  );
}

export async function upsertNovedades(data: NovedadesForm) {
  const db = pool;
  await db.query(
    `INSERT INTO app.novedades_sueldo
       (empleado_id, periodo, dias_trabajados_suplente, horas_jornada,
        horas_extras_50, horas_extras_100, feriados_trabajados_hs,
        suplencia_100_hs, plus_vacaciones_dias, dias_no_trabajados,
        licencia_enfermedad, adicional_voluntario, embargo, anticipo,
        muerte, observaciones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     ON CONFLICT (empleado_id, periodo)
     DO UPDATE SET
       dias_trabajados_suplente = EXCLUDED.dias_trabajados_suplente,
       horas_jornada            = EXCLUDED.horas_jornada,
       horas_extras_50          = EXCLUDED.horas_extras_50,
       horas_extras_100         = EXCLUDED.horas_extras_100,
       feriados_trabajados_hs   = EXCLUDED.feriados_trabajados_hs,
       suplencia_100_hs         = EXCLUDED.suplencia_100_hs,
       plus_vacaciones_dias     = EXCLUDED.plus_vacaciones_dias,
       dias_no_trabajados       = EXCLUDED.dias_no_trabajados,
       licencia_enfermedad      = EXCLUDED.licencia_enfermedad,
       adicional_voluntario     = EXCLUDED.adicional_voluntario,
       embargo                  = EXCLUDED.embargo,
       anticipo                 = EXCLUDED.anticipo,
       muerte                   = EXCLUDED.muerte,
       observaciones            = EXCLUDED.observaciones,
       updated_at               = now()`,
    [
      data.empleado_id, data.periodo, data.dias_trabajados_suplente,
      data.horas_jornada ?? null, data.horas_extras_50, data.horas_extras_100,
      data.feriados_trabajados_hs, data.suplencia_100_hs, data.plus_vacaciones_dias,
      data.dias_no_trabajados, data.licencia_enfermedad, data.adicional_voluntario,
      data.embargo, data.anticipo, data.muerte, data.observaciones ?? null,
    ]
  );
  revalidatePath("/sueldos/novedades");
}

// ─── Escalas ──────────────────────────────────────────────────────────────────

export async function getEscalasPeriodo(periodo: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [escalas, adicionales] = await Promise.all([
    query<any>("SELECT * FROM app.escalas_suterh WHERE periodo = $1 ORDER BY funcion", [periodo]),
    query<any>("SELECT * FROM app.adicionales_suterh WHERE periodo = $1 ORDER BY concepto", [periodo]),
  ]);
  return { escalas, adicionales };
}

export async function getUltimaEscala() {
  const row = await queryOne<{ periodo: string }>(
    "SELECT DISTINCT periodo FROM app.escalas_suterh ORDER BY periodo DESC LIMIT 1"
  );
  return row?.periodo ?? null;
}

export async function calcularLiquidacion(empleadoId: number, periodo: string) {
  const result = await engineCalcLiquidacion(empleadoId, periodo);
  revalidatePath("/sueldos/liquidaciones");
  return result;
}


export async function getLiquidacionesPeriodo(periodo: string, tipo = "mensual") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query<any>(
    `SELECT l.*, e.nombre AS empleado_nombre, e.funcion, e.jornada,
            c.nombre AS consorcio_nombre
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados_edificio e ON e.id = l.empleado_id
     JOIN app.consorcios c ON c.id = e.consorcio_id
     WHERE l.periodo = $1 AND l.tipo = $2
     ORDER BY c.nombre, e.nombre`,
    [periodo, tipo]
  );
}

export async function getLiquidacionDetalle(liquidacionId: number) {
  const liq = await queryOne(
    `SELECT l.*, e.nombre AS empleado_nombre, e.cuil, e.legajo, e.funcion, e.jornada,
            e.obra_social, e.cod_obra_social, e.banco, e.cbu,
            e.fecha_ingreso,
            EXTRACT(YEAR FROM AGE(l.periodo::date, e.fecha_ingreso))::int AS antiguedad_anios,
            c.nombre AS consorcio_nombre, c.cuit AS consorcio_cuit,
            c.nro_cta_suterh,
            c.art_pct_variable, c.art_fijo,
            c.sv_costo_fijo, c.sv_cant_cuiles,
            c.pct_cct_suterh, c.pct_cct_seracarh,
            c.pct_contrib_jubilacion, c.pct_contrib_obra_social, c.pct_cct_fateryh
     FROM app.liquidaciones_sueldo l
     JOIN app.empleados_edificio e ON e.id = l.empleado_id
     JOIN app.consorcios c ON c.id = e.consorcio_id
     WHERE l.id = $1`,
    [liquidacionId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conceptos = await query<any>(
    "SELECT * FROM app.conceptos_liquidacion WHERE liquidacion_id = $1 ORDER BY orden",
    [liquidacionId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return liq ? { ...(liq as any), conceptos } : null;
}

export async function confirmarLiquidacion(liquidacionId: number) {
  const db = pool;
  await db.query(
    "UPDATE app.liquidaciones_sueldo SET estado = 'confirmada', updated_at = now() WHERE id = $1",
    [liquidacionId]
  );
  revalidatePath("/sueldos/liquidaciones");
}

// ─── Calcular todas las liquidaciones de un período ──────────────────────────

export async function calcularLiquidacionesPeriodo(periodo: string) {
  const result = await calcularPeriodo(periodo);
  revalidatePath("/sueldos/liquidaciones");
  return result;
}
