import config from "@payload-config";
import { getPayload } from "payload";

import { isJobOpen, submitApplication, toApplyJob } from "@/lib/etenesh/apply";
import { trackingLink } from "@/lib/etenesh/telegram";

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
  return Response.json(toApplyJob(job), {
    headers: { "Cache-Control": "no-store" },
  });
}

// Candidates post the apply form here as multipart form data.
export async function POST(request: Request): Promise<Response> {
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
  const cv =
    file instanceof File && file.size > 0
      ? {
          bytes: Buffer.from(await file.arrayBuffer()),
          name: file.name,
          size: file.size,
          type: file.type,
        }
      : null;

  const payload = await getPayload({ config });
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
      telegramContact: text("telegramContact"),
      yearsExperience: text("yearsExperience"),
    },
    cv
  );

  const telegramLink = result.ok ? await trackingLink(result.reference) : null;
  return Response.json(result.ok ? { ...result, telegramLink } : result, {
    status: result.ok ? 201 : STATUS[result.reason],
  });
}
