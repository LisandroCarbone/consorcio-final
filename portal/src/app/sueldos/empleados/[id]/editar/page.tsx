export const dynamic = 'force-dynamic';

import { pool } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

import { FUNCIONES } from "../../constants";

async function getEmpleado(cuil: string) {
  const { rows } = await pool.query(
    `SELECT e.*, c.nombre AS consorcio_nombre
     FROM app.empleados e
     JOIN app.consorcios c ON c.cuit = e.consorcio_cuit
     WHERE e.cuil = $1`,
    [cuil]
  );
  return rows[0] ?? null;
}

async function getConsorcios() {
  const { rows } = await pool.query("SELECT cuit, nombre FROM app.consorcios ORDER BY nombre");
  return rows;
}

async function actualizarEmpleado(cuil: string, formData: FormData) {
  'use server';
  const get = (k: string) => formData.get(k) as string | null;
  const bool = (k: string) => formData.get(k) === 'true';

  if (!cuil) throw new Error("CUIL de empleado inválido");
  if (!get('nombre')?.trim()) throw new Error("Nombre requerido");
  if (!get('cuil')?.trim()) throw new Error("CUIL requerido");
  const consorcioCuit = get('consorcio_cuit');
  if (!consorcioCuit) throw new Error("Consorcio CUIT requerido");

  await pool.query(
    `UPDATE app.empleados SET
       cuil = $1, nombre = $2, legajo = $3,
       fecha_nacimiento = $4, fecha_ingreso = $5,
       consorcio_cuit = $6, obra_social = $7, cod_obra_social = $8,
       funcion = $9, categoria_edificio = $10, jornada = $11,
       tiene_vivienda = $12, banco = $13, cbu = $14,
       retiro_residuos = $15, clasificacion_residuos = $16,
       plus_cocheras = $17, plus_movimiento_coches = $18,
       plus_jardin = $19, plus_zona_desfavorable = $20, plus_pileta = $21,
       tiene_titulo = $22, adicional_voluntario = $23,
       updated_at = now()
     WHERE cuil = $24`,
    [
      get('cuil'), get('nombre'), get('legajo') || null,
      get('fecha_nacimiento') || null, get('fecha_ingreso') || null,
      consorcioCuit,
      get('obra_social') || null, Number(get('cod_obra_social')) || null,
      get('funcion'), Number(get('categoria_edificio')), get('jornada'),
      bool('tiene_vivienda'), get('banco') || null, get('cbu') || null,
      bool('retiro_residuos'), bool('clasificacion_residuos'),
      bool('plus_cocheras'), bool('plus_movimiento_coches'),
      bool('plus_jardin'), bool('plus_zona_desfavorable'), bool('plus_pileta'),
      bool('tiene_titulo'), Number(get('adicional_voluntario')) || 0,
      cuil,
    ]
  );
  redirect('/sueldos/empleados');
}

export default async function EditarEmpleadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empleadoCuil = decodeURIComponent(id);

  const [emp, consorcios] = await Promise.all([
    getEmpleado(empleadoCuil),
    getConsorcios(),
  ]);

  if (!emp) notFound();

  const action = actualizarEmpleado.bind(null, empleadoCuil);

  const fmt = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : '';
  const checked = (v: boolean | null) => v === true;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Editar empleado</h1>
      <p className="text-gray-500 text-sm mb-6">{emp.nombre}</p>

      <form action={action} className="space-y-6">

        {/* Identificación */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Identificación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CUIL *</label>
              <input name="cuil" required className="input" defaultValue={emp.cuil ?? ''} />
            </div>
            <div>
              <label className="label">Legajo</label>
              <input name="legajo" className="input" defaultValue={emp.legajo ?? ''} />
            </div>
            <div className="col-span-2">
              <label className="label">Apellido y Nombre *</label>
              <input name="nombre" required className="input" defaultValue={emp.nombre ?? ''} />
            </div>
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input name="fecha_nacimiento" type="date" className="input" defaultValue={fmt(emp.fecha_nacimiento)} />
            </div>
            <div>
              <label className="label">Fecha de ingreso *</label>
              <input name="fecha_ingreso" type="date" required className="input" defaultValue={fmt(emp.fecha_ingreso)} />
            </div>
          </div>
        </div>

        {/* Consorcio y función */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Consorcio y función</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Consorcio *</label>
              <select name="consorcio_cuit" required className="input" defaultValue={emp.consorcio_cuit}>
                {consorcios.map((c: { cuit: string; nombre: string }) => (
                  <option key={c.cuit} value={c.cuit}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Función *</label>
              <select name="funcion" required className="input" defaultValue={emp.funcion}>
                {FUNCIONES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría edificio *</label>
              <select name="categoria_edificio" required className="input" defaultValue={emp.categoria_edificio}>
                <option value="1">1° Cat.</option>
                <option value="2">2° Cat.</option>
                <option value="3">3° Cat.</option>
                <option value="4">4° Cat.</option>
              </select>
            </div>
            <div>
              <label className="label">Jornada *</label>
              <select name="jornada" required className="input" defaultValue={emp.jornada}>
                <option>Completa</option>
                <option>Media</option>
                <option>Suplente</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  name="tiene_vivienda"
                  value="true"
                  className="rounded"
                  defaultChecked={checked(emp.tiene_vivienda)}
                />
                Con vivienda
              </label>
            </div>
          </div>
        </div>

        {/* Obra social y banco */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Obra social y banco</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Obra social</label>
              <input name="obra_social" className="input" defaultValue={emp.obra_social ?? ''} />
            </div>
            <div>
              <label className="label">Código obra social</label>
              <input name="cod_obra_social" type="number" className="input" defaultValue={emp.cod_obra_social ?? ''} />
            </div>
            <div>
              <label className="label">Banco</label>
              <input name="banco" className="input" defaultValue={emp.banco ?? ''} />
            </div>
            <div>
              <label className="label">CBU</label>
              <input name="cbu" className="input" defaultValue={emp.cbu ?? ''} />
            </div>
          </div>
        </div>

        {/* Plus salarial */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Plus salarial</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'retiro_residuos', label: '🗑️ Retiro de residuos', val: emp.retiro_residuos },
              { name: 'clasificacion_residuos', label: '♻️ Clasificación de residuos', val: emp.clasificacion_residuos },
              { name: 'plus_cocheras', label: '🚗 Plus cocheras', val: emp.plus_cocheras },
              { name: 'plus_movimiento_coches', label: '🔄 Movimiento de coches', val: emp.plus_movimiento_coches },
              { name: 'plus_jardin', label: '🌳 Plus jardín', val: emp.plus_jardin },
              { name: 'plus_zona_desfavorable', label: '⚠️ Zona desfavorable', val: emp.plus_zona_desfavorable },
              { name: 'plus_pileta', label: '🏊 Plus pileta', val: emp.plus_pileta },
              { name: 'tiene_titulo', label: '🎓 Título encargado integral', val: emp.tiene_titulo },
            ].map((f) => (
              <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name={f.name}
                  value="true"
                  className="rounded"
                  defaultChecked={checked(f.val)}
                />
                {f.label}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label className="label">Adicional voluntario ($)</label>
            <input
              name="adicional_voluntario"
              type="number"
              step="0.01"
              className="input w-48"
              defaultValue={emp.adicional_voluntario ?? 0}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <a href="/sueldos/empleados" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}
