"use client";

import { useState } from "react";
import { confirmarLiquidacionAction } from "./actions";

export function ConfirmarLiquidacionButton({
  id,
  periodo,
  tipo,
}: {
  id: number;
  periodo: string;
  tipo: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("id", String(id));
    fd.set("periodo", periodo);
    fd.set("tipo", tipo);
    await confirmarLiquidacionAction(fd);
    window.location.href = `/sueldos/liquidaciones?periodo=${periodo}&tipo=${tipo}&ok=confirmado`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading} className="text-green-600 hover:text-green-800 font-medium">
        {loading ? "Confirmando…" : "Confirmar"}
      </button>
    </form>
  );
}
