"use client";

import { useMemo, useState } from "react";
import { formatMoney, formatDate } from "@/lib/format";
import {
  uploadExtracto,
  runAutoMatch,
  confirmarMatch,
  rechazarMatch,
  asignarManual,
  aplicarConciliacion,
  eliminarExtracto,
} from "./actions";

type Extracto = {
  id: number;
  consorcio_cuit: string;
  periodo_id: number;
  anio: number;
  mes: number;
  archivo_nombre: string;
  corte_label: string | null;
  fecha_carga: string;
  estado: string;
  total_creditos: string;
  total_debitos: string;
  movimientos_count: number;
  matcheados_count: number;
};

type Movimiento = {
  id: number;
  extracto_id: number;
  fecha: string;
  descripcion: string;
  referencia: string | null;
  monto: string;
  es_credito: boolean;
  cbu_origen: string | null;
  cuit_origen: string | null;
  nombre_origen: string | null;
  match_tipo: string | null;
  match_id: number | null;
  match_confianza: string | null;
  estado_match: string;
  comprobante_ref: string | null;
};

type Unidad = { id: number; uf: string; uf_numero: number | null; propietario: string | null };
type Gasto = { id: number; descripcion: string; monto: string };

type Filter = "all" | "creditos" | "debitos" | "matcheados" | "sin_match" | "confirmados";

