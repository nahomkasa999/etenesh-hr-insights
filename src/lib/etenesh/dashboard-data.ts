import config from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload, type Payload, type Where } from "payload";

import { hasRole } from "@/access/roles";
import type { Application, Job } from "@/payload-types";

import { APPLICATION_STATUSES, type ApplicationStatus } from "./vocab";

const DAY_MS = 86_400_000;

export interface StaffSession {
  email: string;
  payload: Payload;
}

// Every dashboard page starts here. Anyone who is not HR staff goes to the
// sign-in page and comes back afterwards.
export async function requireStaff(next = "/dashboard"): Promise<StaffSession> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!(hasRole(user, "admin") || hasRole(user, "editor"))) {
    redirect(`/admin/login?redirect=${encodeURIComponent(next)}`);
  }
  return { email: (user as { email?: string }).email ?? "", payload };
}

// The list views never load the CV itself.
const LIST_SELECT = {
  companyName: true,
  createdAt: true,
  email: true,
  fullName: true,
  job: true,
  jobTitle: true,
  matchScore: true,
  phone: true,
  reference: true,
  status: true,
} as const;

export interface ApplicationRow {
  companyName: string;
  createdAt: string;
  email: string;
  fullName: string;
  id: number;
  jobId: number | null;
  jobTitle: string;
  matchScore: number;
  phone: string;
  reference: string;
  status: ApplicationStatus;
}

function toRow(doc: Partial<Application>): ApplicationRow {
  const job = doc.job;
  return {
    companyName: doc.companyName ?? "",
    createdAt: doc.createdAt ?? "",
    email: doc.email ?? "",
    fullName: doc.fullName ?? "",
    id: Number(doc.id),
    jobId: typeof job === "object" && job ? Number(job.id) : (job ?? null),
    jobTitle: doc.jobTitle ?? "",
    matchScore: doc.matchScore ?? 0,
    phone: doc.phone ?? "",
    reference: doc.reference ?? "",
    status: (doc.status ?? "submitted") as ApplicationStatus,
  };
}

export async function listApplications(
  payload: Payload,
  { jobId, limit = 500 }: { jobId?: number | string; limit?: number } = {}
): Promise<ApplicationRow[]> {
  const where: Where | undefined = jobId
    ? { job: { equals: jobId } }
    : undefined;
  const result = await payload.find({
    collection: "applications",
    depth: 0,
    limit,
    overrideAccess: true,
    select: LIST_SELECT,
    sort: "-createdAt",
    where,
  });
  return result.docs.map((doc) => toRow(doc as Partial<Application>));
}

export function statusCounts(rows: ApplicationRow[]) {
  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, 0])
  ) as Record<ApplicationStatus, number>;
  for (const row of rows) {
    counts[row.status] += 1;
  }
  return counts;
}

export interface Overview {
  applications: number;
  applicationsLastWeek: number;
  applicationsThisWeek: number;
  closingThisWeek: number;
  inProgress: number;
  newToReview: number;
  openJobs: number;
  series: { date: string; applied: number; forward: number }[];
}

const FORWARD: ApplicationStatus[] = [
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

export async function getOverview(
  payload: Payload,
  rows: ApplicationRow[],
  now = new Date()
): Promise<Overview> {
  const open: Where = {
    and: [
      { _status: { equals: "published" } },
      { validThrough: { greater_than: now.toISOString() } },
    ],
  };
  const inAWeek = new Date(now.getTime() + 7 * DAY_MS).toISOString();
  const [openJobs, closing] = await Promise.all([
    payload.count({ collection: "jobs", overrideAccess: true, where: open }),
    payload.count({
      collection: "jobs",
      overrideAccess: true,
      where: { and: [open, { validThrough: { less_than: inAWeek } }] },
    }),
  ]);

  const weekAgo = now.getTime() - 7 * DAY_MS;
  const twoWeeksAgo = now.getTime() - 14 * DAY_MS;
  let thisWeek = 0;
  let lastWeek = 0;
  const byDay = new Map<string, { applied: number; forward: number }>();
  for (let day = 89; day >= 0; day -= 1) {
    const date = new Date(now.getTime() - day * DAY_MS)
      .toISOString()
      .slice(0, 10);
    byDay.set(date, { applied: 0, forward: 0 });
  }
  for (const row of rows) {
    const at = new Date(row.createdAt).getTime();
    if (at >= weekAgo) {
      thisWeek += 1;
    } else if (at >= twoWeeksAgo) {
      lastWeek += 1;
    }
    const bucket = byDay.get(row.createdAt.slice(0, 10));
    if (bucket) {
      bucket.applied += 1;
      if (FORWARD.includes(row.status)) {
        bucket.forward += 1;
      }
    }
  }

  const counts = statusCounts(rows);
  return {
    applications: rows.length,
    applicationsLastWeek: lastWeek,
    applicationsThisWeek: thisWeek,
    closingThisWeek: closing.totalDocs,
    inProgress: counts.shortlisted + counts.interview + counts.offer,
    newToReview: counts.submitted,
    openJobs: openJobs.totalDocs,
    series: [...byDay].map(([date, value]) => ({ date, ...value })),
  };
}

export interface JobRow {
  applications: number;
  closesAt: string | null;
  companyName: string;
  id: number;
  newCount: number;
  open: boolean;
  shortlisted: number;
  status: "published" | "draft";
  title: string;
}

export async function listJobsWithCounts(
  payload: Payload,
  rows: ApplicationRow[],
  now = new Date()
): Promise<JobRow[]> {
  const jobs = await payload.find({
    collection: "jobs",
    depth: 0,
    draft: true,
    limit: 500,
    overrideAccess: true,
    select: {
      _status: true,
      companyName: true,
      title: true,
      validThrough: true,
    },
    sort: "validThrough",
  });
  const byJob = new Map<number, ApplicationRow[]>();
  for (const row of rows) {
    if (row.jobId !== null) {
      byJob.set(row.jobId, [...(byJob.get(row.jobId) ?? []), row]);
    }
  }
  return jobs.docs.map((job) => {
    const mine = byJob.get(Number(job.id)) ?? [];
    const closesAt = job.validThrough ?? null;
    const status = job._status === "published" ? "published" : "draft";
    return {
      applications: mine.length,
      closesAt,
      companyName: job.companyName ?? "",
      id: Number(job.id),
      newCount: mine.filter((row) => row.status === "submitted").length,
      open: status === "published" && (!closesAt || new Date(closesAt) > now),
      shortlisted: mine.filter((row) => FORWARD.includes(row.status)).length,
      status,
      title: job.title ?? "",
    };
  });
}

export async function getJob(
  payload: Payload,
  id: string
): Promise<Job | null> {
  return await payload
    .findByID({
      collection: "jobs",
      depth: 0,
      disableErrors: true,
      draft: true,
      id,
      overrideAccess: true,
    })
    .catch(() => null);
}

export type ApplicationDetail = Omit<Application, "cvData">;

export async function getApplication(
  payload: Payload,
  id: string
): Promise<ApplicationDetail | null> {
  const doc = await payload
    .findByID({
      collection: "applications",
      depth: 0,
      disableErrors: true,
      id,
      overrideAccess: true,
    })
    .catch(() => null);
  if (!doc) {
    return null;
  }
  const { cvData: _omit, ...rest } = doc as Application;
  return rest;
}
