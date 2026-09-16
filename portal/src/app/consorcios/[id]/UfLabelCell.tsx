"use client";

import { useRef } from "react";
import { updateUfLabel } from "../actions";

export function UfLabelCell({ id, consorcioCuit, defaultValue }: { id: number; consorcioCuit: string; defaultValue: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const original = useRef(defaultValue);

  return (
    <form action={updateUfLabel}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
      <input
        ref={ref}
        name="uf"
        type="text"
        defaultValue={defaultValue}
        placeholder="Ej: PB A"
        className="w-24 text-sm bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-1.5 transition-colors"
        onBlur={(e) => {
          const val = e.currentTarget.value.trim();
          if (val !== original.current) {
            e.currentTarget.form?.requestSubmit();
            original.current = val;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      />
    </form>
  );
}
