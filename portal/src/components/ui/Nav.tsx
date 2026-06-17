"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/consorcios", label: "Consorcios", icon: "🏢" },
  { href: "/expensas", label: "Expensas", icon: "💰" },
  { href: "/finanzas/cuenta-corriente", label: "Cuenta Cte.", icon: "📊" },
  { href: "/tickets", label: "Tickets", icon: "🔧" },
  { href: "/proveedores", label: "Proveedores", icon: "🔨" },
  { href: "/circulares", label: "Circulares", icon: "📢" },
  { href: "/sueldos", label: "Sueldos", icon: "👷" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-brand-600 flex flex-col">
      <div className="px-6 py-5 border-b border-brand-700">
        <h1 className="text-white font-bold text-lg leading-tight">
          Consorcio<br />
          <span className="text-blue-200 text-sm font-normal">Panel de administración</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
