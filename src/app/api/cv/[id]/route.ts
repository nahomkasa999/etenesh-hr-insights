import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";

import { hasRole } from "@/access/roles";
import { CV_TYPES } from "@/lib/etenesh/apply";
import { readCandidateFile } from "@/storage/candidate-files";

export const runtime = "nodejs";

// Sends an applicant's CV to signed-in HR staff only.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!(hasRole(user, "admin") || hasRole(user, "editor"))) {
    return new Response("Sign in to view CVs.", { status: 401 });
  }

  const { id } = await params;
  const doc = await payload
    .findByID({
      collection: "applications",
      depth: 0,
      disableErrors: true,
      id,
      overrideAccess: true,
      select: { cvData: true, cvName: true, cvType: true },
      showHiddenFields: true,
    })
    .catch(() => null);
  if (!doc?.cvData) {
    return new Response("Not found", { status: 404 });
  }

  const type =
    doc.cvType && doc.cvType in CV_TYPES
      ? doc.cvType
      : "application/octet-stream";
  const name = (doc.cvName ?? "cv").replace(/[^\w.\- ]+/gu, "_");
  return new Response(await readCandidateFile(doc.cvData), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${name}"`,
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
