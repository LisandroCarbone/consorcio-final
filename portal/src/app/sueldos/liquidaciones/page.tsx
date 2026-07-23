export const dynamic = "force-dynamic";

import { getLiquidacionesPeriodo } from "../actions";
import { ConfirmarLiquidacionButton } from "./ConfirmarLiquidacionButton";
import { RecalcularButton } from "./RecalcularButton";
import { LsdExportButton } from "./LsdExportButton";
import { formatMoney0, cleanPeriodo } from "@/lib/format";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import Link from "next/link";
import { Suspense } from "react";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { pool } from "@/lib/db";
import { FileCheck, Clock, ShieldCheck, Wallet, CalendarDays, TrendingUp, UserMinus, Scale, ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="p-6 w-full">
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
  const hasConfirmedLiqs = liquidaciones.some((l) => l.estado === "confirmada");

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
  const confirmadas = liquidaciones.filter((l) => l.estado === "confirmada").length;
  const borradores = liquidaciones.filter((l) => l.estado === "borrador").length;

  return (
    <div className="p-6 w-full">
      <Suspense><ActionFeedback /></Suspense>

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/sueldos" className="hover:underline text-brand-600">Sueldos</a>
          {" / "}
          <span>Liquidaciones</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Liquidaciones</h1>
        <p className="text-gray-500 text-sm mt-1">Período: {periodoLabel}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Generadas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{liquidaciones.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Confirmadas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{confirmadas}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-4 h-4 text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Borradores</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{borradores}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total neto</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatMoney0(totalNeto)}</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — tabla (2/3) */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-gray-800 text-base">Recibos del período</h3>
                <p className="text-xs text-gray-500 mt-0.5">{periodoLabel}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tipo === "mensual" ? (
                  <>
                    <a href={`?periodo=${prevMes}&tipo=mensual`} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" />Anterior
                    </a>
                    <a href={`?periodo=${nextMes}&tipo=mensual`} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
                      Siguiente<ChevronRight className="w-3.5 h-3.5" />
                    </a>
                    <a href={`?periodo=${sac1Periodo}&tipo=sac_1`} className="btn-secondary py-1.5 text-xs text-indigo-700 border-indigo-300">SAC 1°</a>
                    <a href={`?periodo=${sac2Periodo}&tipo=sac_2`} className="btn-secondary py-1.5 text-xs text-indigo-700 border-indigo-300">SAC 2°</a>
                  </>
                ) : (
                  <>
                    <a href={`?periodo=${sac1Periodo}&tipo=sac_1`} className={`btn-secondary py-1.5 text-xs ${tipo === "sac_1" ? "font-semibold" : ""}`}>SAC 1° {sacYear}</a>
                    <a href={`?periodo=${sac2Periodo}&tipo=sac_2`} className={`btn-secondary py-1.5 text-xs ${tipo === "sac_2" ? "font-semibold" : ""}`}>SAC 2° {sacYear}</a>
                    <a href="/sueldos/sac" className="btn-primary py-1.5 text-xs">Liquidar SAC →</a>
                    <a href={`?periodo=${periodo}&tipo=mensual`} className="btn-secondary py-1.5 text-xs">← Mensual</a>
                  </>
                )}
                <RecalcularButton periodo={periodo} tipo={tipo} />
              </div>
            </div>

            {liquidaciones.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                <p className="mb-2">No hay liquidaciones para este período.</p>
                {tipo === "mensual"
                  ? <p className="text-xs text-gray-400">Cargá las novedades del mes y hacé clic en "Recalcular todo".</p>
                  : <p className="text-xs text-gray-400">Usá "Liquidar SAC" y luego recalculá.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Función</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Bruto</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Desc.</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Neto</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {liquidaciones.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-gray-900">{l.empleado_nombre}</td>
                        <td className="px-3 py-2.5 text-gray-500">{l.funcion}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-gray-700">{formatMoney0(Number(l.remuneracion_bruta))}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-red-500">-{formatMoney0(Number(l.total_descuentos_empleado))}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900">{formatMoney0(Number(l.neto_a_pagar))}</td>
                        <td className="px-3 py-2.5"><EstadoBadge estado={l.estado} /></td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-3">
                            <a href={`/sueldos/liquidaciones/${l.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Ver recibo</a>
                            {l.estado === "borrador" && (
                              <ConfirmarLiquidacionButton id={l.id} periodo={periodo} tipo={tipo} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right — acciones (1/3) */}
        <div className="space-y-4">
          {/* Acciones */}
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acciones de liquidación</p>
            </div>
            <div className="divide-y divide-gray-50">
              <Link href="/sueldos/novedades" className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Novedades del mes</p>
                  <p className="text-xs text-gray-500">Horas extras, licencias, mensualidades</p>
                </div>
              </Link>
              <Link href="/sueldos/sac" className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Liquidar SAC (Aguinaldo)</p>
                  <p className="text-xs text-gray-500">Cálculo de 1° o 2° semestre</p>
                </div>
              </Link>
              <Link href="/sueldos/liquidaciones/historia" className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <FileCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Histórico por empleado</p>
                  <p className="text-xs text-gray-500">Ver recibos anteriores de cada persona</p>
                </div>
              </Link>
              <Link href="/sueldos/despido" className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <UserMinus className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Egreso o Despido</p>
                  <p className="text-xs text-gray-500">Liquidación final e indemnización</p>
                </div>
              </Link>
              <LsdExportButton
                periodo={periodo}
                tipo={tipo}
                hasConfirmedLiqs={hasConfirmedLiqs}
              />
            </div>
          </div>

          {/* Escalas SUTERH */}
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Escalas SUTERH
              </p>
            </div>
            <div className="px-5 py-4">
              <Link href="/sueldos/escalas" className="btn-secondary text-xs w-full text-center block">
                Ver escalas vigentes
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

