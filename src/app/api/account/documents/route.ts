import { getAccount, signedOut } from "@/lib/auth/account";
import { isDocumentKind } from "@/lib/etenesh/candidate-vocab";
import { addDocument } from "@/lib/etenesh/candidates";

export const runtime = "nodejs";
export const maxDuration = 30;

const BY_EXTENSION: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
};

// Phones often send an empty or generic type; fall back to the extension.
function fileType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXTENSION[extension] ?? file.type;
}

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
      type: file.type,
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
