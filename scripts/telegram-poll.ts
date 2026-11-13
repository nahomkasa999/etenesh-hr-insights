// Receives Telegram messages without a public URL. Keep it running next to
// `next dev`. In production set a webhook to /api/telegram instead.
import config from "@payload-config";
import { getPayload } from "payload";

import {
  botToken,
  handleUpdate,
  type TelegramUpdate,
} from "../src/lib/etenesh/telegram";

const token = botToken();
if (!token) {
  throw new Error("Set TELEGRAM_BOT_TOKEN first.");
}
const api = `https://api.telegram.org/bot${token}`;
const payload = await getPayload({ config });
await fetch(`${api}/deleteWebhook`);
console.log("Listening for Telegram messages. Press Ctrl+C to stop.");

let offset = 0;
for (;;) {
  try {
    // biome-ignore lint/performance/noAwaitInLoops: long polling is sequential
    const response = await fetch(
      `${api}/getUpdates?timeout=50&offset=${offset}`
    );
    const { result = [] } = (await response.json()) as {
      result?: (TelegramUpdate & { update_id: number })[];
    };
    for (const update of result) {
      offset = update.update_id + 1;
      // biome-ignore lint/performance/noAwaitInLoops: keep message order
      await handleUpdate(payload, update).catch((error) =>
        console.error(error)
      );
    }
  } catch (error) {
    console.error(error);
    // biome-ignore lint/performance/noAwaitInLoops: back off before retrying
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
