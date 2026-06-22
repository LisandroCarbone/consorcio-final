import { Pool, PoolClient } from 'pg';

export interface ExtractedPaymentInfo {
  amount: number;
  date: string;
  cuit: string;
  senderName: string;
  targetCbu: string;
}

export interface MatchPaymentResult {
  cuitConsorcio: string | null;
  uf: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
}

/**
 * Extracts payment parameters (amount, date, CUIT, target CBU, and sender name) from 
 * the email/message subject, body, or attachment file name.
 */
export function extractPaymentInfo(subject: string, body: string, attachmentName?: string): ExtractedPaymentInfo {
  const textToSearch = `${subject}\n${body}\n${attachmentName || ''}`.toUpperCase();

  // 1. Extract Amount
  let amount = 0;
  const fileAmountMatch = attachmentName ? attachmentName.match(/_(\d+)(?:\.\d+)?\./) || attachmentName.match(/(\d+)k?\./i) : null;
  
  const amountRegexes = [
    /\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/,
    /IMPORTE\s*:?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/,
    /TOTAL\s*:?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/,
    /MONTO\s*:?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/
  ];

  let amountFound = false;
  for (const regex of amountRegexes) {
    const match = textToSearch.match(regex);
    if (match && match[1]) {
      const cleanStr = match[1].replace(/\./g, '').replace(',', '.');
      const val = parseFloat(cleanStr);
      if (!isNaN(val) && val > 0) {
        amount = val;
        amountFound = true;
        break;
      }
    }
  }

  if (!amountFound && fileAmountMatch) {
    const val = parseFloat(fileAmountMatch[1]);
    if (!isNaN(val)) amount = val;
  }

  // 2. Extract Date
  let date = new Date().toISOString().substring(0, 10);
  const dateRegexes = [
    /(\d{2})[\/-](\d{2})[\/-](\d{4})/,
    /(\d{4})[\/-](\d{2})[\/-](\d{2})/
  ];

  for (const regex of dateRegexes) {
    const match = textToSearch.match(regex);
    if (match) {
      if (match[3].length === 4) {
        date = `${match[3]}-${match[2]}-${match[1]}`;
      } else {
        date = `${match[1]}-${match[2]}-${match[3]}`;
      }
      break;
    }
  }

  // 3. Extract CUIT/CUIL
  let cuit = '';
  const cuitMatch = textToSearch.match(/([23]\d-?\d{8}-?\d)/);
  if (cuitMatch) {
    cuit = cuitMatch[1].replace(/-/g, '');
  }

  // 4. Extract target CBU
  let targetCbu = '';
  const cbuMatch = textToSearch.match(/(\d{22})/);
  if (cbuMatch) {
    targetCbu = cbuMatch[1];
  }

  let senderName = '';
  const nameMatch = textToSearch.match(/ORIGEN\s*:?\s*([A-Z\s]{4,30})(?:\n|\r|$)/) || 
                    textToSearch.match(/ORDENANTE\s*:?\s*([A-Z\s]{4,30})(?:\n|\r|$)/) ||
                    textToSearch.match(/DESDE\s*:?\s*([A-Z\s]{4,30})(?:\n|\r|$)/);
  if (nameMatch) {
    senderName = nameMatch[1].trim();
  }

  return {
    amount,
    date,
    cuit,
    senderName,
    targetCbu
  };
}

/**
 * Searches the Postgres database to match the payment details to a specific Building (cuit) 
 * and Unit (uf), returning confidence score and description.
 */
