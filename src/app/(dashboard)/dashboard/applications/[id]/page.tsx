import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationDetailView } from "@/components/dashboard/application-detail";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Button } from "@/components/ui/button";
import {
  getApplication,
  getJob,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Application" };

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { payload } = await requireStaff(`/dashboard/applications/${id}`);
  const app = await getApplication(payload, id);
  if (!app) {
    notFound();
  }
  const jobId = typeof app.job === "object" ? app.job.id : app.job;
  const job = await getJob(payload, String(jobId));

  return (
    <>
      <SiteHeader
        actions={
          <Button asChild className="h-9" variant="outline">
            <Link href={`/dashboard/jobs/${jobId}`}>
              <IconArrowLeft />
              All applicants for this job
            </Link>
          </Button>
        }
        title={app.fullName}
      />
      <ApplicationDetailView app={app} job={job} />
    </>
  );
}
