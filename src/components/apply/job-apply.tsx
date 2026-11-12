"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApplyForm } from "@/components/apply/apply-form";
import { BUTTON_CLASS } from "@/components/apply/field";
import { useJobList } from "@/components/board/saved-jobs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const APPLY_OPEN_EVENT = "etenesh:apply-open";
export const APPLY_SECTION_ID = "apply";

function openApply() {
  window.dispatchEvent(new Event(APPLY_OPEN_EVENT));
}

// Opens and scrolls to the form on the full job page.
export function ApplyNowButton({
  className,
  testId,
}: {
  className?: string;
  testId: string;
}) {
  return (
    <Button
      className={cn(BUTTON_CLASS, className)}
      data-testid={testId}
      onClick={openApply}
      type="button"
    >
      Apply now
    </Button>
  );
}

// Inline section on the full job page. Hidden until someone presses Apply now.
export function JobApplySection({
  jobId,
  slug,
  title,
}: {
  jobId: string;
  slug: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const { add } = useJobList("applied");
  const onDone = useCallback(() => add(slug), [add, slug]);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      requestAnimationFrame(() =>
        section.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    };
    if (window.location.hash === `#${APPLY_SECTION_ID}`) {
      show();
    }
    window.addEventListener(APPLY_OPEN_EVENT, show);
    return () => window.removeEventListener(APPLY_OPEN_EVENT, show);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <section
      aria-label={`Apply for ${title}`}
      className="border-line scroll-mt-4 border-t px-4 py-6 md:px-12 xl:px-[88px]"
      data-testid="job-apply-section"
      id={APPLY_SECTION_ID}
      ref={section}
    >
      <h2 className="text-foreground mb-4 text-xl leading-7 font-medium">
        Apply for this job
      </h2>
      <div className="max-w-xl">
        <ApplyForm jobId={jobId} onDone={onDone} />
      </div>
    </section>
  );
}
