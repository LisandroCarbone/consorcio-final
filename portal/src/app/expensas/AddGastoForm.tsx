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

      <div className="flex-1 min-w-40">
        <label className="label text-xs">Concepto</label>
        <input name="concepto" required placeholder="Concepto" className="input" />
      </div>

      <div className="w-28">
        <label className="label text-xs">Monto</label>
        <input
          name="monto"
          type="number"
          step="0.01"
          required
          placeholder="0.00"
          className="input"
        />
      </div>

      <div className="w-36">
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
          <div className="border border-gray-200 rounded-md bg-white max-h-36 overflow-y-auto p-1 min-w-40">
            {unidades.length === 0 && (
              <p className="text-xs text-gray-400 px-2 py-1">Sin unidades</p>
            )}
            {unidades.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 px-2 py-0.5 hover:bg-gray-50 rounded cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={ufsSel.includes(u.id)}
                  onChange={() => toggleUf(u.id)}
                />
                UF {u.uf}
              </label>
            ))}
            {ufsSel.length > 0 && (
              <p className="text-xs text-brand-600 px-2 pt-1 border-t border-gray-100 mt-1">
                {ufsSel.length} seleccionada{ufsSel.length > 1 ? "s" : ""}
              </p>
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
