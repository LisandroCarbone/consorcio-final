export const dynamic = 'force-dynamic';

import { query } from "@/lib/db";
import { createConsorcio } from "./actions";
import { ConsorciosTableClient } from "./ConsorciosTableClient";
import MaskedInput from "@/components/ui/MaskedInput";

interface ConsorcioRow {
  cuit: string;
  nombre: string;
  direccion: string;
  codigo_postal: string | null;
  categoria_edificio: string | null;
  banco: string | null;
  cant_uf: number | null;
  tiene_cochera: boolean;
  tiene_jardin: boolean;
  tiene_pileta: boolean;
  total_unidades: string;
  total_empleados: string;
  [key: string]: unknown;
}

async function getConsorcios() {
  return query<ConsorcioRow>(
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
              <ConsorciosTableClient consorcios={consorcios} />
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
                  <MaskedInput preset="cuit" name="cuit" required className="input" />
                </div>
                <div>
                  <label className="label">Código Postal</label>
                  <input name="codigo_postal" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Clave SUTERH</label>
                <input name="suterh_key" className="input" />
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Servicios centrales</p>
                <p className="text-xs text-gray-400 mb-2">Art. 6 CCT 589/10</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'tiene_ascensor', label: 'Ascensor' },
                    { name: 'tiene_agua_caliente_central', label: 'Agua caliente central' },
                    { name: 'tiene_calefaccion_central', label: 'Calefacción central' },
                    { name: 'tiene_aire_acondicionado_central', label: 'Aire acond. central' },
                    { name: 'tiene_cochera', label: 'Cocheras' },
                    { name: 'tiene_grupo_electrogeno', label: 'Grupo electrógeno' },
                    { name: 'tiene_pileta', label: 'Pileta' },
                    { name: 'tiene_jardin', label: 'Jardín' },
                    { name: 'tiene_seguridad_centralizada', label: 'Seguridad centralizada' },
                    { name: 'tiene_compactador', label: 'Compactador' },
                    { name: 'tiene_montacargas', label: 'Montacargas' },
                    { name: 'tiene_otros_servicios_centrales', label: 'Otros servicios centrales' },
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
