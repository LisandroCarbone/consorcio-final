"use client";

import { useState } from "react";
import { addCbuEntry, updateCbuEntry, deleteCbuEntry } from "./actions";
import { formatCbu } from "@/lib/format";

interface CbuEntry {
  cbu_o_cuit: string;
  nombre_referencia: string | null;
}

export function CbuToggle({ open, onToggle, count }: { open: boolean; onToggle: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
    >
      <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
      CBU {count > 0 ? `(${count})` : ""}
    </button>
  );
}

function CbuEditRow({
  entry,
  unidadId,
  consorcioCuit,
  onDone,
}: {
  entry: CbuEntry;
  unidadId: number;
  consorcioCuit: string;
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData) => {
        await updateCbuEntry(formData);
        onDone();
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="unidad_id" value={unidadId} />
      <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
      <input type="hidden" name="old_cbu_o_cuit" value={entry.cbu_o_cuit} />
      <input name="new_cbu_o_cuit" defaultValue={entry.cbu_o_cuit} className="input text-xs flex-1" />
      <input name="nombre_referencia" defaultValue={entry.nombre_referencia ?? ""} placeholder="Referencia" className="input text-xs flex-1" />
      <button type="submit" className="text-[10px] text-blue-600 hover:underline">Guardar</button>
      <button type="button" onClick={onDone} className="text-[10px] text-gray-500 hover:underline">Cancelar</button>
    </form>
  );
}

export function CbuExpandRow({
  unidadId,
  consorcioCuit,
  entries,
}: {
  unidadId: number;
  consorcioCuit: string;
  entries: CbuEntry[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
      {entries.length === 0 && !adding && (
        <div className="flex items-center gap-2 text-xs text-gray-400 italic">
          Sin CUIT/CBU registrados
          <button type="button" onClick={() => setAdding(true)} className="not-italic text-blue-600 hover:underline">
            Agregar
          </button>
        </div>
      )}

      {entries.map((entry) =>
        editing === entry.cbu_o_cuit ? (
          <CbuEditRow
            key={entry.cbu_o_cuit}
            entry={entry}
            unidadId={unidadId}
            consorcioCuit={consorcioCuit}
            onDone={() => setEditing(null)}
          />
        ) : (
          <div key={entry.cbu_o_cuit} className="flex items-center gap-3 text-xs">
            <span className="font-mono text-gray-700">{formatCbu(entry.cbu_o_cuit)}</span>
            {entry.nombre_referencia && <span className="text-gray-400">{entry.nombre_referencia}</span>}
            <button type="button" onClick={() => setEditing(entry.cbu_o_cuit)} className="text-blue-600 hover:underline">
              Editar
            </button>
            <form action={deleteCbuEntry}>
              <input type="hidden" name="unidad_id" value={unidadId} />
              <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
              <input type="hidden" name="cbu_o_cuit" value={entry.cbu_o_cuit} />
              <button type="submit" className="text-red-600 hover:underline">Eliminar</button>
            </form>
          </div>
        )
      )}

      {entries.length > 0 && !adding && (
        <button type="button" onClick={() => setAdding(true)} className="text-[10px] text-blue-600 hover:underline">
          + Agregar CBU
        </button>
      )}

      {adding && (
        <form
          action={async (formData) => {
            await addCbuEntry(formData);
            setAdding(false);
          }}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="unidad_id" value={unidadId} />
          <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
          <input name="cbu_o_cuit" required placeholder="CBU o CUIT" className="input text-xs flex-1" />
          <input name="nombre_referencia" placeholder="Referencia (opcional)" className="input text-xs flex-1" />
          <button type="submit" className="text-[10px] text-blue-600 hover:underline">Guardar</button>
          <button type="button" onClick={() => setAdding(false)} className="text-[10px] text-gray-500 hover:underline">Cancelar</button>
        </form>
      )}
    </div>
  );
}
