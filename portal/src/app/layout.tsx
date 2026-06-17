import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

export const metadata: Metadata = {
  title: "Consorcio Admin",
  description: "Panel de administración de consorcios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Nav />
        <main className="ml-56 min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
