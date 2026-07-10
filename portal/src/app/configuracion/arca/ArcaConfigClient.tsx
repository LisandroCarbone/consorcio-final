"use client";

import React, { useState, useTransition } from "react";
import { generarCSROnServer, guardarCredenciales, eliminarCredenciales } from "./actions";

interface ArcaDetails {
  configured: boolean;
  puntoVenta?: number;
  ambiente?: string;
  updatedAt?: Date;
  subject?: string;
  validFrom?: Date;
  validTo?: Date;
  expiresDays?: number;
  isExpired?: boolean;
  error?: string;
}

interface Props {
  cuit: string;
  consorcioNombre: string;
  initialDetails: ArcaDetails;
}

export function ArcaConfigClient({ cuit, consorcioNombre, initialDetails }: Props) {
  const [details, setDetails] = useState<ArcaDetails>(initialDetails);
  const [isPending, startTransition] = useTransition();

  // CSR generation state
  const [csrResult, setCsrResult] = useState<{ privateKeyPem: string; csrPem: string } | null>(null);

  // Form inputs state
  const [certPem, setCertPem] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [puntoVenta, setPuntoVenta] = useState(1);
  const [ambiente, setAmbiente] = useState("homologation");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleGenerateCSR = () => {
    startTransition(async () => {
      const res = await generarCSROnServer(cuit, consorcioNombre);
      if (res.success) {
        const successRes = res as { privateKeyPem: string; csrPem: string };
        setCsrResult({ privateKeyPem: successRes.privateKeyPem, csrPem: successRes.csrPem });
        setPrivateKeyPem(successRes.privateKeyPem); // Pre-fill private key field
      } else {
        setFormError((res as { error?: string }).error || "Fallo al generar CSR");
      }
    });
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!certPem || !privateKeyPem) {
      setFormError("Debes ingresar el certificado digital y la clave privada.");
      return;
    }

    startTransition(async () => {
      const res = await guardarCredenciales(cuit, certPem, privateKeyPem, puntoVenta, ambiente);
      if (res.success) {
        setFormSuccess("Credenciales guardadas con éxito.");
        // Refetch/reload details
        window.location.reload();
      } else {
        setFormError(res.error || "Error al guardar credenciales");
      }
    });
  };

  const handleDeleteCredentials = () => {
    if (!confirm("¿Seguro que deseas eliminar las credenciales de ARCA de este consorcio? Se perderá la conexión a Factura Electrónica y validación de CUITs.")) return;
    startTransition(async () => {
      const res = await eliminarCredenciales(cuit);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Error al eliminar credenciales");
      }
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Conexión ARCA (ex AFIP)</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configurá los certificados digitales para el consorcio activo: <strong className="text-brand-600">{consorcioNombre}</strong> (CUIT: {cuit}).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LADO IZQUIERDO: Detalles actuales, pasos, instructivo (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Estado de la Conexión */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Estado de la Integración</h3>
              {details.configured ? (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${details.isExpired ? "bg-red-100 text-red-800" : details.ambiente === "production" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                  {details.isExpired ? "Expirado" : details.ambiente === "production" ? "Producción Activo" : "Homologación Activo"}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                  No Configurado
                </span>
              )}
            </div>
            
            <div className="p-5">
              {details.configured ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Punto de Venta</p>
                      <p className="font-mono font-semibold text-gray-900 mt-0.5">{String(details.puntoVenta).padStart(5, "0")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Entorno</p>
                      <p className="font-semibold text-gray-900 mt-0.5 capitalize">{details.ambiente === "homologation" ? "Homologación (Pruebas)" : "Producción (Real)"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Válido Desde</p>
                      <p className="text-gray-800 mt-0.5">{details.validFrom ? new Date(details.validFrom).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Vencimiento del Certificado</p>
                      <p className={`font-semibold mt-0.5 ${details.isExpired ? "text-red-600" : (details.expiresDays ?? 999) < 30 ? "text-orange-600" : "text-gray-800"}`}>
                        {details.validTo ? new Date(details.validTo).toLocaleDateString() : "—"} 
                        {details.expiresDays !== undefined && (
                          <span className="text-xs font-normal ml-2">
                            ({details.isExpired ? "Expirado" : `Quedan ${details.expiresDays} días`})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Detalle del Sujeto Certificado</p>
                    <p className="text-xs font-mono bg-gray-50 p-2.5 rounded border border-gray-200 text-gray-700 select-all overflow-x-auto whitespace-nowrap">
                      {details.subject}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteCredentials}
                      disabled={isPending}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Desconectar y Borrar Credenciales
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">Este consorcio no tiene una firma digital configurada.</p>
                  <p className="text-xs text-gray-400 mt-1">Generá el CSR en el panel derecho para iniciar el alta.</p>
                </div>
              )}
            </div>
          </div>

          {/* Guía Paso a Paso */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Instructivo de Vinculación con ARCA</h3>
            </div>
            
            <div className="p-5 space-y-6">
              
              <div className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Generar archivo Pedido de Certificado (CSR)</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Hacé clic en <strong>Generar Claves y CSR</strong> en el panel de la derecha. El sistema creará una Clave Privada y un archivo CSR que contiene la identidad del CUIT.
                  </p>
                  {csrResult ? (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <p className="text-xs text-green-700 font-medium">✓ ¡Par de claves generado con éxito!</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => downloadFile(csrResult.csrPem, "pedido.csr")}
                          className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-brand-700 transition-colors"
                        >
                          📥 Guardar pedido.csr
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(csrResult.privateKeyPem, "privada.key")}
                          className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          📥 Guardar privada.key (Copia de seguridad)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleGenerateCSR}
                        disabled={isPending}
                        className="px-3.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-1.5"
                      >
                        ⚙️ {isPending ? "Generando..." : "Generar Claves y CSR Ahora"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-50 pt-5">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Obtener Certificado Digital (.crt) en ARCA</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Entrá a la web oficial de <strong>arca.gob.ar</strong> con Clave Fiscal nivel 3 del consorcio:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1 pl-1">
                    <li>Entrá a <strong>"Administración de Certificados Digitales"</strong>.</li>
                    <li>Creá un nuevo Alias (ej. <code className="bg-gray-100 px-1 rounded">sistema-consorcio</code>).</li>
                    <li>Cargá el archivo <code className="bg-gray-100 px-1 rounded">pedido.csr</code> generado en el Paso 1.</li>
                    <li>Descargá el archivo de certificado digital emitido (con extensión <code className="bg-gray-100 px-1 rounded">.crt</code>).</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-50 pt-5">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Asociar el Certificado al WebService (Factura Electrónica)</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    En el Administrador de Relaciones de Clave Fiscal de ARCA:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1 pl-1">
                    <li>Hacé clic en <strong>Nueva Relación</strong> → Buscar <strong>WebService de Factura Electrónica</strong> (wsfe).</li>
                    <li>Asocialo al alias del certificado creado en el Paso 2.</li>
                    <li>En <strong>"Administración de puntos de venta y domicilios"</strong> creá un Punto de Venta tipo <code className="bg-gray-100 px-1 rounded">Facturación Electrónica - Web Services</code> (ej. PV 3).</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-50 pt-5">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Pegar y Guardar Certificado en el Sistema</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Copiá el contenido del certificado <code className="bg-gray-100 px-1 rounded">.crt</code> descargado de ARCA y pegalo en el formulario de la derecha junto con la Clave Privada y el Punto de Venta para activar la facturación.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* LADO DERECHO: Formulario de carga y guardado de credenciales (Col-span 1) */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Cargar Credenciales de Firma</h3>
            
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              
              <div>
                <label className="label">Entorno Impositivo *</label>
                <select
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  className="input text-sm"
                >
                  <option value="homologation">Homologación (Testing / Pruebas)</option>
                  <option value="production">Producción (Fiscal / Real)</option>
                </select>
              </div>

              <div>
                <label className="label">Punto de Venta de WebServices *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={99999}
                  value={puntoVenta}
                  onChange={(e) => setPuntoVenta(Number(e.target.value))}
                  placeholder="Ej: 3"
                  className="input text-sm"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Debe coincidir con el PV dado de alta para Web Services en ARCA.</span>
              </div>

              <div>
                <label className="label">Clave Privada (private_key.pem) *</label>
                <textarea
                  rows={4}
                  required
                  value={privateKeyPem}
                  onChange={(e) => setPrivateKeyPem(e.target.value)}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                  className="input font-mono text-[10px] leading-tight"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Clave generada en el Paso 1.</span>
              </div>

              <div>
                <label className="label">Certificado Digital (.crt / .pem) *</label>
                <textarea
                  rows={4}
                  required
                  value={certPem}
                  onChange={(e) => setCertPem(e.target.value)}
                  placeholder="-----BEGIN CERTIFICATE-----..."
                  className="input font-mono text-[10px] leading-tight"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">El certificado emitido y descargado de la web de ARCA.</span>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-xs font-semibold text-green-700">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full justify-center"
              >
                {isPending ? "Guardando..." : "Activar Conexión ARCA"}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
