"use client";

import { useState, useTransition } from "react";
import { UfNumeroCell } from "./UfNumeroCell";
import { UfLabelCell } from "./UfLabelCell";
import { InlineEditCell } from "./InlineEditCell";
import { CbuExpandRow } from "./CbuExpandRow";
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

function fullName(nombre: string | null, apellido: string | null) {
  const parts = [nombre, apellido].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
    >
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
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
  const [isPending, startTransition] = useTransition();

  function saveUnidadField(field: "tipo" | "coef_a" | "coef_b", value: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("unidad_id", String(id));
      fd.set("field", field);
      fd.set("value", value);
      fd.set("consorcio_cuit", consorcioCuit);
      await updateUnidadField(fd);
    });
  }

  const propietarioNames = propietarios.map((p) => fullName(p.nombre, p.apellido) ?? "Sin nombre").join(", ");
  const inquilinoName = inquilino ? fullName(inquilino.nombre, inquilino.apellido) ?? "Sin nombre" : null;

  return (
    <>
      <tr
        className="table-row hover:bg-gray-50 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="td font-mono text-gray-500 text-sm text-center w-16 p-0" onClick={(e) => e.stopPropagation()}>
          <UfNumeroCell id={id} consorcioCuit={consorcioCuit} defaultValue={uf_numero} />
        </td>
        <td className="td font-medium p-0" onClick={(e) => e.stopPropagation()}>
          <UfLabelCell id={id} consorcioCuit={consorcioCuit} defaultValue={uf} />
        </td>
        <td className="td text-gray-500 capitalize text-sm">{tipo}</td>
        <td className="td text-right font-mono text-sm">{parseFloat(coefA).toFixed(4)}</td>
        <td className="td text-right font-mono text-sm">{parseFloat(coefB).toFixed(4)}</td>
        <td className="td text-sm">
          {propietarios.length === 0 ? (
            <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>
          ) : (
            <span className="font-medium text-gray-800">{propietarioNames}</span>
          )}
        </td>
        <td className="td text-sm">
          {inquilinoName ? (
            <span className="font-medium text-gray-800">{inquilinoName}</span>
          ) : (
            <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>
          )}
        </td>
        <td className="td p-0 text-center w-10">
          <ChevronIcon open={open} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="p-0">
            <div
              className="bg-gray-50 border-t border-b border-gray-200 px-5 py-5 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Datos de la unidad */}
              <div className="card p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Datos de la unidad
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DetailField label="Tipo">
                    <select
                      defaultValue={tipo}
                      disabled={isPending}
                      onChange={(e) => saveUnidadField("tipo", e.target.value)}
                      className="input capitalize"
                    >
                      <option value="departamento">Departamento</option>
                      <option value="cochera">Cochera</option>
                      <option value="local">Local</option>
                      <option value="baulera">Baulera</option>
                    </select>
                  </DetailField>
                  <DetailField label="Coeficiente A">
                    <input
                      type="number"
                      step="0.0001"
                      defaultValue={coefA}
                      disabled={isPending}
                      onBlur={(e) => {
                        if (e.currentTarget.value !== coefA) saveUnidadField("coef_a", e.currentTarget.value);
                      }}
                      className="input font-mono"
                    />
                  </DetailField>
                  <DetailField label="Coeficiente B">
                    <input
                      type="number"
                      step="0.0001"
                      defaultValue={coefB}
                      disabled={isPending}
                      onBlur={(e) => {
                        if (e.currentTarget.value !== coefB) saveUnidadField("coef_b", e.currentTarget.value);
                      }}
                      className="input font-mono"
                    />
                  </DetailField>
                </div>
              </div>

              {/* Propietario(s) */}
              <div className="card p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Propietario{propietarios.length !== 1 ? "s" : ""}
                </h4>
                {propietarios.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Sin propietarios asignados</p>
                ) : (
                  <div className="space-y-4">
                    {propietarios.map((p) => (
                      <div key={p.ocupante_id} className="border border-gray-100 rounded-lg p-3 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <DetailField label="Nombre">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="nombre"
                              defaultValue={p.nombre}
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input"
                            />
                          </DetailField>
                          <DetailField label="Apellido">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="apellido"
                              defaultValue={p.apellido}
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input"
                            />
                          </DetailField>
                          <DetailField label="DNI / CUIT">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="dni"
                              defaultValue={p.dni}
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input font-mono"
                            />
                          </DetailField>
                          <DetailField label="WhatsApp">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="whatsapp"
                              defaultValue={p.whatsapp}
                              type="tel"
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input font-mono"
                            />
                          </DetailField>
                          <DetailField label="Email">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="email"
                              defaultValue={p.email}
                              type="email"
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input"
                            />
                          </DetailField>
                          <DetailField label="Email alternativo">
                            <InlineEditCell
                              entityId={p.persona_id}
                              field="email_2"
                              defaultValue={p.email_2}
                              type="email"
                              action={updatePersonaField}
                              consorcioCuit={consorcioCuit}
                              className="input"
                            />
                          </DetailField>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <ReplacePropietarioButton ocupanteId={p.ocupante_id} unidadId={id} consorcioCuit={consorcioCuit} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inquilino */}
              <div className="card p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Inquilino</h4>
                {!inquilino ? (
                  <p className="text-sm text-gray-400 italic">Sin inquilino asignado</p>
                ) : (
                  <div className="border border-gray-100 rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailField label="Nombre">
                        <InlineEditCell
                          entityId={inquilino.persona_id}
                          field="nombre"
                          defaultValue={inquilino.nombre}
                          action={updatePersonaField}
                          consorcioCuit={consorcioCuit}
                          className="input"
                        />
                      </DetailField>
                      <DetailField label="Apellido">
                        <InlineEditCell
                          entityId={inquilino.persona_id}
                          field="apellido"
                          defaultValue={inquilino.apellido}
                          action={updatePersonaField}
                          consorcioCuit={consorcioCuit}
                          className="input"
                        />
                      </DetailField>
                      <DetailField label="WhatsApp">
                        <InlineEditCell
                          entityId={inquilino.persona_id}
                          field="whatsapp"
                          defaultValue={inquilino.whatsapp}
                          type="tel"
                          action={updatePersonaField}
                          consorcioCuit={consorcioCuit}
                          className="input font-mono"
                        />
                      </DetailField>
                      <DetailField label="Email">
                        <InlineEditCell
                          entityId={inquilino.persona_id}
                          field="email"
                          defaultValue={inquilino.email}
                          type="email"
                          action={updatePersonaField}
                          consorcioCuit={consorcioCuit}
                          className="input"
                        />
                      </DetailField>
                      <DetailField label="Email alternativo">
                        <InlineEditCell
                          entityId={inquilino.persona_id}
                          field="email_2"
                          defaultValue={inquilino.email_2}
                          type="email"
                          action={updatePersonaField}
                          consorcioCuit={consorcioCuit}
                          className="input"
                        />
                      </DetailField>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <RemoveInquilinoButton ocupanteId={inquilino.ocupante_id} consorcioCuit={consorcioCuit} />
                    </div>
                  </div>
                )}
              </div>

              {/* CBU */}
              <div className="card overflow-hidden">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4">CBU</h4>
                <CbuExpandRow unidadId={id} consorcioCuit={consorcioCuit} entries={cbuEntries} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
