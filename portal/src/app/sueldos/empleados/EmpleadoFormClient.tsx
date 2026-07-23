"use client";

import { useState, useTransition } from "react";

type ActionResult = { error?: string };
type EmpleadoAction = (formData: FormData) => Promise<ActionResult>;

export function EmpleadoFormClient({
  action,
  successHref,
  className,
  children,
}: {
  action: EmpleadoAction;
  successHref: string;
  className?: string;
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
      window.location.href = successHref;
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error === "cuil_duplicado" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Ya existe un empleado con ese CUIL.
        </div>
      )}
      {children}
      <div className="hidden">{pending}</div>
    </form>
  );
}
