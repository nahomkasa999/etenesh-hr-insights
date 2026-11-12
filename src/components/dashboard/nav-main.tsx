"use client";

import { type Icon, IconCirclePlusFilled } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function isActive(pathname: string, url: string): boolean {
  if (url === "/dashboard") {
    return pathname === url;
  }
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({
  items,
}: {
  items: { icon?: Icon; title: string; url: string }[];
}) {
  const pathname = usePathname() ?? "";
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground h-10 min-w-8 duration-200 ease-linear"
              tooltip="Post a job"
            >
              <a href="/admin/collections/jobs/create">
                <IconCirclePlusFilled />
                <span>Post a job</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="h-10 text-[15px]"
                isActive={isActive(pathname, item.url)}
                tooltip={item.title}
              >
                <a href={item.url}>
                  {item.icon ? <item.icon /> : null}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
