import type { Payload } from "payload";
import { z } from "zod";

import {
  JOB_EMPLOYMENT_TYPES,
  JOB_WORKPLACE_TYPES,
} from "@/lib/domain/job-vocab";
import type { Candidate, CandidateDocument } from "@/payload-types";
import {
  deleteCandidateFile,
  readCandidateFile,
  storeCandidateFile,
} from "@/storage/candidate-files";

import type { CvFile } from "./apply";
import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_COUNT,
  DOCUMENT_TYPES,
  type DocumentKind,
  isCvType,
} from "./candidate-vocab";
import { EDUCATION_LEVELS } from "./vocab";

export interface AccountUser {
  email: string;
  name: string;
  userId: string;
}

// The profile row for a signed-in account, created on first use.
export async function ensureCandidate(
  payload: Payload,
  user: AccountUser
): Promise<Candidate> {
  const found = await payload.find({
    collection: "candidates",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { authUserId: { equals: user.userId } },
  });
  const [existing] = found.docs;
  if (existing) {
    return existing;
  }
  try {
    return await payload.create({
      collection: "candidates",
      data: {
        authUserId: user.userId,
        email: user.email.toLowerCase(),
        fullName: user.name,
      },
      overrideAccess: true,
    });
  } catch (error) {
    // Two requests on a first visit can race; the unique index keeps one.
    const again = await payload.find({
      collection: "candidates",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { authUserId: { equals: user.userId } },
    });
    if (again.docs[0]) {
      return again.docs[0];
    }
    throw error;
  }
}

export type DocumentSummary = Pick<
  CandidateDocument,
  "createdAt" | "id" | "kind" | "mimeType" | "name" | "size"
>;

export async function listDocuments(
  payload: Payload,
  candidateId: number
): Promise<DocumentSummary[]> {
  const result = await payload.find({
    collection: "candidate-documents",
    depth: 0,
    limit: DOCUMENT_MAX_COUNT * 2,
    overrideAccess: true,
    select: {
      createdAt: true,
      kind: true,
      mimeType: true,
      name: true,
      size: true,
    },
    sort: "-createdAt",
    where: { candidate: { equals: candidateId } },
  });
  return result.docs as DocumentSummary[];
}

// The newest CV on the profile, with its bytes, for applying.
export async function profileCv(
  payload: Payload,
  candidateId: number
): Promise<CvFile | null> {
  const result = await payload.find({
    collection: "candidate-documents",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
    sort: "-createdAt",
    where: {
      and: [{ candidate: { equals: candidateId } }, { kind: { equals: "cv" } }],
    },
  });
  const [doc] = result.docs;
  if (!doc?.data) {
    return null;
  }
  return {
    bytes: await readCandidateFile(doc.data),
    name: doc.name,
    size: doc.size ?? 0,
    type: doc.mimeType ?? "application/pdf",
  };
}

export function validateDocument(
  file: CvFile | null,
  kind: DocumentKind
): string | null {
  if (!file || file.size === 0) {
    return "Choose a file to upload.";
  }
  if (!(file.type in DOCUMENT_TYPES)) {
    return "Upload a PDF, Word file, JPG or PNG.";
  }
  if (kind === "cv" && !isCvType(file.type)) {
    return "Your CV must be a PDF or Word file.";
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return "Files must be smaller than 4 MB.";
  }
  return null;
}

export async function addDocument(
  payload: Payload,
  candidateId: number,
  kind: DocumentKind,
  file: CvFile
): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  const problem = validateDocument(file, kind);
  if (problem) {
    return { error: problem, ok: false };
  }
  const count = await payload.count({
    collection: "candidate-documents",
    overrideAccess: true,
    where: { candidate: { equals: candidateId } },
  });
  if (count.totalDocs >= DOCUMENT_MAX_COUNT) {
    return {
      error: `You can keep up to ${DOCUMENT_MAX_COUNT} files. Delete one first.`,
      ok: false,
    };
  }
  const data = await storeCandidateFile("candidate-documents", file);
  try {
    const created = await payload.create({
      collection: "candidate-documents",
      data: {
        candidate: candidateId,
        data,
        kind,
        mimeType: file.type,
        name: file.name.slice(0, 200),
        size: file.size,
      },
      overrideAccess: true,
    });
    return { id: created.id, ok: true };
  } catch (error) {
    await deleteCandidateFile(data).catch(() => {
      payload.logger.error(
        "Could not remove a failed candidate document upload"
      );
    });
    throw error;
  }
}

