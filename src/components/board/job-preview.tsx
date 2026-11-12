"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  PreviewApplyAction,
  PreviewApplySection,
} from "@/components/apply/preview-apply";
import { dropBlankParagraphs } from "@/components/board/job-description";
import { jobStatuses, StatusPill } from "@/components/board/job-row";
import { HINT_CLASS } from "@/components/board/rail-styles";
import { useJobList } from "@/components/board/saved-jobs";
import { bulletLinesToLists } from "@/lib/board/bullet-lists";
import { offersVisa } from "@/lib/board/filter";
import {
  formatLocation,
  formatRelativePosted,
  formatSalary,
  formatShortDate,
  SENIORITY_LABELS,
} from "@/lib/board/format";
import { buildJobPath } from "@/lib/board/paths";
import { editorState } from "@/lib/board/plaintext";
import {
  JOB_EMPLOYMENT_LABELS,
  JOB_WORKPLACE_LABELS,
} from "@/lib/domain/job-vocab";
import type { JobListItem } from "@/lib/read/types";
import { cn } from "@/lib/utils";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const SIMILAR_LIMIT = 3;
function useDescription(slug: string): {
  error: boolean;
  loading: boolean;
  value: ReturnType<typeof editorState>;
} {
  const [result, setResult] = useState<{
    slug: string;
    value: unknown;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/job-preview/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load job details");
        }
        return response.json() as Promise<unknown>;
      })
      .then((body) => {
        if (!controller.signal.aborted) {
          const value =
            body !== null && typeof body === "object" && "description" in body
              ? body.description
              : null;
          setResult({ error: false, slug, value });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ error: true, slug, value: null });
        }
      });
    return () => {
      controller.abort();
    };
  }, [slug]);

  if (result?.slug !== slug) {
    return { error: false, loading: true, value: null };
  }
  return {
    error: result.error,
    loading: false,
    value: editorState(result.value),
  };
}

function PreviewDescription({
  description,
}: {
  description: ReturnType<typeof useDescription>;
}) {
  if (description.loading || description.error) {
    return (
      <div aria-busy={description.loading} aria-live="polite">
        <h3 className="text-foreground text-[15px] leading-5 font-medium">
          About the role
        </h3>
        {description.loading ? (
          <div className="mt-3 flex flex-col gap-3" role="status">
            <span className="sr-only">Loading job details</span>
            <div className="bg-surface-sub h-4 w-full animate-pulse rounded" />
            <div className="bg-surface-sub h-4 w-11/12 animate-pulse rounded" />
            <div className="bg-surface-sub h-4 w-4/5 animate-pulse rounded" />
          </div>
        ) : (
          <p className="text-muted-foreground mt-3 text-[14px]">
            Job details are unavailable right now.
          </p>
        )}
      </div>
    );
  }
  if (!description.value) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-foreground text-[15px] leading-5 font-medium">
        About the role
      </h3>
      <div className="bordful-prose text-muted-foreground text-[14px] leading-[22px]">
        <RichText
          data={dropBlankParagraphs(bulletLinesToLists(description.value))}
        />
      </div>
    </div>
  );
}

export interface PreviewFact {
  label: string;
  value: string;
}

export function previewFacts(job: JobListItem, now: number): PreviewFact[] {
  const facts: PreviewFact[] = [];
  const salary = formatSalary(job);
  if (salary) {
    facts.push({ label: "Salary", value: salary });
  }
  if (job.employmentType) {
    facts.push({
      label: "Type",
      value: JOB_EMPLOYMENT_LABELS[job.employmentType],
    });
  }
  if (job.seniority) {
    facts.push({ label: "Level", value: SENIORITY_LABELS[job.seniority] });
  }
  if (job.visaSponsorship !== null && job.visaSponsorship.trim() !== "") {
    facts.push({
      label: "Visa",
      value: offersVisa(job.visaSponsorship) ? "Offered" : "Not offered",
    });
  }
  const closes = job.validThrough ? formatShortDate(job.validThrough, now) : "";
  if (closes) {
    facts.push({ label: "Closes", value: closes });
  }
  return facts;
}

// Other jobs on this page that share a category with the open one.
export function similarJobs(
  job: JobListItem,
  jobs: readonly JobListItem[],
  limit = SIMILAR_LIMIT
): JobListItem[] {
  const categories = new Set(job.categories);
  if (categories.size === 0) {
    return [];
  }
  return jobs
    .filter(
      (other) =>
        other.slug !== job.slug &&
        other.categories.some((category) => categories.has(category))
    )
    .slice(0, limit);
}

// The alert sign-up, prefilled with the open job's type, level and
// workplace, plus a short summary of those filters.
export function roleAlert(job: JobListItem): { href: string; summary: string } {
  const params = new URLSearchParams();
  const parts: string[] = [];
  if (job.seniority) {
    params.set("seniority", job.seniority);
    parts.push(SENIORITY_LABELS[job.seniority]);
  }
  if (job.employmentType) {
    params.set("types", job.employmentType);
    parts.push(JOB_EMPLOYMENT_LABELS[job.employmentType]);
  }
  if (job.workplaceType === "remote") {
    params.set("remote", "true");
    parts.push(JOB_WORKPLACE_LABELS.remote);
  }
  const qs = params.toString();
  return {
    href: qs.length > 0 ? `/alerts?${qs}` : "/alerts",
    summary: parts.join(", "),
  };
}

