import type { Payload } from "payload";
import { appliesHere } from "@/components/apply/applies-here";
import type { Candidate, Job } from "@/payload-types";
import { values } from "./candidates";
import { matchApplicant } from "./match";

// The fields matching needs. Kept small: the description is not loaded.
export type MatchJob = Pick<
  Job,
  | "applyEmail"
  | "applyUrl"
  | "categories"
  | "companyName"
  | "criteria"
  | "employmentType"
  | "id"
  | "locationDisplay"
  | "origin"
  | "publishedAt"
  | "salaryCurrency"
  | "salaryMax"
  | "salaryMin"
  | "skills"
  | "slug"
  | "summary"
  | "title"
  | "validThrough"
  | "workplaceType"
>;

export interface JobMatch {
  // Whether the job takes applications on Etenesh (so auto apply can send).
  appliesHere: boolean;
  // Years and education are met (or the job asks for none).
  eligible: boolean;
  hasQuestions: boolean;
  job: MatchJob;
  reasons: string[];
  score: number;
}

const WORD_RE = /[a-z0-9+#.]+/gu;
const normalize = (value: string) => value.trim().toLowerCase();

function words(text: string): Set<string> {
  return new Set(normalize(text).match(WORD_RE) ?? []);
}

function textHas(haystack: string, needle: string): boolean {
  const target = normalize(needle);
  if (target.length === 0) {
    return false;
  }
  if (target.includes(" ")) {
    return haystack.includes(target);
  }
  return words(haystack).has(target);
}

export async function loadOpenJobs(
  payload: Payload,
  now = new Date()
): Promise<MatchJob[]> {
  const result = await payload.find({
    collection: "jobs",
    depth: 0,
    limit: 300,
    overrideAccess: true,
    select: {
      applyEmail: true,
      applyUrl: true,
      categories: true,
      companyName: true,
      criteria: true,
      employmentType: true,
      locationDisplay: true,
      origin: true,
      publishedAt: true,
      salaryCurrency: true,
      salaryMax: true,
      salaryMin: true,
      skills: true,
      slug: true,
      summary: true,
      title: true,
      validThrough: true,
      workplaceType: true,
    },
    sort: "-publishedAt",
    where: {
      and: [
        { _status: { equals: "published" } },
        {
          or: [
            { validThrough: { exists: false } },
            { validThrough: { greater_than: now.toISOString() } },
          ],
        },
      ],
    },
  });
  return result.docs as MatchJob[];
}

interface Part {
  points: number;
  reason?: string;
}

// Skills: a required skill the candidate has counts most (up to 40).
function skillPart(
  skills: string[],
  required: string[],
  jobText: string
): Part {
  const requiredSet = new Set(required.map(normalize));
  const matchedRequired = skills.filter((skill) =>
    requiredSet.has(normalize(skill))
  );
  const matchedOther = skills.filter(
    (skill) => !requiredSet.has(normalize(skill)) && textHas(jobText, skill)
  );
  let points = Math.min(15, matchedOther.length * 5);
  if (required.length > 0) {
    points += Math.round((25 * matchedRequired.length) / required.length);
  } else if (matchedOther.length > 0) {
    points += 10;
  }
  const matched = [...matchedRequired, ...matchedOther];
  return matched.length > 0
    ? { points, reason: `Skills: ${matched.slice(0, 4).join(", ")}` }
    : { points };
}

// Preferred categories, or a headline that names the job (up to 20).
function categoryPart(candidate: Candidate, job: MatchJob): Part {
  const categories = values(job.categories).map(normalize);
  const hit = values(candidate.preferredCategories).find((category) =>
    categories.includes(normalize(category))
  );
  if (hit) {
    return { points: 20, reason: `In ${hit}` };
  }
  const headlineHit =
    candidate.headline &&
    [...words(candidate.headline)].some(
      (word) => word.length > 3 && textHas(job.title, word)
    );
  return headlineHit
    ? { points: 12, reason: "Close to your headline" }
    : { points: 0 };
}

// No preference counts as a match; a stated one must be met (10 each).
function preferencePart<T extends string>(
  wanted: readonly T[],
  actual: T | null | undefined,
  reason: string
): Part {
  if (wanted.length === 0) {
    return { points: 10 };
  }
  return actual && wanted.includes(actual)
    ? { points: 10, reason }
    : { points: 0 };
}

// Preferred places or the candidate's city (up to 10).
function locationPart(candidate: Candidate, job: MatchJob): Part {
  const where = normalize(job.locationDisplay ?? "");
  const places = values(candidate.preferredLocations);
  const city = normalize(candidate.city ?? "");
  const hit = places.find((place) => where.includes(normalize(place)));
  if (hit) {
    return { points: 10, reason: `In ${hit}` };
  }
  if (city && where.includes(city)) {
    return { points: 10, reason: `In ${candidate.city}` };
  }
  if (job.workplaceType === "remote") {
    return { points: 8 };
  }
  return { points: places.length === 0 && !city ? 5 : 0 };
}

// How well a job fits a profile, 0 to 100, with the reasons in plain words.
//   skills 40, categories 20, job type 10, workplace 10, location 10, and
//   10 when years and education are met. Missing those caps the score at 35.
export function scoreJob(candidate: Candidate, job: MatchJob): JobMatch {
  const skills = values(candidate.skills);
  const required = values(job.criteria?.requiredSkills);
  const jobText = [
    job.title,
    job.summary ?? "",
    ...values(job.categories),
    ...values(job.skills),
    ...required,
  ]
    .join(" ")
    .toLowerCase();

  const workplace = job.workplaceType;
  const parts: Part[] = [
    skillPart(skills, required, jobText),
    categoryPart(candidate, job),
    preferencePart(
      candidate.preferredTypes ?? [],
      job.employmentType,
      "Your preferred job type"
    ),
    preferencePart(
      candidate.preferredWorkplaces ?? [],
      workplace,
      workplace === "remote" ? "Remote" : `Works ${workplace}`
    ),
    locationPart(candidate, job),
  ];

  const check = matchApplicant(
    {
      education: job.criteria?.education ?? "None",
      minYearsExperience: job.criteria?.minYearsExperience ?? 0,
      requiredSkills: required,
    },
    {
      education: candidate.education ?? "None",
      skills,
      yearsExperience: candidate.yearsExperience ?? 0,
    }
  );
  const needs = check.missed.filter((item) => !required.includes(item));
  parts.push(
    check.eligible
      ? { points: 10 }
      : { points: 0, reason: `Needs ${needs.join(" and ")}` }
  );

  const total = parts.reduce((sum, part) => sum + part.points, 0);
  const score = check.eligible ? total : Math.min(total, 35);

  return {
    appliesHere: appliesHere({
      applyHref: job.applyUrl || job.applyEmail || null,
      origin: job.origin,
    }),
    eligible: check.eligible,
    hasQuestions: (job.criteria?.screeningQuestions ?? []).length > 0,
    job,
    reasons: parts.flatMap((part) => (part.reason ? [part.reason] : [])),
    score: Math.max(0, Math.min(100, score)),
  };
}

export function rankJobs(
  candidate: Candidate,
  jobs: readonly MatchJob[],
  { exclude = new Set<number>(), limit = 12 } = {}
): JobMatch[] {
  return jobs
    .filter((job) => !exclude.has(job.id))
    .map((job) => scoreJob(candidate, job))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.job.publishedAt ?? "") -
          Date.parse(a.job.publishedAt ?? "")
    )
    .slice(0, limit);
}

// Jobs this candidate already applied for, by account or by email.
export async function appliedJobIds(
  payload: Payload,
  candidate: Pick<Candidate, "email" | "id">
): Promise<Set<number>> {
  const result = await payload.find({
    collection: "applications",
    depth: 0,
    limit: 500,
    overrideAccess: true,
    select: { job: true },
    where: {
      or: [
        { candidate: { equals: candidate.id } },
        { email: { equals: candidate.email.toLowerCase() } },
      ],
    },
  });
  return new Set(
    result.docs.map((doc) =>
      typeof doc.job === "object" ? doc.job.id : doc.job
    )
  );
}
