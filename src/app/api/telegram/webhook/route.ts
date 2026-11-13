import config from "@payload-config";
import { getPayload } from "payload";

import {
  handleUpdate,
  isWebhookRequest,
  sendTelegram,
} from "@/lib/etenesh/telegram";

export const runtime = "nodejs";

// Telegram posts every message to the bot here.
export async function POST(request: Request): Promise<Response> {
  if (!isWebhookRequest(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  try {
    const update: unknown = await request.json();
    const payload = await getPayload({ config });
    const reply = await handleUpdate(payload, update);
    if (reply) {
      await sendTelegram(reply.chatId, reply.text);
    }
  } catch (error) {
    console.error("telegram webhook failed", error);
  }
  // Always 200 so Telegram does not retry the same update forever.
  return Response.json({ ok: true });
}
