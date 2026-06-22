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

  const consorcios = await query<{ cuit: string; nombre: string }>(
    "SELECT cuit, nombre FROM app.consorcios ORDER BY nombre"
  );

  return (
    <html lang="es">
      <body>
        <Nav />
        <div className="ml-56 flex flex-col min-h-screen">
          <TopBar consorcios={consorcios} activeCuit={activeCuit} />
          <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}

