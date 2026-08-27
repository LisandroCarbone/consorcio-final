"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";

const generalLinks = [
  { href: "/administracion", label: "Administración", icon: "⚙️" },
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/consorcios", label: "Consorcios", icon: "🏢" },
  { href: "/ayuda", label: "Ayuda", icon: "❓" },
];

const sueldosSublinks = [
  { href: "/sueldos/empleados", label: "Empleados" },
  { href: "/sueldos/escalas", label: "Escalas" },
  { href: "/sueldos/novedades", label: "Novedades" },
  { href: "/sueldos/liquidaciones", label: "Liquidaciones" },
  { href: "/sueldos/sac", label: "SAC" },
  { href: "/configuracion/parametros", label: "Parámetros CCT" },
  { href: "/configuracion/arca", label: "Credenciales ARCA" },
];

const expensasSublinks = [
  { href: "/expensas", label: "Expensas" },
  { href: "/expensas/conciliacion-bancaria", label: "Conciliación Bancaria" },
];

const operationalLinks = [
  { href: "/finanzas/cuenta-corriente", label: "Cuenta Cte.", icon: "📊" },
  { href: "/finanzas/facturacion", label: "Facturación", icon: "🧾" },
  { href: "/proveedores", label: "Proveedores", icon: "🔨" },
  { href: "/tickets", label: "Tickets", icon: "🔧" },
  { href: "/circulares", label: "Circulares", icon: "📢" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const inSueldos =
    pathname.startsWith("/sueldos") ||
    pathname.startsWith("/configuracion/parametros") ||
    pathname.startsWith("/configuracion/arca");
  const [sueldosOpen, setSueldosOpen] = useState(inSueldos);
  const inExpensas = pathname.startsWith("/expensas");
  const [expensasOpen, setExpensasOpen] = useState(inExpensas);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (inSueldos) setSueldosOpen(true);
  }, [inSueldos]);

  useEffect(() => {
    if (inExpensas) setExpensasOpen(true);
  }, [inExpensas]);

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
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-brand-600 text-white p-2 rounded-lg shadow-lg print:hidden"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <aside className={clsx(
      "fixed inset-y-0 left-0 w-64 bg-brand-600 flex flex-col z-50 transition-transform duration-200 print:hidden",
      mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
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
            {/* Sueldos — expandible */}
            <button
              onClick={() => setSueldosOpen((o) => !o)}
              className={clsx(
                "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                inSueldos
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-brand-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-xl select-none">👷</span>
              <span className="flex-1 text-left">Sueldos</span>
              <span className="text-xs opacity-60">{sueldosOpen ? "▲" : "▼"}</span>
            </button>
            {sueldosOpen && (
              <div className="ml-9 space-y-0.5">
                {sueldosSublinks.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/20 text-white"
                          : "text-brand-200 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
            {/* Expensas — expandible */}
            <button
              onClick={() => setExpensasOpen((o) => !o)}
              className={clsx(
                "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                inExpensas
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-brand-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-xl select-none">💰</span>
              <span className="flex-1 text-left">Expensas</span>
              <span className="text-xs opacity-60">{expensasOpen ? "▲" : "▼"}</span>
            </button>
            {expensasOpen && (
              <div className="ml-9 space-y-0.5">
                {expensasSublinks.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/20 text-white"
                          : "text-brand-200 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
            {operationalLinks.map(renderLink)}

            {/* Logout Button */}
            <div className="pt-3 mt-3 border-t border-white/10">
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
                title="Cerrar sesión actual"
              >
                <span className="text-lg select-none">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

    </aside>
    </>
  );
}

