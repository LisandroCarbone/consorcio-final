'use client';

import { useState } from "react";
import { distribuirExpensasMasivo } from "./actions";

interface BulkSendButtonProps {
  periodoId: number;
}

export function BulkSendButton({ periodoId }: BulkSendButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await distribuirExpensasMasivo(periodoId);
      if (res.success) {
        setStatus({
          type: "success",
          message: `¡Envío masivo completado! Enviadas: ${res.stats?.sent ?? 0}, Errores: ${res.stats?.errors ?? 0}.`
        });
      } else {
        setStatus({ type: "error", message: res.error || "Ocurrió un error al enviar." });
      }
    } catch (e) {
      setStatus({ type: "error", message: e instanceof Error ? e.message : "Error de red." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end print:hidden">
      <button
        onClick={handleSend}
        disabled={loading}
        className="btn-primary bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Enviando masivo...</span>
          </>
        ) : (
          <>📢 Enviar Expensas (Masivo)</>
        )}
      </button>
      {status && (
        <div
          className={`text-[11px] font-medium px-2.5 py-1 rounded-md border mt-1.5 max-w-xs shadow-sm ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
