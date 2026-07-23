"use client";

import { useState, useTransition } from "react";

type ActionResult = { error?: string };
type AdministradorAction = (formData: FormData) => Promise<ActionResult>;

export function AdministradorFormClient({
  action,
  isNew,
  children,
}: {
  action: AdministradorAction;
  isNew: boolean;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      window.location.href = isNew ? "/administracion" : window.location.pathname + "?ok=guardado";
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {error === "cuit_duplicado" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Ya existe un administrador con ese CUIT.
        </div>
      )}
      {children}
      <div className="hidden">{pending}</div>
    </form>
  );
}
