export const dynamic = "force-dynamic";

import { fetchAuditLogs } from "./actions";
import { AuditDetailRow } from "./AuditDetailRow";

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const entityType = typeof sp.entity_type === "string" ? sp.entity_type : undefined;
  const consorcioCuit = typeof sp.consorcio_cuit === "string" ? sp.consorcio_cuit : undefined;
  const dateFrom = typeof sp.from === "string" ? sp.from : undefined;
  const dateTo = typeof sp.to === "string" ? sp.to : undefined;
  const page = Number(sp.page ?? 1) || 1;
  const pageSize = 50;

  const { rows, total } = await fetchAuditLogs({
    entityType,
    consorcioCuit,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (entityType) params.set("entity_type", entityType);
    if (consorcioCuit) params.set("consorcio_cuit", consorcioCuit);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (page) params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    return `?${params.toString()}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Auditoría</h2>
      </div>

      <form method="get" className="card p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo de entidad</label>
          <input
            type="text"
            name="entity_type"
            defaultValue={entityType}
            placeholder="ej: liquidacion"
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">CUIT consorcio</label>
          <input
            type="text"
            name="consorcio_cuit"
            defaultValue={consorcioCuit}
            className="input"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input type="date" name="from" defaultValue={dateFrom} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input type="date" name="to" defaultValue={dateTo} className="input" />
        </div>
        <button type="submit" className="btn-primary">Filtrar</button>
      </form>

      {rows.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Fecha</th>
                <th className="th">Usuario</th>
                <th className="th">Acción</th>
                <th className="th">Entidad</th>
                <th className="th">ID</th>
                <th className="th">Consorcio</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <AuditDetailRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">
          No hay registros de auditoría para los filtros aplicados.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Página {page} de {totalPages} — {total} registros
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={buildQuery({ page: page - 1 })} className="btn-secondary">
                Anterior
              </a>
            )}
            {page < totalPages && (
              <a href={buildQuery({ page: page + 1 })} className="btn-secondary">
                Siguiente
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
