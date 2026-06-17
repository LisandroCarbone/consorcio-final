import twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  return twilio(accountSid, authToken);
}

const FROM = () => process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"; // Twilio sandbox default

export async function sendMessage(to: string, body: string): Promise<string> {
  const client = getClient();
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const msg = await client.messages.create({ from: FROM(), to: toFormatted, body });
  return msg.sid;
}

export async function sendTemplate(to: string, templateSid: string, variables: Record<string, string>): Promise<string> {
  const client = getClient();
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const msg = await client.messages.create({
    from: FROM(),
    to: toFormatted,
    contentSid: templateSid,
    contentVariables: JSON.stringify(variables),
  });
  return msg.sid;
}
