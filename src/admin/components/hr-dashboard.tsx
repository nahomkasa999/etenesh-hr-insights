import { ArrowUpRight, Briefcase, FileText, Plus } from "lucide-react";
import Link from "next/link";
import type { PayloadRequest } from "payload";

import { publishedAndUnexpiredWhere } from "@/access/jobs";
import { hasRole } from "@/access/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function HrDashboard({
  initPageResult: { req },
}: {
  initPageResult: { req: PayloadRequest };
}) {
  if (!(hasRole(req.user, "admin") || hasRole(req.user, "editor"))) {
    return null;
  }

  const now = new Date();
  const query = { collection: "jobs", req } as const;
  const [open, drafts, closed, recent] = await Promise.all([
    req.payload.count({
      ...query,
      overrideAccess: false,
      where: publishedAndUnexpiredWhere(now),
    }),
    req.payload.count({
      ...query,
      overrideAccess: false,
      where: { _status: { equals: "draft" } },
    }),
    req.payload.count({
      ...query,
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        validThrough: { less_than_equal: now.toISOString() },
      },
    }),
    req.payload.find({
      ...query,
      depth: 0,
      limit: 8,
      overrideAccess: false,
      select: {
        _status: true,
        companyName: true,
        title: true,
        validThrough: true,
      },
      sort: "-updatedAt",
    }),
  ]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="m-0 text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
            Recruitment overview
          </h1>
          <p className="text-muted-foreground m-0 text-base">
            See which jobs are live, review drafts, and post a vacancy.
          </p>
        </div>
        <Button asChild className="h-11 text-sm">
          <Link href="/admin/collections/jobs/create">
            <Plus aria-hidden="true" />
            Post a job
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            description: "Visible on the public board",
            label: "Open jobs",
            total: open.totalDocs,
          },
          {
            description: "Unpublished vacancies",
            label: "Draft jobs",
            total: drafts.totalDocs,
          },
          {
            description: "Published jobs past their deadline",
            label: "Closed jobs",
            total: closed.totalDocs,
          },
        ].map(({ description, label, total }) => (
          <Card className="gap-0 py-4" key={label}>
            <CardHeader className="gap-2 px-4">
              <CardTitle className="text-sm">{label}</CardTitle>
              <p className="m-0 text-3xl leading-none font-semibold tabular-nums">
                {total}
              </p>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-lg font-semibold">Recently updated jobs</h2>
            <Button asChild className="h-11 text-sm" variant="outline">
              <Link href="/admin/collections/jobs">
                <Briefcase aria-hidden="true" />
                Manage jobs
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          {recent.docs.length ? (
            <ul className="divide-border m-0 list-none divide-y p-0">
              {recent.docs.map((job) => {
                let status = "Open";
                if (job._status !== "published") {
                  status = "Draft";
                } else if (
                  job.validThrough &&
                  Date.parse(job.validThrough) <= now.getTime()
                ) {
                  status = "Closed";
                }
                return (
                  <li key={job.id}>
                    <Link
                      className="hover:bg-muted flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-md px-2 py-2 no-underline"
                      href={`/admin/collections/jobs/${job.id}`}
                    >
                      <span className="grid min-w-0 gap-1">
                        <span className="text-foreground text-sm font-semibold">
                          {job.title}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {job.companyName}
                        </span>
                      </span>
                      <Badge variant="outline">{status}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground m-0">
              Post your first job to start tracking vacancies.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <h2 className="m-0 flex items-center gap-2 text-lg font-semibold">
            <FileText aria-hidden="true" className="size-5" />
            Applications
          </h2>
          <CardDescription className="text-sm">
            The public application form is a demo. Applicant and acceptance
            counts are unavailable.
          </CardDescription>
        </CardHeader>
      </Card>
      <Button asChild className="h-11 w-fit text-sm" variant="outline">
        <Link href="/jobs">
          View public job board
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
