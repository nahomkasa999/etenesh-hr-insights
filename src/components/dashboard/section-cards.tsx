import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Overview } from "@/lib/etenesh/dashboard-data";

function percentChange(now: number, before: number): number | null {
  if (before === 0) {
    return now === 0 ? 0 : null;
  }
  return Math.round(((now - before) / before) * 100);
}

const BADGE = "h-7 gap-1 px-2.5 text-sm";

export function SectionCards({ overview }: { overview: Overview }) {
  const change = percentChange(
    overview.applicationsThisWeek,
    overview.applicationsLastWeek
  );
  const up = change === null || change >= 0;
  const Trend = up ? IconTrendingUp : IconTrendingDown;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm">New to review</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
            {overview.newToReview}
          </CardTitle>
          <CardAction>
            <Badge className={BADGE} variant="outline">
              Waiting
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Applications nobody has opened yet
          </div>
          <div className="text-muted-foreground">Start with these first</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm">
            Applications this week
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
            {overview.applicationsThisWeek}
          </CardTitle>
          <CardAction>
            <Badge className={BADGE} variant="outline">
              <Trend />
              {change === null ? "New" : `${change > 0 ? "+" : ""}${change}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {overview.applicationsLastWeek} the week before{" "}
            <Trend className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {overview.applications} applications in total
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm">In progress</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
            {overview.inProgress}
          </CardTitle>
          <CardAction>
            <Badge className={BADGE} variant="outline">
              Shortlist to offer
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Shortlisted, interviewing or offered
          </div>
          <div className="text-muted-foreground">Keep them moving</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-sm">Open jobs</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
            {overview.openJobs}
          </CardTitle>
          <CardAction>
            <Badge className={BADGE} variant="outline">
              {overview.closingThisWeek} closing soon
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">On the job board now</div>
          <div className="text-muted-foreground">
            {overview.closingThisWeek} close in the next 7 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
