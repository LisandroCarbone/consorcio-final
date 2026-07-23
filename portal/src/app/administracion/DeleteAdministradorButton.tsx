"use client";

import { useState } from "react";
import { deleteAdministrador } from "./actions";

export function DeleteAdministradorButton({ id, compact }: { id: number; compact?: boolean }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm("¿Eliminar este administrador?")) return;
    const fd = new FormData();
    fd.set("id", String(id));
    const result = await deleteAdministrador(fd);
    if (result?.error) {
      setError(result.error);
      return;
    }
    window.location.href = "/administracion";
  }

  return (
    <form onSubmit={handleSubmit}>
      {error === "admin_vinculado" && (
        <p className="text-xs text-red-600 mb-1">No se puede eliminar: hay datos vinculados.</p>
      )}
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
