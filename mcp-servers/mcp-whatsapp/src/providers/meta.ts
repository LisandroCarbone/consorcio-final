/**
 * Meta WhatsApp Business API (Cloud API) provider.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const BASE_URL = "https://graph.facebook.com/v20.0";

function getConfig() {
  const token = process.env.META_WA_TOKEN;
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error("META_WA_TOKEN and META_WA_PHONE_NUMBER_ID are required");
  }
  return { token, phoneNumberId };
}

async function post(path: string, body: object): Promise<{ messages: Array<{ id: string }> }> {
  const cfg = getConfig();
  const res = await fetch(`${BASE_URL}/${cfg.phoneNumberId}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<{ messages: Array<{ id: string }> }>;
}

export async function sendMessage(to: string, body: string): Promise<string> {
  const data = await post("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  });
  return data.messages[0]?.id ?? "";
}

export async function sendTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components: object[]
): Promise<string> {
  const data = await post("/messages", {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name: templateName, language: { code: languageCode }, components },
  });
  return data.messages[0]?.id ?? "";
}
