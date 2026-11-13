import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { Pool } from "pg";

import { candidateAuthOptions } from "./options";

// One small pool per server instance, kept across hot reloads in dev.
const globalForAuth = globalThis as unknown as { candidateAuthPool?: Pool };
const pool =
  globalForAuth.candidateAuthPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? "",
    idleTimeoutMillis: 10_000,
    max: 3,
  });
if (process.env.NODE_ENV !== "production") {
  globalForAuth.candidateAuthPool = pool;
}

export const auth = betterAuth({
  ...candidateAuthOptions(),
  database: pool,
  // nextCookies must stay last so sign-in from server actions sets cookies.
  plugins: [nextCookies()],
});

export interface CandidateSession {
  email: string;
  name: string;
  userId: string;
}

// The signed-in candidate, or null. Never throws: a broken session reads as
// signed out.
export async function getCandidateSession(): Promise<CandidateSession | null> {
  // Read headers outside the try: Next signals dynamic rendering by throwing
  // here, and that must not be swallowed.
  const requestHeaders = await headers();
  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) {
      return null;
    }
    return {
      email: session.user.email,
      name: session.user.name,
      userId: session.user.id,
    };
  } catch (error) {
    console.error(
      "candidate session read failed",
      error instanceof Error ? error.message : "unknown"
    );
    return null;
  }
}
