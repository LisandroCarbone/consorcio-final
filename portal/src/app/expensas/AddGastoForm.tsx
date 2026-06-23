"use client";

import { useState } from "react";
import { addGasto } from "./actions";

type UF = { id: number; uf: number };

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

  const toggleUf = (id: number) =>
    setUfsSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // For "Particular" — single UF stored directly in target_uf (uf number, not id)
  const particularUf = unidades.find((u) => ufsSel.includes(u.id));

  return (
    <form
      action={async (fd: FormData) => {
        // For Coef B we submit one form per selected UF
        if (tipo === "B" && ufsSel.length > 0) {
          for (const uid of ufsSel) {
            const u = unidades.find((x) => x.id === uid);
            if (!u) continue;
            const sfd = new FormData();
            sfd.set("periodo_id", String(periodoId));
            sfd.set("concepto", fd.get("concepto") as string);
            sfd.set("monto", fd.get("monto") as string);
            sfd.set("tipo", "B");
            sfd.set("target_uf", String(u.uf));
            sfd.set("categoria", fd.get("categoria") as string);
            sfd.set("cuotas", fd.get("cuotas") as string);
            await addGasto(sfd);
          }
        } else {
          await addGasto(fd);
        }
      }}
      className="flex flex-wrap gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 items-end"
    >
      <input type="hidden" name="periodo_id" value={periodoId} />
      {/* Pass tipo */}
      <input type="hidden" name="tipo" value={tipo} />
      {/* For Particular: pass the UF number */}
      {tipo === "Particular" && particularUf && (
        <input type="hidden" name="target_uf" value={particularUf.uf} />
      )}

      <div className="w-48">
        <label className="label text-xs">Categoría</label>
        <select name="categoria" className="input" defaultValue="10">
          <option value="2">2 - Servicios Públicos</option>
          <option value="3">3 - Abonos de Servicios</option>
          <option value="4">4 - Mantenimiento Común</option>
          <option value="5">5 - Reparaciones en Unidades</option>
          <option value="6">6 - Gastos Bancarios</option>
          <option value="7">7 - Gastos de Limpieza</option>
          <option value="8">8 - Gastos Administración</option>
          <option value="9">9 - Seguros</option>
          <option value="10">10 - Otros Gastos</option>
        </select>
      </div>

      <div className="flex-1 min-w-35">
        <label className="label text-xs">Concepto</label>
        <input name="concepto" required placeholder="Concepto" className="input" />
      </div>

      <div className="w-24">
        <label className="label text-xs">Monto total</label>
        <input
          name="monto"
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          className="input"
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
        />
      </div>

      <div className="w-33">
        <label className="label text-xs">Tipo</label>
        <select
          name="_tipo_display"
          className="input"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as "A" | "B" | "Particular");
            setUfsSel([]);
          }}
        >
          <option value="A">Coeficiente A</option>
          <option value="B">Coeficiente B</option>
          <option value="Particular">Particular</option>
        </select>
      </div>

      {/* UF Selector — changes based on tipo */}
      <div className="min-w-40">
        <label className="label text-xs">
          {tipo === "A"
            ? "UF (no aplica)"
            : tipo === "B"
              ? "UFs destinatarias"
              : "UF destinataria"}
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
            onChange={(e) =>
              setUfsSel(e.target.value ? [Number(e.target.value)] : [])
            }
            required
          >
            <option value="">— Elegir UF —</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                UF {u.uf}
              </option>
            ))}
          </select>
        )}

        {tipo === "B" && (
          <div className="relative min-w-48">
            <button
              type="button"
              onClick={() => setShowUfDropdown(!showUfDropdown)}
              className="input text-left flex justify-between items-center text-sm bg-white"
            >
              <span className="truncate">
                {ufsSel.length === 0
                  ? "— Seleccionar UFs —"
                  : `${ufsSel.length} UF${ufsSel.length > 1 ? "s" : ""} seleccionada${ufsSel.length > 1 ? "s" : ""
                  }`}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            {showUfDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUfDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-20 w-full border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto p-2 shadow-lg space-y-1">
                  {unidades.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">Sin unidades</p>
                  ) : (
                    unidades.map((u) => {
                      const isChecked = ufsSel.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                        >
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

      <button type="submit" className="btn-primary shrink-0 self-end">
        + Agregar
      </button>
    </form>
  );
}
