export const dynamic = "force-dynamic";

import { getAdministradores } from "./actions";

export default async function AdministracionPage() {
  const administradores = await getAdministradores();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Administración</h2>
        <a href="/administracion/nuevo" className="btn-primary">Nuevo administrador</a>
      </div>

      {administradores.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Sociedad</th>
                <th className="th">Administrador</th>
                <th className="th">CUIT</th>
                <th className="th">Email</th>
                <th className="th">Teléfono</th>
                <th className="th">Celular urgencias</th>
              </tr>
            </thead>
            <tbody>
              {administradores.map((a) => (
                <tr key={a.id} className="table-row hover:bg-gray-50">
                  <td className="td">
                    <a href={`/administracion/${a.id}`} className="block">
                      {a.nombre_sociedad ?? <span className="text-gray-400">—</span>}
                    </a>
                  </td>
                  <td className="td">
                    <a href={`/administracion/${a.id}`} className="font-medium text-gray-900">
                      {a.nombre_administrador}
                    </a>
                  </td>
                  <td className="td text-gray-600">{a.cuit}</td>
                  <td className="td text-gray-600">{a.email ?? "—"}</td>
                  <td className="td text-gray-600">{a.telefono ?? "—"}</td>
                  <td className="td text-gray-600">{a.celular_urgencias ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          No hay administradores registrados. Crea uno nuevo con el botón de arriba.
        </div>
      )}
    </div>
  );
}
