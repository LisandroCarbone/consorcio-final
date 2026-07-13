import React from "react";
import { query, queryOne } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { createProveedor, createOrdenTrabajo, completarOrdenTrabajo } from "./actions";
import { cookies } from "next/headers";
import { ConsorcioRequerido } from "@/components/ui/ConsorcioRequerido";
import { ProveedoresTableClient } from "./ProveedoresTableClient";
import { NuevoProveedorForm } from "./NuevoProveedorForm";
import MaskedInput from "@/components/ui/MaskedInput";
import {
  ClipboardList,
  AlertTriangle,
  Users,
  PlusCircle,
  Settings,
  MessageSquareCode,
  FileCheck,
} from "lucide-react";

async function getData(activeCuit?: string) {
  const otWhereParams: unknown[] = [];
  let otWhereClause = "WHERE ot.estado NOT IN ('completada','cancelada')";
  if (activeCuit) {
    otWhereParams.push(activeCuit);
    otWhereClause += " AND ot.consorcio_cuit = $1";
  }

  const ticketParams: unknown[] = [];
  let ticketWhereClause = "WHERE t.estado NOT IN ('resuelto','cerrado')";
  if (activeCuit) {
    ticketParams.push(activeCuit);
    ticketWhereClause += " AND t.consorcio_cuit = $1";
  }

  const [proveedores, ordenes, consorcios, ticketsAbiertos, ticketsPendientes] = await Promise.all([
    query<{ id: number; nombre: string; rubro: string | null; telefono: string | null; whatsapp: string | null; activo: boolean }>(
      "SELECT id, nombre, rubro, telefono, whatsapp, activo FROM app.proveedores WHERE activo=true ORDER BY nombre"
    ),
    query<{
      id: number; descripcion: string; estado: string; fecha_programada: string | null;
      monto_presupuesto: string | null; proveedor_nombre: string | null; consorcio_nombre: string;
      ticket_id: number | null;
    }>(
      `SELECT ot.id, ot.descripcion, ot.estado, ot.fecha_programada, ot.monto_presupuesto,
              p.nombre AS proveedor_nombre, c.nombre AS consorcio_nombre, ot.ticket_id
       FROM app.ordenes_trabajo ot
       JOIN app.consorcios c ON c.cuit=ot.consorcio_cuit
       LEFT JOIN app.proveedores p ON p.id=ot.proveedor_id
       ${otWhereClause}
       ORDER BY ot.created_at DESC LIMIT 20`,
       otWhereParams
    ),
    query<{ id: string; nombre: string }>("SELECT cuit AS id, nombre FROM app.consorcios ORDER BY nombre"),
    query<{ id: number; titulo: string; consorcio_nombre: string }>(
      `SELECT t.id, t.titulo, c.nombre AS consorcio_nombre FROM app.tickets t
       JOIN app.consorcios c ON c.cuit=t.consorcio_cuit
       ${ticketWhereClause} ORDER BY t.created_at DESC`,
       ticketParams
    ),
    query<{ id: number; titulo: string; consorcio_nombre: string }>(
      `SELECT t.id, t.titulo, c.nombre AS consorcio_nombre 
       FROM app.tickets t
       JOIN app.consorcios c ON c.cuit=t.consorcio_cuit
       WHERE t.estado NOT IN ('resuelto','cerrado')
         AND NOT EXISTS (
           SELECT 1 FROM app.ordenes_trabajo ot 
           WHERE ot.ticket_id = t.id AND ot.estado NOT IN ('cancelada')
         )
         ${activeCuit ? "AND t.consorcio_cuit = $1" : ""}
       ORDER BY t.created_at DESC`,
       activeCuit ? [activeCuit] : []
    ),
  ]);
  return { proveedores, ordenes, consorcios, ticketsAbiertos, ticketsPendientes };
}

const ESTADO_OT: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmada: "bg-blue-100 text-blue-700",
  en_curso: "bg-purple-100 text-purple-700",
  completada: "bg-green-100 text-green-700",
  cancelada: "bg-gray-100 text-gray-500",
};

