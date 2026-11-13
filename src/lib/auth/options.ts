import type { BetterAuthOptions } from "better-auth";

import { resolveServerUrl } from "@/config/server-url";

// Candidate accounts (job seekers). HR staff keep signing in to Payload; these
// tables are separate and prefixed so the two never mix.
export const CANDIDATE_TABLES = {
  account: "candidate_account",
  session: "candidate_session",
  user: "candidate_user",
  verification: "candidate_verification",
} as const;

function hostOf(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).host;
  } catch {
    return null;
  }
}

// Hosts this deployment answers on: the configured site URL, the Vercel
// deployment, branch and production URLs, and local development.
export function candidateAuthHosts(
  env: Partial<NodeJS.ProcessEnv> = process.env
): string[] {
  const hosts = [
    hostOf(env.NEXT_PUBLIC_SERVER_URL),
    hostOf(env.VERCEL_URL),
    hostOf(env.VERCEL_BRANCH_URL),
    hostOf(env.VERCEL_PROJECT_PRODUCTION_URL),
    "localhost:*",
    "127.0.0.1:*",
  ];
  return [...new Set(hosts.filter((host): host is string => Boolean(host)))];
}

// A dedicated secret when one is set; otherwise one derived from the Payload
// secret, so an existing deployment works without a new variable.
export function candidateAuthSecret(
  env: Partial<NodeJS.ProcessEnv> = process.env
): string {
  if (env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length >= 32) {
    return env.BETTER_AUTH_SECRET;
  }
  const base = env.PAYLOAD_SECRET ?? "";
  if (base.length === 0) {
    throw new Error("Set BETTER_AUTH_SECRET or PAYLOAD_SECRET.");
  }
  return `${base}:etenesh-candidate-auth`;
}

// Everything except the database, so the migration script can reuse it.
export function candidateAuthOptions(): Omit<BetterAuthOptions, "database"> {
  return {
    account: { modelName: CANDIDATE_TABLES.account },
    appName: "Etenesh HR",
    baseURL: {
      allowedHosts: candidateAuthHosts(),
      fallback: resolveServerUrl(),
    },
    emailAndPassword: {
      autoSignIn: true,
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 8,
    },
    secret: candidateAuthSecret(),
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      modelName: CANDIDATE_TABLES.session,
      updateAge: 60 * 60 * 24,
    },
    telemetry: { enabled: false },
    user: { modelName: CANDIDATE_TABLES.user },
    verification: { modelName: CANDIDATE_TABLES.verification },
  };
}
