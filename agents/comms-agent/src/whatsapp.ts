/**
 * Thin wrapper to send WhatsApp replies via the same provider used in mcp-whatsapp.
 * Avoids spawning the MCP server just to send a reply.
 */

const PROVIDER = (process.env.WA_PROVIDER ?? "twilio") as "twilio" | "meta";

async function sendViaTwilio(to: string, body: string): Promise<void> {
  const { default: twilio } = await import("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
  const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  await client.messages.create({ from, to: toFormatted, body });
}

async function sendViaMeta(to: string, body: string): Promise<void> {
  const token = process.env.META_WA_TOKEN!;
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID!;
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
  });
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
}

export async function sendReply(to: string, body: string): Promise<void> {
  if (PROVIDER === "meta") return sendViaMeta(to, body);
  return sendViaTwilio(to, body);
}