function SimilarJob({
  job,
  onSelect,
}: {
  job: JobListItem;
  onSelect: (job: JobListItem) => void;
}) {
  const onClick = useCallback(() => onSelect(job), [job, onSelect]);
  const salary = formatSalary(job);
  return (
    <li className="border-line border-t">
      <button
        className={cn(
          "group/similar flex h-[34px] w-full cursor-pointer items-center justify-between gap-3 rounded-sm text-left",
          FOCUS
        )}
        onClick={onClick}
        type="button"
      >
        <span className="text-foreground min-w-0 truncate text-[13px] leading-[18px] group-hover/similar:underline">
          {job.title} · {job.companyName}
        </span>
        {salary ? (
          <span className="text-subtle shrink-0 text-[12px] leading-4">
            {salary}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function Logo({ job }: { job: JobListItem }) {
  const initial = job.companyName.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className="bg-primary/10 text-primary flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-lg text-[20px] font-medium"
    >
      {job.companyLogoUrl ? (
        // biome-ignore lint/performance/noImgElement: a 52px company mark, served as-is
        <img
          alt=""
          className="bg-card size-full object-cover"
          height={52}
          src={job.companyLogoUrl}
          width={52}
        />
      ) : (
        initial
      )}
    </span>
  );
}

function KeyButton({
  children,
  label,
  onClick,
}: {
  children: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(HINT_CLASS, "hover:text-foreground cursor-pointer", FOCUS)}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PreviewSide({
  alert,
  onSelect,
  similar,
}: {
  alert: { href: string; summary: string } | null;
  onSelect?: (job: JobListItem) => void;
  similar: JobListItem[];
}) {
  return (
    <div className="flex w-[250px] shrink-0 flex-col gap-4">
      {alert ? (
        <div className="bg-surface-sub ring-line flex flex-col gap-2.5 rounded-[10px] p-3.5 ring-1 ring-inset">
          <h3 className="text-foreground text-[13px] leading-[18px] font-medium">
            Get roles like this
          </h3>
          <p className="text-muted-foreground text-[12px] leading-[17px]">
            {alert.summary ? `${alert.summary}. ` : ""}New matches by email.
          </p>
          <Link
            className={cn(
              "bg-card text-foreground ring-line-strong hover:bg-surface-sub flex h-7 shrink-0 items-center rounded-[8px] px-2.5 text-[13px] leading-[18px] font-medium ring-1 ring-inset",
              FOCUS
            )}
            href={alert.href}
          >
            Save alert
          </Link>
        </div>
      ) : null}
      {similar.length > 0 && onSelect ? (
        <section aria-label="Similar jobs" className="flex flex-col">
          <h3 className="text-subtle pb-2 text-[12px] leading-4 font-medium">
            Similar jobs
          </h3>
          <ul className="flex flex-col">
            {similar.map((other) => (
              <SimilarJob job={other} key={other.slug} onSelect={onSelect} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

// The right-hand panel for the selected row ("Job open" in the design).
export function JobPreview({
  alertsEnabled = false,
  applying,
  index,
  job,
  jobs = [],
  now,
  onClose,
  onNext,
  onPrev,
  onSelect,
  onSetApplying,
  total,
}: {
  alertsEnabled?: boolean;
  applying: boolean;
  index: number;
  job: JobListItem;
  // The jobs on this page, for "Similar jobs".
  jobs?: readonly JobListItem[];
  now: number;
  onClose: () => void;
  onNext: (() => void) | null;
  onPrev: (() => void) | null;
  onSelect?: (job: JobListItem) => void;
  onSetApplying: (applying: boolean) => void;
  total: number;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const lastWheelChange = useRef(0);
  const saved = useJobList("saved");
  const applied = useJobList("applied");
  const description = useDescription(job.slug);
  const isSaved = saved.has(job.slug);
  const { toggle } = saved;
  const { add } = applied;
  const onSave = useCallback(() => toggle(job.slug), [job.slug, toggle]);
  const onApply = useCallback(() => add(job.slug), [add, job.slug]);
  const href = buildJobPath(job.slug);
  const toggleForm = useCallback(
    () => onSetApplying(!applying),
    [applying, onSetApplying]
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: selecting another job starts at its top
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  }, [job.id, applying]);
  useEffect(() => {
    const element = panelRef.current;
    if (!element || applying) {
      return;
    }
    function onWheel(event: WheelEvent) {
      if (
        Math.abs(event.deltaY) < 4 ||
        !(event.target instanceof Element) ||
        !event.target.closest("[data-job-switch]")
      ) {
        return;
      }
      const forward = event.deltaY > 0;
      const navigate = forward ? onNext : onPrev;
      event.preventDefault();
      if (!navigate) {
        return;
      }
      const wheelAt = Date.now();
      if (wheelAt - lastWheelChange.current < 700) {
        return;
      }
      lastWheelChange.current = wheelAt;
      navigate();
    }
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [applying, onNext, onPrev]);
  const facts = previewFacts(job, now);
  const statuses = jobStatuses(job, now);
  const posted = job.publishedAt
    ? formatRelativePosted(job.publishedAt, now)
    : "";
  const meta = [
    job.companyName,
    formatLocation(job),
    posted ? `Posted ${posted}` : "",
  ].filter((part) => part.length > 0);
  const closes = job.validThrough ? formatShortDate(job.validThrough, now) : "";
  const similar = onSelect ? similarJobs(job, jobs) : [];
  const alert = alertsEnabled ? roleAlert(job) : null;
  const hasSide = alert !== null || similar.length > 0;

  return (
    <section
      aria-label={applying ? `Apply for ${job.title}` : undefined}
      aria-labelledby={applying ? undefined : titleId}
      className="bg-card ring-line flex min-h-0 flex-1 flex-col overflow-clip rounded-[14px] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_28px_56px_-20px_rgb(0_0_0/0.16)] ring-1"
      data-testid="job-preview"
      ref={panelRef}
    >
      <div
        className="border-line flex h-11 shrink-0 items-center justify-between border-b pr-4 pl-5"
        data-job-switch
        data-testid="job-preview-topbar"
      >
        <div className="flex items-center gap-2.5">
          <p className="text-subtle text-[12px] leading-4 tabular-nums">
            {index} of {total}
          </p>
          <span className="text-subtle text-[12px] leading-4">
            {applying ? "Application" : "Scroll here to switch jobs"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <KeyButton label="Close preview (Esc)" onClick={onClose}>
            Esc
          </KeyButton>
        </div>
      </div>
      <div className="flex min-h-0 grow overflow-hidden">
        {applying ? (
          <div
            className="min-h-0 w-full overflow-y-auto overscroll-contain px-9 py-7"
            data-testid="job-preview-form-pane"
          >
            <PreviewApplySection job={job} />
          </div>
        ) : (
          <div
            className="flex min-h-0 w-full flex-col gap-6 overflow-y-auto overscroll-contain px-9 py-7"
            data-testid="job-preview-details"
            ref={detailsRef}
          >
            <div className="flex items-center gap-4" data-job-switch>
              <Logo job={job} />
              <div className="flex min-w-0 flex-col gap-1">
                <h2
                  className="text-foreground text-[26px] leading-8 font-medium tracking-[-0.02em]"
                  id={titleId}
                >
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-muted-foreground text-[14px] leading-5">
                    {meta.join(" · ")}
                  </p>
                  {statuses.map((status) => (
                    <StatusPill key={status} status={status} />
                  ))}
                </div>
              </div>
            </div>
            {facts.length > 0 ? (
              <dl className="bg-surface-sub ring-line flex flex-wrap rounded-[10px] ring-1 ring-inset">
                {facts.map((fact) => (
                  <div
                    className="border-line flex min-w-28 grow basis-0 flex-col gap-1 border-r px-4 py-3 last:border-r-0"
                    key={fact.label}
                  >
                    <dt className="text-subtle text-[12px] leading-4">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground text-[14px] leading-5 font-medium">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="flex gap-10">
              <div className="flex min-w-0 grow basis-0 flex-col gap-[18px]">
                <PreviewDescription description={description} />
                {job.categories.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {job.categories.map((category) => (
                      <li
                        className="bg-tag text-muted-foreground rounded-[5px] px-1.5 py-0.5 text-[12px] leading-4 font-medium"
                        key={category}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {hasSide ? (
                <PreviewSide
                  alert={alert}
                  onSelect={onSelect}
                  similar={similar}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
      <div
        className="bg-card border-line flex shrink-0 items-center justify-between gap-3 border-t py-3.5 pr-5 pl-9"
        data-job-switch
        data-testid="job-preview-footer"
      >
        <p className="text-muted-foreground flex min-w-0 items-center gap-2 text-[13px] leading-[18px]">
          {closes ? (
            <>
              <span
                aria-hidden="true"
                className="bg-closing size-1.5 shrink-0 rounded-full"
              />
              <span className="truncate">Closes {closes}</span>
            </>
          ) : null}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            aria-pressed={isSaved}
            className={cn(
              "bg-card text-foreground ring-line-strong hover:bg-surface-sub inline-flex h-11 items-center rounded-[8px] px-4 text-[14px] leading-[18px] font-medium ring-1 ring-inset",
              FOCUS
            )}
            data-testid="job-preview-save"
            onClick={onSave}
            type="button"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <PreviewApplyAction
            applying={applying}
            href={href}
            job={job}
            onApplied={onApply}
            onToggleForm={toggleForm}
          />
        </div>
      </div>
    </section>
  );
}
