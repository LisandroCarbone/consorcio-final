export const dynamic = 'force-dynamic';

import { query, queryOne } from "@/lib/db";
import { notFound } from "next/navigation";
import { createUnidad, createPersonaAndOcupante } from "../actions";

interface Props {
  params: Promise<{ id: string }>;
}

async function getData(id: number) {
  const [consorcio, unidades] = await Promise.all([
    queryOne<{ id: number; nombre: string; direccion: string; cuit: string | null; cbu: string | null }>(
      "SELECT * FROM consorcios WHERE id=$1",
      [id]
    ),
    query<{
      id: number; numero: string; coeficiente: string; tipo: string;
      ocupante_nombre: string | null; ocupante_email: string | null;
      ocupante_whatsapp: string | null; ocupante_rol: string | null;
    }>(
      `SELECT u.id, u.numero, u.coeficiente, u.tipo,
              p.nombre || ' ' || p.apellido AS ocupante_nombre,
              p.email AS ocupante_email,
              p.whatsapp AS ocupante_whatsapp,
              o.rol AS ocupante_rol
       FROM unidades u
       LEFT JOIN ocupantes o ON o.unidad_id=u.id AND o.activo=true AND o.rol='propietario'
       LEFT JOIN personas p ON p.id=o.persona_id
       WHERE u.consorcio_id=$1 ORDER BY u.numero`,
      [id]
    ),
  ]);
  return { consorcio, unidades };
}

export default async function ConsorcioDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = Number(id);
  const { consorcio, unidades } = await getData(numId);
  if (!consorcio) notFound();

  const coefTotal = unidades.reduce((acc, u) => acc + parseFloat(u.coeficiente), 0);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/consorcios" className="hover:underline text-brand-600">Consorcios</a> /
        </p>
        <h2 className="text-2xl font-bold text-gray-900">{consorcio.nombre}</h2>
        <p className="text-gray-500 text-sm">{consorcio.direccion}{consorcio.cuit ? ` · CUIT: ${consorcio.cuit}` : ""}</p>
      </div>

      {/* Unidades */}
      <div className="card mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Unidades <span className="text-gray-400 font-normal text-sm">({unidades.length})</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Coeficiente total: {coefTotal.toFixed(4)}</p>
        </div>
        {unidades.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Unidad</th>
                <th className="th">Tipo</th>
                <th className="th text-right">Coef.</th>
                <th className="th text-right">% del total</th>
                <th className="th">Propietario</th>
                <th className="th">Email / WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id} className="table-row hover:bg-gray-50">
                  <td className="td font-medium">{u.numero}</td>
                  <td className="td text-gray-500 capitalize">{u.tipo}</td>
                  <td className="td text-right font-mono text-sm">{parseFloat(u.coeficiente).toFixed(4)}</td>
                  <td className="td text-right text-sm text-gray-500">
                    {coefTotal > 0 ? ((parseFloat(u.coeficiente) / coefTotal) * 100).toFixed(2) : 0}%
                  </td>
                  <td className="td">{u.ocupante_nombre ?? <span className="text-gray-400 italic text-xs">Sin asignar</span>}</td>
                  <td className="td text-sm text-gray-500">{u.ocupante_email ?? "—"} {u.ocupante_whatsapp ? `· ${u.ocupante_whatsapp}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500 text-center">No hay unidades registradas</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nueva unidad */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nueva unidad</h3>
          <form action={createUnidad} className="space-y-3">
            <input type="hidden" name="consorcio_id" value={numId} />
            <div>
              <label className="label">Número *</label>
              <input name="numero" required className="input" placeholder="Ej: 1A, PH2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Piso</label>
                <input name="piso" className="input" placeholder="1" />
              </div>
              <div>
                <label className="label">Depto</label>
                <input name="departamento" className="input" placeholder="A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Coeficiente *</label>
                <input name="coeficiente" type="number" step="0.0001" required className="input" placeholder="0.0500" />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select name="tipo" className="input">
                  <option value="departamento">Departamento</option>
                  <option value="cochera">Cochera</option>
                  <option value="local">Local</option>
                  <option value="baulera">Baulera</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Agregar unidad</button>
          </form>
        </div>

        {/* Asignar ocupante */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Asignar propietario / inquilino</h3>
          <form action={createPersonaAndOcupante} className="space-y-3">
            <input type="hidden" name="consorcio_id" value={numId} />
            <div>
              <label className="label">Unidad *</label>
              <select name="unidad_id" required className="input">
                <option value="">Seleccionar...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.numero}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre *</label>
                <input name="nombre" required className="input" />
              </div>
              <div>
                <label className="label">Apellido *</label>
                <input name="apellido" required className="input" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">WhatsApp</label>
                <input name="whatsapp" className="input" placeholder="+5491112345678" />
              </div>
              <div>
                <label className="label">Rol</label>
                <select name="rol" className="input">
                  <option value="propietario">Propietario</option>
                  <option value="inquilino">Inquilino</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Asignar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
