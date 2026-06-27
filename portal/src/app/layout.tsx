import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { TopBar } from "@/components/ui/TopBar";
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

  const consorcios = await query<{ cuit: string; nombre: string }>(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  return (
    <html lang="es" data-theme={theme}>
      <body>
        <div className="print:hidden">
          <Nav />
        </div>
        <div className="ml-64 print:ml-0 flex flex-col min-h-screen">
          <div className="print:hidden">
            <TopBar consorcios={consorcios} activeCuit={activeCuit} activePeriodo={activePeriodo} />
          </div>
          <main className="flex-1 p-8 print:p-0 bg-gray-50 print:bg-white">{children}</main>
        </div>
      </body>
    </html>
  );
}

