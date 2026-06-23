export const dynamic = "force-dynamic";

import { getLiquidacionesPeriodo } from "../actions";
import { recalcularPeriodoAction, confirmarLiquidacionAction } from "./actions";
import { formatMoney0, cleanPeriodo } from "@/lib/format";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import Link from "next/link";
import { Suspense } from "react";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { pool } from "@/lib/db";

interface LiquidacionRow {
  id: number;
  empleado_nombre: string;
  funcion: string;
  consorcio_nombre: string;
  remuneracion_bruta: string;
  total_descuentos_empleado: string;
  neto_a_pagar: string;
  estado: string;
}

interface Props {
  searchParams: Promise<{ periodo?: string; tipo?: string }>;
}

export default async function LiquidacionesPage({ searchParams }: Props) {
  const { periodo: periodoParam, tipo: tipoParam } = await searchParams;
  const cleanedPeriodo = cleanPeriodo(periodoParam);
  const now = new Date();
  const tipo = tipoParam ?? "mensual";

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const { rows: consorcios } = await pool.query(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  if (!activeCuit) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Liquidaciones</h1>
        <ConsorcioRequerido consorcios={consorcios} seccion="las liquidaciones de sueldos" />
      </div>
    );
  }

  // Read active_periodo cookie
  const activePeriodo = cleanPeriodo(cookieStore.get("active_periodo")?.value);

  // For SAC periods, default to June (sac_1) or December (sac_2) of current year
  let periodo: string;
  if (!cleanedPeriodo) {
    if (tipo === "sac_1") {
      const year = activePeriodo ? activePeriodo.slice(0, 4) : now.getFullYear();
      periodo = `${year}-06-01`;
    } else if (tipo === "sac_2") {
      const year = activePeriodo ? activePeriodo.slice(0, 4) : now.getFullYear();
      periodo = `${year}-12-01`;
    } else {
      periodo = activePeriodo || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    }
  } else {
    periodo = cleanedPeriodo;
  }

  const liquidaciones: LiquidacionRow[] = await getLiquidacionesPeriodo(periodo, tipo, activeCuit);

  const periodoDate = new Date(periodo + "T00:00:00Z");
  const year = periodoDate.getUTCFullYear();

  let periodoLabel: string;
  if (tipo === "sac_1") {
    periodoLabel = `SAC 1° Semestre ${year}`;
  } else if (tipo === "sac_2") {
    periodoLabel = `SAC 2° Semestre ${year}`;
  } else {
    const raw = periodoDate.toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
    periodoLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // Prev / next for mensual navigation
  const prevMes = new Date(Date.UTC(periodoDate.getUTCFullYear(), periodoDate.getUTCMonth() - 1, 1))
    .toISOString().slice(0, 10);
  const nextMes = new Date(Date.UTC(periodoDate.getUTCFullYear(), periodoDate.getUTCMonth() + 1, 1))
    .toISOString().slice(0, 10);

  // SAC period links for current year shown in periodo
  const sacYear = year;
  const sac1Periodo = `${sacYear}-06-01`;
  const sac2Periodo = `${sacYear}-12-01`;

  const totalNeto = liquidaciones
    .filter((l) => l.estado !== "anulada")
    .reduce((s, l) => s + Number(l.neto_a_pagar), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Suspense><ActionFeedback /></Suspense>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            {periodoLabel}
            {" · "}
            <Link href="/sueldos/liquidaciones/historia" className="text-blue-600 hover:underline text-xs">
              Ver histórico por persona →
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {tipo === "mensual" ? (
            <>
              <a href={`?periodo=${prevMes}&tipo=mensual`} className="btn-secondary text-sm">← Anterior</a>
              <a href={`?periodo=${nextMes}&tipo=mensual`} className="btn-secondary text-sm">Siguiente →</a>
              <a href={`?periodo=${sac1Periodo}&tipo=sac_1`} className="btn-secondary text-sm text-indigo-700 border-indigo-300">SAC 1°</a>
              <a href={`?periodo=${sac2Periodo}&tipo=sac_2`} className="btn-secondary text-sm text-indigo-700 border-indigo-300">SAC 2°</a>
            </>
          ) : (
            <>
              <a
                href={`?periodo=${sac1Periodo}&tipo=sac_1`}
                className={`btn-secondary text-sm ${tipo === "sac_1" ? "font-semibold underline" : ""}`}
              >
                SAC 1° {sacYear}
              </a>
              <a
                href={`?periodo=${sac2Periodo}&tipo=sac_2`}
                className={`btn-secondary text-sm ${tipo === "sac_2" ? "font-semibold underline" : ""}`}
              >
                SAC 2° {sacYear}
              </a>
              <a href={`?periodo=${periodo}&tipo=mensual`} className="btn-secondary text-sm">← Volver a mensual</a>
            </>
          )}
          <form action={recalcularPeriodoAction}>
            <input type="hidden" name="periodo" value={periodo} />
            <input type="hidden" name="tipo" value={tipo} />
            <button type="submit" className="btn-primary">
              Recalcular todo
            </button>
          </form>
        </div>
      </div>

      {liquidaciones.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">No hay liquidaciones para este período.</p>
          {tipo === "mensual" ? (
            <p className="text-sm">Cargá las novedades del mes y hacé clic en "Recalcular todo".</p>
          ) : (
            <p className="text-sm">Usá la página de SAC para liquidar individualmente y luego recalculá.</p>
          )}
        </div>
      ) : (
        <>
          <div className="card mb-4 flex justify-between items-center">
            <span className="text-gray-500 text-sm">Total neto a pagar</span>
            <span className="text-xl font-bold text-gray-900">
              {formatMoney0(totalNeto)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4">Empleado</th>
                  <th className="pb-2 pr-4">Consorcio</th>
                  <th className="pb-2 pr-4 text-right">Bruto</th>
                  <th className="pb-2 pr-4 text-right">Descuentos</th>
                  <th className="pb-2 pr-4 text-right">Neto</th>
                  <th className="pb-2 pr-4">Estado</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{l.empleado_nombre}</p>
                      <p className="text-gray-400 text-xs">{l.funcion}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{l.consorcio_nombre}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">
                      {formatMoney0(Number(l.remuneracion_bruta))}
                    </td>
                    <td className="py-3 pr-4 text-right text-red-600">
                      -{formatMoney0(Number(l.total_descuentos_empleado))}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                      {formatMoney0(Number(l.neto_a_pagar))}
                    </td>
                    <td className="py-3 pr-4">
                      <EstadoBadge estado={l.estado} />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/sueldos/liquidaciones/${l.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Ver recibo
                        </Link>
                        {l.estado === "borrador" && (
                          <form action={confirmarLiquidacionAction}>
                            <input type="hidden" name="id" value={l.id} />
                            <input type="hidden" name="periodo" value={periodo} />
                            <input type="hidden" name="tipo" value={tipo} />
                            <button
                              type="submit"
                              className="text-green-600 hover:underline text-xs"
                            >
                              Confirmar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

