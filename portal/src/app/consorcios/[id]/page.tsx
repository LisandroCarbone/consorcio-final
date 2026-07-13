export const dynamic = 'force-dynamic';

import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { notFound } from "next/navigation";
import { createUnidad, createPersonaAndOcupante } from "../actions";
import { formatCuit, formatPhone } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

async function getData(cuit: string) {
  const [consorcio, unidades] = await Promise.all([
    queryOne<{ cuit: string; nombre: string; direccion: string; cbu: string | null }>(
      "SELECT * FROM app.consorcios WHERE cuit=$1",
      [cuit]
    ),
    query<{
      id: number; uf: string; uf_numero: number | null; coef_a: string; coef_b: string; tipo: string;
      propietario_nombre: string | null; propietario_email: string | null; propietario_whatsapp: string | null;
      inquilino_nombre: string | null; inquilino_email: string | null; inquilino_whatsapp: string | null;
    }>(
      `SELECT u.id, u.uf, u.uf_numero, u.coef_a, u.coef_b, u.tipo,
              prop.nombre || ' ' || prop.apellido AS propietario_nombre,
              prop.email AS propietario_email,
              prop.whatsapp AS propietario_whatsapp,
              inq.nombre || ' ' || inq.apellido AS inquilino_nombre,
              inq.email AS inquilino_email,
              inq.whatsapp AS inquilino_whatsapp
       FROM app.unidades u
       LEFT JOIN app.ocupantes o_prop ON o_prop.unidad_id=u.id AND o_prop.activo=true AND o_prop.rol='propietario'
       LEFT JOIN app.personas prop ON prop.id=o_prop.persona_id
       LEFT JOIN app.ocupantes o_inq ON o_inq.unidad_id=u.id AND o_inq.activo=true AND o_inq.rol='inquilino'
       LEFT JOIN app.personas inq ON inq.id=o_inq.persona_id
       WHERE u.consorcio_cuit=$1
       ORDER BY u.uf_numero NULLS LAST, u.uf`,
      [cuit]
    ),
  ]);
  return { consorcio, unidades };
}

export default async function ConsorcioDetailPage({ params }: Props) {
  const { id } = await params;
  const { consorcio, unidades } = await getData(id);
  if (!consorcio) notFound();

  const coefATotal = unidades.reduce((acc, u) => acc + parseFloat(u.coef_a), 0);
  const coefBTotal = unidades.reduce((acc, u) => acc + parseFloat(u.coef_b), 0);

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/consorcios" className="hover:underline text-brand-600">Consorcios</a>
          {" / "}
          <span>Detalle</span>
        </p>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{consorcio.nombre}</h2>
          <Link href={`/consorcios/${id}/editar`} className="btn-secondary text-sm px-3 py-1">
            Editar
          </Link>
        </div>
        <p className="text-gray-500 text-sm">{consorcio.direccion}{consorcio.cuit ? ` · CUIT: ${formatCuit(consorcio.cuit)}` : ""}</p>
      </div>

      {/* Unidades */}
      <div className="card mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Unidades <span className="text-gray-400 font-normal text-sm">({unidades.length})</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Coeficiente A total: {coefATotal.toFixed(4)} · Coeficiente B total: {coefBTotal.toFixed(4)}</p>
        </div>
        {unidades.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">UF</th>
                <th className="th">Unidad</th>
                <th className="th">Tipo</th>
                <th className="th text-right">Coef. A</th>
                <th className="th text-right">Coef. B</th>
                <th className="th">Propietario</th>
                <th className="th">Email Prop.</th>
                <th className="th">WhatsApp Prop.</th>
                <th className="th">Inquilino</th>
                <th className="th">Email Inq.</th>
                <th className="th">WhatsApp Inq.</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id} className="table-row hover:bg-gray-50">
                  <td className="td font-mono text-gray-500 text-sm text-center w-12">{u.uf_numero ?? "—"}</td>
                  <td className="td font-medium">{u.uf}</td>
                  <td className="td text-gray-500 capitalize">{u.tipo}</td>
                  <td className="td text-right font-mono text-sm">{parseFloat(u.coef_a).toFixed(4)}</td>
                  <td className="td text-right font-mono text-sm">{parseFloat(u.coef_b).toFixed(4)}</td>
                  <td className="td font-medium text-gray-800">{u.propietario_nombre ?? <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>}</td>
                  <td className="td text-xs text-gray-600 font-mono">{u.propietario_email ?? "—"}</td>
                  <td className="td text-xs text-gray-600 font-mono">{formatPhone(u.propietario_whatsapp)}</td>
                  <td className="td font-medium text-gray-800">{u.inquilino_nombre ?? <span className="text-gray-400 italic text-xs font-normal">Sin asignar</span>}</td>
                  <td className="td text-xs text-gray-600 font-mono">{u.inquilino_email ?? "—"}</td>
                  <td className="td text-xs text-gray-600 font-mono">{formatPhone(u.inquilino_whatsapp)}</td>
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
            <input type="hidden" name="consorcio_cuit" value={id} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">N° UF</label>
                <input name="uf_numero" type="number" min="1" className="input" placeholder="3" />
              </div>
              <div className="col-span-2">
                <label className="label">Unidad *</label>
                <input name="uf" required className="input" placeholder="Ej: 1-03, LOC 1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Coeficiente A *</label>
                <input name="coef_a" type="number" step="0.0001" required className="input" placeholder="0.0500" />
              </div>
              <div>
                <label className="label">Coeficiente B</label>
                <input name="coef_b" type="number" step="0.0001" className="input" placeholder="0.0500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Piso</label>
                <input name="piso" className="input" placeholder="1" />
              </div>
              <div>
                <label className="label">Depto</label>
                <input name="depto" className="input" placeholder="A" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Agregar unidad</button>
          </form>
        </div>

        {/* Asignar ocupante */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Asignar propietario / inquilino</h3>
          <form action={createPersonaAndOcupante} className="space-y-3">
            <input type="hidden" name="consorcio_cuit" value={id} />
            <div>
              <label className="label">Unidad *</label>
              <select name="unidad_id" required className="input">
                <option value="">Seleccionar...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.uf}</option>
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
