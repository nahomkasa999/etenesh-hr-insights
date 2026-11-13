import { getAccount, signedOut } from "@/lib/auth/account";
import { ownDocument } from "@/lib/etenesh/candidates";
import {
  deleteCandidateFile,
  readCandidateFile,
} from "@/storage/candidate-files";

export const runtime = "nodejs";

const SAFE_NAME_RE = /[^\w.\- ]+/gu;

// The owner downloads their own file.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const account = await getAccount();
  if (!account) {
    return signedOut();
  }
  const { id } = await params;
  const doc = await ownDocument(
    account.payload,
    account.candidate.id,
    id,
    true
  );
  if (!doc?.data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const name = doc.name.replace(SAFE_NAME_RE, "_") || "document";
  return new Response(await readCandidateFile(doc.data), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Type": doc.mimeType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const account = await getAccount();
  if (!account) {
    return signedOut();
  }
  const { id } = await params;
  const doc = await ownDocument(
    account.payload,
    account.candidate.id,
    id,
    true
  );
  if (!doc) {
    return Response.json({ error: "Not found", ok: false }, { status: 404 });
  }
  await account.payload.delete({
    collection: "candidate-documents",
    id: doc.id,
    overrideAccess: true,
  });
  await deleteCandidateFile(doc.data).catch(() => {
    account.payload.logger.error(
      "Could not remove the stored candidate document"
    );
  });
  return Response.json({ ok: true });
}
