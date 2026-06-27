"use client";

import { useState } from "react";
import { recalcularPeriodoAction } from "./actions";

export function RecalcularButton({ periodo, tipo }: { periodo: string; tipo: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const fd = new FormData();
    fd.set("periodo", periodo);
    fd.set("tipo", tipo);
    await recalcularPeriodoAction(fd).catch(() => {});
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary py-1.5 text-xs"
    >
      {loading ? "Recalculando…" : "Recalcular todo"}
    </button>
  );
}
