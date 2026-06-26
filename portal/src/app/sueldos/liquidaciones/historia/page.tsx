export const dynamic = "force-dynamic";

import { pool } from "@/lib/db";
import { getEmpleados } from "../../actions";
import { formatMoney0, formatEmpleadoOption } from "@/lib/format";
import Link from "next/link";
import { EmpleadoSelect } from "./EmpleadoSelect";

interface Props {
  searchParams: Promise<{ empleado_cuil?: string; desde?: string; hasta?: string }>;
}

const TIPO_LABEL: Record<string, string> = {
  mensual: "Mensual",
  sac_1: "SAC 1°",
  sac_2: "SAC 2°",
  indemnizacion: "Indemniz.",
};

const ESTADO_CLS: Record<string, string> = {
  confirmada: "bg-green-100 text-green-700",
  borrador: "bg-yellow-100 text-yellow-700",
  anulada: "bg-red-100 text-red-700",
};

export default async function HistoriaPage({ searchParams }: Props) {
  const { empleado_cuil, desde, hasta } = await searchParams;
  const empleados = await getEmpleados();

  const now = new Date();
  const desdeDefault = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const hastaDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const toFirstOfMonth = (s: string) =>
    s.length === 7 ? `${s}-01` : s.length === 10 ? s : s;
  const desdeVal = toFirstOfMonth(desde ?? desdeDefault);
  const hastaVal = toFirstOfMonth(hasta ?? hastaDefault);

  let liquidaciones: any[] = [];
  let empleadoNombre = "";

  if (empleado_cuil) {
    try {
      const { rows } = await pool.query(
        `SELECT l.id, l.periodo::text AS periodo, l.tipo, l.estado,
                l.remuneracion_bruta, l.total_descuentos_empleado, l.neto_a_pagar,
                c.nombre AS consorcio_nombre
         FROM app.liquidaciones_sueldo l
         JOIN app.empleados e ON e.cuil = l.empleado_cuil
         JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
         WHERE l.empleado_cuil = $1
           AND l.periodo >= $2
           AND l.periodo <= $3
         ORDER BY l.periodo DESC, l.tipo`,
        [empleado_cuil, desdeVal, hastaVal]
      );
      liquidaciones = rows;
      const emp = empleados.find((e: any) => e.cuil === empleado_cuil);
      empleadoNombre = emp ? String(emp.nombre) : "";
    } catch (err) {
      console.error("[HistoriaPage] Error querying history:", err);
      liquidaciones = [];
    }
  }

  const totalNeto = liquidaciones
    .filter((l) => l.estado !== "anulada")
    .reduce((s, l) => s + Number(l.neto_a_pagar), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico por empleado</h1>
        {empleadoNombre && (
          <p className="text-gray-500 text-sm mt-1">{empleadoNombre}</p>
        )}
      </div>

      <form method="GET" className="card p-5 mb-6 grid grid-cols-4 gap-4 items-end">
        <div className="col-span-2">
          <label className="label">Empleado</label>
          <EmpleadoSelect empleados={empleados} value={empleado_cuil ?? ""} />
        </div>
        <div>
          <label className="label">Desde</label>
          <input name="desde" type="month" defaultValue={desdeVal.slice(0, 7)} className="input" />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input name="hasta" type="month" defaultValue={hastaVal.slice(0, 7)} className="input" />
        </div>
        <div className="col-span-4 flex justify-end">
          <button type="submit" className="btn-primary">Ver histórico</button>
        </div>
      </form>

      {empleado_cuil && liquidaciones.length === 0 && (
        <p className="text-center py-12 text-gray-500">
          No hay liquidaciones en el período seleccionado.
        </p>
      )}

      {liquidaciones.length > 0 && (
        <>
          <div className="card mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total neto en el período</span>
            <span className="text-xl font-bold text-gray-900">{formatMoney0(totalNeto)}</span>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left">Período</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Consorcio</th>
                  <th className="px-3 py-2 text-right">Bruto</th>
                  <th className="px-3 py-2 text-right">Desc.</th>
                  <th className="px-3 py-2 text-right">Neto</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((l) => {
                  const [y, m] = l.periodo.split("-");
                  const periodoDate = new Date(Number(y), Number(m) - 1, 1);
                  const periodoLabel = periodoDate.toLocaleDateString("es-AR", {
                    month: "short", year: "numeric"
                  });
                  return (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 capitalize">{periodoLabel}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {TIPO_LABEL[l.tipo] ?? l.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{l.consorcio_nombre}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatMoney0(Number(l.remuneracion_bruta))}</td>
                      <td className="px-3 py-3 text-right text-red-600">-{formatMoney0(Number(l.total_descuentos_empleado))}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">{formatMoney0(Number(l.neto_a_pagar))}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ESTADO_CLS[l.estado] ?? "bg-gray-100 text-gray-500"}`}>
                          {l.estado}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/sueldos/liquidaciones/${l.id}`} className="text-blue-600 hover:underline text-xs">
                          Ver recibo
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
