import React, { Suspense } from "react";
import { query } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import ManagePaymentsModal from "./ManagePaymentsModal";
import { CuentaCorrienteTableClient, CuentaCorrienteRow } from "./CuentaCorrienteTableClient";
import HistorialCuentaCorrienteClient, { HistorialRow } from "./HistorialCuentaCorrienteClient";

function calcularInteresSimple(
  saldoInicial: number,
  historial: { total_mes: number; su_pago: number }[],
  tasa: number
): { intereses: number; saldoFinal: number; saldoAnterior: number } {
  let deudasVivas: { capital: number; meses: number }[] = [];
  if (saldoInicial > 0) {
    deudasVivas.push({ capital: saldoInicial, meses: 0 });
  }

  let lastIntereses = 0;
  let lastSaldo = saldoInicial;
  let lastSaldoAnterior = saldoInicial;

  for (const row of historial) {
    lastSaldoAnterior = lastSaldo;

    for (const d of deudasVivas) d.meses++;

    if (row.total_mes > 0) {
      deudasVivas.push({ capital: row.total_mes, meses: 0 });
    }

    let pagoRestante = row.su_pago;
    while (pagoRestante > 0 && deudasVivas.length > 0) {
      if (pagoRestante >= deudasVivas[0].capital) {
        pagoRestante -= deudasVivas[0].capital;
        deudasVivas.shift();
      } else {
        deudasVivas[0].capital -= pagoRestante;
        pagoRestante = 0;
      }
    }

    lastIntereses = deudasVivas.reduce(
      (sum, d) => sum + d.capital * tasa * d.meses, 0
    );
    const capitalPostPago = deudasVivas.reduce((s, d) => s + d.capital, 0);
    lastSaldo = capitalPostPago + lastIntereses;
  }

  return { intereses: lastIntereses, saldoFinal: lastSaldo, saldoAnterior: lastSaldoAnterior };
}

async function getCuentaCorriente(
  consorcioCuit: string,
  anio: number,
  mes: number
): Promise<CuentaCorrienteRow[]> {
  return query<CuentaCorrienteRow>(
    `SELECT
       u.id AS unidad_id,
       COALESCE(u.uf_numero::text, u.uf::text) AS unidad_numero,
       NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario,
       COALESCE(rcp.saldo_anterior, 0)::numeric AS saldo_anterior,
       COALESCE(rcp.su_pago, 0)::numeric AS su_pago,
       COALESCE(rcp.coef_a, 0)::numeric AS coef_a,
       COALESCE(rcp.expensas_a, 0)::numeric AS expensas_a,
       COALESCE(rcp.coef_b, 0)::numeric AS coef_b,
       COALESCE(rcp.expensas_b, 0)::numeric AS expensas_b,
       COALESCE(rcp.total_mes, 0)::numeric AS total_mes,
       COALESCE(rcp.deuda, 0)::numeric AS deuda,
       COALESCE(rcp.intereses, 0)::numeric AS intereses,
       COALESCE(rcp.total_pagar, 0)::numeric AS total_pagar,
       rcp.estado,
       COALESCE((SELECT SUM(monto) FROM app.pagos WHERE unidad_id=u.id), 0)::text AS total_pagado,
       COALESCE((SELECT COUNT(*) FROM app.pagos WHERE unidad_id=u.id), 0)::int AS total_pagado_count,
       (SELECT MAX(fecha)::text FROM app.pagos WHERE unidad_id=u.id) AS ultimo_pago,
       rcp.id AS expensa_pendiente_id,
       rcp.total_pagar::text AS expensa_pendiente_monto
     FROM app.unidades u
     LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
     LEFT JOIN app.personas  p ON p.id = o.persona_id
     LEFT JOIN app.periodos_expensas pe ON pe.consorcio_cuit = u.consorcio_cuit AND pe.anio = $2 AND pe.mes = $3
     LEFT JOIN app.res_cuenta_periodo rcp ON rcp.unidad_id = u.id AND rcp.periodo_id = pe.id
     WHERE u.consorcio_cuit = $1
     ORDER BY u.uf_numero NULLS LAST, u.uf`,
    [consorcioCuit, anio, mes]
  );
}


