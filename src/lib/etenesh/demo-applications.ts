import type { Payload } from "payload";

import { demoCvPdf } from "./demo-cv";
import { matchApplicant } from "./match";
import { APPLICATION_STATUSES, type ApplicationStatus } from "./vocab";

export interface DemoApplicant {
  answers: string[];
  city: string;
  company: string;
  coverNote: string;
  daysAgo: number;
  education: string;
  email: string;
  fullName: string;
  jobTitle: string;
  note: string;
  phone: string;
  skills: string[];
  status: ApplicationStatus;
  yearsExperience: number;
}

const DAY_MS = 86_400_000;
const HR = "admin@etenesh.com";

// The steps an application passed through to reach its status, so the
// history reads like real work.
function pathTo(status: ApplicationStatus): ApplicationStatus[] {
  const main: ApplicationStatus[] = [
    "submitted",
    "under_review",
    "shortlisted",
    "interview",
    "offer",
    "hired",
  ];
  if (status === "on_hold") {
    return ["submitted", "under_review", "on_hold"];
  }
  if (status === "rejected") {
    return ["submitted", "under_review", "rejected"];
  }
  return main.slice(0, main.indexOf(status) + 1);
}

// Creates the demo applications with backdated dates. Skips anything that
// already exists, by reference.
export async function seedDemoApplications(
  payload: Payload,
  applicants: DemoApplicant[],
  now = new Date()
): Promise<number> {
  let created = 0;
  const sorted = [...applicants].sort((a, b) => b.daysAgo - a.daysAgo);
  for (const [index, person] of sorted.entries()) {
    if (!APPLICATION_STATUSES.includes(person.status)) {
      continue;
    }
    const reference = `ET-${now.getFullYear()}-D${String(index + 1).padStart(3, "0")}`;
    // biome-ignore lint/performance/noAwaitInLoops: a few dozen demo rows
    const exists = await payload.count({
      collection: "applications",
      overrideAccess: true,
      where: { reference: { equals: reference } },
    });
    if (exists.totalDocs > 0) {
      continue;
    }
    const jobs = await payload.find({
      collection: "jobs",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { title: { equals: person.jobTitle } },
          { companyName: { equals: person.company } },
        ],
      },
    });
    const job = jobs.docs[0];
    if (!job) {
      continue;
    }
    const questions = (job.criteria?.screeningQuestions ?? []).map(
      (row) => row.question
    );
    const skills = (job.criteria?.requiredSkills ?? []).map((row) => row.value);
    const result = matchApplicant(
      {
        education: job.criteria?.education,
        minYearsExperience: job.criteria?.minYearsExperience,
        requiredSkills: skills,
      },
      person
    );
    const appliedAt = new Date(
      now.getTime() - person.daysAgo * DAY_MS - (index % 9) * 3_600_000
    );
    const steps = pathTo(person.status);
    const history = steps.map((status, step) => ({
      at: new Date(
        Math.min(
          now.getTime(),
          appliedAt.getTime() +
            step * Math.max(1, person.daysAgo / steps.length) * DAY_MS
        )
      ).toISOString(),
      by: step === 0 ? "Applicant" : HR,
      status,
    }));
    const cv = demoCvPdf([
      person.fullName,
      `${person.city} · ${person.phone} · ${person.email}`,
      `Applying for: ${person.jobTitle}`,
      `Education: ${person.education}`,
      `Experience: ${person.yearsExperience} years`,
      `Skills: ${person.skills.join(", ") || "-"}`,
      "This is a sample CV for the Etenesh HR demo.",
    ]);
    const doc = await payload.create({
      collection: "applications",
      context: { skipHistory: true },
      data: {
        answers: questions.map((question, i) => ({
          answer: person.answers[i] ?? "",
          question,
        })),
        city: person.city,
        companyName: job.companyName,
        coverNote: person.coverNote,
        cvData: cv.toString("base64"),
        cvName: `${person.fullName.replace(/\s+/gu, "-")}-CV.pdf`,
        cvSize: cv.length,
        cvType: "application/pdf",
        education: person.education,
        email: person.email,
        fullName: person.fullName,
        history,
        job: job.id,
        jobTitle: job.title,
        matchMet: result.met.map((value) => ({ value })),
        matchMissed: result.missed.map((value) => ({ value })),
        matchScore: result.score,
        notes: person.note
          ? [{ at: history.at(-1)?.at, author: HR, text: person.note }]
          : [],
        phone: person.phone,
        reference,
        skills: person.skills.map((value) => ({ value })),
        status: person.status,
        yearsExperience: person.yearsExperience,
      } as never,
      overrideAccess: true,
    });
    // Payload stamps createdAt on create; backdate it to the apply date.
    await payload.db.updateOne({
      collection: "applications",
      data: {
        createdAt: appliedAt.toISOString(),
        updatedAt: history.at(-1)?.at,
      },
      id: doc.id,
      req: undefined,
    } as never);
    created += 1;
  }
  return created;
}
