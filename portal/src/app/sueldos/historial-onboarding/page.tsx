export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { getEmpleados } from "../actions";
import { getHistorialEmpleado } from "./actions";
import { EmpleadoSelect } from "../liquidaciones/historia/EmpleadoSelect";
import { HistorialGrid } from "./HistorialGrid";

interface Props {
  searchParams: Promise<{ empleado_id?: string }>;
}

export default async function HistorialOnboardingPage({ searchParams }: Props) {
  const { empleado_id } = await searchParams;
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const empleados = await getEmpleados(activeCuit || undefined);

  const empleadoIdNum = empleado_id ? Number(empleado_id) : null;
  const meses = empleadoIdNum ? await getHistorialEmpleado(empleadoIdNum) : null;
  const empleado = empleadoIdNum ? empleados.find((e) => e.id === empleadoIdNum) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/sueldos" className="hover:underline text-brand-600">Sueldos</a>
          {" / "}
          <span>Onboarding de historial</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding de historial de sueldos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cargá los últimos meses de liquidación de cada empleado para que el aguinaldo (SAC)
          y el plus vacacional se calculen correctamente desde el primer período liquidado en el sistema.
        </p>
      </div>

      <form method="GET" className="card p-5 mb-6 grid grid-cols-3 gap-4 items-end">
        <div className="col-span-2">
          <label className="label">Empleado</label>
          <EmpleadoSelect empleados={empleados} value={empleado_id ?? ""} />
        </div>
        <div>
          <button type="submit" className="btn-primary w-full">Ver historial</button>
        </div>
      </form>

      {empleadoIdNum && meses && empleado && (
        <HistorialGrid empleadoId={empleadoIdNum} meses={meses} />
      )}
    </div>
  );
}
