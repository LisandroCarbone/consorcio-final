"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scrapeEscalasSuterh } from "./actions";

export function ActualizarEscalasButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function trigger() {
    setStatus("loading");
    try {
      const result = await scrapeEscalasSuterh();
      if (result.ok) {
        setStatus("ok");
        setMessage(`${result.savedEscalas ?? 0} escalas y ${result.savedAdicionales ?? 0} adicionales actualizados.`);
        router.refresh();
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 4000);
      } else {
        setStatus("error");
        setMessage(result.error ?? "Error desconocido");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={trigger}
        disabled={status === "loading"}
        className="btn-primary text-sm"
      >
        {status === "loading" ? "Actualizando escalas..." : "Actualizar Escalas"}
      </button>
      {status === "ok" && (
        <span className="text-xs text-green-600">{message}</span>
      )}
      {status === "error" && (
        <span className="text-xs text-red-600">Error: {message}</span>
      )}
    </div>
  );
}
