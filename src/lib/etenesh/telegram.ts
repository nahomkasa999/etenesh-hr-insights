import { createHmac, timingSafeEqual } from "node:crypto";

import type { Payload } from "payload";

import type { Application } from "@/payload-types";

import {
  type ApplicationStatus,
  STATUS_LABELS,
  STATUS_MESSAGES,
} from "./vocab";

const API = "https://api.telegram.org";

export function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || null;
}

async function call<T>(method: string, body?: object): Promise<T | null> {
  const token = botToken();
  if (!token) {
    return null;
  }
  try {
    const response = await fetch(`${API}/bot${token}/${method}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: { "content-type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(8000),
    });
    const json = (await response.json()) as { ok: boolean; result: T };
    return json.ok ? json.result : null;
  } catch {
    // Applying and saving must work even when Telegram is down.
    return null;
  }
}

async function sendMessage(chatId: string, text: string): Promise<boolean> {
  return (await call("sendMessage", { chat_id: chatId, text })) !== null;
}

let username: string | null | undefined;
async function botUsername(): Promise<string | null> {
  if (username === undefined) {
    const me = await call<{ username: string }>("getMe");
    username = me?.username ?? null;
  }
  return username;
}

// The link in the start parameter carries a signature, so knowing a
// reference number alone is not enough to read someone else's updates.
function sign(reference: string): string {
  return createHmac("sha256", process.env.PAYLOAD_SECRET ?? "")
    .update(reference)
    .digest("hex")
    .slice(0, 16);
}

function verifyStart(param: string): string | null {
  const cut = param.lastIndexOf("_");
  if (cut < 1) {
    return null;
  }
  const reference = param.slice(0, cut);
  const given = Buffer.from(param.slice(cut + 1));
  const expected = Buffer.from(sign(reference));
  return given.length === expected.length && timingSafeEqual(given, expected)
    ? reference
    : null;
}

export async function trackingLink(reference: string): Promise<string | null> {
  const name = await botUsername();
  return name
    ? `https://t.me/${name}?start=${reference}_${sign(reference)}`
    : null;
}

const digits = (value: string) => value.replace(/\D/gu, "");

function statusText(
  app: Pick<Application, "companyName" | "jobTitle" | "reference" | "status">
): string {
  const status = app.status as ApplicationStatus;
  return [
    `${app.jobTitle} at ${app.companyName}`,
    `Reference ${app.reference}`,
    `Status: ${STATUS_LABELS[status]}`,
    "",
    STATUS_MESSAGES[status],
  ].join("\n");
}

export type NotifyResult = "sent" | "not_connected" | "failed";

export async function notifyStatus(app: Application): Promise<NotifyResult> {
  if (!app.telegramChatId) {
    return "not_connected";
  }
  const sent = await sendMessage(
    app.telegramChatId,
    `Update on your application\n\n${statusText(app)}`
  );
  return sent ? "sent" : "failed";
}

async function findByReference(payload: Payload, reference: string) {
  const found = await payload.find({
    collection: "applications",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { reference: { equals: reference.toUpperCase() } },
  });
  return found.docs[0] ?? null;
}

async function link(payload: Payload, app: Application, chatId: string) {
  await payload.update({
    collection: "applications",
    context: { skipHistory: true, skipTelegram: true },
    data: { telegramChatId: chatId },
    id: app.id,
    overrideAccess: true,
  });
  await sendMessage(
    chatId,
    `You are connected. We will message you here when your application moves.\n\n${statusText(app)}`
  );
}

const HELP =
  "Send your reference number and phone number to follow your application, for example:\nET-2026-D034 0911234567\n\nSend /status to see your applications.";

export interface TelegramUpdate {
  message?: { chat: { id: number }; text?: string };
}

export async function handleUpdate(
  payload: Payload,
  update: TelegramUpdate
): Promise<void> {
  const message = update.message;
  if (!message?.text) {
    return;
  }
  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (text.startsWith("/start")) {
    const param = text.slice(6).trim();
    const reference = param ? verifyStart(param) : null;
    const app = reference ? await findByReference(payload, reference) : null;
    if (app) {
      await link(payload, app, chatId);
    } else {
      await sendMessage(chatId, `Welcome to Etenesh HR.\n\n${HELP}`);
    }
    return;
  }

  if (text.startsWith("/status")) {
    const mine = await payload.find({
      collection: "applications",
      depth: 0,
      limit: 10,
      overrideAccess: true,
      sort: "-createdAt",
      where: { telegramChatId: { equals: chatId } },
    });
    await sendMessage(
      chatId,
      mine.docs.length > 0
        ? mine.docs.map((doc) => statusText(doc)).join("\n\n")
        : `No applications are connected to this chat yet.\n\n${HELP}`
    );
    return;
  }

  const [reference, ...rest] = text.split(/\s+/u);
  const app = reference ? await findByReference(payload, reference) : null;
  if (
    app &&
    digits(rest.join("")).length >= 7 &&
    digits(app.phone).endsWith(digits(rest.join("")).slice(-9))
  ) {
    await link(payload, app, chatId);
    return;
  }
  await sendMessage(chatId, `I could not match that.\n\n${HELP}`);
}
