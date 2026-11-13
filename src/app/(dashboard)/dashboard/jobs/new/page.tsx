import type { Metadata } from "next";

import { JobForm } from "@/components/dashboard/job-form";
import { JobImportDialog } from "@/components/dashboard/job-import-dialog";
import { SiteHeader } from "@/components/dashboard/site-header";
import { listCompanies, requireStaff } from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Post a job" };

export default async function NewJobPage() {
  const { payload } = await requireStaff("/dashboard/jobs/new");
  const companies = await listCompanies(payload);
  return (
    <>
      <SiteHeader actions={<JobImportDialog />} title="Post a job" />
      <JobForm companies={companies.map((company) => company.name)} />
    </>
  );
}