interface ProveedorRow {
  id: number;
  nombre: string;
  rubro: string | null;
  telefono: string | null;
  whatsapp: string | null;
  activo: boolean;
}

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket_id?: string; ot_completar?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const activeCuit = cookieStore.get("active_consorcio_cuit")?.value || "";

  const prefillTicketId = sp.ticket_id ? Number(sp.ticket_id) : null;

  const [{ proveedores, ordenes, consorcios, ticketsAbiertos, ticketsPendientes }, prefilledTicket] = await Promise.all([
    getData(activeCuit),
    prefillTicketId
      ? queryOne<{ id: number; titulo: string; descripcion: string | null }>(
          "SELECT id, titulo, descripcion FROM app.tickets WHERE id=$1",
          [prefillTicketId]
        )
      : Promise.resolve(null),
  ]);

  if (!activeCuit) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Proveedores</h2>
        <ConsorcioRequerido
          consorcios={consorcios.map((c) => ({ cuit: c.id, nombre: c.nombre }))}
          seccion="las órdenes de trabajo y proveedores"
        />
      </div>
    );
  }

  const otCompletarId = sp.ot_completar ? Number(sp.ot_completar) : null;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Proveedores</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Órdenes activas */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-400" />
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
                    <th className="th text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o) => {
                    const isCompletar = otCompletarId === o.id;
                    return (
                      <React.Fragment key={o.id}>
                        <tr className={`table-row hover:bg-gray-50 ${isCompletar ? "bg-green-50/20" : ""}`}>
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
                          <td className="td text-center">
                            {o.estado !== "completada" && o.estado !== "cancelada" && (
                              <a href={`?ot_completar=${isCompletar ? "" : o.id}`} className="text-xs text-brand-600 hover:underline whitespace-nowrap">
                                {isCompletar ? "Cerrar" : "Completar"}
                              </a>
                            )}
                          </td>
                        </tr>
                        {isCompletar && (
                          <tr className="bg-green-50 border-b border-green-100">
                            <td colSpan={6} className="px-5 py-4">
                              <form action={completarOrdenTrabajo} className="flex items-end gap-3 max-w-md">
                                <input type="hidden" name="ot_id" value={o.id} />
                                <div className="flex-1">
                                  <label className="label text-xs">Monto Final *</label>
                                  <MaskedInput
                                    preset="money"
                                    name="monto_final"
                                    required
                                    defaultValue={o.monto_presupuesto || ""}
                                    placeholder="0.00"
                                    className="input py-1 text-sm bg-white"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button type="submit" className="btn-primary py-1.5 px-3 text-xs justify-center shrink-0">
                                    Confirmar
                                  </button>
                                  <a href="?" className="btn-secondary py-1.5 px-3 text-xs justify-center shrink-0">
                                    Cancelar
                                  </a>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Tickets sin OT asignada */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-brand-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-gray-800 text-sm">Tickets sin OT ({ticketsPendientes.length})</h3>
              </div>
            </div>
            {ticketsPendientes.length === 0 ? (
              <p className="px-5 py-6 text-xs text-gray-400 text-center">Todos los tickets tienen OT asignada</p>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {ticketsPendientes.map((t) => (
                  <li key={t.id} className="p-3 hover:bg-gray-50 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-700 truncate">{t.titulo}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{t.consorcio_nombre} · #{t.id}</p>
                    </div>
                    <a
                      href={`?ticket_id=${t.id}`}
                      className="text-[10px] text-brand-600 font-bold hover:underline shrink-0 uppercase tracking-wider"
                    >
                      Asociar OT
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Lista de proveedores */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Proveedores registrados</h3>
            </div>
            <ProveedoresTableClient proveedores={proveedores} />
          </div>
        </div>

        <div className="space-y-5">
          {/* Nueva OT */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Nueva orden de trabajo</h3>
              </div>
              {prefilledTicket && (
                <a href="?" className="text-xs text-red-500 hover:underline">Limpiar selección</a>
              )}
            </div>
            <form action={createOrdenTrabajo} className="space-y-3">
              <div>
                <label className="label">Consorcio *</label>
                <select disabled value={activeCuit} className="input bg-gray-50 cursor-not-allowed">
                  {consorcios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <input type="hidden" name="consorcio_id" value={activeCuit} />
              </div>
              <div>
                <label className="label">Descripción *</label>
                <textarea
                  name="descripcion"
                  required
                  rows={3}
                  className="input resize-none"
                  placeholder="Qué hay que hacer..."
                  defaultValue={
                    prefilledTicket
                      ? `OT vinculada al ticket #${prefilledTicket.id}: ${prefilledTicket.titulo}\n${prefilledTicket.descripcion || ""}`
                      : ""
                  }
                />
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
                <select
                  name="ticket_id"
                  className="input"
                  defaultValue={prefilledTicket ? prefilledTicket.id : ""}
                  disabled={!!prefilledTicket}
                  style={prefilledTicket ? { pointerEvents: 'none', backgroundColor: '#f9fafb' } : {}}
                >
                  <option value="">Ninguno</option>
                  {/* Include the prefilled ticket if present so it renders correctly even if it's not in ticketsAbiertos */}
                  {prefilledTicket && (
                    <option key={prefilledTicket.id} value={prefilledTicket.id}>
                      #{prefilledTicket.id} — {prefilledTicket.titulo}
                    </option>
                  )}
                  {ticketsAbiertos
                    .filter((t) => !prefilledTicket || t.id !== prefilledTicket.id)
                    .map((t) => <option key={t.id} value={t.id}>#{t.id} — {t.titulo}</option>)
                  }
                </select>
                {prefilledTicket && <input type="hidden" name="ticket_id" value={prefilledTicket.id} />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Fecha programada</label>
                  <input name="fecha_programada" type="date" className="input" />
                </div>
                <div>
                  <label className="label">Presupuesto</label>
                  <MaskedInput preset="money" name="monto_presupuesto" className="input" placeholder="$" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center">Crear OT</button>
            </form>
          </div>

          {/* Nuevo proveedor */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <PlusCircle className="w-4.5 h-4.5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">Nuevo proveedor</h3>
            </div>
            <NuevoProveedorForm activeCuitConsorcio={activeCuit} />
          </div>
        </div>
      </div>
    </div>
  );
}
