export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import Link from "next/link";
import { createConsorcio } from "./actions";

async function getConsorcios() {
  return query<{
    cuit: string; nombre: string; direccion: string; codigo_postal: string | null;
    categoria_edificio: string | null; banco: string | null; cant_uf: number | null;
    tiene_cochera: boolean; tiene_jardin: boolean; tiene_pileta: boolean;
    total_unidades: string; total_empleados: string;
  }>(
    `SELECT c.cuit, c.nombre, c.direccion, c.codigo_postal,
            c.categoria_edificio, c.banco, c.cant_uf,
            c.tiene_cochera, c.tiene_jardin, c.tiene_pileta,
            COUNT(DISTINCT u.id) AS total_unidades,
            COUNT(DISTINCT e.cuil) AS total_empleados
     FROM app.consorcios c
     LEFT JOIN app.unidades u ON u.consorcio_cuit = c.cuit
     LEFT JOIN app.empleados e ON e.consorcio_cuit = c.cuit AND e.estado = 'activo'
     GROUP BY c.cuit ORDER BY c.nombre`
  );
}

const CAT_COLORS: Record<string, string> = {
  '1° Cat.': 'bg-purple-100 text-purple-700',
  '2° Cat.': 'bg-blue-100 text-blue-700',
  '3° Cat.': 'bg-green-100 text-green-700',
  '4° Cat.': 'bg-gray-100 text-gray-600',
};

export default async function ConsorciosPage() {
  const consorcios = await getConsorcios();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Consorcios</h2>
        <span className="text-sm text-gray-500">{consorcios.length} consorcio{consorcios.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Consorcios (Izquierda) */}
        <div className="lg:col-span-2 order-1 lg:order-first">
          {consorcios.length > 0 ? (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">Nombre</th>
                    <th className="th">Dirección</th>
                    <th className="th">CUIT</th>
                    <th className="th text-center">Cat.</th>
                    <th className="th text-center">UF</th>
                    <th className="th">Banco</th>
                    <th className="th text-center">Amenities</th>
                    <th className="th text-center">Empleados</th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody>
                  {consorcios.map((c) => (
                    <tr key={c.cuit} className="table-row hover:bg-gray-50">
                      <td className="td font-medium text-gray-900">{c.nombre}</td>
                      <td className="td text-gray-500 text-xs">{c.direccion}{c.codigo_postal ? ` (${c.codigo_postal})` : ''}</td>
                      <td className="td text-gray-500 text-xs font-mono">{c.cuit ?? '—'}</td>
                      <td className="td text-center">
                        {c.categoria_edificio ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[c.categoria_edificio] ?? 'bg-gray-100 text-gray-600'}`}>
                            {c.categoria_edificio}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="td text-center text-gray-700">{c.cant_uf ?? '—'}</td>
                      <td className="td text-gray-500 text-xs">{c.banco ?? '—'}</td>
                      <td className="td text-center text-gray-500 text-xs">
                        {[
                          c.tiene_cochera && '🚗',
                          c.tiene_jardin && '🌳',
                          c.tiene_pileta && '🏊',
                        ].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="td text-center text-gray-700">{c.total_empleados}</td>
                      <td className="td">
                        <div className="flex gap-3">
                          <Link href={`/consorcios/${c.cuit}`} className="text-brand-600 text-sm hover:underline font-medium">Ver →</Link>
                          <Link href={`/consorcios/${c.cuit}/editar`} className="text-gray-400 text-sm hover:underline">Editar</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-500">
              No hay consorcios registrados. Crea uno nuevo usando el panel de la derecha.
            </div>
          )}
        </div>

        {/* Formulario Nuevo Consorcio (Derecha) */}
        <div className="lg:col-span-1 order-2 lg:order-last">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Nuevo consorcio</h3>
            <form action={createConsorcio} className="space-y-3.5">
              <div>
                <label className="label">Nombre *</label>
                <input name="nombre" required className="input" />
              </div>
              <div>
                <label className="label">Dirección *</label>
                <input name="direccion" required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CUIT *</label>
                  <input name="cuit" required className="input" placeholder="30-12345678-9" />
                </div>
                <div>
                  <label className="label">Código Postal</label>
                  <input name="codigo_postal" className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Clave SUTERH</label>
                  <input name="suterh_key" className="input" />
                </div>
                <div>
                  <label className="label">Cant. UF</label>
                  <input name="cant_uf" type="number" className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoría edificio</label>
                  <select name="categoria_edificio" className="input">
                    <option value="">— seleccionar —</option>
                    <option>1° Cat.</option>
                    <option>2° Cat.</option>
                    <option>3° Cat.</option>
                    <option>4° Cat.</option>
                  </select>
                </div>
                <div>
                  <label className="label">Banco</label>
                  <input name="banco" className="input" />
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities / Plus salarial</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'tiene_cochera', label: '🚗 Cochera' },
                    { name: 'tiene_movimiento_coches', label: '🔄 Mov. coches' },
                    { name: 'tiene_jardin', label: '🌳 Jardín' },
                    { name: 'zona_desfavorable', label: '⚠️ Zona desf.' },
                    { name: 'tiene_pileta', label: '🏊 Pileta' },
                    { name: 'tiene_caldera', label: '🔥 Caldera' },
                  ].map((f) => (
                    <label key={f.name} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" name={f.name} value="true" className="rounded" />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" className="btn-primary w-full justify-center">Crear consorcio</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
