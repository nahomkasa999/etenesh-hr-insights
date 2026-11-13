import config from "@payload-config";
import { getPayload } from "payload";

import { handleUpdate, type TelegramUpdate } from "@/lib/etenesh/telegram";

// Telegram calls this when a webhook is set. On a laptop, run
// `bun run telegram:poll` instead.
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    !secret ||
    request.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return new Response(null, { status: 401 });
  }
  const payload = await getPayload({ config });
  await handleUpdate(payload, (await request.json()) as TelegramUpdate);
  return new Response(null, { status: 200 });
}
