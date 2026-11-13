import Link from "next/link";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { buildJobPath } from "@/lib/board/paths";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  STATUS_LABELS,
  STATUS_MESSAGES,
} from "@/lib/etenesh/vocab";
import type { Application } from "@/payload-types";

// The main path; on hold and rejected are shown as the current state only.
const PATH: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

function day(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function jobSlug(application: Application): string | null {
  return typeof application.job === "object" ? application.job.slug : null;
}

function Steps({ status }: { status: ApplicationStatus }) {
  const reached = PATH.indexOf(status);
  return (
    <ol aria-label="Progress" className="flex items-center gap-1">
      {PATH.map((step, index) => (
        <li
          className={
            index <= reached && reached !== -1
              ? "bg-primary h-1.5 flex-1 rounded-full"
              : "bg-tag h-1.5 flex-1 rounded-full"
          }
          key={step}
          title={STATUS_LABELS[step]}
        >
          <span className="sr-only">
            {STATUS_LABELS[step]}
            {index <= reached ? " (done)" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ApplicationList({
  applications,
  compact = false,
}: {
  applications: Application[];
  compact?: boolean;
}) {
  if (applications.length === 0) {
    return (
      <div className="bg-surface-sub flex flex-col items-start gap-3 rounded-xl p-5">
        <p className="text-muted-foreground text-sm">
          No applications yet. Apply for a job while signed in, or turn on auto
          apply, and it will show here with its status.
        </p>
        <Link
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium"
          href="/account/jobs"
        >
          See jobs for you
        </Link>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-3" data-testid="application-list">
      {applications.map((application) => {
        const status = APPLICATION_STATUSES.includes(application.status)
          ? application.status
          : "submitted";
        const slug = jobSlug(application);
        const history = [...(application.history ?? [])].reverse();
        return (
          <li
            className="bg-card ring-line flex flex-col gap-3 rounded-xl p-4 ring-1 ring-inset"
            data-testid="application-item"
            key={application.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-foreground text-[15px] leading-5 font-medium">
                  {slug ? (
                    <Link className="hover:underline" href={buildJobPath(slug)}>
                      {application.jobTitle}
                    </Link>
                  ) : (
                    application.jobTitle
                  )}
                </h3>
                <p className="text-muted-foreground text-[13px]">
                  {[
                    application.companyName,
                    `Ref ${application.reference}`,
                    `Sent ${day(application.createdAt)}`,
                    application.source === "auto" ? "Auto applied" : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <StatusBadge status={status} />
            </div>
            <Steps status={status} />
            <p className="text-foreground text-sm leading-5">
              {STATUS_MESSAGES[status]}
            </p>
            {compact || history.length === 0 ? null : (
              <details className="group">
                <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-[13px]">
                  History ({history.length})
                </summary>
                <ol className="border-line mt-2 flex flex-col gap-1.5 border-l pl-3">
                  {history.map((entry) => (
                    <li
                      className="text-muted-foreground text-[13px]"
                      key={entry.id ?? entry.at}
                    >
                      <span className="text-foreground font-medium">
                        {STATUS_LABELS[entry.status as ApplicationStatus] ??
                          entry.status}
                      </span>{" "}
                      · {day(entry.at)}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
}
