import type { Payload } from "payload";
import { z } from "zod";

import type { Job } from "@/payload-types";

import { matchApplicant } from "./match";
import { EDUCATION_LEVELS } from "./vocab";

export const CV_MAX_BYTES = 4 * 1024 * 1024;
export const CV_TYPES: Record<string, string> = {
  "application/msword": ".doc",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

// What the apply form needs to know about a job. Safe to send to browsers.
export interface ApplyJob {
  closesAt: string | null;
  companyName: string;
  education: string;
  id: number | string;
  minYearsExperience: number;
  questions: string[];
  skills: string[];
  slug: string;
  title: string;
}

// A signed-in candidate's saved details, sent with the job to prefill the form.
export interface ApplyProfile {
  city: string;
  cv: { name: string; size: number } | null;
  education: string;
  email: string;
  fullName: string;
  phone: string;
  skills: string[];
  yearsExperience: string;
}

export function toApplyJob(job: Job): ApplyJob {
  return {
    closesAt: job.validThrough ?? null,
    companyName: job.companyName,
    education: job.criteria?.education ?? "None",
    id: job.id,
    minYearsExperience: job.criteria?.minYearsExperience ?? 0,
    questions: (job.criteria?.screeningQuestions ?? []).map(
      (row) => row.question
    ),
    skills: (job.criteria?.requiredSkills ?? []).map((row) => row.value),
    slug: job.slug ?? "",
    title: job.title,
  };
}

export function isJobOpen(
  job: Pick<Job, "_status" | "validThrough">,
  now = new Date()
) {
  if (job._status !== "published") {
    return false;
  }
  return !job.validThrough || new Date(job.validThrough) > now;
}

export const applicationInputSchema = z.object({
  answers: z.array(z.string().trim().max(2000)).default([]),
  city: z.string().trim().max(120).default(""),
  coverNote: z.string().trim().max(3000).default(""),
  education: z.enum(EDUCATION_LEVELS, { message: "Choose your education." }),
  email: z.email({ message: "Enter a valid email address." }),
  fullName: z
    .string()
    .trim()
    .min(3, { message: "Enter your full name." })
    .max(120),
  jobId: z.union([z.string(), z.number()]),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{9,20}$/u, {
      message: "Enter a phone number, like 0911 234 567.",
    }),
  skills: z.array(z.string().trim().max(120)).default([]),
  yearsExperience: z.coerce
    .number({ message: "Enter your years of experience." })
    .int()
    .min(0)
    .max(60),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export interface CvFile {
  bytes: Buffer;
  name: string;
  size: number;
  type: string;
}

export type ApplyResult =
  | { ok: true; reference: string; score: number }
  | { ok: false; reason: "invalid"; errors: Record<string, string> }
  | { ok: false; reason: "closed" }
  | { ok: false; reason: "not_eligible"; missed: string[] };

export function validateCv(file: CvFile | null): string | null {
  if (!file || file.size === 0) {
    return "Upload your CV.";
  }
  if (!(file.type in CV_TYPES)) {
    return "Upload your CV as a PDF or Word file.";
  }
  if (file.size > CV_MAX_BYTES) {
    return "Your CV must be smaller than 4 MB.";
  }
  return null;
}

async function nextReference(
  payload: Payload,
  offset: number
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ET-${year}-`;
  const count = await payload.count({
    collection: "applications",
    overrideAccess: true,
    where: { reference: { like: prefix } },
  });
  return `${prefix}${String(count.totalDocs + 1 + offset).padStart(4, "0")}`;
}

// Checks the job, the criteria and the CV, then saves the application.
export interface SubmitOptions {
  // The signed-in candidate's profile, so the application shows on their
  // account page.
  candidateId?: number | null;
  source?: "auto" | "form";
}

export async function submitApplication(
  payload: Payload,
  raw: unknown,
  cv: CvFile | null,
  options: SubmitOptions = {}
): Promise<ApplyResult> {
  const parsed = applicationInputSchema.safeParse(raw);
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
  }
  const cvError = validateCv(cv);
  if (cvError) {
    errors.cv = cvError;
  }
  if (!parsed.success || cvError || !cv) {
    return { errors, ok: false, reason: "invalid" };
  }
  const input = parsed.data;

  const job = await payload
    .findByID({
      collection: "jobs",
      depth: 0,
      disableErrors: true,
      id: input.jobId,
      overrideAccess: true,
    })
    .catch(() => null);
  if (!(job && isJobOpen(job))) {
    return { ok: false, reason: "closed" };
  }

  const applyJob = toApplyJob(job);
  const result = matchApplicant(
    {
      education: applyJob.education,
      minYearsExperience: applyJob.minYearsExperience,
      requiredSkills: applyJob.skills,
    },
    {
      education: input.education,
      skills: input.skills,
      yearsExperience: input.yearsExperience,
    }
  );
  if (!result.eligible) {
    return {
      missed: result.missed.filter((item) => !applyJob.skills.includes(item)),
      ok: false,
      reason: "not_eligible",
    };
  }

  const phoneDigits = input.phone.replace(/\D+/gu, "");
  const earlier = await payload.find({
    collection: "applications",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    select: { email: true, phone: true, reference: true },
    where: {
      and: [
        { job: { equals: job.id } },
        {
          or: [
            { email: { equals: input.email.toLowerCase() } },
            { phone: { like: phoneDigits.slice(-9) } },
          ],
        },
      ],
    },
  });
  const duplicate = earlier.docs.find(
    (doc) =>
      doc.email?.toLowerCase() === input.email.toLowerCase() ||
      (doc.phone ?? "").replace(/\D+/gu, "").endsWith(phoneDigits.slice(-9))
  );
  if (duplicate) {
    const message = `You already applied for this job. Your reference is ${duplicate.reference}.`;
    return {
      errors:
        duplicate.email?.toLowerCase() === input.email.toLowerCase()
          ? { email: message }
          : { phone: message },
      ok: false,
      reason: "invalid",
    };
  }

  const missingAnswer = applyJob.questions.findIndex(
    (_, index) => !input.answers[index]?.trim()
  );
  if (missingAnswer !== -1) {
    return {
      errors: { [`answer-${missingAnswer}`]: "Please answer this question." },
      ok: false,
      reason: "invalid",
    };
  }

  const rows = (values: string[]) => values.map((value) => ({ value }));
  // Two people applying in the same moment can draw the same number; the
  // unique index rejects one and it takes the next number.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: retries are sequential
    const reference = await nextReference(payload, attempt);
    try {
      await payload.create({
        collection: "applications",
        data: {
          ...(options.candidateId ? { candidate: options.candidateId } : {}),
          answers: applyJob.questions.map((question, index) => ({
            answer: input.answers[index] ?? "",
            question,
          })),
          city: input.city,
          companyName: applyJob.companyName,
          coverNote: input.coverNote,
          cvData: cv.bytes.toString("base64"),
          cvName: cv.name.slice(0, 200),
          cvSize: cv.size,
          cvType: cv.type,
          education: input.education,
          email: input.email.toLowerCase(),
          fullName: input.fullName,
          job: job.id,
          jobTitle: applyJob.title,
          matchMet: rows(result.met),
          matchMissed: rows(result.missed),
          matchScore: result.score,
          phone: input.phone,
          reference,
          skills: rows(input.skills.filter(Boolean)),
          source: options.source ?? "form",
          status: "submitted",
          yearsExperience: input.yearsExperience,
        } as never,
        overrideAccess: true,
      });
      return { ok: true, reference, score: result.score };
    } catch (error) {
      if (!String(error).toLowerCase().includes("unique") && attempt > 0) {
        throw error;
      }
    }
  }
  throw new Error("Could not assign an application reference.");
}
