"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useApplyOpen } from "@/components/apply/job-apply";
import {
  type JobNeighbors,
  type JobSequenceEntry,
  jobNeighbors,
  readJobSequence,
} from "@/components/board/job-sequence";
import { LinkPending } from "@/components/board/link-pending";
import { buildJobPath } from "@/lib/board/paths";
import { cn } from "@/lib/utils";

// Phones only: a swipe left opens the next job, a swipe right the previous
// one, in the order of the list the job was opened from.
const PHONE_QUERY = "(max-width: 47.99rem)";
const LOCK_PX = 12;
const SWIPE_PX = 80;
const FLICK_PX_PER_MS = 0.5;

function startsInsideControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return true;
  }
  return (
    target.closest(
      "input, textarea, select, [contenteditable], [data-no-swipe], pre, table"
    ) !== null
  );
}

function useNeighbors(
  slug: string,
  fallback: readonly JobSequenceEntry[]
): JobNeighbors | null {
  const [neighbors, setNeighbors] = useState<JobNeighbors | null>(null);
  useEffect(() => {
    setNeighbors(jobNeighbors(slug, readJobSequence(), fallback));
  }, [fallback, slug]);
  return neighbors;
}

function SwipePager({ neighbors }: { neighbors: JobNeighbors }) {
  const link =
    "text-muted-foreground hover:text-foreground relative flex h-9 min-w-0 items-center gap-1 rounded-lg px-2 text-[13px] leading-4";
  return (
    <nav
      aria-label="Switch job"
      className="border-line -mx-4 mb-4 flex items-center justify-between gap-2 border-b px-2 pb-2 md:hidden"
      data-testid="job-swipe-pager"
    >
      {neighbors.prev ? (
        <Link
          className={cn(link, "max-w-[40%]")}
          data-testid="job-swipe-prev"
          href={buildJobPath(neighbors.prev.slug)}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">Previous</span>
          <LinkPending />
        </Link>
      ) : (
        <span className="w-20" />
      )}
      <p className="text-subtle shrink-0 text-center text-[12px] leading-4 tabular-nums">
        {neighbors.index + 1} of {neighbors.total}
        <span className="block text-[11px]">Swipe to switch</span>
      </p>
      {neighbors.next ? (
        <Link
          className={cn(link, "max-w-[40%] justify-end")}
          data-testid="job-swipe-next"
          href={buildJobPath(neighbors.next.slug)}
        >
          <span className="truncate">Next</span>
          <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0" />
          <LinkPending />
        </Link>
      ) : (
        <span className="w-20" />
      )}
    </nav>
  );
}

type Direction = "left" | "right";

// Follows a horizontal finger drag on the element and calls onCommit when it
// is long or fast enough. Vertical drags stay normal page scrolls.
function attachSwipe(
  element: HTMLElement,
  {
    canGo,
    onCommit,
  }: {
    canGo: (direction: Direction) => boolean;
    onCommit: (direction: Direction) => void;
  }
): () => void {
  const media = window.matchMedia(PHONE_QUERY);
  let startX = 0;
  let startY = 0;
  let startAt = 0;
  let dx = 0;
  let mode: "idle" | "pending" | "swipe" | "scroll" = "idle";

  const paint = (offset: number, animate: boolean) => {
    element.style.transition = animate ? "transform 180ms ease-out" : "none";
    element.style.transform = offset === 0 ? "" : `translateX(${offset}px)`;
  };

  function onStart(event: TouchEvent) {
    const [touch] = event.touches;
    const usable =
      media.matches &&
      touch !== undefined &&
      event.touches.length === 1 &&
      !startsInsideControl(event.target);
    mode = usable ? "pending" : "idle";
    if (touch) {
      startX = touch.clientX;
      startY = touch.clientY;
    }
    startAt = event.timeStamp;
    dx = 0;
  }

  // Decides once per gesture whether it is a swipe or a scroll.
  function lock(x: number, y: number) {
    if (Math.abs(x) >= LOCK_PX || Math.abs(y) >= LOCK_PX) {
      mode = Math.abs(x) > Math.abs(y) * 1.4 ? "swipe" : "scroll";
    }
  }

  function onMove(event: TouchEvent) {
    const [touch] = event.touches;
    if (!touch || mode === "idle" || mode === "scroll") {
      return;
    }
    const x = touch.clientX - startX;
    if (mode === "pending") {
      lock(x, touch.clientY - startY);
    }
    if (mode !== "swipe") {
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    // No job that way: the page stretches a little and springs back.
    dx = canGo(x < 0 ? "left" : "right") ? x : x * 0.25;
    paint(dx, false);
  }

  function onEnd(event: TouchEvent) {
    const wasSwipe = mode === "swipe";
    mode = "idle";
    if (!wasSwipe) {
      return;
    }
    const direction: Direction = dx < 0 ? "left" : "right";
    const distance = Math.abs(dx);
    const fast =
      distance / Math.max(event.timeStamp - startAt, 1) > FLICK_PX_PER_MS;
    if (canGo(direction) && (distance > SWIPE_PX || (fast && distance > 30))) {
      paint(
        direction === "left" ? -window.innerWidth : window.innerWidth,
        true
      );
      onCommit(direction);
      return;
    }
    paint(0, true);
  }

  element.addEventListener("touchstart", onStart, { passive: true });
  element.addEventListener("touchmove", onMove, { passive: false });
  element.addEventListener("touchend", onEnd, { passive: true });
  element.addEventListener("touchcancel", onEnd, { passive: true });
  return () => {
    element.removeEventListener("touchstart", onStart);
    element.removeEventListener("touchmove", onMove);
    element.removeEventListener("touchend", onEnd);
    element.removeEventListener("touchcancel", onEnd);
    paint(0, false);
  };
}

export function JobSwipe({
  children,
  fallback,
  slug,
}: {
  children: ReactNode;
  // Used when the job was not opened from a list: this job, then similar ones.
  fallback: readonly JobSequenceEntry[];
  slug: string;
}) {
  const router = useRouter();
  const neighbors = useNeighbors(slug, fallback);
  const applying = useApplyOpen();
  const surface = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState<Direction | null>(null);

  // A new job starts in place, whatever the last one did on its way out.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset per job
  useEffect(() => {
    setLeaving(null);
    if (surface.current) {
      surface.current.style.transition = "none";
      surface.current.style.transform = "";
    }
  }, [slug]);

  // Warm the neighbours so a swipe lands fast.
  useEffect(() => {
    for (const entry of [neighbors?.next, neighbors?.prev]) {
      if (entry) {
        router.prefetch(buildJobPath(entry.slug));
      }
    }
  }, [neighbors, router]);

  useEffect(() => {
    const element = surface.current;
    if (!(element && neighbors) || applying) {
      return;
    }
    return attachSwipe(element, {
      canGo: (direction) =>
        Boolean(direction === "left" ? neighbors.next : neighbors.prev),
      onCommit: (direction) => {
        const target = direction === "left" ? neighbors.next : neighbors.prev;
        if (!target) {
          return;
        }
        setLeaving(direction);
        window.setTimeout(() => {
          router.push(buildJobPath(target.slug));
        }, 160);
      },
    });
  }, [applying, neighbors, router]);

  return (
    <div className="overflow-x-clip">
      <div data-leaving={leaving ?? undefined} ref={surface}>
        {children}
      </div>
      {leaving ? (
        <span className="sr-only" role="status">
          Opening {leaving === "left" ? "next" : "previous"} job
        </span>
      ) : null}
    </div>
  );
}
