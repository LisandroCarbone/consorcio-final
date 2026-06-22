import { query } from "@/lib/db";
import { sendCircular } from "./actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";

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

export default async function CircularesPage() {
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const consorcios = await getConsorcios();

  if (!activeCuit) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Circulares</h2>
        <ConsorcioRequerido
          consorcios={consorcios.map((c) => ({ cuit: c.id, nombre: c.nombre }))}
          seccion="el envío de circulares"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Circulares</h2>
      <p className="text-gray-500 text-sm mb-8">
        Enviá un aviso o comunicado a todos los vecinos de un consorcio por WhatsApp.
      </p>

      <div className="card p-6">
        <form action={sendCircular} className="space-y-5">
          <div>
            <label className="label">Consorcio *</label>
            <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed">
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
              className="input resize-none"
              placeholder={`Hola {{nombre}}!\n\nComunicamos que mañana se realizarán trabajos de mantenimiento en el ascensor entre las 9 y las 13hs.\n\nDisculpen las molestias.\nAdministración`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Usá <code className="bg-gray-100 px-1 rounded">{"{{nombre}}"}</code> para personalizar con el nombre del vecino.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">💡 Antes de enviar</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Los mensajes se envían de a uno con un intervalo de 300ms para evitar bloqueos</li>
              <li>Solo se envía a vecinos con número de WhatsApp registrado</li>
              <li>Verificá que el proveedor de WhatsApp (Twilio o Meta) esté configurado en las variables de entorno</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary px-8">
              📢 Enviar circular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
