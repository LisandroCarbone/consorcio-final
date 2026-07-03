export const dynamic = "force-dynamic";

import { queryOne } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateConsorcio } from "../../actions";
import { Suspense } from "react";
import { ActionFeedback } from "@/components/ui/ActionFeedback";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarConsorcioPage({ params }: Props) {
  const { id } = await params;
  const c = await queryOne<{
    cuit: string; nombre: string; direccion: string;
    codigo_postal: string | null; suterh_key: string | null;
    cant_uf: number | null; categoria_edificio: string | null; banco: string | null;
    tiene_cochera: boolean; tiene_movimiento_coches: boolean; tiene_jardin: boolean;
    zona_desfavorable: boolean; tiene_pileta: boolean; tiene_caldera: boolean;
    tiene_ascensor: boolean; tiene_agua_caliente_central: boolean;
    tiene_calefaccion_central: boolean; tiene_aire_acondicionado_central: boolean;
    tiene_grupo_electrogeno: boolean; tiene_seguridad_centralizada: boolean;
    tiene_compactador: boolean; tiene_montacargas: boolean;
    tiene_otros_servicios_centrales: boolean;
    interest_rate: string | null;
    art_pct_variable: string | null; sv_costo_fijo: string | null;
    pct_cct_suterh: string | null; pct_cct_fateryh: string | null; pct_cct_seracarh: string | null;
  }>("SELECT * FROM app.consorcios WHERE cuit = $1", [id]);

  if (!c) notFound();

  const interesesPct = c.interest_rate ? (Number(c.interest_rate) * 100).toFixed(2) : "";
  const artPct = c.art_pct_variable ? (Number(c.art_pct_variable) * 100).toFixed(4) : "";
  const suterhPct = c.pct_cct_suterh ? (Number(c.pct_cct_suterh) * 100).toFixed(4) : "";
  const faterhPct = c.pct_cct_fateryh ? (Number(c.pct_cct_fateryh) * 100).toFixed(4) : "";
  const seracarhPct = c.pct_cct_seracarh ? (Number(c.pct_cct_seracarh) * 100).toFixed(4) : "";

  const SERVICIOS_CENTRALES = [
    { name: "tiene_ascensor", label: "Ascensor", checked: c.tiene_ascensor },
    { name: "tiene_agua_caliente_central", label: "Agua caliente central", checked: c.tiene_agua_caliente_central },
    { name: "tiene_calefaccion_central", label: "Calefacción central", checked: c.tiene_calefaccion_central },
    { name: "tiene_aire_acondicionado_central", label: "Aire acondicionado central", checked: c.tiene_aire_acondicionado_central },
    { name: "tiene_cochera", label: "Cocheras", checked: c.tiene_cochera },
    { name: "tiene_grupo_electrogeno", label: "Grupo electrógeno", checked: c.tiene_grupo_electrogeno },
    { name: "tiene_pileta", label: "Pileta", checked: c.tiene_pileta },
    { name: "tiene_jardin", label: "Jardín", checked: c.tiene_jardin },
    { name: "tiene_seguridad_centralizada", label: "Seguridad centralizada", checked: c.tiene_seguridad_centralizada },
    { name: "tiene_compactador", label: "Compactador", checked: c.tiene_compactador },
    { name: "tiene_montacargas", label: "Montacargas", checked: c.tiene_montacargas },
    { name: "tiene_otros_servicios_centrales", label: "Otros servicios centrales", checked: c.tiene_otros_servicios_centrales },
  ];

  return (
    <div className="max-w-2xl">
      <Suspense><ActionFeedback /></Suspense>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/consorcios" className="hover:underline text-brand-600">Consorcios</a>
          {" / "}
          <a href={`/consorcios/${id}`} className="hover:underline text-brand-600">{c.nombre}</a>
          {" / "}
          <span>Editar</span>
        </p>
        <h2 className="text-2xl font-bold text-gray-900">Editar consorcio</h2>
      </div>

      <form action={updateConsorcio} className="card p-6 space-y-5">
        <input type="hidden" name="cuit" value={c.cuit} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre *</label>
            <input name="nombre" required defaultValue={c.nombre} className="input" />
          </div>
          <div>
            <label className="label">Dirección *</label>
            <input name="direccion" required defaultValue={c.direccion} className="input" />
          </div>
          <div>
            <label className="label">CUIT</label>
            <input defaultValue={c.cuit} className="input bg-gray-100 cursor-not-allowed" readOnly disabled />
          </div>
          <div>
            <label className="label">Código Postal</label>
            <input name="codigo_postal" defaultValue={c.codigo_postal ?? ""} className="input" />
          </div>
          <div>
            <label className="label">N° Cta. SUTERH</label>
            <input name="nro_cta_suterh" defaultValue={c.suterh_key ?? ""} className="input" />
          </div>
          <div>
            <label className="label">UF p/ Retiro de Residuos</label>
            <input name="cant_uf" type="number" defaultValue={c.cant_uf ?? ""} className="input" />
            <p className="text-xs text-gray-400 mt-0.5">Solo las UF alcanzadas por el servicio de retiro</p>
          </div>
          <div>
            <label className="label">Categoría edificio</label>
            <select name="categoria_edificio" defaultValue={c.categoria_edificio ?? ""} className="input">
              <option value="">— seleccionar —</option>
              <option>1° Cat.</option>
              <option>2° Cat.</option>
              <option>3° Cat.</option>
              <option>4° Cat.</option>
            </select>
            <p className="text-xs text-gray-400 mt-0.5">Según Art. 6 CCT 589/10</p>
          </div>
          <div>
            <label className="label">Banco</label>
            <input name="banco" defaultValue={c.banco ?? ""} className="input" />
          </div>
          <div className="col-span-2">
            <label className="label">Intereses por mora (%)</label>
            <input
              name="intereses_mora_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={interesesPct}
              className="input w-40"
              placeholder="Ej: 3.5"
            />
            <p className="text-xs text-gray-400 mt-0.5">Porcentaje mensual definido en asamblea</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Servicios centrales</p>
          <p className="text-xs text-gray-400 mb-3">Art. 6 CCT 589/10 — determinan la categoría del edificio</p>
          <div className="grid grid-cols-2 gap-2">
            {SERVICIOS_CENTRALES.map((f) => (
              <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name={f.name}
                  value="true"
                  defaultChecked={f.checked}
                  className="rounded"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cargas sociales patronales</p>
          <p className="text-xs text-gray-400 -mt-2">Porcentajes sobre remuneración bruta. Dejar vacío para usar el valor legal vigente por defecto.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ART % variable</label>
              <div className="relative">
                <input name="art_pct_variable" type="number" step="0.0001" min="0" max="100"
                  defaultValue={artPct} className="input pr-8" placeholder="Ej: 6.39" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="label">SCVO costo fijo (por empleado)</label>
              <div className="relative">
                <input name="sv_costo_fijo" type="number" step="0.01" min="0"
                  defaultValue={c.sv_costo_fijo ?? ""} className="input pl-6" placeholder="424.62" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              </div>
            </div>
            <div>
              <label className="label">SUTERH %</label>
              <div className="relative">
                <input name="pct_cct_suterh" type="number" step="0.0001" min="0" max="100"
                  defaultValue={suterhPct} className="input pr-8" placeholder="4.5 (default)" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="label">FATERYH %</label>
              <div className="relative">
                <input name="pct_cct_fateryh" type="number" step="0.0001" min="0" max="100"
                  defaultValue={faterhPct} className="input pr-8" placeholder="6.5 (default)" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="label">FATERYH SERACARH %</label>
              <div className="relative">
                <input name="pct_cct_seracarh" type="number" step="0.0001" min="0" max="100"
                  defaultValue={seracarhPct} className="input pr-8" placeholder="0.5 (default)" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <a href={`/consorcios/${id}`} className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}
