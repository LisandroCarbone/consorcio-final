"use client";

import { useMemo, useState } from "react";
import { formatMoney, formatDate } from "@/lib/format";
import { bankChargeLabel } from "@/lib/conciliacion/categorizeBankCharge";
import {
  uploadExtracto,
  runAutoMatch,
  confirmarMatch,
  rechazarMatch,
  asignarManual,
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
};

type Unidad = { id: number; uf: string; uf_numero: number | null; propietario: string | null };
type Gasto = { id: number; descripcion: string; monto: string };

type Filter = "all" | "creditos" | "debitos" | "matcheados" | "sin_match" | "confirmados";
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
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyingCreditos, setIsApplyingCreditos] = useState(false);
  const [isApplyingDebitos, setIsApplyingDebitos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [corteLabel, setCorteLabel] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<Tab>("movimientos");
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

  const saldoApertura = extractos.length > 0 && extractos[extractos.length - 1].saldo_apertura !== null
    ? Number(extractos[extractos.length - 1].saldo_apertura)
    : null;
  const saldoCierre = extractos.length > 0 && extractos[0].saldo_cierre !== null
    ? Number(extractos[0].saldo_cierre)
    : null;

  const movimientosBancarios = movimientos.filter((m) => m.categoria_bancaria !== null);

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

  const confirmedDebitos = movimientos.filter(
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
    if (m.categoria_bancaria) return `Gasto Bancario: ${bankChargeLabel(m.categoria_bancaria)}`;
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
            <div className="card p-4">
              <p className="text-xs text-gray-500">Gastos Bancarios</p>
              <p className="text-sm font-bold text-orange-600">
                {summary ? formatMoney(summary.gastosBancarios) : "—"}
              </p>
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
              <MovimientosTable
                movimientos={filteredMovimientos}
                pendingIds={pendingIds}
                assignOpenFor={assignOpenFor}
                setAssignOpenFor={setAssignOpenFor}
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
                            <span className="text-green-600 text-xs font-medium">✓ Confirmado</span>
                          ) : (
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-800 text-xs"
                              onClick={() => withPending(m.id, () => confirmarMatch(m.id))}
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
  withPending: (id: number, fn: () => Promise<void>) => Promise<void>;
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
                    className={`px-4 py-2 max-w-[220px] truncate ${
                      m.match_tipo || m.categoria_bancaria ? confianzaColor(m.match_confianza) : "text-gray-400"
                    } rounded`}
                  >
                    {m.match_tipo || m.categoria_bancaria ? matchLabel(m) : "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {m.match_confianza ? `${Math.round(Number(m.match_confianza) * 100)}%` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {m.estado_match === "confirmado" ? (
                      <span className="text-green-600 text-xs font-medium">✓ Confirmado</span>
                    ) : (
                      <div className="flex items-center gap-2 relative">
                        {(m.match_tipo || m.categoria_bancaria) && (
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
