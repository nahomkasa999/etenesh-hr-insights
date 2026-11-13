"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { notifyStatus, type NotifyResult } from "@/lib/etenesh/telegram";
import type { Application } from "@/payload-types";
import { requireStaff } from "@/lib/etenesh/dashboard-data";
import { importedJobSchema, importFileSchema, importJobs } from "@/lib/etenesh/job-import";
import { APPLICATION_STATUSES } from "@/lib/etenesh/vocab";

export interface ActionResult {
  error?: string;
  ok: boolean;
  telegram?: NotifyResult;
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
  const before = await payload.findByID({
    collection: "applications",
    depth: 0,
    id: parsed.data.id,
    overrideAccess: true,
    select: { status: true },
  });
  const updated = await payload.update({
    collection: "applications",
    context: { skipTelegram: true },
    data: { status: parsed.data.status },
    id: parsed.data.id,
    overrideAccess: true,
    user: user.docs[0],
  });
  const telegram =
    before.status === parsed.data.status
      ? undefined
      : await notifyStatus(updated as Application);
  revalidatePath("/dashboard", "layout");
  return { ok: true, telegram };
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

const companyInput = z.object({
  industry: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  name: z.string().trim().min(2, "Enter the company name.").max(160),
  website: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^https?:\/\//u.test(v),
      "Start the web address with https://"
    )
    .optional(),
});

export async function saveCompany(
  id: number | null,
  input: z.input<typeof companyInput>
): Promise<ActionResult> {
  const { payload } = await requireStaff();
  const parsed = companyInput.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message, ok: false };
  }
  const data = {
    industry: parsed.data.industry || null,
    location: parsed.data.location || null,
    name: parsed.data.name,
    website: parsed.data.website || null,
  };
  try {
    if (id === null) {
      await payload.create({
        collection: "companies",
        data: { ...data, origin: "manual" } as never,
        overrideAccess: true,
      });
    } else {
      await payload.update({
        collection: "companies",
        data: data as never,
        id,
        overrideAccess: true,
      });
    }
  } catch {
    return { error: "Could not save. Is the name already used?", ok: false };
  }
  revalidatePath("/dashboard/companies");
  return { ok: true };
}

const split = (text: string, pattern: RegExp) =>
  text
    .split(pattern)
    .map((line) => line.trim())
    .filter(Boolean);
const lines = (text: string) => split(text, /\r?\n/u);
const skillList = (text: string) => split(text, /\r?\n|,/u);

export interface JobFormInput {
  about: string;
  area: string;
  careerLevel: string;
  category: string;
  city: string;
  company: string;
  deadline: string;
  education: string;
  employmentType: string;
  minYearsExperience: string;
  published: boolean;
  requiredSkills: string;
  requirements: string;
  responsibilities: string;
  salaryMax: string;
  salaryMin: string;
  screeningQuestions: string;
  summary: string;
  title: string;
  workplaceType: string;
}

export interface JobResult extends ActionResult {
  id?: number;
}

export async function postJob(input: JobFormInput): Promise<JobResult> {
  const { payload } = await requireStaff();
  const parsed = importedJobSchema.safeParse({
    about: input.about || null,
    area: input.area || null,
    careerLevel: input.careerLevel,
    category: input.category,
    city: input.city,
    company: input.company,
    criteria: {
      education: input.education,
      minYearsExperience: Number(input.minYearsExperience || 0),
      requiredSkills: skillList(input.requiredSkills),
    },
    deadline: input.deadline,
    employmentType: input.employmentType,
    requirements: lines(input.requirements),
    responsibilities: lines(input.responsibilities),
    salaryMax: input.salaryMax ? Number(input.salaryMax) : null,
    salaryMin: input.salaryMin ? Number(input.salaryMin) : null,
    screeningQuestions: lines(input.screeningQuestions),
    summary: input.summary,
    title: input.title,
    workplaceType: input.workplaceType,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `Check “${String(issue?.path.at(-1) ?? "the form")}”: ${issue?.message ?? "invalid"}`,
      ok: false,
    };
  }
  const [id] = await importJobs(payload, [parsed.data]);
  if (!input.published && id !== undefined) {
    await payload.update({
      collection: "jobs",
      data: { _status: "draft" } as never,
      id,
      overrideAccess: true,
    });
  }
  revalidatePath("/dashboard/jobs");
  return { id: Number(id), ok: true };
}

export async function updateJob(
  id: number,
  input: Pick<
    JobFormInput,
    | "deadline"
    | "education"
    | "minYearsExperience"
    | "published"
    | "requiredSkills"
    | "screeningQuestions"
    | "summary"
    | "title"
  >
): Promise<JobResult> {
  const { payload } = await requireStaff();
  if (input.title.trim().length < 2 || input.summary.trim().length < 10) {
    return {
      error: "Add a title and a summary of at least 10 letters.",
      ok: false,
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(input.deadline)) {
    return { error: "Pick a closing date.", ok: false };
  }
  await payload.update({
    collection: "jobs",
    data: {
      _status: input.published ? "published" : "draft",
      criteria: {
        education: input.education,
        minYearsExperience: Number(input.minYearsExperience || 0),
        requiredSkills: skillList(input.requiredSkills).map((value) => ({
          value,
        })),
        screeningQuestions: lines(input.screeningQuestions).map((question) => ({
          question,
        })),
      },
      summary: input.summary.trim(),
      title: input.title.trim(),
      validThrough: new Date(`${input.deadline}T23:59:59+03:00`).toISOString(),
    } as never,
    id,
    overrideAccess: true,
  });
  revalidatePath("/dashboard", "layout");
  return { id, ok: true };
}

export interface ImportResult extends ActionResult {
  created?: number;
}

// Reads the JSON an AI wrote from the pasted job text and posts the jobs.
export async function importJobsFromJson(raw: string): Promise<ImportResult> {
  const { payload } = await requireStaff();
  const text = raw
    .trim()
    .replace(/^```(?:json)?/iu, "")
    .replace(/```$/u, "")
    .trim();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      error: "That is not valid JSON. Copy the whole reply from the AI.",
      ok: false,
    };
  }
  const parsed = importFileSchema.safeParse(
    Array.isArray(data) ? { jobs: data } : data
  );
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      error: `Problem at “${issue?.path.join(" › ") ?? ""}”: ${issue?.message ?? "invalid"}`,
      ok: false,
    };
  }
  const ids = await importJobs(payload, parsed.data.jobs);
  revalidatePath("/dashboard", "layout");
  return { created: ids.length, ok: true };
}
