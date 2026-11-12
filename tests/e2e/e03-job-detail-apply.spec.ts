import { expect, test } from "@playwright/test";

import { ensureAdmin } from "./support/admin";
import {
  createCompany,
  createJob,
  docId,
  docString,
  lexicalParagraph,
} from "./support/seed";

test.describe("E3 job-detail-apply", { tag: ["@E3"] }, () => {
  test("publishes JobPosting JSON-LD and opens the demo form", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    const admin = await ensureAdmin(request);
    const company = await createCompany(admin, {
      domain: "e3.example",
      name: "E3zq Example Co",
      website: "https://e3.example",
    });
    const created = await createJob(admin, {
      _status: "published",
      applyUrl: "https://apply.example/e3zq",
      company: company.id,
      companyName: "E3zq Example Co",
      countryCode: "US",
      description: lexicalParagraph("Example description for E3zq."),
      employmentType: "full-time",
      origin: "manual",
      salaryCurrency: "USD",
      salaryMax: 160_000,
      salaryMin: 120_000,
      title: "E3zq Backend Role",
      workplaceType: "remote",
    });
    const id = docId(created);
    const storedResponse = await admin.get(`/api/jobs/${id}`);
    expect(storedResponse.ok()).toBe(true);
    const stored = (await storedResponse.json()) as Record<string, unknown>;
    const slug = docString(stored, "slug");
    const publishedAt = docString(stored, "publishedAt");

    const draft = await createJob(admin, {
      _status: "draft",
      companyName: "E3zq Example Co",
      origin: "manual",
      title: "E3zq Draft Role",
    });
    await admin.dispose();

    await page.goto(`/jobs/${slug}`);
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(1);
    const jsonLd = JSON.parse((await scripts.textContent()) ?? "{}") as {
      "@type"?: string;
      baseSalary?: { value?: { minValue?: number } };
      datePosted?: string;
      employmentType?: string;
      hiringOrganization?: { name?: string };
      jobLocationType?: string;
      title?: string;
      url?: string;
    };
    expect(jsonLd["@type"]).toBe("JobPosting");
    expect(jsonLd.title).toBe("E3zq Backend Role");
    expect(jsonLd.employmentType).toBe("FULL_TIME");
    expect(jsonLd.hiringOrganization?.name).toBe("E3zq Example Co");
    expect(jsonLd.datePosted).toBe(publishedAt);
    expect(jsonLd.jobLocationType).toBe("TELECOMMUTE");
    expect(jsonLd.baseSalary?.value?.minValue).toBe(120_000);
    expect(jsonLd.url?.endsWith(`/jobs/${slug}`)).toBe(true);

    const apply = page.getByTestId("job-apply");
    await expect(apply).toHaveAttribute("href", `/demo/apply?job=${slug}`);
    await apply.click();
    await expect(
      page.getByRole("heading", { name: "Apply for E3zq Backend Role" })
    ).toBeVisible();
    await page.getByLabel("Sample name").fill("Demo Applicant");
    await page.getByLabel("Sample email").fill("demo@example.com");
    await page.getByLabel("Sample note").fill("I am interested in this role.");
    await page
      .getByRole("button", { name: "Complete practice application" })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Practice application complete"
    );

    const missing = await request.get(`/jobs/${docString(draft, "slug")}`);
    expect(missing.status()).toBe(404);
  });
});
