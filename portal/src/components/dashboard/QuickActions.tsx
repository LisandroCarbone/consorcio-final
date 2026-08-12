import { FileText, Landmark, Wrench, Send } from "lucide-react";

const actions = [
  { href: "/expensas", label: "Cargar Gastos", icon: FileText },
  { href: "/finanzas/cuenta-corriente", label: "Ver Cuenta Cte.", icon: Landmark },
  { href: "/proveedores", label: "Órdenes de Trabajo", icon: Wrench },
  { href: "/circulares", label: "Enviar Circulares", icon: Send },
];

export function QuickActions() {
  return (
    <div className="card p-5">
      <div className="border-b pb-4 mb-4">
        <h3 className="font-bold text-gray-800 text-base">Accesos Rápidos</h3>
        <p className="text-xs text-gray-400 mt-0.5">Tareas frecuentes de administración</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg border border-gray-100 p-3 text-sm font-semibold text-gray-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
