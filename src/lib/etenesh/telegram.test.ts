import { expect, test } from "vitest";

import { linkToken, readLinkToken, statusUpdateText } from "./telegram";

test("link tokens round-trip and reject tampering", () => {
  const token = linkToken(42);
  expect(token.length).toBeLessThanOrEqual(64);
  expect(readLinkToken(token)).toBe(42);
  expect(readLinkToken(token.replace("c42_", "c43_"))).toBeNull();
  expect(readLinkToken("c42_0000000000")).toBeNull();
  expect(readLinkToken("hello")).toBeNull();
});

test("status messages name the job, status and reference", () => {
  const text = statusUpdateText({
    companyName: "Acme",
    jobTitle: "Accountant",
    reference: "ET-2026-0001",
    status: "shortlisted",
  });
  expect(text).toContain("Accountant at Acme");
  expect(text).toContain("Shortlisted");
  expect(text).toContain("ET-2026-0001");
});
