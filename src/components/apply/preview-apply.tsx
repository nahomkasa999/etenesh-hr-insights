"use client";

import Link from "next/link";
import { useCallback } from "react";
import { appliesHere } from "@/components/apply/applies-here";
import { ApplyForm } from "@/components/apply/apply-form";
import { useJobList } from "@/components/board/saved-jobs";
import type { JobListItem } from "@/lib/read/types";
import { cn } from "@/lib/utils";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const PRIMARY =
  "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-[8px] px-[18px] text-[14px] leading-[18px] font-medium";

// The Apply control in the preview footer. Outside links keep opening in a new
// tab; our own jobs open the form inside the pane.
export function PreviewApplyAction({
  applying,
  href,
  job,
  onApplied,
  onToggleForm,
}: {
  applying: boolean;
  href: string;
  job: JobListItem;
  onApplied: () => void;
  onToggleForm: () => void;
}) {
  if (job.applyHref) {
    return (
      <a
        className={cn(PRIMARY, "h-11", FOCUS)}
        data-testid="job-preview-apply"
        href={job.applyHref}
        onClick={onApplied}
        rel="noopener noreferrer"
        target="_blank"
      >
        {job.companyName ? `Apply at ${job.companyName} ↗` : "Apply ↗"}
      </a>
    );
  }
  if (appliesHere(job)) {
    return (
      <button
        className={cn(PRIMARY, "h-11 px-5", FOCUS)}
        data-testid="job-preview-apply"
        onClick={onToggleForm}
        type="button"
      >
        {applying ? "Close form" : "Apply now"}
      </button>
    );
  }
  return (
    <Link className={cn(PRIMARY, "h-11", FOCUS)} href={href}>
      View job
    </Link>
  );
}

export function PreviewApplySection({ job }: { job: JobListItem }) {
  const { add } = useJobList("applied");
  const onDone = useCallback(() => add(job.slug), [add, job.slug]);

  return (
    <section
      aria-label={`Apply for ${job.title}`}
      data-testid="job-preview-apply-section"
    >
      <h3 className="text-foreground mb-4 text-xl leading-7 font-medium">
        Apply for this job
      </h3>
      <div className="max-w-xl">
        <ApplyForm jobId={job.id} key={job.id} onDone={onDone} />
      </div>
    </section>
  );
}
