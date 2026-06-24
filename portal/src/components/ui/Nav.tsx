"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";

const generalLinks = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/consorcios", label: "Consorcios", icon: "🏢" },
];

const operationalLinks = [
  { href: "/sueldos", label: "Sueldos", icon: "👷" },
  { href: "/expensas", label: "Expensas", icon: "💰" },
  { href: "/finanzas/cuenta-corriente", label: "Cuenta Cte.", icon: "📊" },
  { href: "/proveedores", label: "Proveedores", icon: "🔨" },
  { href: "/tickets", label: "Tickets", icon: "🔧" },
  { href: "/circulares", label: "Circulares", icon: "📢" },
];

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<string>("default");

  useEffect(() => {
    // Leer el tema inicial del atributo del html
    const currentTheme = document.documentElement.getAttribute("data-theme") || "default";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`; // Persistir por 1 año
  };

  const renderLink = (l: { href: string; label: string; icon: string }) => {
    const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        className={clsx(
          "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold transition-colors",
          active
            ? "bg-white/20 text-white shadow-sm"
            : "text-brand-100 hover:bg-white/10 hover:text-white"
        )}
      >
        <span className="text-xl select-none">{l.icon}</span>
        {l.label}
      </Link>
    );
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-brand-600 flex flex-col">
      <div className="px-6 py-6 border-b border-brand-700">
        <h1 className="text-white font-extrabold text-xl leading-tight">
          Consorcio<br />
          <span className="text-brand-200 text-sm font-normal">Panel de administración</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div className="space-y-2">
          <p className="px-4 text-[11px] font-extrabold text-brand-100 uppercase tracking-widest mb-2 select-none">
            General
          </p>
          <div className="space-y-1">
            {generalLinks.map(renderLink)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[11px] font-extrabold text-brand-100 uppercase tracking-widest mb-2 select-none">
            Gestión Operativa
          </p>
          <div className="space-y-1">
            {operationalLinks.map(renderLink)}
          </div>
        </div>
      </nav>

      {/* Footer del Sidebar con Toggle de Temas */}
      <div className="p-5 border-t border-brand-700 mt-auto bg-brand-700/30">
        <div className="flex items-center justify-between text-xs text-brand-200 mb-3">
          <span>Tema Visual</span>
          <span className="font-semibold text-white">
            {theme === "default" ? "Original" : "Naranja"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 bg-brand-800/40 p-1 rounded-lg">
          <button
            onClick={() => toggleTheme("default")}
            className={clsx(
              "py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1",
              theme === "default"
                ? "bg-white/20 text-white shadow-sm"
                : "text-brand-100 hover:text-white"
            )}
          >
            🔵 Azul
          </button>
          <button
            onClick={() => toggleTheme("orange")}
            className={clsx(
              "py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1",
              theme === "orange"
                ? "bg-white/20 text-white shadow-sm"
                : "text-brand-100 hover:text-white"
            )}
          >
            🟠 Naranja
          </button>
        </div>
      </div>
    </aside>
  );
}

