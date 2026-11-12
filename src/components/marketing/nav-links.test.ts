import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import {
  MARKETING_FOOTER_COLUMNS,
  MARKETING_HEADER_LINKS,
  type MarketingLink,
} from "./nav-links";

const ROOT = process.cwd();

// Route files for every in-app target. A link to a page that is not here 404s.
const ROUTE_FILES: Record<string, string> = {
  "/about": "src/app/(marketing)/about/page.tsx",
  "/admin": "src/app/(payload)/admin/[[...segments]]/page.tsx",
  "/changelog": "src/app/(marketing)/changelog/page.tsx",
  "/companies": "src/app/(site)/companies/page.tsx",
  "/docs": "src/app/(marketing)/docs/page.tsx",
  "/faq": "src/app/(marketing)/faq/page.tsx",
  "/features": "src/app/(marketing)/features/page.tsx",
  "/feed.xml": "src/app/feed.xml/route.ts",
  "/jobs": "src/app/(site)/jobs/page.tsx",
  "/pricing": "src/app/(marketing)/pricing/page.tsx",
  "/privacy": "src/app/(marketing)/privacy/page.tsx",
  "/saved": "src/app/(site)/saved/page.tsx",
  "/showcase": "src/app/(marketing)/showcase/page.tsx",
  "/terms": "src/app/(marketing)/terms/page.tsx",
};

// Same-page anchors on the home page, and the section file that owns each id.
const HOME_ANCHOR_FILES: Record<string, string> = {
  courses: "src/components/marketing/pricing.tsx",
  employers: "src/components/marketing/bento.tsx",
  faq: "src/components/marketing/faq.tsx",
  "how-it-works": "src/components/marketing/timeline.tsx",
};

function allLinks(): MarketingLink[] {
  return [
    ...MARKETING_HEADER_LINKS,
    ...MARKETING_FOOTER_COLUMNS.flatMap((column) => column.items),
  ];
}

test("every in-app marketing link points at an existing route", () => {
  const internal = allLinks()
    .map((link) => link.href)
    .filter((href) => href.startsWith("/"));

  for (const href of internal) {
    const path = href.split("#")[0] ?? "/";
    if (path === "/") {
      continue;
    }
    const file = ROUTE_FILES[path];
    expect(file, `no route mapped for ${href}`).toBeDefined();
    expect(existsSync(join(ROOT, file ?? "")), href).toBe(true);
  }
});

test("home anchors (/#id) match a section id on the home page", () => {
  const anchors = allLinks()
    .map((link) => link.href)
    .filter((href) => href.startsWith("/#"))
    .map((href) => href.slice(2));

  expect(new Set(anchors)).toEqual(
    new Set(["courses", "employers", "faq", "how-it-works"])
  );
  for (const id of anchors) {
    const file = HOME_ANCHOR_FILES[id];
    expect(file, `no section file mapped for #${id}`).toBeDefined();
    const source = readFileSync(join(ROOT, file ?? ""), "utf8");
    expect(source, `#${id} is not a section id in ${file}`).toContain(
      `id="${id}"`
    );
  }
});

test("header and footer link to the board, saved jobs and sign-in", () => {
  const hrefs = allLinks().map((link) => link.href);
  for (const href of ["/jobs", "/companies", "/saved", "/admin"]) {
    expect(hrefs).toContain(href);
  }
  expect(MARKETING_HEADER_LINKS.map((link) => link.href)).toEqual([
    "/jobs",
    "/companies",
    "/#courses",
    "/#how-it-works",
    "/#faq",
  ]);
});

test("header and footer links have no bare anchors", () => {
  const hrefs = allLinks().map((link) => link.href);
  expect(hrefs.filter((href) => href.startsWith("#"))).toEqual([]);
});
