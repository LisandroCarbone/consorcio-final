"use client";

import { deleteAdministrador } from "./actions";

export function DeleteAdministradorButton({ id, compact }: { id: number; compact?: boolean }) {
  return (
    <form
      action={deleteAdministrador}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este administrador?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {compact ? (
        <button
          type="submit"
          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
          title="Eliminar"
        >
          🗑️
        </button>
      ) : (
        <button type="submit" className="btn-secondary text-red-600 hover:bg-red-50">
          Eliminar
        </button>
      )}
    </form>
  );
}
