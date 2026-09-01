"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/format";
import { updateEstadoFinanciero } from "./actions";
import MaskedInput from "@/components/ui/MaskedInput";

interface GastoExtra {
  concepto: string;
  monto: number;
}

interface EstadoFinancieroData {
  saldoAnterior: number;
  cobranzas: number;
  cobranzasSinIdentificar: number;
  totalGastos: number;
  totalGastosA?: number;
  totalGastosB?: number;
  totalParticulares?: number;
  gastosExtra: GastoExtra[];
  saldoCierre: number;
  periodoId: number;
}

interface Props {
  data: EstadoFinancieroData;
}

export function EstadoFinancieroSection({ data }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [gastosExtra, setGastosExtra] = useState<GastoExtra[]>(data.gastosExtra);
  const [newExtraConcepto, setNewExtraConcepto] = useState("");
  const [newExtraEgreso, setNewExtraEgreso] = useState(true);

  const gastosExtraTotal = gastosExtra.reduce((s, g) => s + g.monto, 0);

  const totalGastosB = data.totalGastosB ?? 0;
  const totalParticulares = data.totalParticulares ?? 0;
  const showGastosBreakdown = totalGastosB > 0 || totalParticulares > 0;
  const totalGastosA = data.totalGastosA ?? (data.totalGastos - totalGastosB - totalParticulares);

  const rows: { label: string; value: number; bold?: boolean; negative?: boolean; editable?: string }[] = [
    { label: "Saldo anterior", value: data.saldoAnterior, editable: "ef_saldo_anterior" },
    { label: "Cobranzas del período", value: data.cobranzas },
    { label: "Cobranzas bancarias sin identificar", value: data.cobranzasSinIdentificar, editable: "ef_cobranzas_sin_identificar" },
    ...(showGastosBreakdown
      ? [
          { label: "Pagos del período — Gastos A", value: -totalGastosA, negative: true },
          { label: "Pagos del período — Gastos B", value: -totalGastosB, negative: true },
          { label: "Pagos del período — Particulares", value: -totalParticulares, negative: true },
        ]
      : [{ label: "Pagos del período", value: -data.totalGastos, negative: true }]),
  ];

  const handleSave = (fd: FormData) => {
    fd.set("ef_gastos_extra", JSON.stringify(gastosExtra));
    startTransition(async () => {
      await updateEstadoFinanciero(fd);
      setEditing(false);
      window.location.reload();
    });
  };

  const addGastoExtra = () => {
    const hiddenInput = document.querySelector<HTMLInputElement>('input[name="_extra_monto_hidden"]');
    const rawMonto = hiddenInput ? Number(hiddenInput.value) : 0;
    if (!newExtraConcepto.trim() || !rawMonto) return;
    const finalMonto = newExtraEgreso ? -Math.abs(rawMonto) : Math.abs(rawMonto);
    setGastosExtra([...gastosExtra, { concepto: newExtraConcepto.trim(), monto: finalMonto }]);
    setNewExtraConcepto("");
    setNewExtraEgreso(true);
    if (hiddenInput) hiddenInput.value = "";
    const visibleInput = hiddenInput?.previousElementSibling as HTMLInputElement | null;
    if (visibleInput) visibleInput.value = "";
  };

  const removeGastoExtra = (idx: number) => {
    setGastosExtra(gastosExtra.filter((_, i) => i !== idx));
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <h3 className="font-semibold text-gray-800 text-base">Estado Financiero</h3>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Caja — Conf. Art. 10 inc. c Ley N°941</span>
        </div>
        <div className="flex items-center gap-3">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <form action={handleSave} className="divide-y divide-gray-100">
          <input type="hidden" name="periodo_id" value={data.periodoId} />

          <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
            <span className="text-sm text-gray-700">Saldo anterior</span>
            <div className="w-48">
              <MaskedInput
                preset="money"
                name="ef_saldo_anterior"
                defaultValue={data.saldoAnterior}
                className="input text-right text-sm"
                allowNegative
              />
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between bg-gray-50/30">
            <span className="text-sm text-gray-500">Cobranzas del período</span>
            <span className="font-mono text-sm text-gray-900">{formatMoney(data.cobranzas)}</span>
          </div>

          <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
            <span className="text-sm text-gray-700">Cobranzas bancarias sin identificar</span>
            <div className="w-48">
              <MaskedInput
                preset="money"
                name="ef_cobranzas_sin_identificar"
                defaultValue={data.cobranzasSinIdentificar}
                className="input text-right text-sm"
              />
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between bg-gray-50/30">
            <span className="text-sm text-gray-500">Pagos del período</span>
            <span className="font-mono text-sm text-red-600">-{formatMoney(data.totalGastos)}</span>
          </div>

          {/* Gastos extra editables */}
          <div className="px-5 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Movimientos adicionales</p>
            {gastosExtra.map((g, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <input
                  className="input text-sm flex-1"
                  value={g.concepto}
                  onChange={(e) => {
                    const updated = [...gastosExtra];
                    updated[i] = { ...updated[i], concepto: e.target.value };
                    setGastosExtra(updated);
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  className="input text-sm text-right w-36"
                  value={Math.abs(g.monto)}
                  onChange={(e) => {
                    const abs = Math.abs(Number(e.target.value) || 0);
                    const updated = [...gastosExtra];
                    updated[i] = { ...updated[i], monto: g.monto < 0 ? -abs : abs };
                    setGastosExtra(updated);
                  }}
                />
                <select
                  className="input text-sm w-24"
                  value={g.monto < 0 ? "egreso" : "ingreso"}
                  onChange={(e) => {
                    const abs = Math.abs(g.monto);
                    const updated = [...gastosExtra];
                    updated[i] = { ...updated[i], monto: e.target.value === "egreso" ? -abs : abs };
                    setGastosExtra(updated);
                  }}
                >
                  <option value="egreso">Egreso</option>
                  <option value="ingreso">Ingreso</option>
                </select>
                <button type="button" onClick={() => removeGastoExtra(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            <div className="flex gap-2 mt-2 items-end">
              <input
                placeholder="Concepto"
                className="input text-sm flex-1"
                value={newExtraConcepto}
                onChange={(e) => setNewExtraConcepto(e.target.value)}
              />
              <MaskedInput
                preset="money"
                name="_extra_monto_hidden"
                placeholder="Monto"
                className="input text-sm w-36"
              />
              <select
                className="input text-sm w-24"
                value={newExtraEgreso ? "egreso" : "ingreso"}
                onChange={(e) => setNewExtraEgreso(e.target.value === "egreso")}
              >
                <option value="egreso">Egreso</option>
                <option value="ingreso">Ingreso</option>
              </select>
              <button type="button" onClick={addGastoExtra} className="btn-secondary text-xs px-3 py-1.5">+ Agregar</button>
            </div>
          </div>

          <div className="px-5 py-3 flex justify-end gap-2">
            <button type="button" onClick={() => { setEditing(false); setGastosExtra(data.gastosExtra); }} className="btn-secondary text-xs px-4 py-2">
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs px-4 py-2" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <div key={i} className={`px-5 py-3 flex items-center justify-between ${row.bold ? "bg-emerald-50" : ""}`}>
              <span className={`text-sm ${row.bold ? "font-bold text-gray-900" : "text-gray-700"}`}>{row.label}</span>
              <span className={`font-mono text-sm font-semibold ${
                row.negative || row.value < 0 ? "text-red-600" : "text-gray-900"
              }`}>
                {row.value < 0 ? `-${formatMoney(Math.abs(row.value))}` : formatMoney(row.value)}
              </span>
            </div>
          ))}

          {gastosExtra.map((g, i) => (
            <div key={`extra-${i}`} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">{g.concepto}</span>
              <span className={`font-mono text-sm font-semibold ${g.monto < 0 ? "text-red-600" : "text-gray-900"}`}>
                {g.monto < 0 ? `-${formatMoney(Math.abs(g.monto))}` : formatMoney(g.monto)}
              </span>
            </div>
          ))}

          <div className="px-5 py-4 flex items-center justify-between bg-emerald-50 border-t-2 border-emerald-200">
            <span className="font-bold text-gray-900 text-sm">Saldo al cierre</span>
            <span className={`font-mono text-lg font-bold ${
              data.saldoCierre < 0 ? "text-red-700" : "text-emerald-700"
            }`}>
              {data.saldoCierre < 0 ? `-${formatMoney(Math.abs(data.saldoCierre))}` : formatMoney(data.saldoCierre)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