// Only the owner's own files can be read or deleted through the account.
export async function ownDocument(
  payload: Payload,
  candidateId: number,
  documentId: string | number,
  withData = false
): Promise<CandidateDocument | null> {
  const doc = await payload
    .findByID({
      collection: "candidate-documents",
      depth: 0,
      disableErrors: true,
      id: documentId,
      overrideAccess: true,
      showHiddenFields: withData,
    })
    .catch(() => null);
  if (!doc) {
    return null;
  }
  const owner =
    typeof doc.candidate === "object" ? doc.candidate.id : doc.candidate;
  return owner === candidateId ? doc : null;
}

const listOf = (max: number, each = 80) =>
  z
    .array(z.string().trim().max(each))
    .max(max)
    .transform((items) => [
      ...new Map(
        items
          .filter((value) => value.length > 0)
          .map((value) => [value.toLowerCase(), value])
      ).values(),
    ]);

const PHONE_RE = /^\+?[0-9 ()-]{9,20}$/u;

// Every field is optional: the profile page and the auto apply page each
// send only their own fields, and only those are saved.
export const profileSchema = z.object({
  autoApply: z.boolean().optional(),
  autoApplyDailyLimit: z.coerce.number().int().min(1).max(20).optional(),
  autoApplyMinScore: z.coerce.number().int().min(40).max(100).optional(),
  autoApplyNote: z.string().trim().max(3000).optional(),
  city: z.string().trim().max(120).optional(),
  education: z.enum(EDUCATION_LEVELS).nullable().optional(),
  fullName: z.string().trim().max(120).optional(),
  headline: z.string().trim().max(160).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || PHONE_RE.test(value), {
      message: "Enter a phone number, like 0911 234 567.",
    })
    .optional(),
  preferredCategories: listOf(10).optional(),
  preferredLocations: listOf(10).optional(),
  preferredTypes: z.array(z.enum(JOB_EMPLOYMENT_TYPES)).max(8).optional(),
  preferredWorkplaces: z.array(z.enum(JOB_WORKPLACE_TYPES)).max(3).optional(),
  skills: listOf(40).optional(),
  summary: z.string().trim().max(3000).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

const rows = (items: string[]) => items.map((value) => ({ value }));

export async function saveProfile(
  payload: Payload,
  candidateId: number,
  input: ProfileInput
): Promise<Candidate> {
  const { preferredCategories, preferredLocations, skills, ...rest } = input;
  const data: Record<string, unknown> = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined)
  );
  if (preferredCategories) {
    data.preferredCategories = rows(preferredCategories);
  }
  if (preferredLocations) {
    data.preferredLocations = rows(preferredLocations);
  }
  if (skills) {
    data.skills = rows(skills);
  }
  return await payload.update({
    collection: "candidates",
    data,
    depth: 0,
    id: candidateId,
    overrideAccess: true,
  });
}

export const values = (
  list: { value: string }[] | null | undefined
): string[] => (list ?? []).map((row) => row.value);

// What auto apply and one-click apply need before they can send anything.
export function missingForApply(
  candidate: Candidate,
  hasCv: boolean
): string[] {
  const missing: string[] = [];
  if ((candidate.fullName ?? "").trim().length < 3) {
    missing.push("Full name");
  }
  if (!candidate.phone) {
    missing.push("Phone number");
  }
  if (!candidate.city) {
    missing.push("City");
  }
  if (
    candidate.yearsExperience === null ||
    candidate.yearsExperience === undefined
  ) {
    missing.push("Years of experience");
  }
  if (!candidate.education) {
    missing.push("Education");
  }
  if (!hasCv) {
    missing.push("CV");
  }
  return missing;
}

// A rough "how complete is my profile" for the account overview.
export function profileCompleteness(
  candidate: Candidate,
  hasCv: boolean
): number {
  const checks = [
    (candidate.fullName ?? "").trim().length >= 3,
    Boolean(candidate.phone),
    Boolean(candidate.city),
    candidate.yearsExperience !== null &&
      candidate.yearsExperience !== undefined,
    Boolean(candidate.education),
    hasCv,
    values(candidate.skills).length >= 3,
    Boolean(candidate.headline),
    values(candidate.preferredCategories).length > 0 ||
      (candidate.preferredTypes ?? []).length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// Applications sent from this account, newest first. Linked by account only:
// emails are not verified, so matching on email could show someone else's.
export async function listCandidateApplications(
  payload: Payload,
  candidateId: number,
  limit = 50
) {
  const result = await payload.find({
    collection: "applications",
    depth: 1,
    limit,
    overrideAccess: true,
    populate: { jobs: { slug: true, title: true } },
    select: {
      companyName: true,
      createdAt: true,
      history: true,
      job: true,
      jobTitle: true,
      reference: true,
      source: true,
      status: true,
    },
    sort: "-createdAt",
    where: { candidate: { equals: candidateId } },
  });
  return result.docs;
}
