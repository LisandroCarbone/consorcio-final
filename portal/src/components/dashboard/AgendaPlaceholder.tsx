import { Calendar } from "lucide-react";

export function AgendaPlaceholder() {
  return (
    <div className="card p-5 flex flex-col justify-between">
      <div className="border-b pb-4 mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Agenda de Vencimientos</h3>
          <p className="text-xs text-gray-400 mt-0.5">Fechas límite críticas del mes</p>
        </div>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="badge bg-brand-50 text-brand-700 mb-2">Próximamente</span>
        <p className="text-xs text-gray-400 max-w-[200px]">
          Estamos preparando esta sección para mostrar vencimientos y tareas críticas.
        </p>
      </div>
    </div>
  );
}
