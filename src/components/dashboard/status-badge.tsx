import { type ApplicationStatus, STATUS_LABELS } from "@/lib/etenesh/vocab";
import { cn } from "@/lib/utils";

const TONE: Record<ApplicationStatus, { dot: string; text: string }> = {
  hired: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  interview: { dot: "bg-sky-500", text: "text-sky-700 dark:text-sky-400" },
  offer: { dot: "bg-violet-500", text: "text-violet-700 dark:text-violet-400" },
  on_hold: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  rejected: { dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" },
  shortlisted: {
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
  },
  submitted: { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  under_review: { dot: "bg-slate-400", text: "text-foreground" },
};

// A quiet dot and label. Colour carries the step, not a filled box.
export function StatusBadge({
  className,
  status,
}: {
  className?: string;
  status: ApplicationStatus;
}) {
  const tone = TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap",
        tone.text,
        className
      )}
    >
      <span aria-hidden className={cn("size-2 rounded-full", tone.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}

// A small bar that fills with the score, with the number beside it.
export function MatchBadge({
  className,
  score,
}: {
  className?: string;
  score: number;
}) {
  const bar =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-amber-500"
        : "bg-slate-400";
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sm", className)}
      title={`${score}% match with the job's criteria`}
    >
      <span
        aria-hidden
        className="bg-muted h-1.5 w-14 overflow-hidden rounded-full"
      >
        <span
          className={cn("block h-full rounded-full", bar)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
      <span className="font-medium tabular-nums">{score}%</span>
    </span>
  );
}
