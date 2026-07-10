export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { getAdministrador, createAdministrador, updateAdministrador, type AdministradorRow } from "../actions";
import { DeleteAdministradorButton } from "../DeleteAdministradorButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdministradorPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === "nuevo";

  let admin: AdministradorRow | null = null;
  if (!isNew) {
    const numId = Number(id);
    if (!Number.isInteger(numId)) notFound();
    admin = await getAdministrador(numId);
    if (!admin) notFound();
  }

  const action = isNew ? createAdministrador : updateAdministrador;

  return (
    <div className="max-w-2xl">
      <Suspense><ActionFeedback /></Suspense>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <a href="/administracion" className="hover:underline text-brand-600">Administración</a>
          {" / "}
          <span>{isNew ? "Nuevo" : admin!.nombre_administrador}</span>
        </p>
        <h2 className="text-2xl font-bold text-gray-900">
          {isNew ? "Nuevo administrador" : "Editar administrador"}
        </h2>
      </div>

      <form action={action} className="card p-6 space-y-5">
        {!isNew && <input type="hidden" name="id" value={admin!.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identidad</p>
          </div>
          <div className="col-span-2">
            <label className="label">Nombre de la sociedad</label>
            <input name="nombre_sociedad" defaultValue={admin?.nombre_sociedad ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Nombre del administrador *</label>
            <input name="nombre_administrador" required defaultValue={admin?.nombre_administrador ?? ""} className="input" />
          </div>
          <div>
            <label className="label">CUIT *</label>
            <input name="cuit" required defaultValue={admin?.cuit ?? ""} className="input" placeholder="30-12345678-9" />
          </div>
          <div>
            <label className="label">Matrícula RPA</label>
            <input name="matricula_rpa" defaultValue={admin?.matricula_rpa ?? ""} className="input" />
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</p>
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" defaultValue={admin?.email ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" defaultValue={admin?.telefono ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Celular urgencias</label>
            <input name="celular_urgencias" defaultValue={admin?.celular_urgencias ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Horario de atención</label>
            <input name="horario_atencion" defaultValue={admin?.horario_atencion ?? ""} className="input" placeholder="Ej: Lun a Vie 9 a 17hs" />
          </div>
          <div className="col-span-2">
            <label className="label">Domicilio</label>
            <input name="domicilio" defaultValue={admin?.domicilio ?? ""} className="input" />
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos Fiscales</p>
          </div>
          <div>
            <label className="label">Categoría AFIP</label>
            <select name="categoria_afip" defaultValue={admin?.categoria_afip ?? ""} className="input">
              <option value="">— seleccionar —</option>
              <option>Monotributista</option>
              <option>Responsable Inscripto</option>
              <option>Exento</option>
            </select>
          </div>
          <div>
            <label className="label">Situación IVA</label>
            <select name="situacion_iva" defaultValue={admin?.situacion_iva ?? ""} className="input">
              <option value="">— seleccionar —</option>
              <option>Responsable Inscripto</option>
              <option>Monotributo</option>
              <option>Exento</option>
            </select>
          </div>
          <div>
            <label className="label">Fecha de inicio de actividades</label>
            <input
              name="fecha_inicio_actividades"
              type="date"
              defaultValue={admin?.fecha_inicio_actividades ? admin.fecha_inicio_actividades.slice(0, 10) : ""}
              className="input"
            />
          </div>
          <div>
            <label className="label">N° Registro Público</label>
            <input name="registro_publico" defaultValue={admin?.registro_publico ?? ""} className="input" />
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Operativo</p>
          </div>
          <div>
            <label className="label">Logo (URL)</label>
            <input name="logo_url" defaultValue={admin?.logo_url ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Firma digital (URL)</label>
            <input name="firma_digital_url" defaultValue={admin?.firma_digital_url ?? ""} className="input" />
          </div>
          <div>
            <label className="label">WhatsApp urgencias</label>
            <input name="whatsapp_urgencias" defaultValue={admin?.whatsapp_urgencias ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Sitio web</label>
            <input name="sitio_web" defaultValue={admin?.sitio_web ?? ""} className="input" />
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <a href="/administracion" className="btn-secondary">Cancelar</a>
          <div className="flex items-center gap-2">
            {!isNew && <DeleteAdministradorButton id={admin!.id} />}
            <button type="submit" className="btn-primary">
              {isNew ? "Crear administrador" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
