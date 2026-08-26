"use client";

export default function ExpensasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Ocurrió un error
        </h2>
        <p className="text-sm text-red-600 mb-4">
          {error.message || "Error inesperado en el módulo de expensas."}
        </p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
