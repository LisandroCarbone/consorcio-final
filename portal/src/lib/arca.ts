import { Arca, AccessTicket } from "@arcasdk/core";
import forge from "node-forge";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { queryOne, query } from "./db";

// Key derivation (failsafe fallback to AGENT_API_KEY)
const secret = process.env.ARCA_ENCRYPTION_KEY || process.env.AGENT_API_KEY || "consorcio_default_secret_key_32_bytes_long!!!";
const AES_KEY = createHash("sha256").update(secret).digest();

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", AES_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

export function decrypt(ciphertextHex: string): string {
  const cipherBuf = Buffer.from(ciphertextHex, "hex");
  const iv = cipherBuf.subarray(0, 16);
  const tag = cipherBuf.subarray(16, 32);
  const data = cipherBuf.subarray(32);
  const decipher = createDecipheriv("aes-256-gcm", AES_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data).toString("utf8") + decipher.final("utf8");
}

export function generarCSR(cuit: string, razonSocial: string) {
  // Generate a key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

  // Create a certification request (CSR)
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  
  // Set subject (AFIP Positional Subject format)
  csr.setSubject([
    { name: "commonName", value: "sistema-facturacion" },
    { name: "countryName", value: "AR" },
    { name: "organizationName", value: razonSocial },
    { name: "serialNumber", value: `CUIT ${cuit}` }
  ]);

  // Sign CSR
  csr.sign(keys.privateKey);

  // Convert to PEM
  const csrPem = forge.pki.certificationRequestToPem(csr);

  return {
    privateKeyPem,
    publicKeyPem,
    csrPem
  };
}

// Custom storage implementation for `@arcasdk/core` ITicketStoragePort
class PostgresTicketStorage {
  private cuit: string;
  private production: boolean;

  constructor(cuit: string, production: boolean) {
    this.cuit = cuit;
    this.production = production;
  }

  async save(ticket: AccessTicket, serviceName: string): Promise<void> {
    const ticketData = {
      header: ticket.getHeaders(),
      credentials: ticket.getCredentials(),
    };
    const expiresAt = ticket.getExpiration();
    
    await query(
      `INSERT INTO app.arca_tokens (cuit, token, sign, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cuit) DO UPDATE SET token=$2, sign=$3, expires_at=$4`,
      [this.cuit, JSON.stringify(ticketData), "", expiresAt]
    );
  }

  async get(serviceName: string): Promise<AccessTicket | null> {
    const row = await queryOne<{ token: string }>(
      `SELECT token FROM app.arca_tokens WHERE cuit=$1 AND expires_at > NOW() + INTERVAL '30 minutes'`,
      [this.cuit]
    );
    if (!row || !row.token) return null;
    try {
      const ticketData = JSON.parse(row.token);
      return AccessTicket.create(ticketData);
    } catch (err) {
      return null;
    }
  }

  async delete(serviceName: string): Promise<void> {
    await query(`DELETE FROM app.arca_tokens WHERE cuit=$1`, [this.cuit]);
  }
}

const arcaInstances = new Map<string, Arca>();

export async function getArcaInstance(cuit: string): Promise<Arca> {
  if (arcaInstances.has(cuit)) return arcaInstances.get(cuit)!;

  const result = await queryOne<{ cert_pem: string; private_key_pem: string; ambiente: string }>(
    "SELECT cert_pem, private_key_pem, ambiente FROM app.arca_credentials WHERE cuit = $1",
    [cuit]
  );
  if (!result) throw new Error(`Sin credenciales ARCA configuradas para el CUIT ${cuit}`);

  const cert = decrypt(result.cert_pem);
  const key = decrypt(result.private_key_pem);
  const isProduction = result.ambiente === "production";

  const instance = new Arca({
    cuit: Number(cuit),
    cert,
    key,
    production: isProduction,
    ticketStorage: new PostgresTicketStorage(cuit, isProduction)
  });

  arcaInstances.set(cuit, instance);
  return instance;
}

