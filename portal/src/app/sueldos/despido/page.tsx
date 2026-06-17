export const dynamic = "force-dynamic";

import { getEmpleados } from "../actions";
import { calcularIndemnizacionPreview, IndemnizacionPreview } from "@/lib/liquidacion/engine";
import { formatMoney, formatEmpleadoOption } from "@/lib/format";
import { accionLiquidarDespido } from "./actions";

const TIPOS_EGRESO = [
  { value: "despido_sin_causa", label: "Despido sin causa" },
  { value: "despido_con_causa", label: "Despido con causa justificada" },
  { value: "renuncia", label: "Renuncia voluntaria" },
  { value: "mutuo_acuerdo", label: "Mutuo acuerdo (LCT 241)" },
  { value: "muerte", label: "Fallecimiento" },
  { value: "jubilacion", label: "Jubilación" },
];

export default async function DespidoPage({
  searchParams,
}: {
  searchParams: Promise<{
    empleado_id?: string;
    fecha_egreso?: string;
    tipo_egreso?: string;
    liquidado?: string;
  }>;
}) {
  const sp = await searchParams;
  const empleados = await getEmpleados();

  const empleadoId = sp.empleado_id ? Number(sp.empleado_id) : null;
  const fechaEgreso = sp.fecha_egreso ?? new Date().toISOString().slice(0, 10);
  const tipoEgreso = sp.tipo_egreso ?? "despido_sin_causa";

  let preview: IndemnizacionPreview | null = null;
  let previewError: string | null = null;

  if (empleadoId && sp.fecha_egreso && sp.tipo_egreso) {
    try {
      preview = await calcularIndemnizacionPreview(empleadoId, fechaEgreso, tipoEgreso);
    } catch (err) {
      previewError = err instanceof Error ? err.message : "Error al calcular";
    }
  }

  const yaLiquidado = sp.liquidado === "1";

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liquidación por Egreso</h2>
        <p className="text-gray-500 text-sm mt-1">
          Indemnización, preaviso, SAC proporcional y vacaciones proporcionales
        </p>
      </div>

      <form method="GET" className="card p-5 mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="label">Empleado</label>
          <select name="empleado_id" defaultValue={empleadoId ?? ""} className="input" required>
            <option value="">Seleccionar...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {formatEmpleadoOption(e)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tipo de egreso</label>
          <select name="tipo_egreso" defaultValue={tipoEgreso} className="input">
            {TIPOS_EGRESO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fecha de egreso</label>
          <input
            name="fecha_egreso"
            type="date"
            defaultValue={fechaEgreso}
            className="input"
            required
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">Calcular</button>
        </div>
      </form>

      {previewError && (
        <div className="card border border-red-200 bg-red-50 p-4 mb-4 text-red-700 text-sm">
          {previewError}
        </div>
      )}

      {yaLiquidado && (
        <div className="card border border-green-200 bg-green-50 p-4 mb-4 text-green-700 text-sm">
          Liquidación por egreso guardada. El empleado fue marcado como inactivo.
        </div>
      )}

      {preview && !yaLiquidado && (
        <>
          <div className="card p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">
              {preview.empleadoNombre}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Antigüedad: <strong>{preview.aniosServicio} año/s</strong> ·
              Mejor bruto últimos 6 meses: <strong>{formatMoney(preview.mejorBruto)}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Tipo: <strong>{TIPOS_EGRESO.find((t) => t.value === tipoEgreso)?.label}</strong>
            </p>

            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">Concepto</th>
                  <th className="th text-right">Importe</th>
                  <th className="th text-center text-xs">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {preview.conceptos.map((c) => (
                  <tr key={c.label} className="border-b border-gray-50">
                    <td className="td text-gray-700">{c.label}</td>
                    <td className="td text-right font-mono">{formatMoney(c.importe)}</td>
                    <td className="td text-center">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${c.remunerativo ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {c.remunerativo ? "Rem." : "No Rem."}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-blue-50 rounded p-3">
                <p className="text-xs text-blue-600 mb-1">Total Remunerativo</p>
                <p className="font-mono font-semibold">{formatMoney(preview.totalRemunerativo)}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600 mb-1">Total No Remunerativo</p>
                <p className="font-mono font-semibold">{formatMoney(preview.totalNoRemunerativo)}</p>
              </div>
            </div>

            {preview.descuentosSobreRem.total > 0 && (
              <div className="text-sm mb-3 text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Descuentos s/remunerativo:</p>
                <div className="pl-3 space-y-0.5">
                  {preview.descuentosSobreRem.jubilacion > 0 && <p>Jubilación: - {formatMoney(preview.descuentosSobreRem.jubilacion)}</p>}
                  {preview.descuentosSobreRem.pami > 0 && <p>PAMI: - {formatMoney(preview.descuentosSobreRem.pami)}</p>}
                  {preview.descuentosSobreRem.obraSocial > 0 && <p>Obra Social: - {formatMoney(preview.descuentosSobreRem.obraSocial)}</p>}
                  {preview.descuentosSobreRem.suterh > 0 && <p>SUTERH: - {formatMoney(preview.descuentosSobreRem.suterh)}</p>}
                  {preview.descuentosSobreRem.cajaProtFlia > 0 && <p>CPF: - {formatMoney(preview.descuentosSobreRem.cajaProtFlia)}</p>}
                  {preview.descuentosSobreRem.fateryh > 0 && <p>FATERYH: - {formatMoney(preview.descuentosSobreRem.fateryh)}</p>}
                  {preview.descuentosSobreRem.seguroVital > 0 && <p>Seguro Vitalicio: - {formatMoney(preview.descuentosSobreRem.seguroVital)}</p>}
                </div>
              </div>
            )}

            <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">TOTAL NETO A PAGAR</span>
              <span className="font-mono font-bold text-xl text-green-700">{formatMoney(preview.netoAPagar)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Contribuciones patronales estimadas: {formatMoney(preview.totalPatronal)}
            </p>
          </div>

          <div className="card border border-amber-200 bg-amber-50 p-4 mb-4 text-amber-800 text-sm">
            <strong>Atención:</strong> Al confirmar, el empleado será marcado como <strong>inactivo</strong> con fecha de egreso {fechaEgreso}.
          </div>

          <form action={accionLiquidarDespido}>
            <input type="hidden" name="empleado_id" value={empleadoId!} />
            <input type="hidden" name="fecha_egreso" value={fechaEgreso} />
            <input type="hidden" name="tipo_egreso" value={tipoEgreso} />
            <button type="submit" className="btn-primary">
              Confirmar liquidación por egreso
            </button>
          </form>
        </>
      )}
    </div>
  );
}
