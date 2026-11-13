import Link from "next/link";

import { LinkPending } from "@/components/board/link-pending";
import { buildJobPath } from "@/lib/board/paths";
import { JOB_EMPLOYMENT_LABELS } from "@/lib/domain/job-vocab";
import type { JobMatch } from "@/lib/etenesh/recommend";
import { cn } from "@/lib/utils";

function tone(score: number): string {
  if (score >= 80) {
    return "bg-green-600/10 text-green-700 dark:text-green-400";
  }
  if (score >= 60) {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "bg-tag text-muted-foreground";
}

export function JobMatchList({
  empty,
  matches,
}: {
  empty: string;
  matches: JobMatch[];
}) {
  if (matches.length === 0) {
    return (
      <p className="bg-surface-sub text-muted-foreground rounded-xl p-5 text-sm">
        {empty}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2.5" data-testid="job-matches">
      {matches.map((match) => {
        const { job } = match;
        const meta = [
          job.companyName,
          job.locationDisplay ?? "",
          job.employmentType ? JOB_EMPLOYMENT_LABELS[job.employmentType] : "",
        ].filter(Boolean);
        return (
          <li
            className="bg-card ring-line hover:ring-line-strong relative flex items-start gap-3 rounded-xl p-4 ring-1 transition-shadow ring-inset"
            key={job.id}
          >
            <span
              className={cn(
                "flex size-12 shrink-0 flex-col items-center justify-center rounded-lg text-[15px] leading-4 font-semibold tabular-nums",
                tone(match.score)
              )}
            >
              {match.score}
              <span className="text-[10px] font-medium">match</span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className="text-foreground text-[15px] leading-5 font-medium">
                <Link
                  className="rounded-sm outline-none after:absolute after:inset-0"
                  href={buildJobPath(job.slug)}
                >
                  {job.title}
                  <LinkPending />
                </Link>
              </h3>
              <p className="text-muted-foreground truncate text-[13px]">
                {meta.join(" · ")}
              </p>
              {match.reasons.length > 0 ? (
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {match.reasons.slice(0, 3).map((reason) => (
                    <li
                      className="bg-tag text-muted-foreground rounded-[5px] px-1.5 py-0.5 text-[12px] leading-4"
                      key={reason}
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {match.appliesHere ? (
              <span className="text-primary bg-primary/10 hidden shrink-0 rounded-md px-2 py-1 text-[12px] font-medium sm:inline">
                Easy apply
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
