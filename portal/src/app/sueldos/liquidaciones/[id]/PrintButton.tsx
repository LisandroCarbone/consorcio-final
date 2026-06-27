'use client';

import { useState } from "react";
import { distribuirSueldo } from "../../actions";

interface SueldoActionsProps {
  liquidacionId: number;
  empleadoEmail?: string | null;
  empleadoWhatsapp?: string | null;
}

export function PrintButton({ liquidacionId, empleadoEmail, empleadoWhatsapp }: SueldoActionsProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await distribuirSueldo(liquidacionId);
      if (res.success) {
        let msg = "¡Recibo enviado con éxito!";
        if (res.emailSent && res.whatsappSent) msg = "¡Enviado por Email y WhatsApp!";
        else if (res.emailSent) msg = "¡Enviado por Email!";
        else if (res.whatsappSent) msg = "¡Enviado por WhatsApp!";
        else msg = "Recibo generado, pero el empleado no posee vías de contacto registradas.";
        
        setStatus({ type: "success", message: msg });
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
    <div className="flex flex-col gap-2 print:hidden items-end">
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          🖨️ Imprimir
        </button>

        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-primary text-sm font-medium flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              🚀 Enviar Recibo (WA + Mail)
            </>
          )}
        </button>
      </div>

      {status && (
        <div
          className={`text-xs px-3 py-1 rounded-md border shadow-sm max-w-sm transition-all ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {status.message}
        </div>
      )}

      {(!empleadoEmail && !empleadoWhatsapp) && (
        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ⚠️ El empleado no tiene Email ni WhatsApp configurados.
        </span>
      )}
    </div>
  );
}
