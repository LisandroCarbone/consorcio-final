"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatMoney, formatDate } from "@/lib/format";
import { bankChargeLabel } from "@/lib/conciliacion/categorizeBankCharge";
import {
  uploadExtracto,
  runAutoMatch,
  confirmarMatch,
  rechazarMatch,
  desconfirmarMatch,
  descartarMovimiento,
  asignarManual,
  cargarGastosBancarios,
  aplicarCreditos,
  aplicarDebitos,
  eliminarExtracto,
  type PendingDebit,
  type ReconciliacionSummary,
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
  saldo_apertura: string | null;
  saldo_cierre: string | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
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
  categoria_bancaria: string | null;
  match_group_ids: number[] | null;
};

type Unidad = { id: number; uf: string; uf_numero: number | null; propietario: string | null };
type Gasto = { id: number; descripcion: string; monto: string; periodo_label: string };

type TipoFilter = "todos" | "creditos" | "debitos";
type MatchFilter = "todos" | "matcheados" | "sin_match";
type EstadoFilter = "todos" | "confirmados" | "sin_confirmar";
type Tab = "movimientos" | "gastos_bancarios" | "pendientes" | "resumen";

export function ConciliacionClient({
  consorcioCuit,
  periodoId,
  anio,
  mes,
  extractos,
  movimientos,
  unidades,
  gastos,
  pendingDebits,
  summary,
}: {
  consorcioCuit: string;
  periodoId: number | null;
  anio: number;
  mes: number;
  extractos: Extracto[];
  movimientos: Movimiento[];
  unidades: Unidad[];
  gastos: Gasto[];
  pendingDebits: PendingDebit[];
  summary: ReconciliacionSummary | null;
}) {
  const [localMovimientos, setLocalMovimientos] = useState(movimientos);
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyingCreditos, setIsApplyingCreditos] = useState(false);
  const [isApplyingDebitos, setIsApplyingDebitos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [corteLabel, setCorteLabel] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("todos");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos");
  const [tab, setTab] = useState<Tab>("movimientos");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [assignOpenFor, setAssignOpenFor] = useState<number | null>(null);
  const assignTriggerRef = useRef<HTMLButtonElement | null>(null);

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

  const saldoApertura = extractos.length > 0 && extractos[extractos.length - 1].saldo_apertura !== null
    ? Number(extractos[extractos.length - 1].saldo_apertura)
    : null;
  const saldoCierre = extractos.length > 0 && extractos[0].saldo_cierre !== null
    ? Number(extractos[0].saldo_cierre)
    : null;

  const movimientosBancarios = localMovimientos.filter((m) => m.categoria_bancaria !== null && m.estado_match !== "descartado");

  const filteredMovimientos = localMovimientos.filter((m) => {
    if (tipoFilter === "creditos" && !m.es_credito) return false;
    if (tipoFilter === "debitos" && m.es_credito) return false;
    if (matchFilter === "matcheados" && m.match_tipo === null) return false;
    if (matchFilter === "sin_match" && m.match_tipo !== null) return false;
    if (estadoFilter === "confirmados" && m.estado_match !== "confirmado") return false;
    if (estadoFilter === "sin_confirmar" && m.estado_match === "confirmado") return false;
    return true;
  });

  const confirmedCobranzas = localMovimientos.filter(
    (m) => m.estado_match === "confirmado" && m.match_tipo === "cobranza" && m.es_credito
  );
  const confirmedTotal = confirmedCobranzas.reduce((s, m) => s + Number(m.monto), 0);

  const confirmedDebitos = localMovimientos.filter(
    (m) =>
      m.estado_match === "confirmado" &&
      !m.es_credito &&
      (m.categoria_bancaria !== null || m.match_tipo === "gasto")
  );

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

  async function withPending(id: number, fn: () => Promise<void>, updater?: (m: Movimiento) => Movimiento) {
    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await fn();
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (updater) {
        setLocalMovimientos((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
      }
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
    if (m.categoria_bancaria) return `Gasto Bancario: ${bankChargeLabel(m.categoria_bancaria)}`;
    if (!m.match_tipo || !m.match_id) return "—";
    if (m.match_tipo === "cobranza") {
      const u = unidadMap.get(m.match_id);
      if (!u) return `UF ${m.match_id}`;
      return `UF ${u.uf_numero ?? u.uf}${u.propietario ? ` - ${u.propietario}` : ""}`;
    }
    if (m.match_group_ids && m.match_group_ids.length > 1) {
      const labels = m.match_group_ids
        .map((id) => gastoMap.get(id)?.descripcion ?? `#${id}`)
        .join(" + ");
      return `Gastos: ${labels}`;
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
            <label className="label">Archivo (CSV, XLS, XLSX)</label>
            <input
              type="file"
              name="file"
              accept=".csv,.xls,.xlsx"
              required
              className="input"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Formato soportado: CSV, XLS o XLSX.
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
          {/* Summary bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="card p-4">
              <p className="text-xs text-gray-500">Saldo Inicial</p>
              <p className="text-sm font-bold text-gray-800">{saldoApertura !== null ? formatMoney(saldoApertura) : "—"}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Créditos</p>
              <p className="text-sm font-bold text-green-600">{formatMoney(totalCreditos)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Total Débitos</p>
              <p className="text-sm font-bold text-red-600">{formatMoney(totalDebitos)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-500">Saldo Final</p>
              <p className="text-sm font-bold text-gray-800">{saldoCierre !== null ? formatMoney(saldoCierre) : "—"}</p>
            </div>
            <div className="card p-4 group relative">
              <p className="text-xs text-gray-500">Gastos Bancarios</p>
              <p className="text-sm font-bold text-orange-600">
                {summary ? formatMoney(summary.gastosBancarios) : "—"}
              </p>
              {summary && summary.gastosBancarios > 0 && (
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-orange-600/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    if (!periodoId || !confirm("¿Cargar gastos bancarios en expensas del período?")) return;
                    await cargarGastosBancarios(periodoId);
                    alert("Gastos bancarios cargados en expensas");
                  }}
                >
                  Cargar en Expensas
                </button>
              )}
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
                      {e.fecha_desde && e.fecha_hasta && (
                        <> · Período {formatDate(e.fecha_desde)} a {formatDate(e.fecha_hasta)}</>
                      )}
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

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {(
              [
                ["movimientos", "Movimientos"],
                ["gastos_bancarios", `Gastos Bancarios (${movimientosBancarios.length})`],
                ["pendientes", `Pendientes de Débito (${pendingDebits.length})`],
                ["resumen", "Resumen Conciliación"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === key
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "movimientos" && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {([["todos", "Todos"], ["creditos", "Créditos"], ["debitos", "Débitos"]] as [TipoFilter, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setTipoFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tipoFilter === key ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
                <span className="w-px h-5 bg-gray-300" />
                {([["todos", "Todos"], ["matcheados", "Matcheados"], ["sin_match", "Sin match"]] as [MatchFilter, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setMatchFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${matchFilter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
                <span className="w-px h-5 bg-gray-300" />
                {([["todos", "Todos"], ["confirmados", "Confirmados"], ["sin_confirmar", "Sin confirmar"]] as [EstadoFilter, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setEstadoFilter(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${estadoFilter === key ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
              </div>

              {/* Filter totals */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600 px-1">
                <span>{filteredMovimientos.length} movimientos</span>
                <span>Créditos: <strong className="text-green-700">{formatMoney(String(filteredMovimientos.filter(m => m.es_credito).reduce((s, m) => s + Number(m.monto), 0)))}</strong></span>
                <span>Débitos: <strong className="text-red-600">-{formatMoney(String(filteredMovimientos.filter(m => !m.es_credito).reduce((s, m) => s + Number(m.monto), 0)))}</strong></span>
              </div>

              {/* Movimientos table */}
              <MovimientosTable
                movimientos={filteredMovimientos}
                pendingIds={pendingIds}
                assignOpenFor={assignOpenFor}
                setAssignOpenFor={setAssignOpenFor}
                assignTriggerRef={assignTriggerRef}
                withPending={withPending}
                confianzaColor={confianzaColor}
                matchLabel={matchLabel}
                unidades={unidades}
                gastos={gastos}
              />

              {/* Bottom action bar */}
              <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  {confirmedCobranzas.length} cobranza{confirmedCobranzas.length !== 1 ? "s" : ""} por{" "}
                  <strong>{formatMoney(confirmedTotal)}</strong> serán registradas.
                  {" "}{confirmedDebitos.length} débito{confirmedDebitos.length !== 1 ? "s" : ""} confirmado{confirmedDebitos.length !== 1 ? "s" : ""}.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={confirmedCobranzas.length === 0 || isApplyingCreditos}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (!confirm(`¿Aplicar créditos? Se registrarán ${confirmedCobranzas.length} pagos.`)) return;
                      const extractoIds = Array.from(new Set(confirmedCobranzas.map((m) => m.extracto_id)));
                      setIsApplyingCreditos(true);
                      try {
                        for (const id of extractoIds) {
                          await aplicarCreditos(id);
                        }
                        window.location.reload();
                      } catch (e) {
                        alert("Error al aplicar créditos");
                        setIsApplyingCreditos(false);
                      }
                    }}
                  >
                    Aplicar Créditos
                  </button>
                  <button
                    type="button"
                    disabled={confirmedDebitos.length === 0 || isApplyingDebitos}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (!confirm(`¿Aplicar débitos? Se procesarán ${confirmedDebitos.length} movimientos.`)) return;
                      const extractoIds = Array.from(new Set(confirmedDebitos.map((m) => m.extracto_id)));
                      setIsApplyingDebitos(true);
                      try {
                        for (const id of extractoIds) {
                          await aplicarDebitos(id);
                        }
                        window.location.reload();
                      } catch (e) {
                        alert("Error al aplicar débitos");
                        setIsApplyingDebitos(false);
                      }
                    }}
                  >
                    Aplicar Débitos
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "gastos_bancarios" && (
            <div className="card overflow-hidden">
              {movimientosBancarios.some((m) => m.estado_match !== "confirmado") && (
                <div className="px-4 py-3 border-b border-gray-100 flex justify-end">
                  <button
                    type="button"
                    className="btn-primary text-xs px-3 py-1.5"
                    onClick={async () => {
                      const pending = movimientosBancarios.filter((m) => m.estado_match !== "confirmado");
                      for (const m of pending) {
                        await confirmarMatch(m.id);
                      }
                      setLocalMovimientos((prev) =>
                        prev.map((m) =>
                          m.categoria_bancaria !== null && m.estado_match !== "confirmado"
                            ? { ...m, estado_match: "confirmado" }
                            : m
                        )
                      );
                    }}
                  >
                    Confirmar todos ({movimientosBancarios.filter((m) => m.estado_match !== "confirmado").length})
                  </button>
                </div>
              )}
              <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-600">
                {movimientosBancarios.length} gastos bancarios · Total: <strong className="text-red-600">-{formatMoney(String(movimientosBancarios.reduce((s, m) => s + Number(m.monto), 0)))}</strong>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Fecha</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-right">Monto</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movimientosBancarios.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatDate(m.fecha)}</td>
                        <td className="px-4 py-2 max-w-xs truncate" title={m.descripcion}>{m.descripcion}</td>
                        <td className="px-4 py-2">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                            {bankChargeLabel(m.categoria_bancaria)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-red-600">
                          -{formatMoney(m.monto)}
                        </td>
                        <td className="px-4 py-2">
                          {m.estado_match === "confirmado" ? (
                            <button
                              type="button"
                              className="text-green-600 hover:text-red-600 text-xs font-medium group min-w-[90px] text-left"
                              title="Desconfirmar"
                              onClick={() => withPending(m.id, () => desconfirmarMatch(m.id), (mv) => ({ ...mv, estado_match: "sugerido" }))}
                            >
                              <span className="group-hover:hidden">✓ Confirmado</span>
                              <span className="hidden group-hover:inline">✕ Desconfirmar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-800 text-xs"
                              onClick={() => withPending(m.id, () => confirmarMatch(m.id), (mv) => ({ ...mv, estado_match: "confirmado" }))}
                            >
                              Confirmar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {movimientosBancarios.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                          No se detectaron gastos bancarios en los extractos cargados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "pendientes" && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingDebits.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2">{g.descripcion}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-gray-700">
                          {formatMoney(g.monto)}
                        </td>
                      </tr>
                    ))}
                    {pendingDebits.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-sm">
                          No hay gastos pendientes de débito.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
                Estos gastos son informativos y no bloquean la liquidación del período.
              </p>
            </div>
          )}

          {tab === "resumen" && (
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Resumen de conciliación</h3>
              {summary ? (
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-gray-500">Saldo según banco</dt>
                  <dd className="text-right font-mono font-semibold">
                    {summary.saldoBanco !== null ? formatMoney(summary.saldoBanco) : "—"}
                  </dd>
                  <dt className="text-gray-500">Total créditos</dt>
                  <dd className="text-right font-mono text-green-600">{formatMoney(summary.totalCreditos)}</dd>
                  <dt className="text-gray-500">Total débitos</dt>
                  <dd className="text-right font-mono text-red-600">{formatMoney(summary.totalDebitos)}</dd>
                  <dt className="text-gray-500">Gastos bancarios</dt>
                  <dd className="text-right font-mono text-orange-600">{formatMoney(summary.gastosBancarios)}</dd>
                  <dt className="text-gray-500">Pendientes de débito</dt>
                  <dd className="text-right font-mono">{summary.pendingCount}</dd>
                </dl>
              ) : (
                <p className="text-sm text-gray-400">No hay datos suficientes para calcular el resumen.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MovimientosTable({
  movimientos,
  pendingIds,
  assignOpenFor,
  setAssignOpenFor,
  assignTriggerRef,
  withPending,
  confianzaColor,
  matchLabel,
  unidades,
  gastos,
}: {
  movimientos: Movimiento[];
  pendingIds: Set<number>;
  assignOpenFor: number | null;
  setAssignOpenFor: (id: number | null) => void;
  assignTriggerRef: React.RefObject<HTMLButtonElement | null>;
  withPending: (id: number, fn: () => Promise<void>, updater?: (m: Movimiento) => Movimiento) => Promise<void>;
  confianzaColor: (conf: string | null) => string;
  matchLabel: (m: Movimiento) => string;
  unidades: Unidad[];
  gastos: Gasto[];
}) {
  return (
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
            {movimientos.map((m) => {
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
                    {m.categoria_bancaria ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                        Gasto Bancario
                      </span>
                    ) : m.match_tipo === "cobranza" ? (
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
                    className={`px-4 py-2 max-w-[280px] ${
                      m.match_tipo || m.categoria_bancaria ? confianzaColor(m.match_confianza) : "text-gray-400"
                    } rounded`}
                    title={m.match_tipo || m.categoria_bancaria ? matchLabel(m) : ""}
                  >
                    <div className="truncate text-xs">
                      {m.match_tipo || m.categoria_bancaria ? matchLabel(m) : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {m.match_confianza ? `${Math.round(Number(m.match_confianza) * 100)}%` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {m.estado_match === "confirmado" ? (
                      <button
                        type="button"
                        className="text-green-600 hover:text-red-600 text-xs font-medium group min-w-[90px] text-left"
                        title="Desconfirmar"
                        onClick={() => withPending(m.id, () => desconfirmarMatch(m.id), (mv) => ({ ...mv, estado_match: "sugerido" }))}
                      >
                        <span className="group-hover:hidden">✓ Confirmado</span>
                        <span className="hidden group-hover:inline">✕ Desconfirmar</span>
                      </button>
                    ) : m.estado_match === "descartado" ? (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-blue-600 text-xs font-medium group min-w-[90px] text-left"
                        title="Restaurar"
                        onClick={() => withPending(m.id, () => desconfirmarMatch(m.id), (mv) => ({ ...mv, estado_match: "sugerido" }))}
                      >
                        <span className="group-hover:hidden">Descartado</span>
                        <span className="hidden group-hover:inline">↩ Restaurar</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 relative">
                        {(m.match_tipo || m.categoria_bancaria) && (
                          <button
                            type="button"
                            disabled={isPending}
                            className="text-green-600 hover:text-green-800 text-xs"
                            title="Confirmar"
                            onClick={() => withPending(m.id, () => confirmarMatch(m.id), (mv) => ({ ...mv, estado_match: "confirmado" }))}
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
                            onClick={() => withPending(m.id, () => rechazarMatch(m.id), (mv) => ({ ...mv, estado_match: "pendiente", match_tipo: null, match_id: null, match_confianza: null }))}
                          >
                            ❌
                          </button>
                        )}
                        <button
                          type="button"
                          ref={assignOpenFor === m.id ? assignTriggerRef : undefined}
                          disabled={isPending}
                          className="text-gray-500 hover:text-gray-700 text-xs"
                          title="Asignar manualmente"
                          onClick={(e) => { assignTriggerRef.current = e.currentTarget; setAssignOpenFor(assignOpenFor === m.id ? null : m.id); }}
                        >
                          📝
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          className="text-gray-400 hover:text-orange-600 text-xs"
                          title="Descartar (conciliar sin gasto)"
                          onClick={() => withPending(m.id, () => descartarMovimiento(m.id), (mv) => ({ ...mv, estado_match: "descartado", match_tipo: null, match_id: null, match_confianza: null }))}
                        >
                          🚫
                        </button>
                        {assignOpenFor === m.id && (
                          <AssignPopover
                            movimiento={m}
                            unidades={unidades}
                            gastos={gastos}
                            onClose={() => setAssignOpenFor(null)}
                            triggerRef={assignTriggerRef}
                            onAssign={(tipo, targetId) => {
                              setAssignOpenFor(null);
                              withPending(m.id, () => asignarManual(m.id, tipo, targetId), (mv) => ({
                                ...mv,
                                match_tipo: tipo,
                                match_id: targetId,
                                estado_match: "sugerido",
                              }));
                            }}
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {movimientos.length === 0 && (
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
  );
}

function AssignPopover({
  movimiento,
  unidades,
  gastos,
  onClose,
  onAssign,
  triggerRef,
}: {
  movimiento: Movimiento;
  unidades: Unidad[];
  gastos: Gasto[];
  onClose: () => void;
  onAssign: (tipo: "cobranza" | "gasto", targetId: number) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();
  const [pos, setPos] = useState<{ top: number; left: number; openUp: boolean }>({ top: 0, left: 0, openUp: false });
  const panelW = 420;
  const panelH = 480;

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < panelH && rect.top > spaceBelow;
      setPos({
        top: openUp ? rect.top - panelH - 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left - panelW / 2 + rect.width / 2, window.innerWidth - panelW - 8)),
        openUp,
      });
    }
  }, [triggerRef]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isCredit = movimiento.es_credito;
  const filteredUnidades = unidades.filter(
    (u) =>
      u.uf.toLowerCase().includes(q) ||
      (u.propietario && u.propietario.toLowerCase().includes(q)) ||
      String(u.uf_numero).includes(q)
  );
  const filteredGastos = gastos.filter(
    (g) => g.descripcion.toLowerCase().includes(q) || g.monto.includes(q)
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col"
        style={{ top: Math.max(4, pos.top), left: pos.left, width: panelW, maxHeight: panelH }}
      >
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-800">
              {isCredit ? "Asignar a unidad" : "Asignar a gasto"}
            </span>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>
          <div className="text-[11px] text-gray-500 mb-2 truncate">
            {movimiento.descripcion} · <span className="font-mono font-medium">{formatMoney(movimiento.monto)}</span>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, monto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs w-full"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto flex-1 p-1.5">
          {isCredit ? (
            filteredUnidades.length > 0 ? (
              filteredUnidades.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => onAssign("cobranza", u.id)}
                >
                  <span className="font-medium text-gray-800">UF {u.uf_numero ?? u.uf}</span>
                  {u.propietario && <span className="text-gray-500 ml-1">· {u.propietario}</span>}
                </button>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
            )
          ) : (
            filteredGastos.length > 0 ? (
              (() => {
                const grouped = new Map<string, Gasto[]>();
                filteredGastos.forEach((g) => {
                  const key = g.periodo_label;
                  if (!grouped.has(key)) grouped.set(key, []);
                  grouped.get(key)!.push(g);
                });
                return Array.from(grouped.entries()).map(([label, items]) => (
                  <div key={label}>
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-50">
                      Período {label}
                    </div>
                    {items.map((g) => {
                      const montoMatch = Math.abs(Number(g.monto) - Number(movimiento.monto)) < 0.01;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          className={`flex items-center justify-between w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors ${montoMatch ? "bg-green-50 hover:bg-green-100 ring-1 ring-green-200" : "hover:bg-blue-50"}`}
                          onClick={() => onAssign("gasto", g.id)}
                        >
                          <span className="font-medium text-gray-800 truncate mr-2">{g.descripcion}</span>
                          <span className={`font-mono whitespace-nowrap ${montoMatch ? "text-green-700 font-semibold" : "text-gray-500"}`}>
                            {formatMoney(g.monto)}
                            {montoMatch && " ✓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ));
              })()
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
            )
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
