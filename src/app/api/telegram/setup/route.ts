import { createHash, timingSafeEqual } from "node:crypto";

import { resolveServerUrl } from "@/config/server-url";
import {
  telegramCall,
  telegramToken,
  webhookSecret,
} from "@/lib/etenesh/telegram";

export const runtime = "nodejs";

function keyMatches(given: string): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) {
    return false;
  }
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

// Open once after deploying: /api/telegram/setup?key=<CRON_SECRET>
// Points the bot at this site and sets its command menu.
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!keyMatches(url.searchParams.get("key") ?? "")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!telegramToken()) {
    return Response.json(
      { error: "TELEGRAM_BOT_TOKEN is not set" },
      { status: 500 }
    );
  }
  const origin = resolveServerUrl().startsWith("http://localhost")
    ? url.origin
    : resolveServerUrl();
  const webhook = await telegramCall("setWebhook", {
    allowed_updates: ["message"],
    secret_token: webhookSecret(),
    url: `${origin}/api/telegram/webhook`,
  });
  const commands = await telegramCall("setMyCommands", {
    commands: [
      { command: "status", description: "See your applications" },
      { command: "stop", description: "Stop updates in this chat" },
    ],
  });
  return Response.json({
    commands,
    webhook,
    webhookUrl: `${origin}/api/telegram/webhook`,
  });
}
