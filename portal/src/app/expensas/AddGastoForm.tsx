"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addGasto, buscarGastosSimilares } from "./actions";
import { formatMoney } from "@/lib/format";
import { CATEGORIA_LABELS } from "./ExpensasTableClient";

type UF = { id: number; uf: number };
type Suggestion = { descripcion: string; monto: string; categoria: number; tipo: string };

export function AddGastoForm({
  periodoId,
  unidades,
}: {
  periodoId: number;
  unidades: UF[];
}) {
  const [tipo, setTipo] = useState<"A" | "B" | "Particular">("A");
  const [ufsSel, setUfsSel] = useState<number[]>([]);
  const [showUfDropdown, setShowUfDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Controlled fields for autocomplete fill
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("10");
  const tipoSelectRef = useRef<HTMLSelectElement>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const conceptoRef = useRef<HTMLInputElement>(null);

  const toggleUf = (id: number) =>
    setUfsSel((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const particularUf = unidades.find((u) => ufsSel.includes(u.id));

  // Debounced autocomplete search
  const handleConceptoChange = (val: string) => {
    setConcepto(val);
    setShowSuggestions(false);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (val.length < 3) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      const results = await buscarGastosSimilares(periodoId, val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);
    setSearchTimeout(t);
  };

  const applySuggestion = (s: Suggestion) => {
    setConcepto(s.descripcion);
    setMonto(String(Number(s.monto)));
    setCategoria(String(s.categoria));
    if (tipoSelectRef.current) {
      setTipo(s.tipo as "A" | "B" | "Particular");
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (conceptoRef.current && !conceptoRef.current.parentElement?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resetForm = () => {
    setConcepto("");
    setMonto("");
    setCategoria("10");
    setTipo("A");
    setUfsSel([]);
    setSuggestions([]);
  };

  const handleSubmit = (fd: FormData) => {
    startTransition(async () => {
      if (tipo === "B" && ufsSel.length > 0) {
        for (const uid of ufsSel) {
          const u = unidades.find((x) => x.id === uid);
          if (!u) continue;
          const sfd = new FormData();
          sfd.set("periodo_id", String(periodoId));
          sfd.set("concepto", concepto);
          sfd.set("monto", monto);
          sfd.set("tipo", "B");
          sfd.set("target_uf", String(u.uf));
          sfd.set("categoria", categoria);
          sfd.set("cuotas", fd.get("cuotas") as string);
          await addGasto(sfd);
        }
      } else {
        await addGasto(fd);
      }
      resetForm();
      router.refresh();
    });
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-wrap gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 items-end"
    >
      <input type="hidden" name="periodo_id" value={periodoId} />
      <input type="hidden" name="tipo" value={tipo} />
      {tipo === "Particular" && particularUf && (
        <input type="hidden" name="target_uf" value={particularUf.uf} />
      )}

      <div className="w-48">
        <label className="label text-xs">Categoría</label>
        <select
          name="categoria"
          className="input"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={isPending}
        >
          <option value="2">2 - Servicios Públicos</option>
          <option value="3">3 - Abonos de Servicios</option>
          <option value="4">4 - Mantenimiento Común</option>
          <option value="5">5 - Reparaciones en Unidades</option>
          <option value="6">6 - Gastos Bancarios</option>
          <option value="7">7 - Gastos de Limpieza</option>
          <option value="8">8 - Gastos Administración</option>
          <option value="9">9 - Seguros</option>
          <option value="10">10 - Otros</option>
        </select>
      </div>

      {/* Concepto with autocomplete */}
      <div className="flex-1 min-w-40 relative" ref={conceptoRef as React.RefObject<HTMLDivElement>}>
        <label className="label text-xs">Concepto</label>
        <input
          ref={conceptoRef}
          name="concepto"
          required
          placeholder="Concepto"
          className="input"
          value={concepto}
          onChange={(e) => handleConceptoChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          disabled={isPending}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sugerencias de períodos anteriores</p>
            </div>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                className="w-full text-left px-3 py-2.5 hover:bg-brand-50 border-b border-gray-50 last:border-0 transition-colors"
              >
                <p className="text-sm text-gray-800 leading-snug">{s.descripcion}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">{CATEGORIA_LABELS[s.categoria] ?? `Cat. ${s.categoria}`}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] font-mono text-gray-500">{formatMoney(s.monto)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-28">
        <label className="label text-xs">Monto total</label>
        <input
          name="monto"
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          className="input"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="w-20">
        <label className="label text-xs">Cuotas</label>
        <input
          name="cuotas"
          type="number"
          min="1"
          defaultValue="1"
          required
          className="input"
          disabled={isPending}
        />
      </div>

      <div className="w-33">
        <label className="label text-xs">Tipo</label>
        <select
          ref={tipoSelectRef}
          name="_tipo_display"
          className="input"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as "A" | "B" | "Particular");
            setUfsSel([]);
          }}
          disabled={isPending}
        >
          <option value="A">Coeficiente A</option>
          <option value="B">Coeficiente B</option>
          <option value="Particular">Particular</option>
        </select>
      </div>

      <div className="min-w-40">
        <label className="label text-xs">
          {tipo === "A" ? "UF (no aplica)" : tipo === "B" ? "UFs destinatarias" : "UF destinataria"}
        </label>

        {tipo === "A" && (
          <div className="input bg-gray-100 text-gray-400 cursor-not-allowed select-none text-sm">
            Todas las unidades
          </div>
        )}

        {tipo === "Particular" && (
          <select
            className="input"
            value={ufsSel[0] ?? ""}
            onChange={(e) => setUfsSel(e.target.value ? [Number(e.target.value)] : [])}
            required
            disabled={isPending}
          >
            <option value="">— Elegir UF —</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>UF {u.uf}</option>
            ))}
          </select>
        )}

        {tipo === "B" && (
          <div className="relative min-w-48">
            <button
              type="button"
              onClick={() => setShowUfDropdown(!showUfDropdown)}
              className="input text-left flex justify-between items-center text-sm bg-white"
              disabled={isPending}
            >
              <span className="truncate">
                {ufsSel.length === 0
                  ? "— Seleccionar UFs —"
                  : `${ufsSel.length} UF${ufsSel.length > 1 ? "s" : ""} seleccionada${ufsSel.length > 1 ? "s" : ""}`}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            {showUfDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUfDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-full border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto p-2 shadow-lg space-y-1">
                  {unidades.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">Sin unidades</p>
                  ) : (
                    unidades.map((u) => {
                      const isChecked = ufsSel.includes(u.id);
                      return (
                        <label key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            checked={isChecked}
                            onChange={() => toggleUf(u.id)}
                          />
                          <span>UF {u.uf}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary shrink-0 self-end" disabled={isPending}>
        {isPending ? "Guardando…" : "+ Agregar"}
      </button>
    </form>
  );
}
