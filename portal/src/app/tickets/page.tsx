export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { createTicket, updateTicketEstado, addMensaje } from "./actions";
import { cookies } from "next/headers";
import { TicketsTableClient } from "./TicketsTableClient";

async function getTickets(filtro: string, activeCuit?: string) {
  const conds: string[] = [];

  if (filtro === "cerrados") {
    conds.push("t.estado IN ('resuelto','cerrado')");
  } else if (filtro !== "todos") {
    conds.push("t.estado NOT IN ('resuelto','cerrado')");
  }

  const params: unknown[] = [];
  if (activeCuit) {
    params.push(activeCuit);
    conds.push(`t.consorcio_cuit = $${params.length}`);
  }

  const where = conds.length > 0 ? "WHERE " + conds.join(" AND ") : "";

  return query<{
    id: number; titulo: string; descripcion: string | null; categoria: string;
    prioridad: string; estado: string; canal_origen: string; created_at: string;
    consorcio_nombre: string; unidad_numero: string | null; ocupante_nombre: string | null;
  }>(
    `SELECT t.*, c.nombre AS consorcio_nombre,
            u.uf::text AS unidad_numero,
            p.nombre||' '||p.apellido AS ocupante_nombre
     FROM app.tickets t
     JOIN app.consorcios c ON c.cuit = t.consorcio_cuit
     LEFT JOIN app.unidades u ON u.id = t.unidad_id
     LEFT JOIN app.personas p ON p.id = t.persona_id
     ${where}
     ORDER BY
       CASE t.prioridad WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
       t.created_at DESC`,
    params
  );
}

async function getTicketDetail(id: number) {
  const [ticket, mensajes] = await Promise.all([
    query<{
      id: number; titulo: string; descripcion: string | null; categoria: string;
      prioridad: string; estado: string; canal_origen: string; created_at: string;
      resolucion: string | null; consorcio_nombre: string;
    }>(
      `SELECT t.*, c.nombre AS consorcio_nombre FROM app.tickets t
       JOIN app.consorcios c ON c.cuit=t.consorcio_cuit WHERE t.id=$1`,
      [id]
    ),
    query<{ id: number; autor: string; contenido: string; es_interno: boolean; created_at: string }>(
      "SELECT * FROM app.ticket_mensajes WHERE ticket_id=$1 ORDER BY created_at",
      [id]
    ),
  ]);
  return { ticket: ticket[0] ?? null, mensajes };
}

const PRIORIDAD = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  baja: "bg-gray-100 text-gray-600",
} as Record<string, string>;

const ESTADO = {
  abierto: "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-blue-100 text-blue-700",
  esperando_proveedor: "bg-purple-100 text-purple-700",
  resuelto: "bg-green-100 text-green-700",
  cerrado: "bg-gray-100 text-gray-500",
} as Record<string, string>;

const ESTADOS_NEXT: Record<string, string[]> = {
  abierto: ["en_proceso", "cerrado"],
  en_proceso: ["esperando_proveedor", "resuelto", "cerrado"],
  esperando_proveedor: ["en_proceso", "resuelto", "cerrado"],
  resuelto: ["cerrado"],
};

