import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { cleanPeriodo } from "@/lib/format";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { ConciliacionClient } from "./ConciliacionClient";
import { getPendingDebits, getReconciliacionSummary } from "./actions";

async function getData(consorcioCuit: string, periodoId: number | null, periodoAnteriorId: number | null) {
  const [extractos, unidades, consorcios] = await Promise.all([
    periodoId
      ? query<{
          id: number;
          consorcio_cuit: string;
          periodo_id: number;
          anio: number;
          mes: number;
          archivo_nombre: string;
          corte_label: string | null;
          fecha_carga: string;
          estado: string;
          total_creditos: string;
          total_debitos: string;
          movimientos_count: number;
          matcheados_count: number;
          saldo_apertura: string | null;
          saldo_cierre: string | null;
          fecha_desde: string | null;
          fecha_hasta: string | null;
        }>(
          `SELECT id, consorcio_cuit, periodo_id, anio, mes, archivo_nombre, corte_label,
                  fecha_carga::text, estado, total_creditos::text, total_debitos::text,
                  movimientos_count, matcheados_count,
                  saldo_apertura::text, saldo_cierre::text, fecha_desde::text, fecha_hasta::text
           FROM app.extractos_bancarios
           WHERE consorcio_cuit = $1 AND periodo_id = $2
           ORDER BY fecha_carga DESC`,
          [consorcioCuit, periodoId]
        )
      : Promise.resolve([]),
    query<{ id: number; uf: string; uf_numero: number | null; propietario: string | null }>(
      `SELECT u.id, u.uf::text, u.uf_numero,
              NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario
       FROM app.unidades u
       LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
       LEFT JOIN app.personas p ON p.id = o.persona_id
       WHERE u.consorcio_cuit = $1
       ORDER BY u.uf_numero NULLS LAST, u.uf`,
      [consorcioCuit]
    ),
    query<{ id: string; nombre: string }>("SELECT cuit AS id, nombre FROM app.consorcios ORDER BY nombre"),
  ]);

  const extractoIds = extractos.map((e) => e.id);
  const movimientos = extractoIds.length
    ? await query<{
        id: number;
        extracto_id: number;
        fecha: string;
        descripcion: string;
        referencia: string | null;
        monto: string;
        es_credito: boolean;
        cbu_origen: string | null;
        cuit_origen: string | null;
        nombre_origen: string | null;
        match_tipo: string | null;
        match_id: number | null;
        match_confianza: string | null;
        estado_match: string;
        comprobante_ref: string | null;
        categoria_bancaria: string | null;
      }>(
        `SELECT id, extracto_id, fecha::text, descripcion, referencia, monto::text, es_credito,
                cbu_origen, cuit_origen, nombre_origen, match_tipo, match_id, match_confianza::text,
                estado_match, comprobante_ref, categoria_bancaria
         FROM app.extracto_movimientos
         WHERE extracto_id = ANY($1::int[])
         ORDER BY fecha DESC, id DESC`,
        [extractoIds]
      )
    : [];

  const gastos = consorcioCuit
    ? await query<{ id: number; descripcion: string; monto: string; periodo_label: string }>(
        `SELECT gp.id, gp.descripcion, gp.monto::text,
                pe.mes || '/' || pe.anio AS periodo_label
         FROM app.gastos_periodo gp
         JOIN app.periodos_expensas pe ON pe.id = gp.periodo_id
         WHERE pe.consorcio_cuit = $1
         ORDER BY pe.anio DESC, pe.mes DESC, gp.descripcion`,
        [consorcioCuit]
      )
    : [];

  const pendingDebits = periodoId
    ? await getPendingDebits([periodoId, periodoAnteriorId].filter((p): p is number => p !== null))
    : [];

  const summary = periodoId && consorcioCuit
    ? await getReconciliacionSummary(consorcioCuit, periodoId, periodoAnteriorId)
    : null;

  return { extractos, movimientos, unidades, consorcios, gastos, pendingDebits, summary };
}

export default async function ConciliacionBancariaPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  if (!activeCuit) {
    const consorcios = await query<{ id: string; nombre: string }>(
      "SELECT cuit AS id, nombre FROM app.consorcios ORDER BY nombre"
    );
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conciliación Bancaria</h2>
        <ConsorcioRequerido
          consorcios={consorcios.map((c) => ({ cuit: c.id, nombre: c.nombre }))}
          seccion="la conciliación bancaria"
        />
      </div>
    );
  }

  const activePeriodoRaw = cookieStore.get("active_periodo")?.value;
  const activePeriodo = cleanPeriodo(activePeriodoRaw);
  let activeYear = 0;
  let activeMonth = 0;
  if (activePeriodo) {
    const parts = activePeriodo.split("-");
    activeYear = Number(parts[0]);
    activeMonth = Number(parts[1]);
  }
  if (!activeYear || isNaN(activeYear) || activeYear < 2000 || !activeMonth || isNaN(activeMonth)) {
    const now = new Date();
    activeYear = now.getFullYear();
    activeMonth = now.getMonth() + 1;
  }

  const periodo = await query<{ id: number }>(
    "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
    [activeCuit, activeYear, activeMonth]
  );
  const periodoId = periodo[0]?.id ?? null;

  let prevYear = activeMonth === 1 ? activeYear - 1 : activeYear;
  let prevMonth = activeMonth === 1 ? 12 : activeMonth - 1;
  const periodoAnterior = await query<{ id: number }>(
    "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
    [activeCuit, prevYear, prevMonth]
  );
  const periodoAnteriorId = periodoAnterior[0]?.id ?? null;

  const { extractos, movimientos, unidades, gastos, pendingDebits, summary } = await getData(
    activeCuit,
    periodoId,
    periodoAnteriorId
  );

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conciliación Bancaria</h2>
      <ConciliacionClient
        consorcioCuit={activeCuit}
        periodoId={periodoId}
        anio={activeYear}
        mes={activeMonth}
        extractos={extractos}
        movimientos={movimientos}
        unidades={unidades}
        gastos={gastos}
        pendingDebits={pendingDebits}
        summary={summary}
      />
    </div>
  );
}
