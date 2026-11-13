import { getAccount, signedOut } from "@/lib/auth/account";
import { fileType, isDocumentKind } from "@/lib/etenesh/candidate-vocab";
import { addDocument } from "@/lib/etenesh/candidates";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  const account = await getAccount();
  if (!account) {
    return signedOut();
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");
  if (!(file instanceof File && isDocumentKind(kind))) {
    return Response.json(
      { error: "Choose a file and what it is.", ok: false },
      { status: 400 }
    );
  }
  let result: Awaited<ReturnType<typeof addDocument>>;
  try {
    result = await addDocument(account.payload, account.candidate.id, kind, {
      bytes: Buffer.from(await file.arrayBuffer()),
      name: file.name,
      size: file.size,
      type: fileType(file),
    });
  } catch (error) {
    console.error("document upload failed", error);
    return Response.json(
      { error: "The upload failed on our side. Please try again.", ok: false },
      { status: 500 }
    );
  }
  return Response.json(result, { status: result.ok ? 201 : 400 });
}
