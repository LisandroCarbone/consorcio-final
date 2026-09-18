"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight, AlertTriangle, UserPlus } from "lucide-react";
import { formatCuit } from "@/lib/format";
import { confirmBaja, extendSuplencia } from "./actions";

export interface EmpleadoAnteriorRow {
  id: number;
  cuil: string;
  nombre: string;
  funcion: string;
  jornada: string;
  estado: "inactivo" | "pendiente_revision";
  fecha_egreso: string | null;
}

const TIPOS_EGRESO = [
  { value: "despido_sin_causa", label: "Despido sin causa" },
  { value: "despido_con_causa", label: "Despido con causa" },
  { value: "renuncia", label: "Renuncia" },
  { value: "mutuo_acuerdo", label: "Mutuo acuerdo" },
  { value: "muerte", label: "Fallecimiento" },
  { value: "jubilacion", label: "Jubilación" },
];

export function EmpleadosAnterioresClient({ empleados }: { empleados: EmpleadoAnteriorRow[] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"todos" | "inactivo" | "pendiente_revision">("todos");
  const [actionRowId, setActionRowId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"baja" | "extender" | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const pendientesCount = empleados.filter((e) => e.estado === "pendiente_revision").length;

  const visibles = empleados.filter((e) => filter === "todos" || e.estado === filter);

  function closeAction() {
    setActionRowId(null);
    setActionType(null);
  }

  function handleConfirmBaja(formData: FormData) {
    const empleadoId = Number(formData.get("empleado_id"));
    const fechaEgreso = formData.get("fecha_egreso") as string;
    const tipoEgreso = formData.get("tipo_egreso") as string;
    startTransition(async () => {
      await confirmBaja(empleadoId, fechaEgreso, tipoEgreso);
      closeAction();
      router.refresh();
    });
  }

  function handleExtender(formData: FormData) {
    const empleadoId = Number(formData.get("empleado_id"));
    const newEndDate = formData.get("fecha_fin_reemplazo") as string;
    startTransition(async () => {
      await extendSuplencia(empleadoId, newEndDate);
      closeAction();
      router.refresh();
    });
  }

  return (
    <div className="card mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <h3 className="font-semibold text-gray-800 text-base">Empleados anteriores</h3>
          <span className="text-xs text-gray-500">
            {empleados.length} empleado{empleados.length !== 1 ? "s" : ""} anterior{empleados.length !== 1 ? "es" : ""}
          </span>
          {pendientesCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {pendientesCount} pendiente{pendientesCount !== 1 ? "s" : ""} de revisión
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex gap-2 mb-4">
            {(["todos", "inactivo", "pendiente_revision"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  filter === f ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f === "todos" ? "Todos" : f === "inactivo" ? "Inactivos" : "Pendientes de revisión"}
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No hay empleados anteriores para este filtro.</p>
          ) : (
            <div className="space-y-2">
              {visibles.map((e) => (
                <div key={e.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{e.nombre}</span>
                      <span className="text-gray-400 font-mono text-xs">{formatCuit(e.cuil)}</span>
                      <span className="text-xs text-gray-500">{e.funcion}</span>
                      {e.estado === "pendiente_revision" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Pendiente de revisión
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {e.estado === "pendiente_revision" && (
                        <>
                          <button
                            type="button"
                            className="btn-secondary py-1 text-xs"
                            onClick={() => {
                              setActionRowId(e.id);
                              setActionType("extender");
                            }}
                          >
                            Extender
                          </button>
                          <button
                            type="button"
                            className="btn-secondary py-1 text-xs"
                            onClick={() => {
                              setActionRowId(e.id);
                              setActionType("baja");
                            }}
                          >
                            Confirmar baja
                          </button>
                        </>
                      )}
                      <Link
                        href={`/sueldos/empleados/nuevo?rehire_from=${e.id}`}
                        className="btn-primary py-1 text-xs flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Dar de alta nuevamente
                      </Link>
                    </div>
                  </div>

                  {actionRowId === e.id && actionType === "baja" && (
                    <form action={handleConfirmBaja} className="mt-3 flex items-end gap-2 flex-wrap bg-gray-50 p-3 rounded">
                      <input type="hidden" name="empleado_id" value={e.id} />
                      <div>
                        <label className="label">Fecha de egreso *</label>
                        <input name="fecha_egreso" type="date" required className="input" />
                      </div>
                      <div>
                        <label className="label">Tipo de egreso *</label>
                        <select name="tipo_egreso" required className="input">
                          <option value="">— seleccionar —</option>
                          {TIPOS_EGRESO.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" disabled={isPending} className="btn-primary text-xs py-2">
                        {isPending ? "Guardando..." : "Confirmar"}
                      </button>
                      <button type="button" className="btn-secondary text-xs py-2" onClick={closeAction}>
                        Cancelar
                      </button>
                    </form>
                  )}

                  {actionRowId === e.id && actionType === "extender" && (
                    <form action={handleExtender} className="mt-3 flex items-end gap-2 flex-wrap bg-gray-50 p-3 rounded">
                      <input type="hidden" name="empleado_id" value={e.id} />
                      <div>
                        <label className="label">Nueva fecha de fin de reemplazo *</label>
                        <input name="fecha_fin_reemplazo" type="date" required className="input" />
                      </div>
                      <button type="submit" disabled={isPending} className="btn-primary text-xs py-2">
                        {isPending ? "Guardando..." : "Extender"}
                      </button>
                      <button type="button" className="btn-secondary text-xs py-2" onClick={closeAction}>
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
