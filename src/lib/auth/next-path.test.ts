import { expect, test } from "vitest";
import { safeNext } from "./next-path";
import { candidateAuthHosts, candidateAuthSecret } from "./options";

test("only same-site paths are followed after sign in", () => {
  expect(safeNext("/account/profile")).toBe("/account/profile");
  expect(safeNext("/jobs/a#apply")).toBe("/jobs/a#apply");
  expect(safeNext("https://evil.example")).toBe("/account");
  expect(safeNext("//evil.example")).toBe("/account");
  expect(safeNext("/\\evil.example")).toBe("/account");
  expect(safeNext(undefined)).toBe("/account");
});

test("auth trusts this deployment's hosts and local dev", () => {
  const hosts = candidateAuthHosts({
    NEXT_PUBLIC_SERVER_URL: "https://jobs.example.com",
    VERCEL_PROJECT_PRODUCTION_URL: "etenesh.vercel.app",
    VERCEL_URL: "etenesh-abc123.vercel.app",
  });
  expect(hosts).toContain("jobs.example.com");
  expect(hosts).toContain("etenesh.vercel.app");
  expect(hosts).toContain("etenesh-abc123.vercel.app");
  expect(hosts).toContain("localhost:*");
  expect(hosts.some((host) => host.includes("*.vercel.app"))).toBe(false);
});

test("auth secret prefers its own variable and falls back to Payload's", () => {
  const own = "b".repeat(40);
  expect(candidateAuthSecret({ BETTER_AUTH_SECRET: own })).toBe(own);
  expect(candidateAuthSecret({ PAYLOAD_SECRET: "p".repeat(32) })).not.toBe(
    "p".repeat(32)
  );
  expect(() => candidateAuthSecret({})).toThrow();
});
