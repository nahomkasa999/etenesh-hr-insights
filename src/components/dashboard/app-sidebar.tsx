"use client";

import {
  IconBriefcase,
  IconBuilding,
  IconExternalLink,
  IconLayoutDashboard,
  IconUsers,
} from "@tabler/icons-react";
import type * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_MAIN = [
  { icon: IconLayoutDashboard, title: "Overview", url: "/dashboard" },
  { icon: IconUsers, title: "Applications", url: "/dashboard/applications" },
  { icon: IconBriefcase, title: "Jobs", url: "/dashboard/jobs" },
  {
    icon: IconBuilding,
    title: "Companies",
    url: "/dashboard/companies",
  },
];

const NAV_SECONDARY = [
  { icon: IconExternalLink, title: "View job board", url: "/jobs" },
];

export function AppSidebar({
  email,
  ...props
}: React.ComponentProps<typeof Sidebar> & { email: string }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                {/* biome-ignore lint/performance/noImgElement: a static logo at text height */}
                <img
                  alt=""
                  className="h-5 w-auto object-contain"
                  height={20}
                  src="/etenesh/logo.webp"
                  width={24}
                />
                <span className="text-base font-semibold">Etenesh HR</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_MAIN} />
        <NavSecondary className="mt-auto" items={NAV_SECONDARY} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={email} />
      </SidebarFooter>
    </Sidebar>
  );
}
