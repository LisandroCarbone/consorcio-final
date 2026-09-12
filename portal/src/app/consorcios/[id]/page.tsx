export const dynamic = 'force-dynamic';

import { query, queryOne } from "@/lib/db";
import { notFound } from "next/navigation";
import { createUnidad, createPersonaAndOcupante } from "../actions";
import { UnidadRow } from "./UnidadRow";
import { InlineEditCell } from "./InlineEditCell";
import { ConsorcioToggleField, ConsorcioSelectField } from "./ConsorcioFieldControls";
import { updateConsorcioField } from "./actions";
import { formatCuit } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

interface Propietario {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  dni: string | null;
  email: string | null;
  whatsapp: string | null;
}

interface Inquilino {
  ocupante_id: number;
  persona_id: number;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  whatsapp: string | null;
}

interface CbuEntry {
  cbu_o_cuit: string;
  nombre_referencia: string | null;
}

interface ConsorcioDetalle {
  [key: string]: unknown;
  cuit: string;
  nombre: string;
  direccion: string;
  codigo_postal: string | null;
  suterh_key: string | null;
  clave_suterh: string | null;
  cant_uf: number | null;
  uf_retiro_residuos: number | null;
  categoria_edificio: string | null;
  banco: string | null;
  tiene_cochera: boolean;
  tiene_movimiento_coches: boolean;
  tiene_jardin: boolean;
  zona_desfavorable: boolean;
  tiene_pileta: boolean;
  tiene_caldera: boolean;
  tiene_ascensor: boolean;
  tiene_agua_caliente_central: boolean;
  tiene_calefaccion_central: boolean;
  tiene_aire_acondicionado_central: boolean;
  tiene_grupo_electrogeno: boolean;
  tiene_seguridad_centralizada: boolean;
  tiene_compactador: boolean;
  tiene_montacargas: boolean;
  tiene_otros_servicios_centrales: boolean;
  interest_rate: string | null;
  tipo_expensas: string;
  formato_cobro: string;
  monto_fijo_default: string | null;
  pct_expensa_a: string;
  fondo_obra: string | null;
  fondo_obra_activo: boolean;
  divisor_b: string | null;
}

