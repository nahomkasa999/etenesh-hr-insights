import type { Payload } from "payload";
import { z } from "zod";

import { htmlToLexical } from "@/lib/bordfeed/html-to-lexical";

import { EDUCATION_LEVELS } from "./vocab";

// The JSON shape HR pastes (or Claude writes) to post jobs in bulk.

export const importedJobSchema = z.object({
  about: z.string().nullish(),
  area: z.string().nullish(),
  benefits: z.array(z.string()).default([]),
  careerLevel: z.enum([
    "Internship",
    "Entry",
    "Junior",
    "Mid",
    "Senior",
    "Manager",
  ]),
  category: z.string().min(2),
  city: z.string().min(2),
  company: z.string().min(2),
  criteria: z
    .object({
      education: z.enum(EDUCATION_LEVELS).default("None"),
      fieldOfStudy: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      minYearsExperience: z.number().int().nonnegative().default(0),
      mustBeIn: z.string().nullish(),
      requiredSkills: z.array(z.string()).default([]),
    })
    .partial()
    .default({}),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  positions: z.number().int().positive().nullish(),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  salaryMax: z.number().nonnegative().nullish(),
  salaryMin: z.number().nonnegative().nullish(),
  screeningQuestions: z.array(z.string()).default([]),
  summary: z.string().min(10),
  title: z.string().min(2).max(200),
  workplaceType: z.enum(["onsite", "hybrid", "remote"]),
});

export const importFileSchema = z.object({
  jobs: z.array(importedJobSchema).min(1),
});

export type ImportedJob = z.infer<typeof importedJobSchema>;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function list(title: string, items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  const lis = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<h3>${title}</h3><ul>${lis}</ul>`;
}

function jobDescriptionHtml(job: ImportedJob): string {
  const parts = [`<p>${escapeHtml(job.summary)}</p>`];
  if (job.about) {
    parts.push(`<h3>About the company</h3><p>${escapeHtml(job.about)}</p>`);
  }
  parts.push(list("Responsibilities", job.responsibilities));
  parts.push(list("Requirements", job.requirements));
  parts.push(list("Benefits", job.benefits));
  const facts = [
    job.positions ? `Positions: ${job.positions}` : null,
    `Deadline: ${job.deadline}`,
  ].filter(Boolean);
  parts.push(`<p>${facts.join(" · ")}</p>`);
  return parts.join("");
}

const rows = (values: string[]) => values.map((value) => ({ value }));

async function findOrCreateCompany(
  payload: Payload,
  name: string,
  city: string
): Promise<number | string> {
  const found = await payload.find({
    collection: "companies",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { name: { equals: name } },
  });
  if (found.docs[0]) {
    return found.docs[0].id;
  }
  const created = await payload.create({
    collection: "companies",
    data: { location: `${city}, Ethiopia`, name, origin: "manual" } as never,
    overrideAccess: true,
  });
  return created.id;
}

// Creates published jobs from the import shape. Returns the created ids.
export async function importJobs(
  payload: Payload,
  jobs: ImportedJob[],
  options: { featuredTitles?: string[] } = {}
): Promise<(number | string)[]> {
  const ids: (number | string)[] = [];
  for (const job of jobs) {
    // One at a time: two jobs from a new company must not create it twice.
    // biome-ignore lint/performance/noAwaitInLoops: sequential on purpose
    const company = await findOrCreateCompany(payload, job.company, job.city);
    const location = job.area ? `${job.area}, ${job.city}` : job.city;
    const created = await payload.create({
      collection: "jobs",
      data: {
        _status: "published",
        careerLevel: job.careerLevel,
        categories: rows([job.category]),
        company,
        companyName: job.company,
        countryCode: "ET",
        criteria: {
          education: job.criteria.education ?? "None",
          minYearsExperience: job.criteria.minYearsExperience ?? 0,
          requiredSkills: rows(job.criteria.requiredSkills ?? []),
          screeningQuestions: job.screeningQuestions.map((question) => ({
            question,
          })),
        },
        description: htmlToLexical(jobDescriptionHtml(job)),
        employmentType: job.employmentType,
        featured: options.featuredTitles?.includes(job.title) ?? false,
        languages: rows(job.criteria.languages ?? []),
        locality: job.city,
        locationDisplay: `${location}, Ethiopia`,
        origin: "manual",
        salaryCurrency: job.salaryMin || job.salaryMax ? "ETB" : undefined,
        salaryMax: job.salaryMax ?? undefined,
        salaryMin: job.salaryMin ?? undefined,
        skills: rows(job.criteria.requiredSkills ?? []),
        summary: job.summary,
        title: job.title,
        validThrough: new Date(`${job.deadline}T23:59:59+03:00`).toISOString(),
        workplaceType: job.workplaceType,
      } as never,
      overrideAccess: true,
    });
    ids.push(created.id);
  }
  return ids;
}