export default async function CuentaCorrientePage({
  searchParams,
}: {
  searchParams: Promise<{
    pago?: string;
    consorcio?: string;
    ver_historial?: string;
    ver_pagos?: string;
  }>;
}) {
  const sp = await searchParams;

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const activePeriodo = cookieStore.get("active_periodo")?.value || "";
  const [anio, mes] = activePeriodo
    ? activePeriodo.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  let prevYear = mes === 1 ? anio - 1 : anio;
  let prevMonth = mes === 1 ? 12 : mes - 1;

  const [consorcios, rows, periodoRow, prevPeriodoRow] = await Promise.all([
    query<{ cuit: string; nombre: string }>(
      "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
    ),
    activeCuit ? getCuentaCorriente(activeCuit, anio, mes) : Promise.resolve([] as CuentaCorrienteRow[]),
    activeCuit
      ? query<{ id: number }>(
          "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
          [activeCuit, anio, mes]
        )
      : Promise.resolve([]),
    activeCuit
      ? query<{ id: number }>(
          "SELECT id FROM app.periodos_expensas WHERE consorcio_cuit = $1 AND anio = $2 AND mes = $3",
          [activeCuit, prevYear, prevMonth]
        )
      : Promise.resolve([]),
  ]);

  const periodoId = periodoRow[0]?.id ?? null;
  const esPrimerPeriodo = !!periodoId && prevPeriodoRow.length === 0;

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cuenta Corriente</h2>
        <ConsorcioRequerido consorcios={consorcios} seccion="la cuenta corriente" />
      </div>
    );
  }

  const selectedCuit = activeCuit;
  const selectedConsorcio = consorcios.find((c) => c.cuit === selectedCuit);

  // Recalculate interest using historial logic (interés simple per-expense)
  if (rows.length > 0) {
    const [saldosRes, historialAllRes, tasaRes] = await Promise.all([
      query<{ id: number; saldo_inicial_historico: number }>(
        `SELECT id, COALESCE(saldo_inicial_historico, 0)::numeric AS saldo_inicial_historico
         FROM app.unidades WHERE consorcio_cuit = $1`,
        [activeCuit]
      ),
      query<{ unidad_id: number; total_mes: number; su_pago: number }>(
        `SELECT rcp.unidad_id, COALESCE(rcp.total_mes, 0)::numeric AS total_mes,
                COALESCE(rcp.su_pago, 0)::numeric AS su_pago
         FROM app.res_cuenta_periodo rcp
         JOIN app.periodos_expensas pe ON pe.id = rcp.periodo_id
         WHERE pe.consorcio_cuit = $1
         ORDER BY pe.anio ASC, pe.mes ASC`,
        [activeCuit]
      ),
      query<{ tasa: number }>(
        `SELECT COALESCE(tasa, 0)::numeric AS tasa FROM app.tasas_interes
         WHERE consorcio_cuit = $1 ORDER BY fecha_desde DESC LIMIT 1`,
        [activeCuit]
      ),
    ]);

    const tasa = Number(tasaRes[0]?.tasa ?? 0);
    const saldoMap = new Map(saldosRes.map(s => [s.id, Number(s.saldo_inicial_historico)]));
    const historialMap = new Map<number, { total_mes: number; su_pago: number }[]>();
    for (const h of historialAllRes) {
      if (!historialMap.has(h.unidad_id)) historialMap.set(h.unidad_id, []);
      historialMap.get(h.unidad_id)!.push({ total_mes: Number(h.total_mes), su_pago: Number(h.su_pago) });
    }

    for (const row of rows) {
      const uid = Number(row.unidad_id);
      const saldoIni = saldoMap.get(uid) ?? 0;
      const hist = historialMap.get(uid) ?? [];
      if (saldoIni > 0 || hist.length > 0) {
        const { intereses, saldoFinal, saldoAnterior } = calcularInteresSimple(saldoIni, hist, tasa);
        const r = row as Record<string, unknown>;
        r.saldo_anterior = saldoAnterior;
        r.intereses = intereses;
        r.deuda = saldoAnterior + Number(row.total_mes) - Number(row.su_pago);
        r.total_pagar = saldoFinal;
      }
    }
  }

  const totalDeuda = rows.reduce((s, r) => s + (Number(r.total_pagar) > 0 ? Number(r.total_pagar) : 0), 0);
  const totalPagado = rows.reduce((s, r) => s + Number(r.total_pagado), 0);
  const unidadesDeudoras = rows.filter((r) => Number(r.total_pagar) > 0).length;

  // Query details if modals are active
  let historyUnitDetails: { uf: string; propietario: string }[] = [];
  let historialRows: HistorialRow[] = [];
  let historialSaldoInicial = 0;
  let historialTasaVigente = 0;

  if (sp.ver_historial) {
    const historyUnidadId = Number(sp.ver_historial);
    const [unitRes, rowsRes, saldoRes, tasaRes] = await Promise.all([
      query<{ uf: string; propietario: string }>(
        `SELECT u.uf::text, NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario
         FROM app.unidades u
         LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
         LEFT JOIN app.personas p ON p.id = o.persona_id
         WHERE u.id = $1`,
        [historyUnidadId]
      ),
      query<HistorialRow>(
        `SELECT rcp.id, pe.anio, pe.mes,
                rcp.total_mes::text, rcp.su_pago::text, rcp.saldo_anterior::text,
                rcp.intereses::text, rcp.deuda::text, rcp.total_pagar::text,
                pe.estado AS periodo_estado
         FROM app.res_cuenta_periodo rcp
         JOIN app.periodos_expensas pe ON pe.id = rcp.periodo_id
         WHERE rcp.unidad_id = $1
         ORDER BY pe.anio ASC, pe.mes ASC`,
        [historyUnidadId]
      ),
      query<{ saldo_inicial_historico: string }>(
        `SELECT saldo_inicial_historico::text FROM app.unidades WHERE id = $1`,
        [historyUnidadId]
      ),
      query<{ tasa: string }>(
        `SELECT tasa::text FROM app.tasas_interes
         WHERE consorcio_cuit = $1
         ORDER BY fecha_desde DESC LIMIT 1`,
        [activeCuit]
      ),
    ]);
    historyUnitDetails = unitRes;
    historialRows = rowsRes;
    historialSaldoInicial = Number(saldoRes[0]?.saldo_inicial_historico ?? 0);
    historialTasaVigente = Number(tasaRes[0]?.tasa ?? 0);
  }

  let pagosUnitDetails: { uf: string; propietario: string }[] = [];
  let pagosList: { id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }[] = [];

  if (sp.ver_pagos) {
    const pagosUnidadId = Number(sp.ver_pagos);
    const [unitRes, pagosRes] = await Promise.all([
      query<{ uf: string; propietario: string }>(
        `SELECT u.uf::text, NULLIF(TRIM(COALESCE(p.nombre,'') || ' ' || COALESCE(p.apellido,'')), '') AS propietario
         FROM app.unidades u
         LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true AND o.rol = 'propietario'
         LEFT JOIN app.personas p ON p.id = o.persona_id
         WHERE u.id = $1`,
        [pagosUnidadId]
      ),
      query<{ id: number; fecha: string; monto: string; medio_pago: string; referencia: string | null; notas: string | null }>(
        `SELECT id, fecha::text, monto::text, medio_pago, referencia, notas
         FROM app.pagos
         WHERE unidad_id = $1
         ORDER BY fecha DESC, id DESC`,
        [pagosUnidadId]
      ),
    ]);
    pagosUnitDetails = unitRes;
    pagosList = pagosRes;
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cuenta Corriente</h2>
        <p className="text-gray-500 text-sm mt-1">
          Saldo por unidad · cobranzas registradas — <strong>{selectedConsorcio?.nombre}</strong>
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          {/* Summary cards */}
          {selectedCuit && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Crédito a cobrar</p>
                <p className="text-xl font-bold text-red-600">{formatMoney(totalDeuda)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Cobranzas históricas</p>
                <p className="text-xl font-bold text-green-600">{formatMoney(totalPagado)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Unidades con saldo pendiente</p>
                <p className="text-xl font-bold text-gray-800">{unidadesDeudoras} / {rows.length}</p>
              </div>
            </div>
          )}

          {/* Grilla principal */}
          {rows.length > 0 ? (
            <div className="card overflow-hidden">
              <Suspense fallback={null}>
                <CuentaCorrienteTableClient consorcioCuit={selectedCuit} data={rows} esPrimerPeriodo={esPrimerPeriodo} periodoId={periodoId} />
              </Suspense>
            </div>
          ) : (
            selectedCuit && (
              <div className="card p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📊</p>
                <p>No hay unidades en este consorcio aún.</p>
              </div>
            )
          )}
        </div>

      </div>

      {/* Modal Historial */}
      {sp.ver_historial && historyUnitDetails.length > 0 && (
        <HistorialCuentaCorrienteClient
          consorcioCuit={selectedCuit}
          unidadId={Number(sp.ver_historial)}
          uf={historyUnitDetails[0].uf}
          propietario={historyUnitDetails[0].propietario ?? "—"}
          saldoInicial={historialSaldoInicial}
          tasaVigente={historialTasaVigente}
          historialRows={historialRows}
        />
      )}

      {/* Modal Gestionar Pagos (6B) */}
      {sp.ver_pagos && pagosUnitDetails.length > 0 && (
        <ManagePaymentsModal
          consorcioCuit={selectedCuit}
          unidadId={Number(sp.ver_pagos)}
          uf={pagosUnitDetails[0].uf}
          propietario={pagosUnitDetails[0].propietario ?? ""}
          pagos={pagosList}
        />
      )}
    </div>
  );
}
