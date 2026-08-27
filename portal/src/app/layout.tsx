import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export const metadata: Metadata = {
  title: "Consorcio Admin",
  description: "Panel de administración de consorcios",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";
  const activePeriodoRaw = cookieStore.get("active_periodo")?.value;

  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const activePeriodo = activePeriodoRaw || defaultPeriod;
  const theme = cookieStore.get("theme")?.value || "default";

  let consorcios: Array<{ cuit: string; nombre: string }> = [];
  try {
    consorcios = await query<{ cuit: string; nombre: string }>(
      "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
    );
  } catch {
    consorcios = [];
  }

  return (
    <html lang="es" data-theme={theme}>
      <body>
        <AppShell
          consorcios={consorcios}
          activeCuit={activeCuit}
          activePeriodo={activePeriodo}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}