export async function emitirFacturaC(params: {
  cuitConsorcio: string;
  puntoVenta: number;
  cuitReceptor: string;
  monto: number;
  conceptoTipo: number;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  periodoDesde?: string;
  periodoHasta?: string;
  vencimientoPago?: string;
}) {
  const arca = await getArcaInstance(params.cuitConsorcio);

  // 1. Obtener próximo número correlativo
  // CbteTipo 11 = Factura C
  const ultimo = await arca.electronicBillingService.getLastVoucher(params.puntoVenta, 11);
  const nro = (ultimo.cbteNro || 0) + 1;

  // 2. Emitir
  const payload: any = {
    CantReg: 1,
    PtoVta: params.puntoVenta,
    CbteTipo: 11,           // Factura C
    Concepto: params.conceptoTipo || 2, // 2 = Servicios
    DocTipo: params.cuitReceptor.length === 11 ? 80 : 96, // 80=CUIT, 96=DNI, 99=Cons.Final
    DocNro: Number(params.cuitReceptor),
    CbteDesde: nro,
    CbteHasta: nro,
    CbteFch: params.fecha.replace(/-/g, ""),
    ImpTotal: params.monto,
    ImpTotConc: 0,
    ImpNeto: 0,
    ImpOpEx: params.monto,  // Todo exento en Factura C
    ImpTrib: 0,
    ImpIVA: 0,
    MonId: "PES",
    MonCotiz: 1,
  };

  if (payload.Concepto === 2 || payload.Concepto === 3) {
    payload.FchServDesde = (params.periodoDesde || params.fecha).replace(/-/g, "");
    payload.FchServHasta = (params.periodoHasta || params.fecha).replace(/-/g, "");
    payload.FchVtoPago = (params.vencimientoPago || params.fecha).replace(/-/g, "");
  }

  const result = await arca.electronicBillingService.createVoucher(payload);

  if (!result.cae) {
    const errors = result.response.Errors?.Err?.map(e => `${e.Code}: ${e.Msg}`).join("; ") || "";
    const observations = result.response.FeDetResp?.FECAEDetResponse?.[0]?.Observaciones?.Obs?.map(o => `${o.Code}: ${o.Msg}`).join("; ") || "";
    throw new Error(errors || observations || "Rechazado por ARCA");
  }

  // 3. Guardar en app.arca_comprobantes
  await query(
    `INSERT INTO app.arca_comprobantes (cuit_emisor, punto_venta, cbte_tipo, cbte_nro, cae, cae_vto, fecha, cuit_receptor, concepto_tipo, monto_total, descripcion)
     VALUES ($1, $2, 11, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      params.cuitConsorcio,
      params.puntoVenta,
      nro,
      result.cae,
      new Date(
        result.caeFchVto.slice(0, 4) + "-" + result.caeFchVto.slice(4, 6) + "-" + result.caeFchVto.slice(6, 8)
      ),
      new Date(params.fecha),
      params.cuitReceptor,
      params.conceptoTipo,
      params.monto,
      params.descripcion
    ]
  );

  return { cae: result.cae, vtoCAE: result.caeFchVto, nroComprobante: nro };
}

export async function consultarPadron(cuitProveedor: string, cuitConsorcio: string) {
  const arca = await getArcaInstance(cuitConsorcio);
  
  try {
    const taxpayerDetails = await arca.registerScopeFiveService.getTaxpayerDetails(Number(cuitProveedor)) as any;
    if (taxpayerDetails && taxpayerDetails.datosGenerales) {
      const dg = taxpayerDetails.datosGenerales;
      const nombre = dg.razonSocial || (dg.apellido ? `${dg.nombre} ${dg.apellido}`.trim() : "");
      
      const impuestos = taxpayerDetails.datosRegimenGeneral?.impuesto || taxpayerDetails.datosRegimenes?.impuesto || [];
      const esRI = impuestos.some((i: any) => i.idImpuesto === 30);
      const esMono = !!taxpayerDetails.datosMonotributo || impuestos.some((i: any) => i.idImpuesto === 20);
      const esExento = impuestos.some((i: any) => i.idImpuesto === 34);

      let condicionIva = "Consumidor Final";
      if (esRI) condicionIva = "Responsable Inscripto";
      else if (esMono) condicionIva = "Monotributista";
      else if (esExento) condicionIva = "IVA Exento";

      return {
        cuit: cuitProveedor,
        nombre,
        condicionIva,
        estado: dg.estadoClave || "ACTIVO",
        direccion: dg.domicilioFiscal?.direccion || dg.domicilio || ""
      };
    }
  } catch (errScopeFive) {
    console.warn("ScopeFive failed, falling back to InscriptionProof:", errScopeFive);
  }

  // Fallback to Constancia de Inscripción
  const proof = await arca.registerInscriptionProofService.getTaxpayerDetails(Number(cuitProveedor)) as any;
  if (!proof || !proof.datosGenerales) {
    throw new Error("No se encontraron datos en el padrón ni en la constancia de inscripción de ARCA.");
  }
  
  const dg = proof.datosGenerales;
  const nombre = dg.razonSocial || (dg.apellido ? `${dg.nombre} ${dg.apellido}`.trim() : "");
  
  const impuestos = proof.datosRegimenGeneral?.impuesto || proof.datosRegimenes?.impuesto || [];
  const esRI = impuestos.some((i: any) => i.idImpuesto === 30);
  const esMono = !!proof.datosMonotributo || impuestos.some((i: any) => i.idImpuesto === 20);
  const esExento = impuestos.some((i: any) => i.idImpuesto === 34);

  let condicionIva = "Consumidor Final";
  if (esRI) condicionIva = "Responsable Inscripto";
  else if (esMono) condicionIva = "Monotributista";
  else if (esExento) condicionIva = "IVA Exento";

  return {
    cuit: cuitProveedor,
    nombre,
    condicionIva,
    estado: dg.estadoClave || "ACTIVO",
    direccion: dg.domicilioFiscal?.direccion || dg.domicilio || ""
  };
}
