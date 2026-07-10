"use client";

import { deleteAdministrador } from "./actions";

export function DeleteAdministradorButton({ id }: { id: number }) {
  return (
    <form
      action={deleteAdministrador}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este administrador?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-secondary text-red-600 hover:bg-red-50">
        Eliminar
      </button>
    </form>
  );
}
