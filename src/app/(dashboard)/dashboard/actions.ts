"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/etenesh/dashboard-data";
import { APPLICATION_STATUSES } from "@/lib/etenesh/vocab";

export interface ActionResult {
  error?: string;
  ok: boolean;
}

const statusInput = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(APPLICATION_STATUSES),
});

// Moves an application to a new step. The collection hook records who did
// it and when.
export async function updateApplicationStatus(
  id: number,
  status: string
): Promise<ActionResult> {
  const { payload, email } = await requireStaff();
  const parsed = statusInput.safeParse({ id, status });
  if (!parsed.success) {
    return { error: "That change is not allowed.", ok: false };
  }
  const user = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  });
  await payload.update({
    collection: "applications",
    data: { status: parsed.data.status },
    id: parsed.data.id,
    overrideAccess: true,
    user: user.docs[0],
  });
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

const noteInput = z.object({
  id: z.coerce.number().int().positive(),
  text: z.string().trim().min(1, "Write a note first.").max(2000),
});

export async function addApplicationNote(
  id: number,
  text: string
): Promise<ActionResult> {
  const { payload, email } = await requireStaff();
  const parsed = noteInput.safeParse({ id, text });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, ok: false };
  }
  const doc = await payload.findByID({
    collection: "applications",
    depth: 0,
    id: parsed.data.id,
    overrideAccess: true,
    select: { notes: true },
  });
  await payload.update({
    collection: "applications",
    data: {
      notes: [
        ...(doc.notes ?? []),
        { at: new Date().toISOString(), author: email, text: parsed.data.text },
      ],
    },
    id: parsed.data.id,
    overrideAccess: true,
  });
  revalidatePath(`/dashboard/applications/${parsed.data.id}`);
  return { ok: true };
}
