import config from "@payload-config";
import { getPayload } from "payload";

import { getAccount } from "@/lib/auth/account";
import {
  type ApplyProfile,
  type CvFile,
  isJobOpen,
  submitApplication,
  toApplyJob,
} from "@/lib/etenesh/apply";
import { fileType } from "@/lib/etenesh/candidate-vocab";
import { listDocuments, profileCv, values } from "@/lib/etenesh/candidates";

export const runtime = "nodejs";
export const maxDuration = 30;

const STATUS = { closed: 409, invalid: 400, not_eligible: 422 } as const;

// The apply form loads a job's criteria and questions from here.
export async function GET(request: Request): Promise<Response> {
  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) {
    return Response.json({ error: "jobId is required" }, { status: 400 });
  }
  const payload = await getPayload({ config });
  const job = await payload
    .findByID({
      collection: "jobs",
      depth: 0,
      disableErrors: true,
      id: jobId,
      overrideAccess: true,
    })
    .catch(() => null);
  if (!(job && isJobOpen(job))) {
    return Response.json({ error: "closed" }, { status: 404 });
  }
  // A signed-in candidate gets their profile back to prefill the form.
  const account = await getAccount().catch(() => null);
  let me: ApplyProfile | null = null;
  if (account) {
    const { candidate } = account;
    const cv = (await listDocuments(account.payload, candidate.id)).find(
      (doc) => doc.kind === "cv"
    );
    me = {
      city: candidate.city ?? "",
      cv: cv ? { name: cv.name, size: cv.size ?? 0 } : null,
      education: candidate.education ?? "",
      email: candidate.email,
      fullName: candidate.fullName ?? "",
      phone: candidate.phone ?? "",
      skills: values(candidate.skills),
      yearsExperience:
        candidate.yearsExperience === null ||
        candidate.yearsExperience === undefined
          ? ""
          : String(candidate.yearsExperience),
    };
  }
  return Response.json(
    { ...toApplyJob(job), me },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// Candidates post the apply form here as multipart form data.
export async function POST(request: Request): Promise<Response> {
  // Applying needs a candidate account, so every application is trackable.
  const account = await getAccount().catch(() => null);
  if (!account) {
    return Response.json(
      {
        errors: { form: "Please sign in to apply." },
        ok: false,
        reason: "invalid",
      },
      { status: 401 }
    );
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      {
        errors: { form: "The form could not be read. Try again." },
        ok: false,
        reason: "invalid",
      },
      { status: 400 }
    );
  }

  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };
  const file = form.get("cv");
  let cv: CvFile | null =
    file instanceof File && file.size > 0
      ? {
          bytes: Buffer.from(await file.arrayBuffer()),
          name: file.name,
          size: file.size,
          type: fileType(file),
        }
      : null;

  // Signed-in candidates link the application to their account and may
  // send the CV saved on their profile instead of a new file.
  if (!cv && text("useSavedCv") === "1") {
    cv = await profileCv(account.payload, account.candidate.id);
  }

  const { payload } = account;
  const result = await submitApplication(
    payload,
    {
      answers: form.getAll("answers").map(String),
      city: text("city"),
      coverNote: text("coverNote"),
      education: text("education"),
      email: text("email"),
      fullName: text("fullName"),
      jobId: text("jobId"),
      phone: text("phone"),
      skills: form.getAll("skills").map(String),
      yearsExperience: text("yearsExperience"),
    },
    cv,
    { candidateId: account.candidate.id, source: "form" }
  );

  return Response.json(result, {
    status: result.ok ? 201 : STATUS[result.reason],
  });
}
