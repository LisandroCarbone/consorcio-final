"use client";

import { useState } from "react";

export function TriggerN8nButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function trigger() {
    setStatus("loading");
    try {
      const res = await fetch("/api/sueldos/trigger-escalas", { method: "POST" });
      setStatus(res.ok ? "ok" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={trigger}
        disabled={status === "loading"}
        className="btn-primary text-sm"
      >
        {status === "loading" ? "Actualizando…" : "Actualizar escalas desde n8n"}
      </button>
      {status === "ok" && (
        <span className="text-xs text-green-600">Workflow ejecutado. Las escalas se actualizaron.</span>
      )}
      {status === "error" && (
        <span className="text-xs text-red-600">Error al ejecutar el workflow. Revisá n8n.</span>
      )}
    </div>
  );
}
