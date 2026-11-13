import { createHmac, timingSafeEqual } from "node:crypto";

import type { Payload } from "payload";

import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  STATUS_LABELS,
  STATUS_MESSAGES,
} from "./vocab";

// The Etenesh Telegram bot: candidates link their account with a deep link,
// ask /status, and get a message whenever an application changes status.

const API = "https://api.telegram.org";

export function telegramToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return token ? token : null;
}

function key(purpose: string): Buffer {
  return createHmac("sha256", process.env.PAYLOAD_SECRET ?? "")
    .update(`etenesh-telegram:${purpose}`)
    .digest();
}

function sign(value: string, purpose: string, length = 20): string {
  return createHmac("sha256", key(purpose))
    .update(value)
    .digest("hex")
    .slice(0, length);
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Telegram sends this in X-Telegram-Bot-Api-Secret-Token on every update.
export function webhookSecret(): string {
  return sign(telegramToken() ?? "", "webhook", 48);
}

export function isWebhookRequest(request: Request): boolean {
  const header = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  return telegramToken() !== null && same(header, webhookSecret());
}

// /start payloads are at most 64 characters of [A-Za-z0-9_-].
export function linkToken(candidateId: number): string {
  return `c${candidateId}_${sign(String(candidateId), "link")}`;
}

const LINK_RE = /^c(?<id>\d+)_(?<mac>[0-9a-f]{20})$/u;
const SPACE_RE = /\s+/u;

export function readLinkToken(token: string): number | null {
  const match = LINK_RE.exec(token.trim());
  if (!match) {
    return null;
  }
  const { id = "", mac = "" } = match.groups ?? {};
  return same(mac, sign(id, "link")) ? Number(id) : null;
}

export async function telegramCall(
  method: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const token = telegramToken();
  if (!token) {
    return null;
  }
  const response = await fetch(`${API}/bot${token}/${method}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(8000),
  });
  return response.json().catch(() => null);
}

export async function sendTelegram(
  chatId: string | number,
  text: string
): Promise<void> {
  try {
    await telegramCall("sendMessage", {
      chat_id: chatId,
      disable_web_page_preview: true,
      text,
    });
  } catch (error) {
    console.error(
      "telegram send failed",
      error instanceof Error ? error.message : "unknown"
    );
  }
}

let cachedUsername: string | null = null;

// The bot's @username, for the "Connect Telegram" link.
export async function botUsername(): Promise<string | null> {
  if (cachedUsername || !telegramToken()) {
    return cachedUsername;
  }
  try {
    const reply = (await telegramCall("getMe", {})) as {
      result?: { username?: string };
    } | null;
    cachedUsername = reply?.result?.username ?? null;
  } catch {
    cachedUsername = null;
  }
  return cachedUsername;
}

function statusOf(value: unknown): ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : "submitted";
}

export function statusUpdateText(application: {
  companyName?: string | null;
  jobTitle?: string | null;
  reference: string;
  status: unknown;
}): string {
  const status = statusOf(application.status);
  return [
    `${application.jobTitle ?? "Your application"}${application.companyName ? ` at ${application.companyName}` : ""}`,
    `Status: ${STATUS_LABELS[status]}`,
    STATUS_MESSAGES[status],
    `Reference: ${application.reference}`,
  ].join("\n");
}

const HELP =
  "Etenesh HR bot\n\n/status - see your applications\n\nTo connect, open your Etenesh account and press Connect Telegram.";

async function candidateByChat(payload: Payload, chatId: string) {
  const found = await payload.find({
    collection: "candidates",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { telegramChatId: { equals: chatId } },
  });
  return found.docs[0] ?? null;
}

async function statusReply(payload: Payload, chatId: string): Promise<string> {
  const candidate = await candidateByChat(payload, chatId);
  if (!candidate) {
    return "This chat is not connected yet. Open your Etenesh account and press Connect Telegram.";
  }
  const result = await payload.find({
    collection: "applications",
    depth: 0,
    limit: 10,
    overrideAccess: true,
    select: {
      companyName: true,
      jobTitle: true,
      reference: true,
      status: true,
    },
    sort: "-createdAt",
    where: { candidate: { equals: candidate.id } },
  });
  if (result.docs.length === 0) {
    return "You have no applications yet. Apply on the Etenesh website and they will show here.";
  }
  return [
    `Your applications (${result.totalDocs}):`,
    ...result.docs.map((doc) => statusUpdateText(doc)),
  ].join("\n\n");
}

interface TelegramUpdate {
  message?: { chat?: { id?: number }; text?: string };
}

// Handles one Telegram update. Returns the reply text, or null for none.
export async function handleUpdate(
  payload: Payload,
  update: unknown
): Promise<{ chatId: string; text: string } | null> {
  const message =
    typeof update === "object" && update !== null
      ? (update as TelegramUpdate).message
      : undefined;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim() ?? "";
  if (chatId === undefined) {
    return null;
  }
  const chat = String(chatId);
  const [command = "", argument = ""] = text.split(SPACE_RE);
  const name = command.split("@")[0]?.toLowerCase();

  if (name === "/start" && argument) {
    const candidateId = readLinkToken(argument);
    if (candidateId === null) {
      return {
        chatId: chat,
        text: "That link is not valid. Open your Etenesh account and press Connect Telegram again.",
      };
    }
    await payload.update({
      collection: "candidates",
      data: { telegramChatId: chat },
      id: candidateId,
      overrideAccess: true,
    });
    return {
      chatId: chat,
      text: `Connected. You will get a message here whenever an application changes.\n\n${await statusReply(payload, chat)}`,
    };
  }
  if (name === "/status") {
    return { chatId: chat, text: await statusReply(payload, chat) };
  }
  if (name === "/stop") {
    const candidate = await candidateByChat(payload, chat);
    if (candidate) {
      await payload.update({
        collection: "candidates",
        data: { telegramChatId: null },
        id: candidate.id,
        overrideAccess: true,
      });
    }
    return {
      chatId: chat,
      text: "Disconnected. You will not get updates here any more.",
    };
  }
  return { chatId: chat, text: HELP };
}
