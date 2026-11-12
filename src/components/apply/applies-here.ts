import type { JobOrigin } from "@/lib/domain/job-vocab";

// Our own jobs (no outside apply link) take applications on the board itself.
export function appliesHere(job: {
  applyHref?: string | null;
  origin: JobOrigin;
}): boolean {
  return !job.applyHref && job.origin === "manual";
}
