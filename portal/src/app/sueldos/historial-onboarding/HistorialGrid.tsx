"use client";

import { useState } from "react";
import {
  guardarHistorial,
  actualizarHistorial,
  eliminarHistorial,
  type HistorialEntry,
  type HistorialMonthRow,
} from "./actions";

interface Props {
  empleadoId: number;
  meses: HistorialMonthRow[];
}

interface RowState {
  bruto: string;
  he50: string;
  he100: string;
  feriado: string;
}

function monthLabel(periodo: string) {
  const [y, m] = periodo.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  const label = d.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function HistorialGrid({ empleadoId, meses }: Props) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      meses.map((m) => [
        m.periodo,
        {
          bruto: m.remuneracion_bruta != null ? String(m.remuneracion_bruta) : "",
          he50: m.he_50 != null ? String(m.he_50) : "",
          he100: m.he_100 != null ? String(m.he_100) : "",
          feriado: m.he_feriado != null ? String(m.he_feriado) : "",
        },
      ])
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateRow(periodo: string, field: keyof RowState, value: string) {
    setRows((prev) => ({ ...prev, [periodo]: { ...prev[periodo], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const entries: HistorialEntry[] = meses
        .filter((m) => !m.liquidacion_id) // only new (empty) rows go through create
        .map((m) => {
          const r = rows[m.periodo];
          return {
            empleado_id: empleadoId,
            periodo: m.periodo,
            remuneracion_bruta: Number(r.bruto) || 0,
            he_50: Number(r.he50) || undefined,
            he_100: Number(r.he100) || undefined,
            he_feriado: Number(r.feriado) || undefined,
          };
        })
        .filter((e) => e.remuneracion_bruta > 0);

      if (entries.length === 0) {
        setError("No hay filas nuevas para guardar.");
        return;
      }

      const result = await guardarHistorial(entries);
      if (result.errors.length > 0) {
        setError(result.errors.join(" · "));
      }
      if (result.ok > 0) {
        setMessage(`${result.ok} mes${result.ok > 1 ? "es" : ""} guardado${result.ok > 1 ? "s" : ""}. Recargá la página para ver los cambios.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(m: HistorialMonthRow) {
    if (!m.liquidacion_id) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const r = rows[m.periodo];
      const res = await actualizarHistorial(m.liquidacion_id, {
        empleado_id: empleadoId,
        remuneracion_bruta: Number(r.bruto) || 0,
        he_50: Number(r.he50) || undefined,
        he_100: Number(r.he100) || undefined,
        he_feriado: Number(r.feriado) || undefined,
      });
      if (res.error === "locked-historical-data") {
        setError("No se puede editar: ya existe una liquidación real para este empleado.");
      } else if (res.error) {
        setError(res.error);
      } else {
        setMessage("Mes actualizado. Recargá la página para ver los cambios.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m: HistorialMonthRow) {
    if (!m.liquidacion_id) return;
    if (!confirm(`¿Eliminar el mes histórico ${monthLabel(m.periodo)}?`)) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await eliminarHistorial(m.liquidacion_id);
      if (res.error === "locked-historical-data") {
        setError("No se puede eliminar: ya existe una liquidación real para este empleado.");
      } else if (res.error) {
        setError(res.error);
      } else {
        setMessage("Mes eliminado. Recargá la página para ver los cambios.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  const hasNewRows = meses.some((m) => !m.liquidacion_id);

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-gray-400 text-xs uppercase tracking-wide">
            <th className="px-4 py-2 text-left">Período</th>
            <th className="px-3 py-2 text-right">Bruto *</th>
            <th className="px-3 py-2 text-right">HE 50%</th>
            <th className="px-3 py-2 text-right">HE 100%</th>
            <th className="px-3 py-2 text-right">Feriados</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {meses.map((m) => {
            const r = rows[m.periodo];
            const isNew = !m.liquidacion_id;
            const readOnly = !isNew && m.locked;
            return (
              <tr key={m.periodo} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium text-gray-800">{monthLabel(m.periodo)}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={readOnly}
                    value={r.bruto}
                    onChange={(e) => updateRow(m.periodo, "bruto", e.target.value)}
                    className="input w-28 text-right disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={readOnly}
                    value={r.he50}
                    onChange={(e) => updateRow(m.periodo, "he50", e.target.value)}
                    className="input w-24 text-right disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={readOnly}
                    value={r.he100}
                    onChange={(e) => updateRow(m.periodo, "he100", e.target.value)}
                    className="input w-24 text-right disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={readOnly}
                    value={r.feriado}
                    onChange={(e) => updateRow(m.periodo, "feriado", e.target.value)}
                    className="input w-24 text-right disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
                <td className="px-3 py-2">
                  {m.origen === "manual" ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      Histórico{m.locked ? " · bloqueado" : ""}
                    </span>
                  ) : m.origen === "sistema" ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Real</span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin datos</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {!isNew && !readOnly && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleUpdate(m)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleDelete(m)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {error && <p className="px-4 py-2 text-sm text-red-600">{error}</p>}
      {message && <p className="px-4 py-2 text-sm text-green-600">{message}</p>}

      {hasNewRows && (
        <div className="px-4 py-3 flex justify-end border-t">
          <button type="button" disabled={saving} onClick={handleSave} className="btn-primary">
            {saving ? "Guardando…" : "Guardar meses nuevos"}
          </button>
        </div>
      )}
    </div>
  );
}
