import type { Metadata } from "next";

import { ApplicationsTable } from "@/components/dashboard/applications-table";
import { HeaderActions } from "@/components/dashboard/header-actions";
import { SiteHeader } from "@/components/dashboard/site-header";
import { listApplications, requireStaff } from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const { payload } = await requireStaff("/dashboard/applications");
  const rows = await listApplications(payload);

  return (
    <>
      <SiteHeader actions={<HeaderActions />} title="Applications" />
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <p className="text-muted-foreground px-4 text-[15px] lg:px-6">
          Everyone who applied, newest first. Only people who met each job's
          minimum requirements could apply.
        </p>
        <ApplicationsTable data={rows} />
      </div>
    </>
  );
}
