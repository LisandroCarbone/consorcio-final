import { getEmpleados } from "../actions";
import { calcularSACPreview, SACPreview } from "@/lib/liquidacion/engine";
import { formatMoney, formatEmpleadoOption } from "@/lib/format";
import { accionLiquidarSAC } from "./actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { pool } from "@/lib/db";

export default async function SACPage({
  searchParams,
}: {
  searchParams: Promise<{ empleado_cuil?: string; anio?: string; semestre?: string; liquidado?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const actionError = sp.error ? decodeURIComponent(sp.error) : null;
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const { rows: consorcios } = await pool.query(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  if (!activeCuit) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Liquidación SAC</h2>
        <ConsorcioRequerido consorcios={consorcios} seccion="el SAC" />
      </div>
    );
  }

  const allEmpleados = await getEmpleados();
  const empleados = allEmpleados.filter((e) => e.consorcio_cuit === activeCuit);

  const now = new Date();
  const anioDefault = now.getFullYear();
  const semestreDefault = now.getMonth() < 6 ? 1 : 2;

  const empleadoCuil = sp.empleado_cuil ?? null;
  const anio = sp.anio ? Number(sp.anio) : anioDefault;
  const semestreRaw = sp.semestre ? Number(sp.semestre) : semestreDefault;
  const semestre = (semestreRaw === 1 || semestreRaw === 2 ? semestreRaw : semestreDefault) as 1 | 2;

  let preview: SACPreview | null = null;
  let previewError: string | null = null;


  if (empleadoCuil) {
    try {
      preview = await calcularSACPreview(empleadoCuil, anio, semestre);
    } catch (err) {
      previewError = err instanceof Error ? err.message : "Error al calcular";
    }
  }

  const yaLiquidado = sp.liquidado === "1";

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/sueldos" className="hover:underline text-brand-600">Sueldos</a>
          {" / "}
          <span>Liquidación SAC</span>
        </p>
        <h2 className="text-2xl font-bold text-gray-900">Liquidación SAC</h2>
        <p className="text-gray-500 text-sm mt-1">
          SAC 1° semestre: mejor bruto enero–junio / 2 · SAC 2° semestre: mejor bruto julio–noviembre / 2 (pago antes del 18/12)
        </p>
      </div>

      <form method="GET" className="card p-5 mb-6 grid grid-cols-3 gap-4">
        <div>
          <label className="label">Empleado</label>
          <select name="empleado_cuil" defaultValue={empleadoCuil ?? ""} className="input" required>
            <option value="">Seleccionar...</option>
            {empleados.map((e) => (
              <option key={e.cuil} value={e.cuil}>
                {formatEmpleadoOption(e)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Semestre</label>
          <select name="semestre" defaultValue={semestre} className="input">
            <option value="1">1° semestre (ene–jun)</option>
            <option value="2">2° semestre (jul–nov)</option>
          </select>
        </div>
        <div>
          <label className="label">Año</label>
          <input name="anio" type="number" defaultValue={anio} min="2020" max="2099" className="input" />
        </div>
        <div className="col-span-3">
          <button type="submit" className="btn-primary">Cálculo estimado</button>
        </div>
      </form>

      {(previewError || actionError) && (
        <div className="card border border-red-200 bg-red-50 p-4 mb-4 text-red-700 text-sm">
          {previewError || actionError}
        </div>
      )}

      {yaLiquidado && (
        <div className="card border border-green-200 bg-green-50 p-4 mb-4 text-green-700 text-sm flex items-center justify-between gap-4">
          <span>SAC liquidado correctamente.</span>
          <a
            href={`/sueldos/liquidaciones?periodo=${anio}-${semestre === 1 ? "06" : "12"}-01&tipo=sac_${semestre}`}
            className="btn-primary text-xs whitespace-nowrap"
          >
            Ver SAC {semestre}° en liquidaciones →
          </a>
        </div>
      )}

      {preview && !yaLiquidado && (
        <>
          <div className="card p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">
              {preview.empleadoNombre} — SAC {semestre}° {anio}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Mejor bruto semestral: <strong>{formatMoney(preview.mejorBruto)}</strong>
              {preview.mesesTrabajados < preview.mesesTotales && (
                <span className="ml-2 text-amber-600">
                  (proporcional: {preview.mesesTrabajados}/{preview.mesesTotales} meses)
                </span>
              )}
            </p>

            <table className="w-full text-sm mb-4">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-600">SAC bruto</td>
                  <td className="py-1.5 text-right font-mono font-semibold">{formatMoney(preview.sacBase)}</td>
                </tr>
                {preview.bonificacionSAC > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-600">Bonificación SAC (20% básico categoría)</td>
                    <td className="py-1.5 text-right font-mono font-semibold">{formatMoney(preview.bonificacionSAC)}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-500 pl-4">Jubilación (11%)</td>
                  <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.jubilacion)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-500 pl-4">PAMI (3%)</td>
                  <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.pami)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-500 pl-4">Obra Social (3%)</td>
                  <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.obraSocial)}</td>
                </tr>
                {preview.suterh > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-500 pl-4">SUTERH (2%)</td>
                    <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.suterh)}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-500 pl-4">Caja Protección Familiar (1%)</td>
                  <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.cajaProtFlia)}</td>
                </tr>
                {preview.fateryh > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-500 pl-4">FATERYH (1%)</td>
                    <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.fateryh)}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-500 pl-4">Seguro Vitalicio (0.75%)</td>
                  <td className="py-1.5 text-right font-mono text-red-600">- {formatMoney(preview.seguroVital)}</td>
                </tr>
                <tr className="border-t-2 border-gray-300">
                  <td className="py-2 font-bold text-gray-900">Neto a pagar</td>
                  <td className="py-2 text-right font-mono font-bold text-lg text-green-700">
                    {formatMoney(preview.netoAPagar)}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs text-gray-400">
              Contribuciones patronales estimadas: {formatMoney(preview.totalPatronal)}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <form action={accionLiquidarSAC}>
              <input type="hidden" name="empleado_cuil" value={empleadoCuil!} />
              <input type="hidden" name="anio" value={anio} />
              <input type="hidden" name="semestre" value={semestre} />
              <button type="submit" className="btn-primary">
                Confirmar y guardar liquidación SAC
              </button>
            </form>
            <a
              href={`/sueldos/liquidaciones?periodo=${anio}-${semestre === 1 ? "06" : "12"}-01&tipo=sac_${semestre}`}
              className="btn-secondary text-sm"
            >
              Ver SAC en liquidaciones →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
