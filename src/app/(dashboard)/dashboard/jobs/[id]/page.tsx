import { IconEdit, IconExternalLink } from "@tabler/icons-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplicationsTable } from "@/components/dashboard/applications-table";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getJob,
  listApplications,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Job applications" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "Africa/Addis_Ababa",
  year: "numeric",
});

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
  const criteria = job.criteria;
  const requirements = [
    criteria?.minYearsExperience
      ? `${criteria.minYearsExperience}+ years of experience`
      : null,
    criteria?.education && criteria.education !== "None"
      ? `${criteria.education} or higher`
      : null,
  ].filter(Boolean) as string[];

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
              <a href={`/admin/collections/jobs/${job.id}`}>
                <IconEdit />
                Edit job
              </a>
            </Button>
          </>
        }
        title={job.title}
      />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <CardDescription className="text-[15px]">
                {job.companyName}
                {job.locationDisplay ? ` · ${job.locationDisplay}` : ""}
                {job.validThrough
                  ? ` · Closes ${dateFormat.format(new Date(job.validThrough))}`
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-[15px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Must have:</span>
                {requirements.length > 0 ? (
                  requirements.map((item) => (
                    <Badge
                      className="h-7 px-2.5 text-sm"
                      key={item}
                      variant="outline"
                    >
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span>No minimum</span>
                )}
              </div>
              {(criteria?.requiredSkills?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Skills checked:</span>
                  {criteria?.requiredSkills?.map((skill) => (
                    <Badge
                      className="h-7 px-2.5 text-sm"
                      key={skill.id ?? skill.value}
                    >
                      {skill.value}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
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
