"use client";

import React, { useState, useTransition } from "react";
import { createProveedor } from "./actions";

interface Props {
  activeCuitConsorcio: string;
}

export function NuevoProveedorForm({ activeCuitConsorcio }: Props) {
  const [cuit, setCuit] = useState("");
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isValidating, setIsValidating] = useState(false);
  const [validationInfo, setValidationInfo] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleValidateCuit = async () => {
    setValidationError("");
    setValidationInfo("");

    const cleanCuit = cuit.replace(/-/g, "").trim();
    if (cleanCuit.length !== 11 || isNaN(Number(cleanCuit))) {
      setValidationError("El CUIT debe tener 11 dígitos numéricos.");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch(`/api/arca/validar-cuit?cuit=${cleanCuit}&cuitConsorcio=${activeCuitConsorcio}`);
      const data = await res.json();

      if (data.error) {
        setValidationError(data.error);
      } else if (data.success && data.details) {
        const { nombre: arcaNombre, condicionIva, estado } = data.details;
        setNombre(arcaNombre);
        setValidationInfo(`ARCA: ${condicionIva} (${estado})`);
      }
    } catch (err) {
      setValidationError("Error al conectar con el padrón de ARCA.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("rubro", rubro);
      formData.append("whatsapp", whatsapp);
      formData.append("email", email);
      formData.append("cuit", cuit.replace(/-/g, "").trim());
      formData.append("notas", notas);

      await createProveedor(formData);
      
      // Reset form
      setCuit("");
      setNombre("");
      setRubro("");
      setWhatsapp("");
      setEmail("");
      setNotas("");
      setValidationInfo("");
      setValidationError("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      
      <div>
        <label className="label">CUIT Proveedor</label>
        <div className="flex gap-2">
          <input
            name="cuit"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            placeholder="30-12345678-9"
            className="input text-sm flex-1"
          />
          <button
            type="button"
            onClick={handleValidateCuit}
            disabled={isValidating || !cuit}
            className="px-3 py-1.5 border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
          >
            {isValidating ? "Validando..." : "🔍 Validar"}
          </button>
        </div>
        {validationInfo && (
          <span className="text-[10px] text-green-600 font-semibold mt-1 block">
            {validationInfo}
          </span>
        )}
        {validationError && (
          <span className="text-[10px] text-red-500 mt-1 block leading-tight">
            ⚠️ {validationError}
          </span>
        )}
      </div>

      <div>
        <label className="label">Nombre / Razón Social *</label>
        <input
          name="nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del proveedor o empresa"
          className="input text-sm"
        />
      </div>

      <div>
        <label className="label">Rubro</label>
        <input
          name="rubro"
          value={rubro}
          onChange={(e) => setRubro(e.target.value)}
          placeholder="plomería, electricidad..."
          className="input text-sm"
        />
      </div>

      <div>
        <label className="label">WhatsApp</label>
        <input
          name="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+5491112345678"
          className="input text-sm"
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="proveedor@email.com"
          className="input text-sm"
        />
      </div>

      <div>
        <label className="label">Notas / Observaciones</label>
        <textarea
          name="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Datos adicionales del proveedor..."
          className="input text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !nombre}
        className="btn-primary w-full justify-center"
      >
        {isPending ? "Registrando..." : "Registrar Proveedor"}
      </button>

    </form>
  );
}
