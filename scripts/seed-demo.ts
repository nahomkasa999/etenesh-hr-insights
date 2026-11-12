// Fills a fresh database for the Etenesh demo: the first admin, the site
// name, and the demo vacancies. Safe to run again; it skips what exists.
import config from "@payload-config";
import { getPayload } from "payload";

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
  payload.logger.info(`Jobs already present (${jobs.totalDocs}), skipped`);
}

process.exit(0);
