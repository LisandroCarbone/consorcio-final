export const dynamic = "force-dynamic";

import { queryOne } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateConsorcio } from "../../actions";
import { Suspense } from "react";
import { ActionFeedback } from "@/components/ui/ActionFeedback";

// Auto-category detection: CCT SUTERH defines category by UF count + amenities
function inferCategoria(cant_uf: number | null, amenities: { pileta: boolean; jardin: boolean; cochera: boolean; caldera: boolean }): string | null {
  if (!cant_uf) return null;
  // Rough thresholds (CCT SUTERH): ≥10 UF + amenity → 1°, ≥10 sin → 2°, ≥4 → 3°, resto → 4°
  const hasAmenity = amenities.pileta || amenities.jardin || amenities.cochera || amenities.caldera;
  if (cant_uf >= 10 && hasAmenity) return "1° Cat.";
  if (cant_uf >= 10) return "2° Cat.";
  if (cant_uf >= 4) return "3° Cat.";
  return "4° Cat.";
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarConsorcioPage({ params }: Props) {
  const { id } = await params;
  const c = await queryOne<{
    id: number; nombre: string; direccion: string; cuit: string | null;
    codigo_postal: string | null; nro_cta_suterh: string | null;
    cant_uf: number | null; categoria_edificio: string | null; banco: string | null;
    tiene_cochera: boolean; tiene_movimiento_coches: boolean; tiene_jardin: boolean;
    zona_desfavorable: boolean; tiene_pileta: boolean; tiene_caldera: boolean;
    intereses_mora_pct: string | null;
  }>("SELECT * FROM consorcios WHERE id = $1", [Number(id)]);

  if (!c) notFound();

  const sugerida = inferCategoria(c.cant_uf, {
    pileta: c.tiene_pileta, jardin: c.tiene_jardin,
    cochera: c.tiene_cochera, caldera: c.tiene_caldera,
  });

  const interesesPct = c.intereses_mora_pct
    ? (Number(c.intereses_mora_pct) * 100).toFixed(2)
    : "";

  const CHECKBOXES = [
    { name: "tiene_cochera", label: "Cochera", checked: c.tiene_cochera },
    { name: "tiene_movimiento_coches", label: "Mov. de coches", checked: c.tiene_movimiento_coches },
    { name: "tiene_jardin", label: "Jardín", checked: c.tiene_jardin },
    { name: "zona_desfavorable", label: "Zona desfavorable", checked: c.zona_desfavorable },
    { name: "tiene_pileta", label: "Pileta", checked: c.tiene_pileta },
    { name: "tiene_caldera", label: "Caldera", checked: c.tiene_caldera },
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
        <input type="hidden" name="id" value={c.id} />

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
            <input name="cuit" defaultValue={c.cuit ?? ""} className="input" placeholder="30-12345678-9" />
          </div>
          <div>
            <label className="label">Código Postal</label>
            <input name="codigo_postal" defaultValue={c.codigo_postal ?? ""} className="input" />
          </div>
          <div>
            <label className="label">N° Cta. SUTERH</label>
            <input name="nro_cta_suterh" defaultValue={c.nro_cta_suterh ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Cant. UF</label>
            <input name="cant_uf" type="number" defaultValue={c.cant_uf ?? ""} className="input" />
          </div>
          <div>
            <label className="label">
              Categoría edificio
              {sugerida && sugerida !== c.categoria_edificio && (
                <span className="ml-2 text-xs text-amber-600 font-normal">
                  (sugerida: {sugerida})
                </span>
              )}
            </label>
            <select name="categoria_edificio" defaultValue={c.categoria_edificio ?? ""} className="input">
              <option value="">— seleccionar —</option>
              <option>1° Cat.</option>
              <option>2° Cat.</option>
              <option>3° Cat.</option>
              <option>4° Cat.</option>
            </select>
            {sugerida && (
              <p className="text-xs text-gray-400 mt-0.5">
                Por UF + amenities el sistema sugiere: <strong>{sugerida}</strong>
              </p>
            )}
          </div>
          <div>
            <label className="label">Banco</label>
            <input name="banco" defaultValue={c.banco ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Intereses por mora (%)</label>
            <input
              name="intereses_mora_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={interesesPct}
              className="input"
              placeholder="Ej: 3.5 (definido en asamblea)"
            />
            <p className="text-xs text-gray-400 mt-0.5">Porcentaje mensual definido en asamblea</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amenities / Plus salarial</p>
          <div className="flex flex-wrap gap-5">
            {CHECKBOXES.map((f) => (
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

        <div className="flex justify-between items-center border-t pt-4">
          <a href={`/consorcios/${id}`} className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}
