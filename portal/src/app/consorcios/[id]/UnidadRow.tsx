"use client";

import { useState, useTransition } from "react";
import { UfNumeroCell } from "./UfNumeroCell";
import { UfLabelCell } from "./UfLabelCell";
import { InlineEditCell } from "./InlineEditCell";
import { CbuToggle, CbuExpandRow } from "./CbuExpandRow";
import { ReplacePropietarioButton, RemoveInquilinoButton } from "./OcupanteActions";
import { updatePersonaField, updateUnidadField } from "./actions";

interface Propietario {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  dni: string | null;
  email: string | null;
  email_2: string | null;
  whatsapp: string | null;
}

interface Inquilino {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  email_2: string | null;
  whatsapp: string | null;
}

interface CbuEntry {
  cbu_o_cuit: string;
  nombre_referencia: string | null;
}

export function UnidadRow({
  id,
  uf,
  uf_numero,
  tipo,
  coefA,
  coefB,
  consorcioCuit,
  propietarios,
  inquilino,
  cbuEntries,
}: {
  id: number;
  uf: string;
  uf_numero: number | null;
  tipo: string;
  coefA: string;
  coefB: string;
  consorcioCuit: string;
  propietarios: Propietario[];
  inquilino: Inquilino | null;
  cbuEntries: CbuEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState({ tipo, coefA, coefB });

  function startEdit() {
    setDraft({ tipo, coefA, coefB });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ tipo, coefA, coefB });
    setEditing(false);
  }

  function saveEdit() {
    const changes: Array<[string, string]> = [];
    if (draft.tipo !== tipo) changes.push(["tipo", draft.tipo]);
    if (draft.coefA !== coefA) changes.push(["coef_a", draft.coefA]);
    if (draft.coefB !== coefB) changes.push(["coef_b", draft.coefB]);

    if (changes.length === 0) {
      setEditing(false);
      return;
    }

    startTransition(async () => {
      await Promise.all(
        changes.map(([field, value]) => {
          const fd = new FormData();
          fd.set("unidad_id", String(id));
          fd.set("field", field);
          fd.set("value", value);
          fd.set("consorcio_cuit", consorcioCuit);
          return updateUnidadField(fd);
        })
      );
      setEditing(false);
    });
  }

  return (
    <>
      <tr className="table-row hover:bg-gray-50 group">
        <td className="td font-mono text-gray-500 text-sm text-center w-16 p-0">
          <UfNumeroCell id={id} consorcioCuit={consorcioCuit} defaultValue={uf_numero} />
        </td>
        <td className="td font-medium p-0">
          <UfLabelCell id={id} consorcioCuit={consorcioCuit} defaultValue={uf} />
        </td>
        <td className="td text-gray-500 capitalize">
          {editing ? (
            <input
              type="text"
              value={draft.tipo}
              disabled={isPending}
              onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value }))}
              className="w-24 bg-white border border-gray-300 rounded px-1 py-0.5 text-sm capitalize"
            />
          ) : (
            tipo
          )}
        </td>
        <td className="td text-right font-mono text-sm">
          {editing ? (
            <input
              type="number"
              step="0.0001"
              value={draft.coefA}
              disabled={isPending}
              onChange={(e) => setDraft((d) => ({ ...d, coefA: e.target.value }))}
              className="w-24 bg-white border border-gray-300 rounded px-1 py-0.5 text-right text-sm font-mono"
            />
          ) : (
            parseFloat(coefA).toFixed(4)
          )}
        </td>
        <td className="td text-right font-mono text-sm">
          {editing ? (
            <input
              type="number"
              step="0.0001"
              value={draft.coefB}
              disabled={isPending}
              onChange={(e) => setDraft((d) => ({ ...d, coefB: e.target.value }))}
              className="w-24 bg-white border border-gray-300 rounded px-1 py-0.5 text-right text-sm font-mono"
            />
          ) : (
            parseFloat(coefB).toFixed(4)
          )}
        </td>
        <td className="td">
          {propietarios.length === 0 ? (
            <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>
          ) : (
            <div className="space-y-2">
              {propietarios.map((p) => (
                <div key={p.ocupante_id} className="border-b last:border-0 border-gray-100 pb-1">
                  <div className="flex gap-1">
                    <InlineEditCell
                      entityId={p.persona_id}
                      field="nombre"
                      defaultValue={p.nombre}
                      action={updatePersonaField}
                      consorcioCuit={consorcioCuit}
                      className="w-20 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-sm font-medium"
                    />
                    <InlineEditCell
                      entityId={p.persona_id}
                      field="apellido"
                      defaultValue={p.apellido}
                      action={updatePersonaField}
                      consorcioCuit={consorcioCuit}
                      className="w-20 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-sm font-medium"
                    />
                  </div>
                  <InlineEditCell
                    entityId={p.persona_id}
                    field="dni"
                    defaultValue={p.dni}
                    action={updatePersonaField}
                    consorcioCuit={consorcioCuit}
                    className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono text-gray-400"
                  />
                  <ReplacePropietarioButton ocupanteId={p.ocupante_id} unidadId={id} consorcioCuit={consorcioCuit} />
                </div>
              ))}
            </div>
          )}
        </td>
        <td className="td text-xs text-gray-600 font-mono">
          {propietarios.map((p) => (
            <div key={p.ocupante_id}>
              <InlineEditCell
                entityId={p.persona_id}
                field="email"
                defaultValue={p.email}
                type="email"
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
              />
              <InlineEditCell
                entityId={p.persona_id}
                field="email_2"
                defaultValue={p.email_2}
                type="email"
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono text-gray-400"
              />
            </div>
          ))}
        </td>
        <td className="td text-xs text-gray-600 font-mono">
          {propietarios.map((p) => (
            <InlineEditCell
              key={p.ocupante_id}
              entityId={p.persona_id}
              field="whatsapp"
              defaultValue={p.whatsapp}
              type="tel"
              action={updatePersonaField}
              consorcioCuit={consorcioCuit}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
            />
          ))}
        </td>
        <td className="td font-medium text-gray-800">
          {!inquilino ? (
            <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>
          ) : (
            <div className="flex gap-1 items-center">
              <InlineEditCell
                entityId={inquilino.persona_id}
                field="nombre"
                defaultValue={inquilino.nombre}
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-16 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-sm"
              />
              <InlineEditCell
                entityId={inquilino.persona_id}
                field="apellido"
                defaultValue={inquilino.apellido}
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-16 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-sm"
              />
            </div>
          )}
        </td>
        <td className="td text-xs text-gray-600 font-mono">
          {inquilino ? (
            <>
              <InlineEditCell
                entityId={inquilino.persona_id}
                field="email"
                defaultValue={inquilino.email}
                type="email"
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
              />
              <InlineEditCell
                entityId={inquilino.persona_id}
                field="email_2"
                defaultValue={inquilino.email_2}
                type="email"
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono text-gray-400"
              />
            </>
          ) : (
            "—"
          )}
        </td>
        <td className="td text-xs text-gray-600 font-mono">
          {inquilino ? (
            <>
              <InlineEditCell
                entityId={inquilino.persona_id}
                field="whatsapp"
                defaultValue={inquilino.whatsapp}
                type="tel"
                action={updatePersonaField}
                consorcioCuit={consorcioCuit}
                className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
              />
              <RemoveInquilinoButton ocupanteId={inquilino.ocupante_id} consorcioCuit={consorcioCuit} />
            </>
          ) : (
            "—"
          )}
        </td>
        <td className="td p-0 text-center w-14">
          {editing ? (
            <div className="flex gap-1.5 justify-center items-center">
              <button
                type="button"
                onClick={saveEdit}
                disabled={isPending}
                title="Guardar"
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isPending}
                title="Cancelar"
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              title="Editar fila"
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
        </td>
        <td className="td p-0 text-center w-20">
          <CbuToggle open={open} onToggle={() => setOpen((v) => !v)} count={cbuEntries.length} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={13} className="p-0">
            <CbuExpandRow unidadId={id} consorcioCuit={consorcioCuit} entries={cbuEntries} />
          </td>
        </tr>
      )}
    </>
  );
}
