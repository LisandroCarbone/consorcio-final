export const dynamic = 'force-dynamic';

import { pool } from "@/lib/db";
import { redirect } from "next/navigation";
import { FUNCIONES } from "../constants";

async function getConsorcios() {
  const { rows } = await pool.query("SELECT id, nombre FROM app.consorcios ORDER BY nombre");
  return rows;
}

async function crearEmpleado(formData: FormData) {
  'use server';
  const get = (k: string) => formData.get(k) as string | null;
  const bool = (k: string) => formData.get(k) === 'true';

  if (!get('nombre')?.trim()) throw new Error("Nombre requerido");
  if (!get('cuil')?.trim()) throw new Error("CUIL requerido");
  const consorcioId = Number(get('consorcio_id'));
  if (!consorcioId || consorcioId <= 0) throw new Error("Consorcio inválido");
  if (!get('fecha_ingreso')) throw new Error("Fecha de ingreso requerida");

  try {
   await pool.query(
    `INSERT INTO app.empleados_edificio
     (cuil, nombre, legajo, fecha_nacimiento, fecha_ingreso, consorcio_id,
      obra_social, cod_obra_social, funcion, categoria_edificio, jornada,
      tiene_vivienda, banco, cbu,
      retiro_residuos, clasificacion_residuos,
      plus_cocheras, plus_movimiento_coches, plus_jardin, plus_zona_desfavorable, plus_pileta,
      tiene_titulo, adicional_voluntario, estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,'activo')`,
    [
      get('cuil'), get('nombre'), get('legajo') || null,
      get('fecha_nacimiento') || null, get('fecha_ingreso') || null,
      Number(get('consorcio_id')),
      get('obra_social') || null, Number(get('cod_obra_social')) || null,
      get('funcion'), Number(get('categoria_edificio')), get('jornada'),
      bool('tiene_vivienda'), get('banco') || null, get('cbu') || null,
      bool('retiro_residuos'), bool('clasificacion_residuos'),
      bool('plus_cocheras'), bool('plus_movimiento_coches'),
      bool('plus_jardin'), bool('plus_zona_desfavorable'), bool('plus_pileta'),
      bool('tiene_titulo'), Number(get('adicional_voluntario')) || 0,
    ]
  );
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505') {
      redirect('/sueldos/empleados/nuevo?error=cuil_duplicado');
    }
    throw err;
  }
  redirect('/sueldos/empleados');
}


export default async function NuevoEmpleadoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const consorcios = await getConsorcios();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo empleado</h1>

      {error === 'cuil_duplicado' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          Ya existe un empleado con ese CUIL.
        </div>
      )}

      <form action={crearEmpleado} className="space-y-6">

        {/* Identificación */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Identificación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CUIL *</label>
              <input name="cuil" required className="input" placeholder="20123456789" />
            </div>
            <div>
              <label className="label">Legajo</label>
              <input name="legajo" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Apellido y Nombre *</label>
              <input name="nombre" required className="input" placeholder="APELLIDO NOMBRE" />
            </div>
            <div>
              <label className="label">Fecha de nacimiento</label>
              <input name="fecha_nacimiento" type="date" className="input" />
            </div>
            <div>
              <label className="label">Fecha de ingreso *</label>
              <input name="fecha_ingreso" type="date" required className="input" />
            </div>
          </div>
        </div>

        {/* Consorcio y función */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Consorcio y función</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Consorcio *</label>
              <select name="consorcio_id" required className="input">
                <option value="">— seleccionar —</option>
                {consorcios.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Función *</label>
              <select name="funcion" required className="input">
                <option value="">— seleccionar —</option>
                {FUNCIONES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría edificio *</label>
              <select name="categoria_edificio" required className="input">
                <option value="1">1° Cat.</option>
                <option value="2">2° Cat.</option>
                <option value="3">3° Cat.</option>
                <option value="4">4° Cat.</option>
              </select>
            </div>
            <div>
              <label className="label">Jornada *</label>
              <select name="jornada" required className="input">
                <option>Completa</option>
                <option>Media</option>
                <option>Suplente</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-6">
                <input type="checkbox" name="tiene_vivienda" value="true" className="rounded" />
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
              <input name="obra_social" className="input" placeholder="OSPERYH" />
            </div>
            <div>
              <label className="label">Código obra social</label>
              <input name="cod_obra_social" type="number" className="input" placeholder="106500" />
            </div>
            <div>
              <label className="label">Banco</label>
              <input name="banco" className="input" />
            </div>
            <div>
              <label className="label">CBU</label>
              <input name="cbu" className="input" placeholder="22 dígitos" />
            </div>
          </div>
        </div>

        {/* Plus salarial */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Plus salarial</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'retiro_residuos', label: '🗑️ Retiro de residuos' },
              { name: 'clasificacion_residuos', label: '♻️ Clasificación de residuos' },
              { name: 'plus_cocheras', label: '🚗 Plus cocheras' },
              { name: 'plus_movimiento_coches', label: '🔄 Movimiento de coches' },
              { name: 'plus_jardin', label: '🌳 Plus jardín' },
              { name: 'plus_zona_desfavorable', label: '⚠️ Zona desfavorable' },
              { name: 'plus_pileta', label: '🏊 Plus pileta' },
              { name: 'tiene_titulo', label: '🎓 Título encargado integral' },
            ].map((f) => (
              <label key={f.name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name={f.name} value="true" className="rounded" />
                {f.label}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label className="label">Adicional voluntario ($)</label>
            <input name="adicional_voluntario" type="number" step="0.01" className="input w-48" defaultValue="0" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <a href="/sueldos/empleados" className="btn-secondary">Cancelar</a>
          <button type="submit" className="btn-primary">Guardar empleado</button>
        </div>
      </form>
    </div>
  );
}
