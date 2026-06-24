import { query } from "@/lib/db";
import { sendCircular } from "./actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { CircularesTableClient } from "./CircularesTableClient";
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
            <form action={sendCircular} className="space-y-5">
              <div>
                <label className="label">Consorcio *</label>
                <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed text-sm">
                  {consorcios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.total_con_whatsapp} con WhatsApp)
                    </option>
                  ))}
                </select>
                <input type="hidden" name="consorcio_id" value={activeCuit} />
              </div>

              <div>
                <label className="label">Mensaje *</label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="input text-sm resize-none"
                  placeholder={`Hola {{nombre}}!\n\nComunicamos que mañana se realizarán trabajos de mantenimiento en el ascensor entre las 9 y las 13hs.\n\nDisculpen las molestias.\nAdministración`}
                />
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Usá <code className="bg-gray-100 px-1 rounded font-mono text-[10px]">{"{{nombre}}"}</code> para personalizar con el nombre del vecino.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700">
                <p className="font-semibold text-xs mb-1.5 flex items-center gap-1">
                  <span>💡</span> Antes de enviar
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed opacity-90">
                  <li>Los mensajes se envían de a uno con un intervalo de 300ms para evitar bloqueos</li>
                  <li>Solo se envía a vecinos con número de WhatsApp registrado</li>
                  <li>Verificá que el proveedor de WhatsApp esté configurado</li>
                </ul>
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-sm py-2">
                📢 Enviar circular
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
