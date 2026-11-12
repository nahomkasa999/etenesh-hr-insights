"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type JSX, useEffect, useState } from "react";

import { isActiveItem } from "@/components/board/nav-active";
import { BOARD_HOME_PATH, type NavItem } from "@/config/nav";
import { useTranslation } from "@/custom/etenesh/language-provider";

const ICON_PROPS = {
  "aria-hidden": true,
  className: "size-[22px] shrink-0",
  fill: "none",
  focusable: false,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.5,
  viewBox: "0 0 20 20",
} as const;

type TabId = "alerts" | "companies" | "courses" | "jobs" | "saved";

const TAB_ICONS: Record<TabId, JSX.Element> = {
  alerts: (
    <svg {...ICON_PROPS}>
      <title>Alerts</title>
      <path d="M5 13.5V9a5 5 0 0 1 10 0v4.5l1.2 1.5H3.8z" />
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),
  companies: (
    <svg {...ICON_PROPS}>
      <title>Companies</title>
      <rect height="10" width="7" x="3" y="7" />
      <rect height="14" width="7" x="10" y="3" />
    </svg>
  ),
  courses: <GraduationCap aria-hidden="true" className="size-[22px]" />,
  jobs: (
    <svg {...ICON_PROPS}>
      <title>Jobs</title>
      <rect height="11" rx="2" width="14" x="3" y="6" />
      <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h3A1.5 1.5 0 0 1 13 4.5V6" />
    </svg>
  ),
  saved: (
    <svg {...ICON_PROPS}>
      <title>Saved</title>
      <path d="M5.5 3h9v14l-4.5-3.2L5.5 17z" />
    </svg>
  ),
};

interface Tab extends NavItem {
  id: TabId;
}

// Fixed bar for phones. The spacer reserves its height so the footer and the
// last content are never covered.
const JOB_PAGE =
  /^\/jobs\/(?!(?:search|locations|languages|levels|types)$)[^/]+$/u;

// A 404 under /jobs/ looks like a job URL, but it is a board page, so the
// tab bar stays. The not-found page marks itself with data-page.
const NOT_FOUND_SELECTOR = '[data-page="not-found"]';

function useIsNotFound(pathname: string): boolean {
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    // Re-check on every navigation; the marker comes and goes with the page.
    setNotFound(
      pathname.length > 0 && document.querySelector(NOT_FOUND_SELECTOR) !== null
    );
  }, [pathname]);
  return notFound;
}

export function TabBar({
  alertsEnabled,
  showCourses = false,
}: {
  alertsEnabled: boolean;
  showCourses?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslation();
  const notFound = useIsNotFound(pathname);

  const tabs: Tab[] = [
    {
      href: BOARD_HOME_PATH,
      id: "jobs",
      label: "Jobs",
    },
    { href: "/saved", id: "saved", label: "Saved" },
  ];
  if (alertsEnabled) {
    tabs.push({ href: "/alerts", id: "alerts", label: "Alerts" });
  }
  if (showCourses) {
    tabs.push({ href: "/courses", id: "courses", label: "Courses" });
  }
  tabs.push({ href: "/companies", id: "companies", label: "Companies" });

  // Paper's job page has only the pinned Save/Apply bar, no tab bar.
  if (JOB_PAGE.test(pathname) && !notFound) {
    return null;
  }

  return (
    <div className="md:hidden" data-testid="tab-bar">
      <div
        aria-hidden="true"
        className="h-[calc(64px+env(safe-area-inset-bottom))]"
      />
      <nav
        aria-label="Tabs"
        className="bg-background border-line fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="flex px-2 pt-2.5 pb-2">
          {tabs.map((tab) => {
            const active = isActiveItem(pathname, tab);
            return (
              <li className="flex-1" key={tab.id}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 text-xs leading-4 font-medium ${
                    active ? "text-foreground" : "text-subtle"
                  }`}
                  href={tab.href}
                >
                  {TAB_ICONS[tab.id]}
                  {t(tab.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
