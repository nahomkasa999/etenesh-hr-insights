import { IconChevronRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HeaderActions } from "@/components/dashboard/header-actions";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listApplications,
  listJobsWithCounts,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Jobs" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Addis_Ababa",
  year: "numeric",
});

export default async function JobsPage() {
  const { payload } = await requireStaff("/dashboard/jobs");
  const rows = await listApplications(payload);
  const jobs = await listJobsWithCounts(payload, rows);

  return (
    <>
      <SiteHeader actions={<HeaderActions />} title="Jobs" />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <p className="text-muted-foreground px-4 text-[15px] lg:px-6">
          Open a job to see who applied and move them forward.
        </p>
        <div className="px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="h-11 text-sm">Job</TableHead>
                  <TableHead className="h-11 text-sm">Deadline</TableHead>
                  <TableHead className="h-11 text-right text-sm">
                    Applied
                  </TableHead>
                  <TableHead className="h-11 text-right text-sm">New</TableHead>
                  <TableHead className="h-11 text-right text-sm">
                    In progress
                  </TableHead>
                  <TableHead className="h-11 text-sm">Status</TableHead>
                  <TableHead className="h-11 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow className="relative" key={job.id}>
                    <TableCell className="py-3">
                      <Link
                        className="flex flex-col gap-0.5 after:absolute after:inset-0"
                        href={`/dashboard/jobs/${job.id}`}
                      >
                        <span className="text-[15px] font-medium">
                          {job.title}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {job.companyName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.closesAt
                        ? dateFormat.format(new Date(job.closesAt))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-[15px] font-medium tabular-nums">
                      {job.applications}
                    </TableCell>
                    <TableCell className="text-right">
                      {job.newCount > 0 ? (
                        <Badge className="bg-primary text-primary-foreground h-6 px-2 text-sm tabular-nums">
                          {job.newCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {job.shortlisted}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="h-7 px-2.5 text-sm"
                        variant={job.open ? "default" : "outline"}
                      >
                        {job.status === "draft"
                          ? "Draft"
                          : job.open
                            ? "Open"
                            : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <IconChevronRight className="text-muted-foreground size-4" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
