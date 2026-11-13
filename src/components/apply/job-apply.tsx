"use client";

import { ArrowLeftIcon } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import { ApplyForm } from "@/components/apply/apply-form";
import { BUTTON_CLASS } from "@/components/apply/field";
import { useJobList } from "@/components/board/saved-jobs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const APPLY_SECTION_ID = "apply";

// Whether the job page shows the form in place of the job details. One job
// page is on screen at a time, so a module-level flag is enough.
let applyOpen = false;
const listeners = new Set<() => void>();

export function setApplyOpen(open: boolean) {
  if (applyOpen === open) {
    return;
  }
  applyOpen = open;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useApplyOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => applyOpen,
    () => false
  );
}

// Apply now opens the form; while it is open the same button goes back to
// the job details.
export function ApplyNowButton({
  className,
  testId,
}: {
  className?: string;
  testId: string;
}) {
  const open = useApplyOpen();
  const onClick = useCallback(() => setApplyOpen(!applyOpen), []);
  return (
    <Button
      aria-expanded={open}
      className={cn(BUTTON_CLASS, className)}
      data-testid={testId}
      onClick={onClick}
      type="button"
      variant={open ? "outline" : "default"}
    >
      {open ? "Back to job" : "Apply now"}
    </Button>
  );
}

// The job page body. Pressing Apply now swaps the job details for the form,
// in the same card, instead of adding the form below the description.
export function JobApplySwap({
  children,
  jobId,
  slug,
  title,
}: {
  children: ReactNode;
  jobId: string;
  slug: string;
  title: string;
}) {
  const open = useApplyOpen();
  const anchor = useRef<HTMLDivElement>(null);
  const { add } = useJobList("applied");
  const onDone = useCallback(() => add(slug), [add, slug]);
  const back = useCallback(() => setApplyOpen(false), []);

  // A new job page starts on its details, unless the link asks for #apply.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset per job
  useEffect(() => {
    setApplyOpen(window.location.hash === `#${APPLY_SECTION_ID}`);
    return () => setApplyOpen(false);
  }, [slug]);

  // Bring the top of the swapped card into view when it swaps.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on each swap
  useEffect(() => {
    const element = anchor.current;
    if (!element) {
      return;
    }
    const { top } = element.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.5) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  return (
    <div className="scroll-mt-20" ref={anchor}>
      <div hidden={open}>{children}</div>
      {open ? (
        <section
          aria-label={`Apply for ${title}`}
          className="animate-in fade-in slide-in-from-bottom-2 px-0 py-2 duration-200 md:px-12 md:pt-10 md:pb-12 xl:px-[88px]"
          data-testid="job-apply-section"
          id={APPLY_SECTION_ID}
        >
          <button
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 rounded-sm text-[14px] leading-5"
            data-testid="job-apply-back"
            onClick={back}
            type="button"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            Back to job details
          </button>
          <h2 className="text-foreground text-xl leading-7 font-medium">
            Apply for {title}
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-[14px] leading-5">
            Takes about two minutes. Your CV stays private to the hiring team.
          </p>
          <div className="max-w-xl">
            <ApplyForm jobId={jobId} key={jobId} onDone={onDone} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
