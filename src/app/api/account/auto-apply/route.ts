import { getAccount, signedOut } from "@/lib/auth/account";
import { runAutoApply } from "@/lib/etenesh/auto-apply";

export const runtime = "nodejs";
export const maxDuration = 60;

// "Run now" on the auto apply page.
export async function POST(): Promise<Response> {
  const account = await getAccount();
  if (!account) {
    return signedOut();
  }
  const run = await runAutoApply(account.payload, account.candidate);
  return Response.json({ ok: true, ...run });
}
