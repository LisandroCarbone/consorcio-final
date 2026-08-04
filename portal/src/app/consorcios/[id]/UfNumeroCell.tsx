"use client";

import { useRef } from "react";
import { updateUfNumero } from "../actions";

export function UfNumeroCell({ id, consorcioCuit, defaultValue }: { id: number; consorcioCuit: string; defaultValue: number | null }) {
  const ref = useRef<HTMLInputElement>(null);
  const original = useRef(defaultValue);

  return (
    <form action={updateUfNumero}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
      <input
        ref={ref}
        name="uf_numero"
        type="number"
        min="1"
        defaultValue={defaultValue ?? ""}
        className="w-14 text-center text-sm font-mono bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-1.5 transition-colors"
        onBlur={(e) => {
          const val = e.currentTarget.value ? Number(e.currentTarget.value) : null;
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
