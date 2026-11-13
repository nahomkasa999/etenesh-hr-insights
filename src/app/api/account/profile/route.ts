import { getAccount, signedOut } from "@/lib/auth/account";
import { profileSchema, saveProfile } from "@/lib/etenesh/candidates";

export const runtime = "nodejs";

export async function PUT(request: Request): Promise<Response> {
  const account = await getAccount();
  if (!account) {
    return signedOut();
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return Response.json({ errors, ok: false }, { status: 400 });
  }
  await saveProfile(account.payload, account.candidate.id, parsed.data);
  return Response.json({ ok: true });
}