export async function matchPaymentToUF(
  dbClient: Pool | PoolClient,
  emailSender: string | undefined,
  subject: string,
  body: string,
  extracted: ExtractedPaymentInfo
): Promise<MatchPaymentResult> {
  const textToSearch = `${subject}\n${body}`.toUpperCase();

  // 1. First search for a registered sender (email or phone) across ALL consorcios
  if (emailSender && emailSender.trim()) {
    const cleanSender = emailSender.trim().toLowerCase();
    const isEmail = cleanSender.includes('@');
    
    if (isEmail) {
      const emailQuery = await dbClient.query(
        `SELECT u.consorcio_cuit, u.uf
         FROM app.unidades u
         JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true
         JOIN app.personas p ON p.id = o.persona_id
         WHERE LOWER(p.email) = $1;`,
        [cleanSender]
      );
      if (emailQuery.rows.length > 0) {
        return {
          cuitConsorcio: emailQuery.rows[0].consorcio_cuit,
          uf: emailQuery.rows[0].uf,
          confidence: 'high',
          reason: `Coincidencia por remitente registrado (${emailSender}).`
        };
      }
    } else {
      const cleanPhone = cleanSender.replace(/[^0-9]/g, '');
      if (cleanPhone) {
        const phoneQuery = await dbClient.query(
          `SELECT u.consorcio_cuit, u.uf, p.telefono
           FROM app.unidades u
           JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true
           JOIN app.personas p ON p.id = o.persona_id
           WHERE p.telefono IS NOT NULL AND p.telefono <> '';`
        );
        for (const row of phoneQuery.rows) {
          const uPhone = String(row.telefono).replace(/[^0-9]/g, '');
          if (uPhone && uPhone.endsWith(cleanPhone)) {
            return {
              cuitConsorcio: row.consorcio_cuit,
              uf: row.uf,
              confidence: 'high',
              reason: `Coincidencia por remitente registrado (${emailSender}).`
            };
          }
        }
      }
    }
  }

  // 2. Find matched consorcio
  let matchedCuit: string | null = null;

  if (extracted.targetCbu) {
    const cbuQuery = await dbClient.query(
      `SELECT cuit FROM app.consorcios WHERE cbu = $1;`,
      [extracted.targetCbu]
    );
    if (cbuQuery.rows.length > 0) {
      matchedCuit = cbuQuery.rows[0].cuit;
    }
  }

  if (!matchedCuit) {
    const aliasQuery = await dbClient.query(
      `SELECT cuit, bank_alias FROM app.consorcios WHERE bank_alias IS NOT NULL AND bank_alias <> '';`
    );
    for (const row of aliasQuery.rows) {
      if (textToSearch.includes(String(row.bank_alias).toUpperCase())) {
        matchedCuit = row.cuit;
        break;
      }
    }
  }

  if (!matchedCuit) {
    const nameQuery = await dbClient.query(
      `SELECT cuit, nombre FROM app.consorcios;`
    );
    for (const row of nameQuery.rows) {
      const nameWords = String(row.nombre).toUpperCase().split(/\s+/).filter(w => w.length > 3 && w !== "CONSORCIO" && w !== "PROPIETARIOS");
      let matched = false;
      for (const word of nameWords) {
        if (textToSearch.includes(word)) {
          matched = true;
          break;
        }
      }
      if (matched) {
        matchedCuit = row.cuit;
        break;
      }
    }
  }

  if (!matchedCuit) {
    const firstConsQuery = await dbClient.query(
      `SELECT cuit FROM app.consorcios LIMIT 1;`
    );
    if (firstConsQuery.rows.length > 0) {
      matchedCuit = firstConsQuery.rows[0].cuit;
    }
  }

  if (!matchedCuit) {
    return {
      cuitConsorcio: null,
      uf: null,
      confidence: 'none',
      reason: 'No se encontró consorcio en la base de datos.'
    };
  }

  // 3. Match Payment to UF
  const unitsQuery = await dbClient.query(
    `SELECT u.id, u.uf, u.depto, p.nombre, p.apellido
     FROM app.unidades u
     LEFT JOIN app.ocupantes o ON o.unidad_id = u.id AND o.activo = true
     LEFT JOIN app.personas p ON p.id = o.persona_id
     WHERE u.consorcio_cuit = $1;`,
    [matchedCuit]
  );
  const units = unitsQuery.rows;

  for (const u of units) {
    const ufStr = String(u.uf).toUpperCase().trim();
    const deptoStr = String(u.depto || '').toUpperCase().trim();

    if (textToSearch.includes(`UF ${ufStr}`) || textToSearch.includes(`UF-${ufStr}`) || textToSearch.includes(`UF${ufStr}`)) {
      return {
        cuitConsorcio: matchedCuit,
        uf: u.uf,
        confidence: 'high',
        reason: `UF ${u.uf} especificada en el cuerpo/asunto.`
      };
    }
    if (deptoStr && (textToSearch.includes(`DPTO ${deptoStr}`) || textToSearch.includes(`DEPTO ${deptoStr}`) || textToSearch.includes(`DEPARTAMENTO ${deptoStr}`))) {
      return {
        cuitConsorcio: matchedCuit,
        uf: u.uf,
        confidence: 'high',
        reason: `Departamento ${u.depto} especificado en el cuerpo/asunto.`
      };
    }
    if (ufStr.length > 1 && textToSearch.includes(ufStr)) {
      return {
        cuitConsorcio: matchedCuit,
        uf: u.uf,
        confidence: 'medium',
        reason: `Coincidencia parcial del código de unidad (${u.uf}) en el texto.`
      };
    }
  }

  if (extracted.senderName) {
    const cleanExtractedName = extracted.senderName.toUpperCase().replace(/[^A-Z]/g, '');
    for (const u of units) {
      if (u.nombre || u.apellido) {
        const fullName = `${u.nombre || ''} ${u.apellido || ''}`.toUpperCase().trim();
        const cleanOwnerName = fullName.replace(/[^A-Z]/g, '');
        if (cleanOwnerName && (cleanExtractedName.includes(cleanOwnerName) || cleanOwnerName.includes(cleanExtractedName))) {
          return {
            cuitConsorcio: matchedCuit,
            uf: u.uf,
            confidence: 'medium',
            reason: `Coincidencia del titular de la transferencia (${extracted.senderName}) con el propietario registrado (${fullName}).`
          };
        }
      }
    }
  }

  if (units.length > 0) {
    return {
      cuitConsorcio: matchedCuit,
      uf: units[0].uf,
      confidence: 'low',
      reason: `No se pudo determinar la unidad con precisión. Se pre-asigna la primera UF por defecto.`
    };
  }

  return {
    cuitConsorcio: matchedCuit,
    uf: null,
    confidence: 'low',
    reason: 'Consorcio identificado pero no tiene unidades funcionales.'
  };
}
