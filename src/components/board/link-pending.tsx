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
        <span className="bg-foreground/[0.06] absolute inset-0 animate-pulse" />
      </span>
      {pending ? (
        <span className="sr-only" role="status">
          Opening job
        </span>
      ) : null}
    </>
  );
}
