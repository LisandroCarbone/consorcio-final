export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { sendCircular } from "./actions";

async function getConsorcios() {
  return query<{ id: number; nombre: string; total_con_whatsapp: string }>(
    `SELECT c.id, c.nombre,
            COUNT(p.id) FILTER (WHERE p.whatsapp IS NOT NULL) AS total_con_whatsapp
     FROM consorcios c
     LEFT JOIN unidades u ON u.consorcio_id=c.id
     LEFT JOIN ocupantes o ON o.unidad_id=u.id AND o.activo=true
     LEFT JOIN personas p ON p.id=o.persona_id
     GROUP BY c.id ORDER BY c.nombre`
  );
}

export default async function CircularesPage() {
  const consorcios = await getConsorcios();

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
            <select name="consorcio_id" required className="input">
              {consorcios.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.total_con_whatsapp} con WhatsApp)
                </option>
              ))}
            </select>
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
