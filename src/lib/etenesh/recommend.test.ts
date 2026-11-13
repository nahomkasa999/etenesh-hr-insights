import { expect, test } from "vitest";

import type { Candidate } from "@/payload-types";

import { type MatchJob, rankJobs, scoreJob } from "./recommend";

const rows = (...items: string[]) => items.map((value) => ({ value }));

function job(overrides: Partial<MatchJob>): MatchJob {
  return {
    applyEmail: null,
    applyUrl: null,
    categories: [],
    companyName: "Acme",
    criteria: {},
    employmentType: "full-time",
    id: 1,
    locationDisplay: "Addis Ababa",
    origin: "manual",
    publishedAt: "2026-11-01T00:00:00.000Z",
    salaryCurrency: null,
    salaryMax: null,
    salaryMin: null,
    skills: [],
    slug: "job",
    summary: "",
    title: "Accountant",
    validThrough: null,
    workplaceType: "onsite",
    ...overrides,
  };
}

const candidate = {
  authUserId: "u1",
  city: "Addis Ababa",
  createdAt: "",
  education: "Bachelor's degree",
  email: "a@example.com",
  id: 1,
  preferredCategories: rows("Finance"),
  preferredTypes: ["full-time"],
  skills: rows("Excel", "Peachtree", "Tax"),
  updatedAt: "",
  yearsExperience: 3,
} as Candidate;

test("a job that fits skills, category and preferences scores high", () => {
  const match = scoreJob(
    candidate,
    job({
      categories: rows("Finance"),
      criteria: {
        education: "Diploma",
        minYearsExperience: 2,
        requiredSkills: rows("Excel", "Peachtree"),
      },
    })
  );
  expect(match.eligible).toBe(true);
  expect(match.appliesHere).toBe(true);
  expect(match.score).toBeGreaterThanOrEqual(80);
  expect(match.reasons.join(" ")).toContain("Excel");
});

test("missing must-haves caps the score and says why", () => {
  const match = scoreJob(
    candidate,
    job({ criteria: { minYearsExperience: 8, requiredSkills: rows("Excel") } })
  );
  expect(match.eligible).toBe(false);
  expect(match.score).toBeLessThanOrEqual(35);
  expect(match.reasons.at(-1)).toContain("8+ years");
});

test("jobs with an outside apply link are not easy apply", () => {
  expect(
    scoreJob(candidate, job({ applyUrl: "https://example.com" })).appliesHere
  ).toBe(false);
});

test("ranking puts the best fit first and skips excluded jobs", () => {
  const good = job({ categories: rows("Finance"), id: 2, slug: "good" });
  const poor = job({
    employmentType: "contract",
    id: 3,
    slug: "poor",
    title: "Driver",
  });
  const ranked = rankJobs(candidate, [poor, good]);
  expect(ranked.map((item) => item.job.slug)).toEqual(["good", "poor"]);
  expect(
    rankJobs(candidate, [poor, good], { exclude: new Set([2]) }).map(
      (item) => item.job.slug
    )
  ).toEqual(["poor"]);
});
