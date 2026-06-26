"use client";

import { useState } from "react";
import { upsertNovedades } from "../actions";

interface Props {
  empleado: {
    cuil: string;
    nombre: string;
    funcion: string;
    jornada: string;
    consorcio_nombre: string;
  };
  periodo: string;
  novedades: Record<string, number | string | null> | null;
}

export default function NovedadesForm({ empleado, periodo, novedades }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!novedades);
  const [error, setError] = useState<string | null>(null);

  const def = (key: string, fallback = 0) => Number(novedades?.[key] ?? fallback);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const n = (k: string) => Number(fd.get(k) ?? 0);
    try {
      await upsertNovedades({
        empleado_cuil: empleado.cuil,
        periodo,
        dias_trabajados_suplente: n("dias_trabajados_suplente"),
        horas_jornada: n("horas_jornada") || undefined,
        horas_extras_50: n("horas_extras_50"),
        horas_extras_100: n("horas_extras_100"),
        feriados_trabajados_hs: n("feriados_trabajados_hs"),
        suplencia_100_hs: n("suplencia_100_hs"),
        plus_vacaciones_dias: n("plus_vacaciones_dias"),
        dias_no_trabajados: n("dias_no_trabajados"),
        licencia_enfermedad: n("licencia_enfermedad"),
        adicional_voluntario: n("adicional_voluntario"),
        embargo: n("embargo"),
        anticipo: n("anticipo"),
        muerte: n("muerte"),
        observaciones: fd.get("observaciones") as string | undefined,
      });
      setSaved(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="font-semibold text-gray-900">{empleado.nombre}</p>
          <p className="text-sm text-gray-500">
            {empleado.funcion} · {empleado.consorcio_nombre}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Cargado
            </span>
          )}
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {empleado.jornada === "Suplente" && (
              <>
                <Field label="Días trabajados" name="dias_trabajados_suplente" defaultValue={def("dias_trabajados_suplente")} step="0.5" max={31} />
                <Field label="Hs por jornada (máx. 18 — Art. 7 inc. P)" name="horas_jornada" defaultValue={def("horas_jornada", 8)} step="0.5" max={18} />
              </>
            )}
            <Field label="Hs extras 50%" name="horas_extras_50" defaultValue={def("horas_extras_50")} step="0.5" max={200} />
            <Field label="Hs extras 100%" name="horas_extras_100" defaultValue={def("horas_extras_100")} step="0.5" max={200} />
            <Field label="Feriados trabajados (hs)" name="feriados_trabajados_hs" defaultValue={def("feriados_trabajados_hs")} step="0.5" max={200} />
            <Field label="Suplencia 100% (hs)" name="suplencia_100_hs" defaultValue={def("suplencia_100_hs")} step="0.5" max={200} />
            <Field label="Plus vacaciones (días)" name="plus_vacaciones_dias" defaultValue={def("plus_vacaciones_dias")} step="0.5" max={31} />
            <Field label="Días no trabajados" name="dias_no_trabajados" defaultValue={def("dias_no_trabajados")} step="0.5" max={31} />
            <Field label="Lic. enfermedad (días)" name="licencia_enfermedad" defaultValue={def("licencia_enfermedad")} step="0.5" max={31} />
            <Field label="Adicional voluntario ($)" name="adicional_voluntario" defaultValue={def("adicional_voluntario")} step="1" />
            <Field label="Embargo ($)" name="embargo" defaultValue={def("embargo")} step="1" />
            <Field label="Anticipo ($)" name="anticipo" defaultValue={def("anticipo")} step="1" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              defaultValue={(novedades?.observaciones as string) ?? ""}
              rows={2}
              className="input w-full"
              placeholder="Notas opcionales..."
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Guardando…" : "Guardar novedades"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label, name, defaultValue, step, max,
}: {
  label: string; name: string; defaultValue: number; step: string; max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        step={step}
        min="0"
        max={max}
        className="input w-full text-sm"
      />
    </div>
  );
}
