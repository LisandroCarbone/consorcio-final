"use client";

import { useState } from "react";
import MaskedInput from "@/components/ui/MaskedInput";

interface Props {
  activo: boolean;
  monto: number;
}

export function FondoObraFields({ activo, monto }: Props) {
  const [enabled, setEnabled] = useState(activo);

  return (
    <div className="col-span-2 border-t pt-4">
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
        <input
          type="checkbox"
          name="fondo_obra_activo"
          value="true"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded"
        />
        Fondo de obra
      </label>
      {enabled && (
        <div>
          <label className="label">Monto total fondo de obra</label>
          <MaskedInput
            name="fondo_obra"
            defaultValue={monto || ""}
            placeholder="0,00"
            preset="money"
            className="input w-60"
          />
          <p className="text-xs text-gray-400 mt-0.5">
            Se prorratea por Coef. A de cada unidad y se repite todos los meses hasta desactivarse o modificarse
          </p>
        </div>
      )}
    </div>
  );
}
