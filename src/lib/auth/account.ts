import config from "@payload-config";
import { getPayload, type Payload } from "payload";

import { ensureCandidate } from "@/lib/etenesh/candidates";
import type { Candidate } from "@/payload-types";

import { getCandidateSession } from "./server";

export interface AccountContext {
  candidate: Candidate;
  payload: Payload;
}

// The signed-in candidate and their profile row, or null when signed out.
export async function getAccount(): Promise<AccountContext | null> {
  const session = await getCandidateSession();
  if (!session) {
    return null;
  }
  const payload = await getPayload({ config });
  const candidate = await ensureCandidate(payload, session);
  return { candidate, payload };
}

export function signedOut(): Response {
  return Response.json(
    { error: "Please sign in again.", ok: false },
    { headers: { "Cache-Control": "no-store" }, status: 401 }
  );
}
