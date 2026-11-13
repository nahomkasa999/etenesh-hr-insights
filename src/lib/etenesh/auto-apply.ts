import type { Payload } from "payload";

import type { Candidate } from "@/payload-types";

import { type ApplyResult, type CvFile, submitApplication } from "./apply";
import { missingForApply, profileCv, values } from "./candidates";
import {
  appliedJobIds,
  type JobMatch,
  loadOpenJobs,
  type MatchJob,
  rankJobs,
} from "./recommend";

const DAY_MS = 24 * 60 * 60 * 1000;
const LOG_KEEP = 40;

export interface AutoApplyOutcome {
  detail: string;
  jobTitle: string;
  outcome: "applied" | "skipped";
  reference?: string;
}

export interface AutoApplyRun {
  applied: number;
  // The best match among easy-apply jobs not yet applied for, to explain
  // an empty run.
  bestScore: number | null;
  // Profile fields that must be filled before anything can be sent.
  missing: string[];
  outcomes: AutoApplyOutcome[];
}

const normalize = (value: string) => value.trim().toLowerCase();

async function sentToday(
  payload: Payload,
  candidateId: number,
  now: Date
): Promise<number> {
  const result = await payload.count({
    collection: "applications",
    overrideAccess: true,
    where: {
      and: [
        { candidate: { equals: candidateId } },
        { source: { equals: "auto" } },
        {
          createdAt: {
            greater_than: new Date(now.getTime() - DAY_MS).toISOString(),
          },
        },
      ],
    },
  });
  return result.totalDocs;
}

function skipReason(result: Exclude<ApplyResult, { ok: true }>): string {
  if (result.reason === "invalid") {
    return Object.values(result.errors)[0] ?? "Your profile needs updating.";
  }
  if (result.reason === "closed") {
    return "The job closed.";
  }
  return "You do not meet the requirements.";
}

// Sends one application from the profile, or says why it was skipped.
async function applyOne(
  payload: Payload,
  candidate: Candidate,
  match: JobMatch,
  cv: CvFile
): Promise<AutoApplyOutcome> {
  const jobTitle = match.job.title;
  if (match.hasQuestions) {
    return {
      detail: "The employer asks questions only you can answer. See Waiting for your answers.",
      jobTitle,
      outcome: "skipped",
    };
  }
  // Tick the job's own skills the candidate has, in the job's spelling.
  const have = new Set(values(candidate.skills).map(normalize));
  const ticked = values(match.job.criteria?.requiredSkills).filter((skill) =>
    have.has(normalize(skill))
  );
  const result = await submitApplication(
    payload,
    {
      answers: [],
      city: candidate.city ?? "",
      coverNote: candidate.autoApplyNote ?? "",
      education: candidate.education ?? "",
      email: candidate.email,
      fullName: candidate.fullName ?? "",
      jobId: match.job.id,
      phone: candidate.phone ?? "",
      skills: ticked,
      yearsExperience: String(candidate.yearsExperience ?? 0),
    },
    cv,
    { candidateId: candidate.id, source: "auto" }
  );
  if (!result.ok) {
    return { detail: skipReason(result), jobTitle, outcome: "skipped" };
  }
  return {
    detail: `${match.score}% match`,
    jobTitle,
    outcome: "applied",
    reference: result.reference,
  };
}

// Applies for the best open Etenesh jobs that clear the candidate's minimum
// match, up to their daily limit. Jobs with screening questions are left for
// the candidate to answer themselves.
export async function runAutoApply(
  payload: Payload,
  candidate: Candidate,
  { jobs, now = new Date() }: { jobs?: MatchJob[]; now?: Date } = {}
): Promise<AutoApplyRun> {
  const cv = await profileCv(payload, candidate.id);
  const missing = missingForApply(candidate, cv !== null);
  if (missing.length > 0 || !cv) {
    return { applied: 0, bestScore: null, missing, outcomes: [] };
  }

  const limit = Math.max(1, candidate.autoApplyDailyLimit ?? 5);
  const budget = limit - (await sentToday(payload, candidate.id, now));
  const minScore = candidate.autoApplyMinScore ?? 70;
  const open = jobs ?? (await loadOpenJobs(payload, now));
  const applied = await appliedJobIds(payload, candidate);
  const candidates = rankJobs(candidate, open, {
    exclude: applied,
    limit: open.length,
  }).filter((match) => match.appliesHere);
  const bestScore = candidates[0]?.score ?? null;
  const ranked = candidates.filter((match) => match.score >= minScore);

  const outcomes: AutoApplyOutcome[] = [];
  let sent = 0;
  for (const match of ranked) {
    if (sent >= budget) {
      break;
    }
    if (!match.eligible) {
      continue;
    }
    // biome-ignore lint/performance/noAwaitInLoops: one application at a time keeps references in order
    const outcome = await applyOne(payload, candidate, match, cv);
    if (outcome.outcome === "applied") {
      sent += 1;
    }
    outcomes.push(outcome);
  }

  const stamp = now.toISOString();
  const log = [
    ...outcomes.map((item) => ({
      at: stamp,
      detail: item.reference
        ? `${item.detail} · ${item.reference}`
        : item.detail,
      jobTitle: item.jobTitle,
      outcome: item.outcome,
    })),
    ...(candidate.autoApplyLog ?? []).map(
      ({ at, detail, jobTitle, outcome }) => ({
        at,
        detail,
        jobTitle,
        outcome,
      })
    ),
  ].slice(0, LOG_KEEP);
  await payload.update({
    collection: "candidates",
    data: { autoApplyLastRun: stamp, autoApplyLog: log },
    depth: 0,
    id: candidate.id,
    overrideAccess: true,
  });

  return { applied: sent, bestScore, missing: [], outcomes };
}

// The daily cron: every candidate with auto apply on.
export async function runAutoApplyForAll(
  payload: Payload,
  now = new Date()
): Promise<{ applied: number; candidates: number }> {
  const result = await payload.find({
    collection: "candidates",
    depth: 0,
    limit: 500,
    overrideAccess: true,
    where: { autoApply: { equals: true } },
  });
  const jobs = await loadOpenJobs(payload, now);
  let applied = 0;
  for (const candidate of result.docs) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: candidates run one by one
      const run = await runAutoApply(payload, candidate, { jobs, now });
      applied += run.applied;
    } catch (error) {
      payload.logger.error(
        { candidate: candidate.id, err: error },
        "auto apply failed"
      );
    }
  }
  return { applied, candidates: result.docs.length };
}
