// Fills a fresh database for the Etenesh demo: the first admin, the site
// name, and the demo vacancies. Safe to run again; it skips what exists.
import config from "@payload-config";
import { getPayload } from "payload";
import applicants from "../src/lib/etenesh/demo-applicants.json" with {
  type: "json",
};
import {
  type DemoApplicant,
  seedDemoApplications,
} from "../src/lib/etenesh/demo-applications";
import demo from "../src/lib/etenesh/demo-jobs.json" with { type: "json" };
import { importFileSchema, importJobs } from "../src/lib/etenesh/job-import";

const FEATURED = [
  "Senior Software Developer",
  "Branch Manager",
  "Monitoring and Evaluation Officer",
];

const payload = await getPayload({ config });

const email = process.env.DEMO_EDITOR_EMAIL;
const password = process.env.DEMO_EDITOR_PASSWORD;
const users = await payload.count({
  collection: "users",
  overrideAccess: true,
});
if (users.totalDocs === 0 && email && password) {
  await payload.create({
    collection: "users",
    data: { email, password, roles: ["admin"] } as never,
    overrideAccess: true,
  });
  payload.logger.info(`Created admin ${email}`);
}

await payload.updateGlobal({
  data: {
    name: "Etenesh HR",
    tagline: "Ethiopian jobs from trusted employers",
  } as never,
  overrideAccess: true,
  slug: "site-settings",
});

const jobs = await payload.count({ collection: "jobs", overrideAccess: true });
if (jobs.totalDocs === 0) {
  const parsed = importFileSchema.parse(demo);
  const ids = await importJobs(payload, parsed.jobs, {
    featuredTitles: FEATURED,
  });
  payload.logger.info(`Imported ${ids.length} demo jobs`);
} else {
  // Fill in hiring criteria on demo jobs that were imported before
  // criteria existed. Jobs HR edited by hand keep their values.
  const parsed = importFileSchema.parse(demo);
  let updated = 0;
  for (const job of parsed.jobs) {
    // biome-ignore lint/performance/noAwaitInLoops: a few dozen demo rows
    const found = await payload.find({
      collection: "jobs",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { title: { equals: job.title } },
          { companyName: { equals: job.company } },
        ],
      },
    });
    const existing = found.docs[0];
    if (!existing || (existing.criteria?.screeningQuestions?.length ?? 0) > 0) {
      continue;
    }
    await payload.update({
      collection: "jobs",
      data: {
        criteria: {
          education: job.criteria.education ?? "None",
          minYearsExperience: job.criteria.minYearsExperience ?? 0,
          requiredSkills: (job.criteria.requiredSkills ?? []).map((value) => ({
            value,
          })),
          screeningQuestions: job.screeningQuestions.map((question) => ({
            question,
          })),
        },
      } as never,
      id: existing.id,
      overrideAccess: true,
    });
    updated += 1;
  }
  payload.logger.info(
    `Jobs already present (${jobs.totalDocs}); added criteria to ${updated}`
  );
}

const created = await seedDemoApplications(
  payload,
  applicants.applicants as DemoApplicant[]
);
payload.logger.info(`Added ${created} demo applications`);

process.exit(0);
