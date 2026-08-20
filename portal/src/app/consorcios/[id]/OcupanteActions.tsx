"use client";

import { useState } from "react";
import { replacePropietario, removeInquilino } from "./actions";

export function ReplacePropietarioButton({
  ocupanteId,
  unidadId,
  consorcioCuit,
  label = "Reemplazar",
}: {
  ocupanteId: number;
  unidadId: number;
  consorcioCuit: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] text-blue-600 hover:underline"
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Reemplazar propietario</h4>
            <form
              action={async (formData) => {
                await replacePropietario(formData);
                setOpen(false);
              }}
              className="space-y-2"
            >
              <input type="hidden" name="old_ocupante_id" value={ocupanteId} />
              <input type="hidden" name="unidad_id" value={unidadId} />
              <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
              <div className="grid grid-cols-2 gap-2">
                <input name="nombre" required placeholder="Nombre" className="input" />
                <input name="apellido" required placeholder="Apellido" className="input" />
              </div>
              <input name="dni" placeholder="DNI / CUIT" className="input" />
              <input name="email" type="email" placeholder="Email" className="input" />
              <input name="whatsapp" placeholder="WhatsApp" className="input" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm px-3 py-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-sm px-3 py-1">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function RemoveInquilinoButton({
  ocupanteId,
  consorcioCuit,
}: {
  ocupanteId: number;
  consorcioCuit: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] text-red-600 hover:underline"
      >
        Quitar inquilino
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Quitar inquilino</h4>
            <p className="text-xs text-gray-500 mb-4">¿Confirmás que querés quitar este inquilino de la unidad?</p>
            <form
              action={async (formData) => {
                await removeInquilino(formData);
                setOpen(false);
              }}
              className="flex justify-end gap-2"
            >
              <input type="hidden" name="ocupante_id" value={ocupanteId} />
              <input type="hidden" name="consorcio_cuit" value={consorcioCuit} />
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm px-3 py-1">
                Cancelar
              </button>
              <button type="submit" className="btn-primary text-sm px-3 py-1 bg-red-600 hover:bg-red-700 border-red-600">
                Quitar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
