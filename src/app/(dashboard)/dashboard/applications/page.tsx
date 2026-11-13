import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ApplicationDetailView } from "@/components/dashboard/application-detail";
import { ApplicationsInbox } from "@/components/dashboard/applications-inbox";
import { HeaderActions } from "@/components/dashboard/header-actions";
import { SiteHeader } from "@/components/dashboard/site-header";
import { Button } from "@/components/ui/button";
import {
  getApplication,
  getJob,
  listApplications,
  requireStaff,
} from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const { payload } = await requireStaff(
    id ? `/dashboard/applications?id=${id}` : "/dashboard/applications"
  );
  const rows = await listApplications(payload);
  // On a wide screen the first application opens by itself. On a phone the
  // list shows until one is chosen.
  const openId = id ?? (rows[0] ? String(rows[0].id) : undefined);
  const app = openId ? await getApplication(payload, openId) : null;
  const jobId = app && (typeof app.job === "object" ? app.job.id : app.job);
  const job = jobId ? await getJob(payload, String(jobId)) : null;

  return (
    <>
      <SiteHeader actions={<HeaderActions />} title="Applications" />
      <div className="flex min-h-0 flex-1 lg:h-[calc(100svh-var(--header-height)-1rem)]">
        <aside
          className={`flex min-h-0 w-full flex-col lg:w-[400px] lg:shrink-0 lg:border-r ${id ? "hidden lg:flex" : "flex"}`}
        >
          <ApplicationsInbox
            rows={rows}
            selectedId={app ? Number(app.id) : null}
          />
        </aside>
        <section
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${id ? "block" : "hidden lg:block"}`}
          key={app?.id}
        >
          {app ? (
            <>
              <div className="px-4 pt-4 lg:hidden">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/applications">
                    <IconArrowLeft />
                    All applications
                  </Link>
                </Button>
              </div>
              <ApplicationDetailView app={app} job={job} />
            </>
          ) : (
            <p className="text-muted-foreground p-8 text-center">
              Nobody has applied yet.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
