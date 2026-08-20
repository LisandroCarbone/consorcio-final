"use client";

import { useState } from "react";
import { UfNumeroCell } from "./UfNumeroCell";
import { InlineEditCell } from "./InlineEditCell";
import { CbuToggle, CbuExpandRow } from "./CbuExpandRow";
import { ReplacePropietarioButton, RemoveInquilinoButton } from "./OcupanteActions";
import { updatePersonaField } from "./actions";

interface Propietario {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  dni: string | null;
  email: string | null;
  whatsapp: string | null;
}

interface Inquilino {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
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

  return (
    <>
      <tr className="table-row hover:bg-gray-50">
        <td className="td font-mono text-gray-500 text-sm text-center w-16 p-0">
          <UfNumeroCell id={id} consorcioCuit={consorcioCuit} defaultValue={uf_numero} />
        </td>
        <td className="td font-medium">{uf}</td>
        <td className="td text-gray-500 capitalize">{tipo}</td>
        <td className="td text-right font-mono text-sm">{parseFloat(coefA).toFixed(4)}</td>
        <td className="td text-right font-mono text-sm">{parseFloat(coefB).toFixed(4)}</td>
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
            <InlineEditCell
              key={p.ocupante_id}
              entityId={p.persona_id}
              field="email"
              defaultValue={p.email}
              type="email"
              action={updatePersonaField}
              consorcioCuit={consorcioCuit}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
            />
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
            <InlineEditCell
              entityId={inquilino.persona_id}
              field="email"
              defaultValue={inquilino.email}
              type="email"
              action={updatePersonaField}
              consorcioCuit={consorcioCuit}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-1 py-0.5 text-xs font-mono"
            />
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
        <td className="td p-0 text-center w-20">
          <CbuToggle open={open} onToggle={() => setOpen((v) => !v)} count={cbuEntries.length} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={12} className="p-0">
            <CbuExpandRow unidadId={id} consorcioCuit={consorcioCuit} entries={cbuEntries} />
          </td>
        </tr>
      )}
    </>
  );
}