const CATEGORIAS_LABEL: Record<string, string> = {
  "2": "Servicios Públicos",
  "3": "Abonos de Servicios",
  "4": "Mantenimiento Común",
  "5": "Reparaciones en Unidades",
  "6": "Gastos Bancarios",
  "7": "Gastos de Limpieza",
  "8": "Gastos Administración",
  "9": "Seguros",
  "10": "Otros Gastos",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; filtro?: string }>;
}) {
  const sp = await searchParams;
  const filtro = sp.filtro ?? "abiertos";
  const selectedId = sp.id ? Number(sp.id) : null;

  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const [tickets, consorcios, detail] = await Promise.all([
    getTickets(filtro, activeCuit),
    query<{ id: string; nombre: string }>("SELECT cuit AS id, nombre FROM app.consorcios ORDER BY nombre"),
    selectedId ? getTicketDetail(selectedId) : null,
  ]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tickets</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lado Izquierdo (3/5 de ancho) - Tabla de Tickets */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filtros */}
          <div className="flex gap-2">
            {["abiertos", "todos", "cerrados"].map((f) => (
              <a
                key={f}
                href={`/tickets?filtro=${f}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filtro === f ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </a>
            ))}
          </div>

          <div className="card overflow-hidden">
            <TicketsTableClient
              consorcioCuit={activeCuit}
              tickets={tickets}
              filtro={filtro}
              selectedId={selectedId}
            />
          </div>
        </div>

        {/* Lado Derecho (2/5 de ancho) - Detalle o Formulario Nuevo */}
        <div className="lg:col-span-2">
          {!detail?.ticket ? (
            /* Nuevo ticket (se muestra por defecto si no hay selección) */
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">➕</span>
                <h3 className="text-sm font-semibold text-gray-700">Nuevo ticket de reclamo</h3>
              </div>
              <form action={createTicket} className="space-y-3.5">
                <div>
                  <label className="label">Consorcio *</label>
                  {activeCuit ? (
                    <>
                      <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed">
                        {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <input type="hidden" name="consorcio_id" value={activeCuit} />
                    </>
                  ) : (
                    <select name="consorcio_id" required className="input">
                      <option value="">— seleccionar —</option>
                      {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="label">Título *</label>
                  <input name="titulo" required className="input" placeholder="Descripción breve del problema" />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <textarea name="descripcion" rows={3} className="input resize-none" placeholder="Detalle extendido..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Categoría</label>
                    <select name="categoria" className="input" defaultValue="10">
                      <option value="2">Servicios Públicos (2)</option>
                      <option value="3">Abonos de Servicios (3)</option>
                      <option value="4">Mantenimiento Común (4)</option>
                      <option value="5">Reparaciones en Unidades (5)</option>
                      <option value="6">Gastos Bancarios (6)</option>
                      <option value="7">Gastos de Limpieza (7)</option>
                      <option value="8">Gastos Administración (8)</option>
                      <option value="9">Seguros (9)</option>
                      <option value="10">Otros Gastos (10)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Prioridad</label>
                    <select name="prioridad" className="input">
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center">Crear ticket</button>
              </form>
            </div>
          ) : (
            /* Detalle del Ticket seleccionado */
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <a href={`/tickets?filtro=${filtro}`} className="text-xs text-brand-600 hover:underline font-semibold">
                    ← Nuevo ticket
                  </a>
                  <div className="flex gap-1">
                    <span className={`badge ${PRIORIDAD[detail.ticket.prioridad]}`}>{detail.ticket.prioridad}</span>
                    <span className={`badge ${ESTADO[detail.ticket.estado]}`}>{detail.ticket.estado.replace("_", " ")}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{detail.ticket.titulo}</h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  #{detail.ticket.id} · {detail.ticket.canal_origen} · {formatDate(detail.ticket.created_at)}
                </p>
                {detail.ticket.descripcion && (
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{detail.ticket.descripcion}</p>
                )}
                {/* Cambiar estado */}
                {(ESTADOS_NEXT[detail.ticket.estado] ?? []).length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {(ESTADOS_NEXT[detail.ticket.estado] ?? []).map((e) => (
                      <form key={e} action={updateTicketEstado.bind(null, detail.ticket!.id, e)}>
                        <button type="submit" className="btn-secondary text-[10px] py-1 px-2.5 capitalize">
                          → {e.replace("_", " ")}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </div>

              {/* Mensajes */}
              <div className="px-5 py-4 space-y-3 max-h-60 overflow-y-auto bg-gray-50/30 border-b border-gray-100">
                {detail.mensajes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sin notas internas ni mensajes</p>
                ) : detail.mensajes.map((m) => (
                  <div key={m.id} className={`rounded-lg p-3 ${m.es_interno ? "bg-yellow-50 border border-yellow-100" : "bg-white border border-gray-100"}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700">{m.autor}</span>
                      <span className="text-[10px] text-gray-400">{formatDate(m.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-700">{m.contenido}</p>
                    {m.es_interno && <p className="text-[9px] text-yellow-600 font-bold mt-1">🔒 Nota interna</p>}
                  </div>
                ))}
              </div>

              {/* Agregar nota */}
              <form action={addMensaje} className="px-5 py-4 space-y-3">
                <input type="hidden" name="ticket_id" value={detail.ticket.id} />
                <textarea name="contenido" required rows={2} placeholder="Agregar nota o actualización..." className="input text-xs resize-none" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" name="es_interno" value="true" className="rounded" />
                    Nota interna
                  </label>
                  <button type="submit" className="btn-primary py-1.5 text-xs">Agregar nota</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
