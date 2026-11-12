import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireStaff } from "@/lib/etenesh/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { email } = await requireStaff();
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 14)",
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as CSSProperties
      }
    >
      <AppSidebar email={email} variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
