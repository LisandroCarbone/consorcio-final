"use client";

import { useEffect, useState, useCallback } from "react";
import {
  uploadConceptosARCA,
  getConceptosARCA,
  generateLSDFile,
  updateMapeoConcepto,
  type ConceptoARCARow,
} from "./actions";

interface ConsorcioOption {
  cuit: string;
  nombre: string;
}

export function LSDClient({ consorcios }: { consorcios: ConsorcioOption[] }) {
  const [consorcioCuit, setConsorcioCuit] = useState(consorcios[0]?.cuit ?? "");
  const [conceptos, setConceptos] = useState<ConceptoARCARow[]>([]);
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const reloadConceptos = useCallback(async (cuit: string) => {
    if (!cuit) return;
    try {
      const rows = await getConceptosARCA(cuit);
      setConceptos(rows);
    } catch (err) {
      setMessage({ type: "error", text: `Error al cargar conceptos: ${(err as Error).message}` });
    }
  }, []);

  useEffect(() => {
    if (consorcioCuit) reloadConceptos(consorcioCuit);
  }, [consorcioCuit, reloadConceptos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !consorcioCuit) return;
    setLoading(true);
    setMessage(null);
    try {
      const content = await file.text();
      const { count } = await uploadConceptosARCA(consorcioCuit, content);
      setMessage({ type: "ok", text: `Se importaron ${count} conceptos ARCA.` });
      await reloadConceptos(consorcioCuit);
    } catch (err) {
      setMessage({ type: "error", text: `Error al importar: ${(err as Error).message}` });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function handleMapeoChange(id: number, codigoInterno: string) {
    try {
      await updateMapeoConcepto(id, codigoInterno || null);
      setConceptos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, codigo_interno: codigoInterno || null } : c))
      );
    } catch (err) {
      setMessage({ type: "error", text: `Error al guardar mapeo: ${(err as Error).message}` });
    }
  }

  async function handleGenerate() {
    if (!consorcioCuit || !periodo) return;
    setLoading(true);
    setMessage(null);
    try {
      const content = await generateLSDFile(consorcioCuit, periodo);
      const blob = new Blob([content], { type: "text/plain;charset=windows-1252" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LSD_${consorcioCuit}_${periodo}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "Archivo LSD generado correctamente." });
    } catch (err) {
      setMessage({ type: "error", text: `Error al generar: ${(err as Error).message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Libro de Sueldos Digital (LSD)</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Consorcio</label>
          <select
            className="border rounded px-3 py-2 min-w-[280px]"
            value={consorcioCuit}
            onChange={(e) => setConsorcioCuit(e.target.value)}
          >
            {consorcios.length === 0 && <option value="">Sin consorcios</option>}
            {consorcios.map((c) => (
              <option key={c.cuit} value={c.cuit}>
                {c.nombre} ({c.cuit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subir conceptos ARCA (.txt)</label>
          <input type="file" accept=".txt" onChange={handleUpload} disabled={loading || !consorcioCuit} />
        </div>
      </div>

      {message && (
        <div
          className={`rounded px-4 py-2 text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-2">Conceptos mapeados</h2>
        {conceptos.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay conceptos cargados para este consorcio. Subí el TXT de conceptos ARCA.
          </p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Código ARCA</th>
                  <th className="text-left px-3 py-2">Descripción ARCA</th>
                  <th className="text-left px-3 py-2">Código interno</th>
                </tr>
              </thead>
              <tbody>
                {conceptos.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{c.codigo_contribuyente}</td>
                    <td className="px-3 py-2">{c.descripcion_contribuyente}</td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-40"
                        defaultValue={c.codigo_interno ?? ""}
                        placeholder="ej: sueldo_basico"
                        onBlur={(e) => handleMapeoChange(c.id, e.target.value.trim())}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-end gap-4 border-t pt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Período</label>
          <input
            type="month"
            className="border rounded px-3 py-2"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading || !consorcioCuit || !periodo}
        >
          {loading ? "Generando..." : "Generar TXT"}
        </button>
      </div>
    </div>
  );
}
