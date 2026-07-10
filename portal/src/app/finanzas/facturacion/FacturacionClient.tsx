"use client";

import React, { useState, useTransition } from "react";
import { emitirFacturaAction } from "./actions";

interface Comprobante {
  id: number;
  cuit_emisor: string;
  punto_venta: number;
  cbte_tipo: number;
  cbte_nro: number;
  cae: string;
  cae_vto: string;
  fecha: string;
  cuit_receptor: string;
  concepto_tipo: number;
  monto_total: string;
  descripcion: string;
  created_at: string;
}

interface Props {
  cuitConsorcio: string;
  consorcioNombre: string;
  comprobantes: Comprobante[];
  arcaConfigured: boolean;
  puntoVentaConfigured?: number;
  ambiente?: string;
}

export function FacturacionClient({
  cuitConsorcio,
  consorcioNombre,
  comprobantes,
  arcaConfigured,
  puntoVentaConfigured,
  ambiente
}: Props) {
  const [isPending, startTransition] = useTransition();

  // Form states
  const [cuitReceptor, setCuitReceptor] = useState("");
  const [receptorNombre, setReceptorNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [conceptoTipo, setConceptoTipo] = useState(2); // default to 2: Servicios
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [periodoDesde, setPeriodoDesde] = useState(new Date().toISOString().slice(0, 10));
  const [periodoHasta, setPeriodoHasta] = useState(new Date().toISOString().slice(0, 10));
  const [vencimientoPago, setVencimientoPago] = useState(new Date().toISOString().slice(0, 10));

  // Lookups and feedback
  const [isValidating, setIsValidating] = useState(false);
  const [validationInfo, setValidationInfo] = useState("");
  const [validationError, setValidationError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ nro: number; cae: string } | null>(null);

  const handleValidateCuit = async () => {
    setValidationError("");
    setValidationInfo("");

    const cleanCuit = cuitReceptor.replace(/-/g, "").trim();
    if (!cleanCuit || isNaN(Number(cleanCuit))) {
      setValidationError("Ingresa un número de CUIT o DNI válido.");
      return;
    }

    if (!arcaConfigured) {
      setValidationError("Configura la firma digital ARCA antes de realizar consultas de padrón.");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch(`/api/arca/validar-cuit?cuit=${cleanCuit}&cuitConsorcio=${cuitConsorcio}`);
      const data = await res.json();

      if (data.error) {
        setValidationError(data.error);
      } else if (data.success && data.details) {
        setReceptorNombre(data.details.nombre);
        setValidationInfo(`ARCA: ${data.details.condicionIva}`);
      }
    } catch (err) {
      setValidationError("Error al conectar con ARCA.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setSuccessInfo(null);

    if (!arcaConfigured || !puntoVentaConfigured) {
      setActionError("Falta configurar credenciales ARCA para este consorcio.");
      return;
    }

    const numericMonto = Number(monto);
    if (isNaN(numericMonto) || numericMonto <= 0) {
      setActionError("El monto debe ser mayor a 0.");
      return;
    }

    startTransition(async () => {
      const res = await emitirFacturaAction({
        cuitConsorcio,
        puntoVenta: puntoVentaConfigured,
        cuitReceptor: cuitReceptor.replace(/-/g, "").trim(),
        monto: numericMonto,
        conceptoTipo,
        descripcion,
        fecha,
        ...(conceptoTipo === 2 ? { periodoDesde, periodoHasta, vencimientoPago } : {})
      });

      if (res.success) {
        const successRes = res as { nroComprobante: number; cae: string };
        setSuccessInfo({ nro: successRes.nroComprobante, cae: successRes.cae });
        // Reset form
        setCuitReceptor("");
        setReceptorNombre("");
        setMonto("");
        setDescripcion("");
        setValidationInfo("");
      } else {
        setActionError((res as { error?: string }).error || "Error al emitir el comprobante.");
      }
    });
  };

  // Official ARCA QR code URL generator
  const getQrUrl = (comp: Comprobante) => {
    const data = {
      ver: 1,
      fecha: comp.fecha.slice(0, 10),
      cuit: Number(comp.cuit_emisor),
      ptoVta: comp.punto_venta,
      tipoCodCbte: comp.cbte_tipo,
      nroCbte: comp.cbte_nro,
      importe: Number(comp.monto_total),
      moneda: "PES",
      cotizacion: 1,
      tipoDocRec: comp.cuit_receptor.length === 11 ? 80 : 96,
      docRec: Number(comp.cuit_receptor),
      tipoCodAut: "E",
      codAut: comp.cae
    };
    try {
      const jsonStr = JSON.stringify(data);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return `https://www.arca.gob.ar/fe/qr/?p=${base64}`;
    } catch (e) {
      return "#";
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facturación Electrónica</h2>
          <p className="text-sm text-gray-500 mt-1">
            Emití comprobantes con validez fiscal y gestioná facturas para el consorcio activo: <strong className="text-brand-600">{consorcioNombre}</strong> (CUIT: {cuitConsorcio}).
          </p>
        </div>
        {arcaConfigured && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ambiente === "production" ? "bg-green-100 text-green-700 border border-green-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
            Entorno: {ambiente === "production" ? "Producción" : "Homologación"} (PV: {puntoVentaConfigured})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LADO IZQUIERDO: Historial de Comprobantes (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {successInfo && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 space-y-2 shadow-sm">
              <h4 className="font-bold text-sm">✓ Comprobante Autorizado por ARCA</h4>
              <p className="text-xs">
                Se emitió con éxito la <strong>Factura C Nº {String(successInfo.nro).padStart(8, "0")}</strong>.
                <br />
                CAE obtenido: <strong className="font-mono text-sm">{successInfo.cae}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setSuccessInfo(null)}
                className="text-xs text-green-700 hover:underline font-semibold"
              >
                Entendido
              </button>
            </div>
          )}

          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Historial de facturas emitidas</h3>
            </div>
            {comprobantes.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                Aún no se han emitido comprobantes fiscales para este consorcio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="th">Comprobante</th>
                      <th className="th">Receptor</th>
                      <th className="th">Fecha</th>
                      <th className="th text-right">Monto</th>
                      <th className="th">CAE</th>
                      <th className="th text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantes.map((c) => (
                      <tr key={c.id} className="table-row hover:bg-gray-50 text-sm">
                        <td className="td font-medium">
                          Factura C <span className="font-mono">Nº {String(c.cbte_nro).padStart(8, "0")}</span>
                        </td>
                        <td className="td">
                          <p className="font-medium text-gray-800 truncate max-w-[150px]">{c.descripcion}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Receptor: {c.cuit_receptor}</p>
                        </td>
                        <td className="td text-gray-500">
                          {new Date(c.fecha).toLocaleDateString()}
                        </td>
                        <td className="td text-right font-mono font-semibold text-gray-900">
                          {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(c.monto_total))}
                        </td>
                        <td className="td font-mono text-xs text-gray-500">
                          {c.cae}
                        </td>
                        <td className="td text-right">
                          <a
                            href={getQrUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-600 hover:underline font-semibold"
                          >
                            🔗 QR ARCA
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: Formulario de Nueva Factura (Col-span 1) */}
        <div className="lg:col-span-1">
          
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Nueva Factura C</h3>
            
            {!arcaConfigured ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <span className="text-3xl select-none mb-2 block">⚠️</span>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-normal">
                  Debe configurar primero los certificados del consorcio en **Credenciales ARCA** para habilitar la facturación.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmit} className="space-y-4">
                
                <div>
                  <label className="label">CUIT / DNI del Receptor *</label>
                  <div className="flex gap-2">
                    <input
                      required
                      value={cuitReceptor}
                      onChange={(e) => setCuitReceptor(e.target.value)}
                      placeholder="Ej: 30123456789"
                      className="input text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCuit}
                      disabled={isValidating || !cuitReceptor}
                      className="px-3 py-1.5 border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
                    >
                      {isValidating ? "..." : "Buscar"}
                    </button>
                  </div>
                  {validationInfo && (
                    <span className="text-[10px] text-green-600 font-semibold mt-1 block">
                      {validationInfo}
                    </span>
                  )}
                  {validationError && (
                    <span className="text-[10px] text-red-500 mt-1 block leading-tight">
                      {validationError}
                    </span>
                  )}
                </div>

                <div>
                  <label className="label">Nombre / Razón Social Receptor *</label>
                  <input
                    required
                    value={receptorNombre}
                    onChange={(e) => setReceptorNombre(e.target.value)}
                    placeholder="Empresa o persona"
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="label">Concepto *</label>
                  <select
                    value={conceptoTipo}
                    onChange={(e) => setConceptoTipo(Number(e.target.value))}
                    className="input text-sm"
                  >
                    <option value={1}>1 - Productos</option>
                    <option value={2}>2 - Servicios (Sugerido)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Monto Total ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="label">Descripción de los servicios *</label>
                  <textarea
                    required
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Concepto facturado..."
                    className="input text-sm resize-none"
                  />
                </div>

                {conceptoTipo === 2 && (
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Datos Obligatorios del Servicio</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-[11px]">Desde</label>
                        <input
                          type="date"
                          required
                          value={periodoDesde}
                          onChange={(e) => setPeriodoDesde(e.target.value)}
                          className="input py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="label text-[11px]">Hasta</label>
                        <input
                          type="date"
                          required
                          value={periodoHasta}
                          onChange={(e) => setPeriodoHasta(e.target.value)}
                          className="input py-1 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label text-[11px]">Vencimiento del Pago</label>
                      <input
                        type="date"
                        required
                        value={vencimientoPago}
                        onChange={(e) => setVencimientoPago(e.target.value)}
                        className="input py-1 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Fecha Facturación</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="input text-sm"
                  />
                </div>

                {actionError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 leading-tight">
                    ⚠️ {actionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || !receptorNombre}
                  className="btn-primary w-full justify-center"
                >
                  {isPending ? "Emitiendo..." : "Solicitar CAE y Emitir"}
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
