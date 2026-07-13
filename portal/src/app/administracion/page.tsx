export const dynamic = "force-dynamic";

import { getAdministradores } from "./actions";
import { DeleteAdministradorButton } from "./DeleteAdministradorButton";
import { formatCuit, formatPhone } from "@/lib/format";

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
                <th className="th" />
              </tr>
            </thead>
            <tbody>
              {administradores.map((a) => (
                <tr key={a.id} className="group table-row hover:bg-gray-50">
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
                  <td className="td text-gray-600">{formatCuit(a.cuit)}</td>
                  <td className="td text-gray-600">{a.email ?? "—"}</td>
                  <td className="td text-gray-600">{formatPhone(a.telefono)}</td>
                  <td className="td text-gray-600">{formatPhone(a.celular_urgencias)}</td>
                  <td className="td text-right whitespace-nowrap">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/administracion/${a.id}`}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </a>
                      <DeleteAdministradorButton id={a.id} compact />
                    </div>
                  </td>
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
