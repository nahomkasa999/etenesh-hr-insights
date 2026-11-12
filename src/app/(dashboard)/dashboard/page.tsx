import type { Metadata } from "next";

import { ApplicationsTable } from "@/components/dashboard/applications-table";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { HeaderActions } from "@/components/dashboard/header-actions";
import { SectionCards } from "@/components/dashboard/section-cards";
import { SiteHeader } from "@/components/dashboard/site-header";
import {
  getOverview,
  listApplications,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const { payload } = await requireStaff("/dashboard");
  const rows = await listApplications(payload);
  const overview = await getOverview(payload, rows);

  return (
    <>
      <SiteHeader actions={<HeaderActions />} title="Overview" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards overview={overview} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive data={overview.series} />
            </div>
            <h2 className="px-4 text-lg font-semibold lg:px-6">
              Latest applications
            </h2>
            <ApplicationsTable data={rows} />
          </div>
        </div>
      </div>
    </>
  );
}
