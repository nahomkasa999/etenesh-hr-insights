import { Badge } from "@/components/ui/badge";
import { type ApplicationStatus, STATUS_LABELS } from "@/lib/etenesh/vocab";
import { cn } from "@/lib/utils";

const TONE: Record<ApplicationStatus, string> = {
  hired: "bg-secondary/15 text-secondary dark:text-secondary",
  interview: "bg-primary/10 text-primary",
  offer: "bg-primary/10 text-primary",
  on_hold: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  rejected: "bg-destructive/10 text-destructive",
  shortlisted: "bg-secondary/15 text-green-700 dark:text-secondary",
  submitted: "bg-primary text-primary-foreground",
  under_review: "bg-tag text-foreground",
};

export function StatusBadge({
  className,
  status,
}: {
  className?: string;
  status: ApplicationStatus;
}) {
  return (
    <Badge className={cn("h-7 px-2.5 text-sm", TONE[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "border-green-600/30 text-green-700 dark:text-secondary"
      : score >= 60
        ? "border-amber-500/40 text-amber-700 dark:text-amber-400"
        : "border-line-strong text-muted-foreground";
  return (
    <Badge
      className={cn("h-7 px-2.5 text-sm tabular-nums", tone)}
      variant="outline"
    >
      {score}% match
    </Badge>
  );
}
