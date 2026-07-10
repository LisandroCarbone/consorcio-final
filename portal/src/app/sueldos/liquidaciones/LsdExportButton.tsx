"use client";

import { useState } from "react";
import { Download, AlertCircle } from "lucide-react";

export function LsdExportButton({
  periodo,
  tipo,
  hasConfirmedLiqs,
}: {
  periodo: string;
  tipo: string;
  hasConfirmedLiqs: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!hasConfirmedLiqs) {
      setError("Debes confirmar las liquidaciones antes de exportar a LSD.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sueldos/lsd?periodo=${periodo}&tipo=${tipo}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "No se pudo generar el archivo LSD.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LSD_${periodo}_${tipo}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Error al descargar el archivo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left disabled:opacity-50 border-0 bg-transparent cursor-pointer outline-none"
      >
        <Download className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-800">
            {loading ? "Generando TXT..." : "Exportar Libro Sueldos Digital (LSD)"}
          </p>
          <p className="text-xs text-gray-500">
            Generar archivo posicional .txt para ARCA / AFIP
          </p>
          {error && (
            <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
