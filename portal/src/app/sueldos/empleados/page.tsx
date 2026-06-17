export const dynamic = 'force-dynamic';

import { pool } from "@/lib/db";
import Link from "next/link";

async function getData() {
  const { rows: consorcios } = await pool.query(
    "SELECT id, nombre FROM app.consorcios ORDER BY nombre"
  );
  const { rows: empleados } = await pool.query(`
    SELECT e.*,
           c.nombre AS consorcio_nombre,
           EXTRACT(YEAR FROM AGE(NOW(), e.fecha_ingreso))::int AS antiguedad_anios
    FROM app.empleados_edificio e
    JOIN app.consorcios c ON c.id = e.consorcio_id
    WHERE e.estado = 'activo'
    ORDER BY c.nombre, e.nombre
  `);
  return { consorcios, empleados };
}

const JORNADA_BADGE: Record<string, string> = {
  Completa: 'bg-green-100 text-green-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Suplente: 'bg-gray-100 text-gray-500',
};

const FUNCION_SHORT: Record<string, string> = {
  'Encargado Permanente con vivienda': 'Enc. Perm. c/viv.',
  'Encargado Permanente sin vivienda': 'Enc. Perm. s/viv.',
  'Encargado No Permanente con vivienda': 'Enc. No Perm. c/viv.',
  'Encargado No Permanente Sin vivienda': 'Enc. No Perm. s/viv.',
  'Ayudante Media jornada': 'Ayudante Media',
  'Personal Vigilancia Diurna': 'Vigilancia Diurna',
  'Personal Vigilancia Nocturna': 'Vigilancia Nocturna',
  'Suplente eventual': 'Suplente',
};

export default async function EmpleadosPage() {
  const { consorcios, empleados } = await getData();

  const grouped = consorcios
    .map((c: any) => ({
      ...c,
      empleados: empleados.filter((e: any) => e.consorcio_id === c.id),
    }))
    .filter((g: any) => g.empleados.length > 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-sm text-gray-500 mt-0.5">{empleados.length} empleados activos en {grouped.length} consorcios</p>
        </div>
        <Link href="/sueldos/empleados/nuevo" className="btn-primary">
          + Agregar empleado
        </Link>
      </div>

      {grouped.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay empleados registrados.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((g: any) => (
            <div key={g.id} className="card overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">{g.nombre}</h2>
                <span className="text-xs text-gray-400">{g.empleados.length} empleado{g.empleados.length !== 1 ? 's' : ''}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-400 text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-3 py-2">CUIL</th>
                    <th className="px-3 py-2">Función</th>
                    <th className="px-3 py-2">Jornada</th>
                    <th className="px-3 py-2 text-center">Cat.</th>
                    <th className="px-3 py-2">Obra Social</th>
                    <th className="px-3 py-2">Banco</th>
                    <th className="px-3 py-2 text-center">Plus</th>
                    <th className="px-3 py-2 text-center">Ant.</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {g.empleados.map((e: any) => {
                    const plus = [
                      e.retiro_residuos && '🗑️',
                      e.plus_cocheras && '🚗',
                      e.plus_movimiento_coches && '🔄',
                      e.plus_jardin && '🌳',
                      e.tiene_pileta && '🏊',
                      e.plus_zona_desfavorable && '⚠️',
                      e.tiene_titulo && '🎓',
                    ].filter(Boolean);

                    return (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {e.nombre}
                          {e.tiene_vivienda && (
                            <span className="ml-1.5 text-xs text-blue-500" title="Con vivienda">🏠</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-400 font-mono text-xs">{e.cuil}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">
                          {FUNCION_SHORT[e.funcion] ?? e.funcion}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JORNADA_BADGE[e.jornada] ?? 'bg-gray-100 text-gray-500'}`}>
                            {e.jornada}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 text-xs">{e.categoria_edificio}°</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{e.obra_social}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{e.banco ?? '—'}</td>
                        <td className="px-3 py-3 text-center text-sm">
                          {plus.length > 0 ? plus.join(' ') : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600 text-xs">
                          {e.antiguedad_anios > 0 ? `${e.antiguedad_anios}a` : '<1a'}
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/sueldos/empleados/${e.id}/editar`}
                            className="text-brand-600 hover:underline text-xs"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