async function getData(cuit: string) {
  const [consorcio, unidades] = await Promise.all([
    queryOne<ConsorcioDetalle>(
      "SELECT * FROM app.consorcios WHERE cuit=$1",
      [cuit]
    ),
    query<{
      id: number; uf: string; uf_numero: number | null; coef_a: string; coef_b: string; tipo: string;
      propietarios: Propietario[] | null;
      inquilino_ocupante_id: number | null; inquilino_persona_id: number | null;
      inquilino_nombre: string | null; inquilino_apellido: string | null;
      inquilino_email: string | null; inquilino_whatsapp: string | null;
      cbu_entries: CbuEntry[] | null;
    }>(
      `SELECT u.id, u.uf, u.uf_numero, u.coef_a, u.coef_b, u.tipo,
              COALESCE(
                (SELECT json_agg(json_build_object(
                    'ocupante_id', o_prop.id,
                    'persona_id', prop.id,
                    'nombre', prop.nombre,
                    'apellido', prop.apellido,
                    'dni', prop.dni,
                    'email', prop.email,
                    'whatsapp', prop.whatsapp
                  ) ORDER BY o_prop.id)
                 FROM app.ocupantes o_prop
                 JOIN app.personas prop ON prop.id = o_prop.persona_id
                 WHERE o_prop.unidad_id = u.id AND o_prop.activo = true AND o_prop.rol = 'propietario'
                ), '[]'
              ) AS propietarios,
              o_inq.id AS inquilino_ocupante_id,
              inq.id AS inquilino_persona_id,
              inq.nombre AS inquilino_nombre,
              inq.apellido AS inquilino_apellido,
              inq.email AS inquilino_email,
              inq.whatsapp AS inquilino_whatsapp,
              COALESCE(
                (SELECT json_agg(json_build_object(
                    'cbu_o_cuit', cm.cbu_o_cuit,
                    'nombre_referencia', cm.nombre_referencia
                  ) ORDER BY cm.cbu_o_cuit) FILTER (WHERE cm.cbu_o_cuit IS NOT NULL)
                 FROM app.cbu_unidad_map cm
                 WHERE cm.unidad_id = u.id
                ), '[]'
              ) AS cbu_entries
       FROM app.unidades u
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

  // Config inconsistency: divisor_b is set (B expenses would be prorated)
  // but no unit actually has a coef_b — every B gasto would end up
  // distributed as $0 to everyone. Almost always a missing-data mistake.
  const divisorB = Number(consorcio.divisor_b ?? 0);
  const hasDivisorBInconsistency = divisorB > 0 && coefBTotal === 0;

  const interesesPct = consorcio.interest_rate ? (Number(consorcio.interest_rate) * 100).toFixed(2) : "";
  const pctExpensaA = consorcio.pct_expensa_a ? (Number(consorcio.pct_expensa_a) * 100).toFixed(2) : "100";

  const SERVICIOS_CENTRALES: { field: string; label: string; checked: boolean }[] = [
    { field: "tiene_ascensor", label: "Ascensor", checked: consorcio.tiene_ascensor },
    { field: "tiene_agua_caliente_central", label: "Agua caliente central", checked: consorcio.tiene_agua_caliente_central },
    { field: "tiene_calefaccion_central", label: "Calefacción central", checked: consorcio.tiene_calefaccion_central },
    { field: "tiene_aire_acondicionado_central", label: "Aire acondicionado central", checked: consorcio.tiene_aire_acondicionado_central },
    { field: "tiene_cochera", label: "Cocheras", checked: consorcio.tiene_cochera },
    { field: "tiene_movimiento_coches", label: "Movimiento de coches", checked: consorcio.tiene_movimiento_coches },
    { field: "tiene_grupo_electrogeno", label: "Grupo electrógeno", checked: consorcio.tiene_grupo_electrogeno },
    { field: "tiene_pileta", label: "Pileta", checked: consorcio.tiene_pileta },
    { field: "tiene_caldera", label: "Caldera", checked: consorcio.tiene_caldera },
    { field: "tiene_jardin", label: "Jardín", checked: consorcio.tiene_jardin },
    { field: "tiene_seguridad_centralizada", label: "Seguridad centralizada", checked: consorcio.tiene_seguridad_centralizada },
    { field: "tiene_compactador", label: "Compactador", checked: consorcio.tiene_compactador },
    { field: "tiene_montacargas", label: "Montacargas", checked: consorcio.tiene_montacargas },
    { field: "tiene_otros_servicios_centrales", label: "Otros servicios centrales", checked: consorcio.tiene_otros_servicios_centrales },
  ];

  const inlineField = (
    field: string,
    defaultValue: string | number | null,
    opts?: { type?: "text" | "email" | "tel" | "number"; step?: string; placeholder?: string }
  ) => (
    <InlineEditCell
      entityId={id}
      idFieldName="cuit"
      field={field}
      defaultValue={defaultValue === null || defaultValue === undefined ? null : String(defaultValue)}
      action={updateConsorcioField}
      consorcioCuit={id}
      type={opts?.type ?? "text"}
      step={opts?.step}
      placeholder={opts?.placeholder}
      className="input"
    />
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/consorcios" className="hover:underline text-brand-600">Consorcios</a>
          {" / "}
          <span>Detalle</span>
        </p>
        <h2 className="text-2xl font-bold text-gray-900">{consorcio.nombre}</h2>
        <p className="text-gray-500 text-sm">{consorcio.direccion}{consorcio.cuit ? ` · CUIT: ${formatCuit(consorcio.cuit)}` : ""}</p>
      </div>

      {hasDivisorBInconsistency && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-start gap-2">
          <span className="text-base leading-none">⚠️</span>
          <div>
            <p className="font-bold">Configuración de Coeficiente B inconsistente</p>
            <p className="mt-0.5 text-amber-700">
              Este consorcio tiene divisor de Coef. B configurado ({divisorB}), pero ninguna unidad
              tiene coeficiente B asignado (total = 0). Cualquier gasto extraordinario (B) se prorrateará
              en $0 para todas las unidades. Verifique los coeficientes B de las unidades.
            </p>
          </div>
        </div>
      )}

      {/* Consorcio configuration — collapsible sections */}
      <div className="space-y-3 mb-6">
        <details className="card overflow-hidden" open>
          <summary className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 cursor-pointer select-none flex items-center justify-between bg-gray-50">
            Datos Fiscales
            <span className="text-gray-400 text-xs">▾</span>
          </summary>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              {inlineField("nombre", consorcio.nombre)}
            </div>
            <div>
              <label className="label">Dirección</label>
              {inlineField("direccion", consorcio.direccion)}
            </div>
            <div>
              <label className="label">Código Postal</label>
              {inlineField("codigo_postal", consorcio.codigo_postal)}
            </div>
            <div>
              <label className="label">Banco</label>
              {inlineField("banco", consorcio.banco)}
            </div>
          </div>
        </details>

        <details className="card overflow-hidden">
          <summary className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 cursor-pointer select-none flex items-center justify-between bg-gray-50">
            SUTERH
            <span className="text-gray-400 text-xs">▾</span>
          </summary>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">N° Cta. SUTERH</label>
              {inlineField("nro_cta_suterh", consorcio.suterh_key)}
            </div>
            <div>
              <label className="label">Clave SUTERH</label>
              {inlineField("clave_suterh", consorcio.clave_suterh)}
            </div>
          </div>
        </details>

        <details className="card overflow-hidden">
          <summary className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 cursor-pointer select-none flex items-center justify-between bg-gray-50">
            Configuración Edificio
            <span className="text-gray-400 text-xs">▾</span>
          </summary>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Categoría edificio</label>
                <ConsorcioSelectField
                  cuit={id}
                  field="categoria_edificio"
                  defaultValue={consorcio.categoria_edificio ?? ""}
                  action={updateConsorcioField}
                  options={[
                    { value: "", label: "— seleccionar —" },
                    { value: "1° Cat.", label: "1° Cat." },
                    { value: "2° Cat.", label: "2° Cat." },
                    { value: "3° Cat.", label: "3° Cat." },
                    { value: "4° Cat.", label: "4° Cat." },
                  ]}
                />
                <p className="text-xs text-gray-400 mt-0.5">Según Art. 6 CCT 589/10</p>
              </div>
              <div>
                <label className="label">Cantidad de UF</label>
                {inlineField("cant_uf", consorcio.cant_uf, { type: "number" })}
              </div>
              <div>
                <label className="label">UF p/ Retiro de Residuos</label>
                {inlineField("uf_retiro_residuos", consorcio.uf_retiro_residuos, { type: "number" })}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Servicios centrales</p>
              <p className="text-xs text-gray-400 mb-3">Art. 6 CCT 589/10 — determinan la categoría del edificio</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICIOS_CENTRALES.map((f) => (
                  <ConsorcioToggleField
                    key={f.field}
                    cuit={id}
                    field={f.field}
                    label={f.label}
                    defaultChecked={f.checked}
                    action={updateConsorcioField}
                  />
                ))}
                <ConsorcioToggleField
                  cuit={id}
                  field="zona_desfavorable"
                  label="Zona desfavorable"
                  defaultChecked={consorcio.zona_desfavorable}
                  action={updateConsorcioField}
                />
              </div>
            </div>
          </div>
        </details>

        <details className="card overflow-hidden">
          <summary className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800 cursor-pointer select-none flex items-center justify-between bg-gray-50">
            Configuración Expensas
            <span className="text-gray-400 text-xs">▾</span>
          </summary>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de expensas</label>
              <ConsorcioSelectField
                cuit={id}
                field="tipo_expensas"
                defaultValue={consorcio.tipo_expensas ?? "variable"}
                action={updateConsorcioField}
                options={[
                  { value: "variable", label: "Variable" },
                  { value: "fija", label: "Fija" },
                ]}
              />
            </div>
            <div>
              <label className="label">Formato de cobro</label>
              <ConsorcioSelectField
                cuit={id}
                field="formato_cobro"
                defaultValue={consorcio.formato_cobro ?? "exacto"}
                action={updateConsorcioField}
                options={[
                  { value: "exacto", label: "Monto exacto" },
                  { value: "identificacion_uf", label: "Identificación por UF (centavos = N° UF)" },
                ]}
              />
            </div>
            <div>
              <label className="label">Intereses por mora (%)</label>
              {inlineField("intereses_mora_pct", interesesPct, { type: "number", step: "0.01", placeholder: "Ej: 3.5" })}
              <p className="text-xs text-gray-400 mt-0.5">Porcentaje mensual definido en asamblea</p>
            </div>
            <div>
              <label className="label">% Coeficiente A</label>
              {inlineField("pct_expensa_a", pctExpensaA, { type: "number", step: "0.01" })}
              <p className="text-xs text-gray-400 mt-0.5">El resto se asigna a Coef. B</p>
            </div>
            {consorcio.tipo_expensas === "fija" && (
              <div>
                <label className="label">Monto fijo mensual default</label>
                {inlineField("monto_fijo_default", consorcio.monto_fijo_default ? Number(consorcio.monto_fijo_default) : null, { type: "number", step: "0.01" })}
              </div>
            )}
            <div className="flex items-end pb-1">
              <ConsorcioToggleField
                cuit={id}
                field="fondo_obra_activo"
                label="Fondo de obra activo"
                defaultChecked={consorcio.fondo_obra_activo}
                action={updateConsorcioField}
              />
            </div>
            {consorcio.fondo_obra_activo && (
              <div>
                <label className="label">Monto total fondo de obra</label>
                {inlineField("fondo_obra", consorcio.fondo_obra ? Number(consorcio.fondo_obra) : null, { type: "number", step: "0.01" })}
                <p className="text-xs text-gray-400 mt-0.5">Se prorratea por Coef. A de cada unidad</p>
              </div>
            )}
          </div>
        </details>
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
                <th className="th">CBU</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <UnidadRow
                  key={u.id}
                  id={u.id}
                  uf={u.uf}
                  uf_numero={u.uf_numero}
                  tipo={u.tipo}
                  coefA={u.coef_a}
                  coefB={u.coef_b}
                  consorcioCuit={id}
                  propietarios={u.propietarios ?? []}
                  inquilino={
                    u.inquilino_ocupante_id && u.inquilino_persona_id
                      ? {
                          ocupante_id: u.inquilino_ocupante_id,
                          persona_id: u.inquilino_persona_id,
                          nombre: u.inquilino_nombre,
                          apellido: u.inquilino_apellido,
                          email: u.inquilino_email,
                          whatsapp: u.inquilino_whatsapp,
                        }
                      : null
                  }
                  cbuEntries={u.cbu_entries ?? []}
                />
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">DNI / CUIT</label>
                <input name="dni" className="input" placeholder="20123456789" />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" />
              </div>
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