export function ExtractoBancarioClient({
  consorcioCuit,
  periodoId,
  anio,
  mes,
  extractos,
  movimientos,
  unidades,
  gastos,
}: {
  consorcioCuit: string;
  periodoId: number | null;
  anio: number;
  mes: number;
  extractos: Extracto[];
  movimientos: Movimiento[];
  unidades: Unidad[];
  gastos: Gasto[];
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [corteLabel, setCorteLabel] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [assignOpenFor, setAssignOpenFor] = useState<number | null>(null);

  const unidadMap = useMemo(() => {
    const m = new Map<number, Unidad>();
    for (const u of unidades) m.set(u.id, u);
    return m;
  }, [unidades]);
  const gastoMap = useMemo(() => {
    const m = new Map<number, Gasto>();
    for (const g of gastos) m.set(g.id, g);
    return m;
  }, [gastos]);

  const totalCreditos = extractos.reduce((s, e) => s + Number(e.total_creditos), 0);
  const totalDebitos = extractos.reduce((s, e) => s + Number(e.total_debitos), 0);
  const totalMovimientos = extractos.reduce((s, e) => s + e.movimientos_count, 0);
  const totalMatcheados = extractos.reduce((s, e) => s + e.matcheados_count, 0);
  const estadoGeneral = extractos.length === 0
    ? "sin_extractos"
    : extractos.every((e) => e.estado === "aplicado")
    ? "aplicado"
    : totalMatcheados > 0
    ? "parcial"
    : "pendiente";

  const filteredMovimientos = movimientos.filter((m) => {
    switch (filter) {
      case "creditos":
        return m.es_credito;
      case "debitos":
        return !m.es_credito;
      case "matcheados":
        return m.match_tipo !== null;
      case "sin_match":
        return m.match_tipo === null;
      case "confirmados":
        return m.estado_match === "confirmado";
      default:
        return true;
    }
  });

  const confirmedCobranzas = movimientos.filter(
    (m) => m.estado_match === "confirmado" && m.match_tipo === "cobranza" && m.es_credito
  );
  const confirmedTotal = confirmedCobranzas.reduce((s, m) => s + Number(m.monto), 0);

  async function handleUpload(formData: FormData) {
    if (!periodoId) return;
    setUploadError(null);
    setIsUploading(true);
    formData.set("consorcio_cuit", consorcioCuit);
    formData.set("periodo_id", String(periodoId));
    formData.set("anio", String(anio));
    formData.set("mes", String(mes));
    formData.set("corte_label", corteLabel);
    try {
      await uploadExtracto(formData);
      window.location.reload();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir el extracto.");
      setIsUploading(false);
    }
  }

  async function withPending(id: number, fn: () => Promise<void>) {
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await fn();
      window.location.reload();
    } catch (e) {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert("Error al procesar la operación");
    }
  }

  function confianzaColor(conf: string | null): string {
    const n = conf ? Number(conf) : 0;
    if (n > 0.85) return "text-green-600 bg-green-50";
    if (n > 0.7) return "text-yellow-700 bg-yellow-50";
    return "text-red-600 bg-red-50";
  }

  function matchLabel(m: Movimiento): string {
    if (!m.match_tipo || !m.match_id) return "—";
    if (m.match_tipo === "cobranza") {
      const u = unidadMap.get(m.match_id);
      if (!u) return `UF ${m.match_id}`;
      return `UF ${u.uf_numero ?? u.uf}${u.propietario ? ` - ${u.propietario}` : ""}`;
    }
    const g = gastoMap.get(m.match_id);
    return `Gasto: ${g ? g.descripcion : m.match_id}`;
  }

  if (!periodoId) {
    return (
      <div className="card p-12 text-center">
        <p className="text-3xl mb-2">🏦</p>
        <h4 className="font-semibold text-gray-800 mb-1">Período no inicializado</h4>
        <p className="text-gray-500 text-sm">
          Cree primero el período de expensas correspondiente desde la sección Expensas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Cargar extracto bancario</h3>
        <form
          action={handleUpload}
          className="flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1">
            <label className="label">Archivo (CSV)</label>
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="input"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Formato soportado: CSV (separado por coma o punto y coma).
            </p>
          </div>
          <div className="w-full sm:w-56">
            <label className="label">Corte (opcional)</label>
            <input
              type="text"
              className="input"
              placeholder='Ej: "Parcial 15/06", "Cierre"'
              value={corteLabel}
              onChange={(e) => setCorteLabel(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isUploading} className="btn-primary disabled:opacity-60">
            {isUploading ? "Subiendo..." : "Subir extracto"}
          </button>
        </form>
        {uploadError && (
          <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-200 rounded px-3 py-2">
            {uploadError}
          </p>
        )}
      </div>

      {extractos.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Créditos</p>
              <p className="text-lg font-bold text-green-600">{formatMoney(totalCreditos)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Débitos</p>
              <p className="text-lg font-bold text-red-600">{formatMoney(totalDebitos)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500 mb-1">Matcheados</p>
              <p className="text-sm font-semibold text-gray-800">
                {totalMatcheados} / {totalMovimientos}
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-brand-600 h-1.5 rounded-full"
                  style={{
                    width: `${totalMovimientos > 0 ? Math.round((totalMatcheados / totalMovimientos) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Estado</p>
              <span
                className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  estadoGeneral === "aplicado"
                    ? "bg-green-100 text-green-700"
                    : estadoGeneral === "parcial"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {estadoGeneral === "aplicado"
                  ? "Aplicado"
                  : estadoGeneral === "parcial"
                  ? "Parcial"
                  : "Pendiente"}
              </span>
            </div>
          </div>

          {/* Extractos list */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">Extractos cargados</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {extractos.map((e) => (
                <li key={e.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">
                      {e.archivo_nombre} {e.corte_label && <span className="text-gray-400">· {e.corte_label}</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      Cargado {formatDate(e.fecha_carga)} · {e.movimientos_count} movimientos · {e.matcheados_count} confirmados
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => withPending(e.id, () => runAutoMatch(e.id))}
                    >
                      🔁 Re-matchear
                    </button>
                    {e.estado !== "aplicado" && (
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => {
                          if (confirm("¿Eliminar este extracto y todos sus movimientos?")) {
                            withPending(e.id, () => eliminarExtracto(e.id));
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["creditos", "Créditos"],
                ["debitos", "Débitos"],
                ["matcheados", "Matcheados"],
                ["sin_match", "Sin match"],
                ["confirmados", "Confirmados"],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Movimientos table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Descripción</th>
                    <th className="px-4 py-2 text-left">Referencia</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Match</th>
                    <th className="px-4 py-2 text-left">Confianza</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMovimientos.map((m) => {
                    const isPending = pendingIds.has(m.id);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatDate(m.fecha)}</td>
                        <td className="px-4 py-2 max-w-xs truncate" title={m.descripcion}>
                          {m.descripcion}
                        </td>
                        <td className="px-4 py-2 text-gray-500">{m.referencia || "—"}</td>
                        <td
                          className={`px-4 py-2 text-right font-mono font-semibold ${
                            m.es_credito ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {m.es_credito ? "+" : "-"}
                          {formatMoney(m.monto)}
                        </td>
                        <td className="px-4 py-2">
                          {m.match_tipo === "cobranza" ? (
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                              Cobranza
                            </span>
                          ) : m.match_tipo === "gasto" ? (
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                              Gasto
                            </span>
                          ) : (
                            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">?</span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-2 max-w-[220px] truncate ${
                            m.match_tipo ? confianzaColor(m.match_confianza) : "text-gray-400"
                          } rounded`}
                        >
                          {m.match_tipo ? matchLabel(m) : "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {m.match_confianza ? `${Math.round(Number(m.match_confianza) * 100)}%` : "—"}
                        </td>
                        <td className="px-4 py-2">
                          {m.estado_match === "confirmado" ? (
                            <span className="text-green-600 text-xs font-medium">✓ Confirmado</span>
                          ) : (
                            <div className="flex items-center gap-2 relative">
                              {m.match_tipo && (
                                <button
                                  type="button"
                                  disabled={isPending}
                                  className="text-green-600 hover:text-green-800 text-xs"
                                  title="Confirmar"
                                  onClick={() => withPending(m.id, () => confirmarMatch(m.id))}
                                >
                                  ✅
                                </button>
                              )}
                              {m.match_tipo && (
                                <button
                                  type="button"
                                  disabled={isPending}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  title="Rechazar"
                                  onClick={() => withPending(m.id, () => rechazarMatch(m.id))}
                                >
                                  ❌
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isPending}
                                className="text-gray-500 hover:text-gray-700 text-xs"
                                title="Asignar manualmente"
                                onClick={() => setAssignOpenFor(assignOpenFor === m.id ? null : m.id)}
                              >
                                📝
                              </button>
                              {assignOpenFor === m.id && (
                                <div className="absolute z-10 top-6 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-56 max-h-64 overflow-y-auto">
                                  {m.es_credito ? (
                                    <>
                                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 px-1">
                                        Asignar a unidad
                                      </p>
                                      {unidades.map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                                          onClick={() => {
                                            setAssignOpenFor(null);
                                            withPending(m.id, () => asignarManual(m.id, "cobranza", u.id));
                                          }}
                                        >
                                          UF {u.uf_numero ?? u.uf} {u.propietario ? `- ${u.propietario}` : ""}
                                        </button>
                                      ))}
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 px-1">
                                        Asignar a gasto
                                      </p>
                                      {gastos.map((g) => (
                                        <button
                                          key={g.id}
                                          type="button"
                                          className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                                          onClick={() => {
                                            setAssignOpenFor(null);
                                            withPending(m.id, () => asignarManual(m.id, "gasto", g.id));
                                          }}
                                        >
                                          {g.descripcion} ({formatMoney(g.monto)})
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMovimientos.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                        No hay movimientos para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {confirmedCobranzas.length} cobranza{confirmedCobranzas.length !== 1 ? "s" : ""} por{" "}
              <strong>{formatMoney(confirmedTotal)}</strong> serán registradas.
            </p>
            <button
              type="button"
              disabled={confirmedCobranzas.length === 0 || isApplying}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                if (!confirm(`¿Aplicar conciliación? Se registrarán ${confirmedCobranzas.length} pagos.`)) return;
                const extractoIds = Array.from(new Set(confirmedCobranzas.map((m) => m.extracto_id)));
                setIsApplying(true);
                try {
                  for (const id of extractoIds) {
                    await aplicarConciliacion(id);
                  }
                  window.location.reload();
                } catch (e) {
                  alert("Error al aplicar conciliación");
                  setIsApplying(false);
                }
              }}
            >
              Aplicar Conciliación
            </button>
          </div>
        </>
      )}
    </div>
  );
}
