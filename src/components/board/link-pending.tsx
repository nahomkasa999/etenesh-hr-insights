"use client";

import { useLinkStatus } from "next/link";

// Rendered inside a card's stretched <Link>. While the job page loads, the
// card dims slightly, a spinner shows on its right edge and a bar runs along
// the bottom. Always rendered and toggled by opacity, so nothing shifts.
export function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit] transition-opacity duration-150 ${
          pending ? "opacity-100" : "opacity-0"
        }`}
        data-pending={pending ? "true" : undefined}
        data-testid="link-pending"
      >
        <span className="bg-background/40 absolute inset-0" />
        <span className="border-primary/25 border-t-primary absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin rounded-full border-2" />
        <span className="bg-primary/15 absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
          <span className="bg-primary animate-link-pending absolute inset-y-0 w-1/3" />
        </span>
      </span>
      {pending ? (
        <span className="sr-only" role="status">
          Opening job
        </span>
      ) : null}
    </>
  );
}
