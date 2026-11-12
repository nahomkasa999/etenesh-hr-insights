import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

import { legacyRedirects, legacyRedirectsFor } from "./legacy-redirects";

test("retired marketing URLs redirect with 301", () => {
  expect(legacyRedirects).toEqual([
    { destination: "/", source: "/blog", statusCode: 301 },
    { destination: "/", source: "/blog/:path*", statusCode: 301 },
    { destination: "/", source: "/use-cases", statusCode: 301 },
    { destination: "/", source: "/use-cases/:path*", statusCode: 301 },
    {
      destination: "/docs/deploy",
      source: "/docs/quick-start",
      statusCode: 301,
    },
    { destination: "/faq", source: "/help", statusCode: 301 },
    {
      destination: "/marketing/icon.svg",
      source: "/icon.png",
      statusCode: 301,
    },
    {
      destination: "/marketing/apple-icon.png",
      source: "/apple-icon.png",
      statusCode: 301,
    },
    {
      destination: "/manifest.webmanifest",
      source: "/manifest.json",
      statusCode: 301,
    },
  ]);
});

test("legacy redirects only apply when marketing is on", () => {
  expect(legacyRedirectsFor({})).toEqual([]);
  expect(legacyRedirectsFor({ BORDFUL_MARKETING: "false" })).toEqual([]);
  expect(legacyRedirectsFor({ BORDFUL_MARKETING: "true" })).toEqual([
    ...legacyRedirects,
  ]);
});

test("vercel.json never sends Etenesh visitors to bordful.com", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    redirects?: { destination: string }[];
  };

  for (const rule of vercel.redirects ?? []) {
    expect(rule.destination).not.toContain("bordful.com");
  }
});
