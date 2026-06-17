import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export type MessageCategory =
  | "reclamo"        // maintenance issue, complaint
  | "consulta_expensa"  // question about expenses
  | "consulta_general"  // general question
  | "pago"           // payment confirmation or question
  | "saludo"         // greeting, no action needed
  | "otro";          // unclassified

export interface ClassificationResult {
  category: MessageCategory;
  confidence: "high" | "medium" | "low";
  summary: string;
  suggested_response: string;
  requires_human: boolean;
  extracted_data: {
    unidad?: string;
    issue_type?: string;
    urgency?: "baja" | "normal" | "alta" | "urgente";
  };
}

const SYSTEM_PROMPT = `Sos un asistente de administración de consorcios (edificios de departamentos en Argentina).
Clasificás mensajes entrantes de WhatsApp de vecinos/propietarios y generás respuestas apropiadas.

Categorías disponibles:
- reclamo: rotura, problema, ruido, filtración, ascensor, luz, agua, limpieza, etc.
- consulta_expensa: preguntas sobre monto, vencimiento, forma de pago de expensas
- consulta_general: preguntas sobre el edificio, reglamento, reunión, etc.
- pago: confirmación o consulta sobre un pago realizado
- saludo: mensaje de saludo o sin contenido accionable
- otro: no entra en las categorías anteriores

Respondé SIEMPRE con un JSON válido con esta estructura exacta:
{
  "category": "<categoria>",
  "confidence": "high|medium|low",
  "summary": "<resumen en una oración de qué necesita el vecino>",
  "suggested_response": "<respuesta sugerida en español rioplatense, cálida y profesional, máximo 3 oraciones>",
  "requires_human": true|false,
  "extracted_data": {
    "unidad": "<número de unidad si se menciona, sino null>",
    "issue_type": "<tipo de problema para reclamos, sino null>",
    "urgency": "baja|normal|alta|urgente (solo para reclamos)"
  }
}

requires_human = true cuando: reclamo urgente, queja grave, tema legal, amenaza, o cuando no podés dar una respuesta útil.`;

export async function classifyMessage(
  message: string,
  context?: {
    phone: string;
    consorcio_nombre?: string;
    ocupante_nombre?: string;
  }
): Promise<ClassificationResult> {
  const userContent = context
    ? `Consorcio: ${context.consorcio_nombre ?? "desconocido"}\nVecino: ${context.ocupante_nombre ?? "desconocido"} (${context.phone})\n\nMensaje: ${message}`
    : `Mensaje: ${message}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const response = await model.generateContent(userContent);
  const text = response.response.text();

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Could not parse classifier response: ${text}`);

  return JSON.parse(jsonMatch[0]) as ClassificationResult;
}
