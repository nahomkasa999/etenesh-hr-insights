import { IconEdit, IconExternalLink } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationsTable } from "@/components/dashboard/applications-table";
import { JobBrief } from "@/components/dashboard/job-brief";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Button } from "@/components/ui/button";
import {
  getJob,
  listApplications,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Job applications" };

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { payload } = await requireStaff(`/dashboard/jobs/${id}`);
  const job = await getJob(payload, id);
  if (!job) {
    notFound();
  }
  const rows = await listApplications(payload, { jobId: job.id });
  return (
    <>
      <SiteHeader
        actions={
          <>
            <Button asChild className="hidden h-9 sm:flex" variant="outline">
              <a href={`/jobs/${job.slug}`} rel="noopener" target="_blank">
                <IconExternalLink />
                View on board
              </a>
            </Button>
            <Button asChild className="h-9" variant="outline">
              <Link href={`/dashboard/jobs/${job.id}/edit`}>
                <IconEdit />
                Edit job
              </Link>
            </Button>
          </>
        }
        title={job.title}
      />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <JobBrief defaultOpen={false} job={job} />
        </div>
        <h2 className="px-4 text-lg font-semibold lg:px-6">
          Applications ({rows.length})
        </h2>
        <ApplicationsTable
          data={rows}
          emptyText="Nobody has applied for this job yet."
          showJob={false}
        />
      </div>
    </>
  );
}
