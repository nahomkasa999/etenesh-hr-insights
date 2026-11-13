"use client";

import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import { MatchBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Input } from "@/components/ui/input";
import type { ApplicationRow } from "@/lib/etenesh/dashboard-data";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  STATUS_LABELS,
} from "@/lib/etenesh/vocab";
import { cn } from "@/lib/utils";

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Addis_Ababa",
});

// The scrolling list on the left of the applications page. Choosing a row
// loads it on the right without leaving the page.
export function ApplicationsInbox({
  rows,
  selectedId,
}: {
  rows: ApplicationRow[];
  selectedId: number | null;
}) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ApplicationStatus | "all">("all");

  const counts = React.useMemo(() => {
    const result: Record<string, number> = { all: rows.length };
    for (const row of rows) {
      result[row.status] = (result[row.status] ?? 0) + 1;
    }
    return result;
  }, [rows]);

  const visible = rows.filter((row) => {
    if (status !== "all" && row.status !== status) {
      return false;
    }
    const needle = query.trim().toLowerCase();
    return (
      needle === "" ||
      `${row.fullName} ${row.jobTitle} ${row.companyName} ${row.phone} ${row.reference}`
        .toLowerCase()
        .includes(needle)
    );
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="h-10 pl-9 text-[15px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, job, phone…"
            value={query}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...APPLICATION_STATUSES] as const)
            .filter((key) => key === "all" || (counts[key] ?? 0) > 0)
            .map((key) => (
              <button
                aria-pressed={status === key}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[13px] transition-colors",
                  status === key
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "text-muted-foreground hover:text-foreground"
                )}
                key={key}
                onClick={() => setStatus(key)}
                type="button"
              >
                {key === "all" ? "All" : STATUS_LABELS[key]}{" "}
                <span className="tabular-nums">{counts[key] ?? 0}</span>
              </button>
            ))}
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <li className="text-muted-foreground p-6 text-center text-[15px]">
            No applications match.
          </li>
        ) : (
          visible.map((row) => (
            <li key={row.id}>
              <Link
                aria-current={row.id === selectedId ? "true" : undefined}
                className={cn(
                  "hover:bg-muted/60 flex flex-col gap-1.5 border-b px-4 py-3 transition-colors",
                  row.id === selectedId && "bg-muted"
                )}
                href={`/dashboard/applications?id=${row.id}`}
                scroll={false}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[15px] font-medium">
                    {row.fullName}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {dayFormat.format(new Date(row.createdAt))}
                  </span>
                </span>
                <span className="text-muted-foreground truncate text-sm">
                  {row.jobTitle} · {row.companyName}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <StatusBadge status={row.status} />
                  <MatchBadge score={row.matchScore} />
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
