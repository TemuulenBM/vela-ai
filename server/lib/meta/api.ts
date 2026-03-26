const FB_GRAPH_API_BASE = "https://graph.facebook.com/v21.0";
export const IG_GRAPH_API_BASE = "https://graph.instagram.com/v21.0";
const MESSENGER_MAX_LENGTH = 2000;
const INSTAGRAM_MAX_LENGTH = 1000;

/**
 * Meta Send API-аар хариу илгээх.
 * Урт текстийг platform-ийн дагуу хэсэглэж илгээнэ.
 * apiBase: Instagram Login token → graph.instagram.com, бусад → graph.facebook.com
 */
export async function sendMetaMessage(params: {
  recipientId: string;
  text: string;
  pageAccessToken: string;
  platform: "messenger" | "instagram";
  apiBase?: string;
}): Promise<void> {
  const { recipientId, text, pageAccessToken, platform, apiBase } = params;
  const maxLength = platform === "instagram" ? INSTAGRAM_MAX_LENGTH : MESSENGER_MAX_LENGTH;
  const base = apiBase || FB_GRAPH_API_BASE;

  const chunks = splitMessage(text, maxLength);

  for (const chunk of chunks) {
    await sendSingleMessage(recipientId, chunk, pageAccessToken, base);
  }
}

async function sendSingleMessage(
  recipientId: string,
  text: string,
  pageAccessToken: string,
  apiBase: string = FB_GRAPH_API_BASE,
): Promise<void> {
  const response = await fetch(`${apiBase}/me/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "RESPONSE",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Meta Send API] Error:", response.status, error);
    throw new Error(`Meta Send API failed: ${response.status}`);
  }
}

/**
 * Текстийг maxLength-д багтаан хэсэглэх.
 * Мөр/өгүүлбэрийн дунд таслахгүй.
 */
function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Мөрийн завсар эсвэл цэг дээр таслах
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex < maxLength * 0.5) {
      splitIndex = remaining.lastIndexOf(". ", maxLength);
    }
    if (splitIndex < maxLength * 0.3) {
      splitIndex = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitIndex <= 0) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks;
}

/**
 * Meta Profile API-аас хэрэглэгчийн нэрийг авах.
 */
export async function getMetaUserProfile(
  userId: string,
  pageAccessToken: string,
): Promise<{ name?: string; profilePic?: string }> {
  try {
    const response = await fetch(`${FB_GRAPH_API_BASE}/${userId}?fields=name,profile_pic`, {
      headers: { Authorization: `Bearer ${pageAccessToken}` },
    });
    if (!response.ok) return {};
    const data = (await response.json()) as { name?: string; profile_pic?: string };
    return { name: data.name, profilePic: data.profile_pic };
  } catch {
    return {};
  }
}
