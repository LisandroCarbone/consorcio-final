export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { createProveedor, createOrdenTrabajo } from "./actions";

async function getData() {
  const [proveedores, ordenes, consorcios, ticketsAbiertos] = await Promise.all([
    query<{ id: number; nombre: string; rubro: string | null; telefono: string | null; whatsapp: string | null; activo: boolean }>(
      "SELECT id, nombre, rubro, telefono, whatsapp, activo FROM proveedores WHERE activo=true ORDER BY nombre"
    ),
    query<{
      id: number; descripcion: string; estado: string; fecha_programada: string | null;
      monto_presupuesto: string | null; proveedor_nombre: string | null; consorcio_nombre: string;
    }>(
      `SELECT ot.id, ot.descripcion, ot.estado, ot.fecha_programada, ot.monto_presupuesto,
              p.nombre AS proveedor_nombre, c.nombre AS consorcio_nombre
       FROM ordenes_trabajo ot
       JOIN consorcios c ON c.id=ot.consorcio_id
       LEFT JOIN proveedores p ON p.id=ot.proveedor_id
       WHERE ot.estado NOT IN ('completada','cancelada')
       ORDER BY ot.created_at DESC LIMIT 20`
    ),
    query<{ id: number; nombre: string }>("SELECT id, nombre FROM consorcios ORDER BY nombre"),
    query<{ id: number; titulo: string; consorcio_nombre: string }>(
      `SELECT t.id, t.titulo, c.nombre AS consorcio_nombre FROM tickets t
       JOIN consorcios c ON c.id=t.consorcio_id
       WHERE t.estado NOT IN ('resuelto','cerrado') ORDER BY t.created_at DESC`
    ),
  ]);
  return { proveedores, ordenes, consorcios, ticketsAbiertos };
}

const ESTADO_OT: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmada: "bg-blue-100 text-blue-700",
  en_curso: "bg-purple-100 text-purple-700",
  completada: "bg-green-100 text-green-700",
  cancelada: "bg-gray-100 text-gray-500",
};

export default async function ProveedoresPage() {
  const { proveedores, ordenes, consorcios, ticketsAbiertos } = await getData();

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Proveedores</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Órdenes activas */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Órdenes de trabajo activas</h3>
            </div>
            {ordenes.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">No hay órdenes activas</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Descripción</th>
                    <th className="th">Proveedor</th>
                    <th className="th text-center">Estado</th>
                    <th className="th">Fecha prog.</th>
                    <th className="th text-right">Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => (
                    <tr key={o.id} className="table-row hover:bg-gray-50">
                      <td className="td">
                        <p className="text-sm font-medium">{o.descripcion}</p>
                        <p className="text-xs text-gray-400">{o.consorcio_nombre}</p>
                      </td>
                      <td className="td text-sm text-gray-600">{o.proveedor_nombre ?? <span className="italic text-gray-400">Sin asignar</span>}</td>
                      <td className="td text-center">
                        <span className={`badge ${ESTADO_OT[o.estado] ?? ""}`}>{o.estado.replace("_", " ")}</span>
                      </td>
                      <td className="td text-sm text-gray-500">{formatDate(o.fecha_programada)}</td>
                      <td className="td text-right font-mono text-sm">
                        {o.monto_presupuesto ? formatMoney(o.monto_presupuesto) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Lista de proveedores */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Proveedores registrados</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">Nombre</th>
                  <th className="th">Rubro</th>
                  <th className="th">Teléfono</th>
                  <th className="th">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id} className="table-row hover:bg-gray-50">
                    <td className="td font-medium">{p.nombre}</td>
                    <td className="td text-gray-500 capitalize">{p.rubro ?? "—"}</td>
                    <td className="td text-sm text-gray-500">{p.telefono ?? "—"}</td>
                    <td className="td text-sm text-gray-500">{p.whatsapp ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          {/* Nueva OT */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nueva orden de trabajo</h3>
            <form action={createOrdenTrabajo} className="space-y-3">
              <div>
                <label className="label">Consorcio *</label>
                <select name="consorcio_id" required className="input">
                  {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descripción *</label>
                <textarea name="descripcion" required rows={2} className="input resize-none" placeholder="Qué hay que hacer..." />
              </div>
              <div>
                <label className="label">Proveedor</label>
                <select name="proveedor_id" className="input">
                  <option value="">Sin asignar</option>
                  {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.rubro ? `(${p.rubro})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ticket relacionado</label>
                <select name="ticket_id" className="input">
                  <option value="">Ninguno</option>
                  {ticketsAbiertos.map((t) => <option key={t.id} value={t.id}>#{t.id} — {t.titulo}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Fecha programada</label>
                  <input name="fecha_programada" type="date" className="input" />
                </div>
                <div>
                  <label className="label">Presupuesto</label>
                  <input name="monto_presupuesto" type="number" step="0.01" className="input" placeholder="$" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Crear OT</button>
            </form>
          </div>

          {/* Nuevo proveedor */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuevo proveedor</h3>
            <form action={createProveedor} className="space-y-3">
              <div>
                <label className="label">Nombre *</label>
                <input name="nombre" required className="input" />
              </div>
              <div>
                <label className="label">Rubro</label>
                <input name="rubro" className="input" placeholder="plomería, electricidad..." />
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input name="whatsapp" className="input" placeholder="+5491112345678" />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Registrar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
