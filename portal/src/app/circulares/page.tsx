import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { CircularesTableClient } from "./CircularesTableClient";
import { SendCircularForm } from "./SendCircularForm";
import { Send, History } from "lucide-react";

async function getConsorcios() {
  return query<{ id: string; nombre: string; total_con_whatsapp: string }>(
    `SELECT c.cuit AS id, c.nombre,
            COUNT(p.id) FILTER (WHERE p.whatsapp IS NOT NULL) AS total_con_whatsapp
     FROM app.consorcios c
     LEFT JOIN app.unidades u ON u.consorcio_cuit=c.cuit
     LEFT JOIN app.ocupantes o ON o.unidad_id=u.id AND o.activo=true
     LEFT JOIN app.personas p ON p.id=o.persona_id
     GROUP BY c.cuit ORDER BY c.nombre`
  );
}

async function getCirculares(consorcioCuit: string) {
  if (!consorcioCuit) return [];
  return query<{ id: number; consorcio_cuit: string; mensaje: string; created_at: string }>(
    "SELECT id, consorcio_cuit, mensaje, created_at::text FROM app.circulares WHERE consorcio_cuit = $1 ORDER BY created_at DESC",
    [consorcioCuit]
  );
}

export default async function CircularesPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const consorcios = await getConsorcios();
  const circulares = await getCirculares(activeCuit);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Circulares</h2>
        <ConsorcioRequerido
          consorcios={consorcios.map((c) => ({ cuit: c.id, nombre: c.nombre }))}
          seccion="el envío de circulares"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Circulares</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enviá y gestioná los comunicados internos enviados a los vecinos del consorcio por WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo - Historial de circulares (2/3 del ancho) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Historial de Comunicados</h3>
          </div>
          <div className="card overflow-hidden">
            <CircularesTableClient circulares={circulares} />
          </div>
        </div>

        {/* Lado Derecho - Formulario de envío (1/3 del ancho) */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-700">Nueva Circular</h3>
          </div>

          <div className="card p-6">
            <SendCircularForm activeCuit={activeCuit} consorcios={consorcios} />
          </div>
        </div>
      </div>
    </div>
  );
}
