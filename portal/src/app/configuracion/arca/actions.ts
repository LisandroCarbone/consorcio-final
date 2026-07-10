"use server";

import { queryOne, query } from "@/lib/db";
import { generarCSR, encrypt, decrypt } from "@/lib/arca";
import forge from "node-forge";

export async function generarCSROnServer(cuit: string, razonSocial: string) {
  try {
    const result = generarCSR(cuit, razonSocial);
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al generar CSR" };
  }
}

export async function guardarCredenciales(
  cuit: string,
  certPem: string,
  privateKeyPem: string,
  puntoVenta: number,
  ambiente: string
) {
  try {
    // Validar el certificado pegado/cargado
    let certParsed;
    try {
      certParsed = forge.pki.certificateFromPem(certPem);
    } catch (e) {
      throw new Error("El certificado ingresado no es un PEM X.509 válido.");
    }

    const encryptedCert = encrypt(certPem);
    const encryptedKey = encrypt(privateKeyPem);

    await query(
      `INSERT INTO app.arca_credentials (cuit, cert_pem, private_key_pem, punto_venta, ambiente, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (cuit) DO UPDATE 
       SET cert_pem = EXCLUDED.cert_pem, private_key_pem = EXCLUDED.private_key_pem, 
           punto_venta = EXCLUDED.punto_venta, ambiente = EXCLUDED.ambiente, updated_at = NOW()`,
      [cuit, encryptedCert, encryptedKey, Number(puntoVenta), ambiente]
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al guardar credenciales" };
  }
}

export async function obtenerDetallesARCA(cuit: string) {
  try {
    const row = await queryOne<{ cert_pem: string; punto_venta: number; ambiente: string; updated_at: Date }>(
      "SELECT cert_pem, punto_venta, ambiente, updated_at FROM app.arca_credentials WHERE cuit = $1",
      [cuit]
    );

    if (!row) {
      return { configured: false };
    }

    const certPem = decrypt(row.cert_pem);
    const certParsed = forge.pki.certificateFromPem(certPem);
    
    // Check subject details and validity
    const subject = certParsed.subject.attributes
      .map((a: any) => `${a.shortName || a.name}=${a.value}`)
      .join(", ");
    
    const notBefore = certParsed.validity.notBefore;
    const notAfter = certParsed.validity.notAfter;
    const expiresDays = Math.ceil((notAfter.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      configured: true,
      puntoVenta: row.punto_venta,
      ambiente: row.ambiente,
      updatedAt: row.updated_at,
      subject,
      validFrom: notBefore,
      validTo: notAfter,
      expiresDays,
      isExpired: expiresDays <= 0
    };
  } catch (err: any) {
    return { configured: false, error: err.message || "Error al obtener detalles de ARCA" };
  }
}

export async function eliminarCredenciales(cuit: string) {
  try {
    await query("DELETE FROM app.arca_credentials WHERE cuit = $1", [cuit]);
    await query("DELETE FROM app.arca_tokens WHERE cuit = $1", [cuit]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al eliminar credenciales" };
  }
}
