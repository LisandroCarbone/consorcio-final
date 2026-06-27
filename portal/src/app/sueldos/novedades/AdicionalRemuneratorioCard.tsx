"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  upsertAdicionalRemuneratorio,
  upsertFondoEducacion,
  upsertConceptoAdicionalPeriodo,
  deleteConceptoAdicionalPeriodo,
} from "../actions";
import { formatMoney0 } from "@/lib/format";

interface ConceptoAdicional {
  id: number;
  concepto: string;
  tipo: string;
  importe: number;
  es_porcentaje: boolean;
}

interface Props {
  periodo: string;
  consorcioCuit: string;
  valorInicial: number | null;
  fondoEducacionInicial: boolean;
  conceptosIniciales: ConceptoAdicional[];
}

export function AdicionalRemuneratorioCard({
  periodo,
  consorcioCuit,
  valorInicial,
  fondoEducacionInicial,
  conceptosIniciales,
}: Props) {
  const [remVal, setRemVal] = useState(valorInicial != null ? String(valorInicial) : "");
  const [savingRem, setSavingRem] = useState(false);
  const [savedRem, setSavedRem] = useState(false);

  const [fondoEdu, setFondoEdu] = useState(fondoEducacionInicial);
  const [savingFondo, setSavingFondo] = useState(false);

  const [conceptos, setConceptos] = useState<ConceptoAdicional[]>(conceptosIniciales);
  const [newConcepto, setNewConcepto] = useState("");
  const [newTipo, setNewTipo] = useState<"haber" | "descuento">("descuento");
  const [newEsPorcentaje, setNewEsPorcentaje] = useState(false);
  const [newImporte, setNewImporte] = useState("");
  const [addingConcepto, setAddingConcepto] = useState(false);

  async function handleSaveRem() {
    const num = parseFloat(remVal.replace(/\./g, "").replace(",", "."));
    if (isNaN(num) || num < 0) return;
    setSavingRem(true);
    await upsertAdicionalRemuneratorio(periodo, num);
    setSavingRem(false);
    setSavedRem(true);
    setTimeout(() => setSavedRem(false), 2000);
  }

  async function handleFondoToggle(checked: boolean) {
    setSavingFondo(true);
    setFondoEdu(checked);
    await upsertFondoEducacion(periodo, checked);
    setSavingFondo(false);
  }

  async function handleAddConcepto() {
    if (!newConcepto.trim()) return;
    const num = parseFloat(newImporte.replace(/\./g, "").replace(",", "."));
    if (isNaN(num) || num <= 0) return;
    setAddingConcepto(true);
    await upsertConceptoAdicionalPeriodo(periodo, consorcioCuit, newConcepto.trim(), newTipo, num, newEsPorcentaje);
    setConceptos(prev => {
      const existing = prev.findIndex(c => c.concepto === newConcepto.trim());
      const entry: ConceptoAdicional = { id: Date.now(), concepto: newConcepto.trim(), tipo: newTipo, importe: num, es_porcentaje: newEsPorcentaje };
      return existing >= 0 ? prev.map((c, i) => i === existing ? entry : c) : [...prev, entry];
    });
    setNewConcepto("");
    setNewImporte("");
    setAddingConcepto(false);
  }

  async function handleDeleteConcepto(id: number) {
    await deleteConceptoAdicionalPeriodo(id);
    setConceptos(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="card p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Adicionales del período</h3>

      {/* Adicional Remuneratorio */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600 w-56 shrink-0">Adicional Remuneratorio Mensual (CCT):</label>
        <span className="text-sm text-gray-400">$</span>
        <input
          type="text"
          value={remVal}
          onChange={(e) => { setRemVal(e.target.value); setSavedRem(false); }}
          placeholder="0"
          className="w-36 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        <button onClick={handleSaveRem} disabled={savingRem} className="btn-primary py-1.5 text-xs">
          {savingRem ? "Guardando…" : savedRem ? "Guardado ✓" : "Guardar"}
        </button>
        <p className="text-xs text-gray-400">Proporcional para suplentes.</p>
      </div>

      {/* Fondo Educación */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
        <label className="text-sm text-gray-600 w-56 shrink-0">Fondo Educación y Comunicación Art. 19 bis (2%):</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fondoEdu}
            disabled={savingFondo}
            onChange={(e) => handleFondoToggle(e.target.checked)}
            className="w-4 h-4 accent-brand-600"
          />
          <span className="text-sm text-gray-700">{fondoEdu ? "Aplicar este período" : "No aplicar"}</span>
        </label>
        {savingFondo && <span className="text-xs text-gray-400">Guardando…</span>}
        <p className="text-xs text-gray-400">Se descuenta 1 vez al año.</p>
      </div>

      {/* Conceptos adicionales libres */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Conceptos adicionales</p>

        {conceptos.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {conceptos.map(c => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <span className={`w-16 text-center text-xs font-medium rounded px-1.5 py-0.5 ${c.tipo === "haber" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {c.tipo === "haber" ? "Haber" : "Descuento"}
                </span>
                <span className="flex-1 text-gray-700">{c.concepto}</span>
                <span className="font-mono text-gray-600">
                  {c.es_porcentaje ? `${c.importe}%` : formatMoney0(c.importe)}
                </span>
                <button onClick={() => handleDeleteConcepto(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={newTipo}
            onChange={e => {
              setNewTipo(e.target.value as "haber" | "descuento");
              if (e.target.value === "haber") setNewEsPorcentaje(false);
            }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="descuento">Descuento</option>
            <option value="haber">Haber</option>
          </select>

          {newTipo === "descuento" && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button
                onClick={() => setNewEsPorcentaje(false)}
                className={`px-3 py-1.5 ${!newEsPorcentaje ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >$</button>
              <button
                onClick={() => setNewEsPorcentaje(true)}
                className={`px-3 py-1.5 ${newEsPorcentaje ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >%</button>
            </div>
          )}

          <input
            type="text"
            value={newConcepto}
            onChange={e => setNewConcepto(e.target.value)}
            placeholder="Nombre del concepto"
            className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">{newEsPorcentaje ? "%" : "$"}</span>
            <input
              type="text"
              value={newImporte}
              onChange={e => setNewImporte(e.target.value)}
              placeholder={newEsPorcentaje ? "0.00" : "0,00"}
              className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <button onClick={handleAddConcepto} disabled={addingConcepto || !newConcepto.trim()} className="btn-secondary py-1.5 text-xs">
            {addingConcepto ? "Agregando…" : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
