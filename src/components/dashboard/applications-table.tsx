"use client";

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconFileText,
  IconLayoutColumns,
  IconSearch,
} from "@tabler/icons-react";
import {
  type ColumnVisibilityState,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { updateApplicationStatus } from "@/app/(dashboard)/dashboard/actions";
import { MatchBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApplicationRow } from "@/lib/etenesh/dashboard-data";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  STATUS_ACTIONS,
  STATUS_LABELS,
} from "@/lib/etenesh/vocab";

const features = tableFeatures({
  columnVisibilityFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowPaginationFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, ApplicationRow>();

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Addis_Ababa",
});

function RowActions({ row }: { row: ApplicationRow }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function move(to: ApplicationStatus, label: string) {
    startTransition(async () => {
      const result = await updateApplicationStatus(row.id, to);
      if (result.ok) {
        toast.success(`${row.fullName}: ${label}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the change.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-muted-foreground data-[state=open]:bg-muted size-9"
          disabled={pending}
          size="icon"
          variant="ghost"
        >
          <IconDotsVertical />
          <span className="sr-only">Actions for {row.fullName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/applications/${row.id}`}>
            Open application
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/api/cv/${row.id}`} rel="noopener" target="_blank">
            <IconFileText />
            Open CV
          </a>
        </DropdownMenuItem>
        {STATUS_ACTIONS[row.status].length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {STATUS_ACTIONS[row.status].map((action) => (
              <DropdownMenuItem
                key={action.to}
                onSelect={() => move(action.to, STATUS_LABELS[action.to])}
                variant={action.to === "rejected" ? "destructive" : "default"}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildColumns(showJob: boolean) {
  return columnHelper.columns([
    columnHelper.accessor("fullName", {
      cell: ({ row }) => (
        <Link
          className="flex flex-col gap-0.5 hover:underline"
          href={`/dashboard/applications/${row.original.id}`}
        >
          <span className="text-foreground text-[15px] font-medium">
            {row.original.fullName}
          </span>
          <span className="text-muted-foreground text-sm">
            {row.original.reference} · {row.original.phone}
          </span>
        </Link>
      ),
      enableHiding: false,
      header: "Applicant",
    }),
    ...(showJob
      ? [
          columnHelper.accessor("jobTitle", {
            cell: ({ row }) => (
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {row.original.jobTitle}
                </span>
                <span className="text-muted-foreground text-sm">
                  {row.original.companyName}
                </span>
              </div>
            ),
            header: "Job",
          }),
        ]
      : []),
    columnHelper.accessor("matchScore", {
      cell: ({ row }) => <MatchBadge score={row.original.matchScore} />,
      header: "Match",
    }),
    columnHelper.accessor("status", {
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      header: "Status",
    }),
    columnHelper.accessor("createdAt", {
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.createdAt
            ? dateFormat.format(new Date(row.original.createdAt))
            : ""}
        </span>
      ),
      header: "Applied",
    }),
    columnHelper.display({
      cell: ({ row }) => <RowActions row={row.original} />,
      id: "actions",
    }),
  ]);
}

const COLUMN_LABELS: Record<string, string> = {
  createdAt: "Applied",
  jobTitle: "Job",
  matchScore: "Match",
  status: "Status",
};

type View = "all" | ApplicationStatus;

export function ApplicationsTable({
  data,
  emptyText = "No applications yet.",
  showJob = true,
}: {
  data: ApplicationRow[];
  emptyText?: string;
  showJob?: boolean;
}) {
  const [view, setView] = React.useState<View>("all");
  const [query, setQuery] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const counts = React.useMemo(() => {
    const map = new Map<View, number>([["all", data.length]]);
    for (const status of APPLICATION_STATUSES) {
      map.set(status, data.filter((row) => row.status === status).length);
    }
    return map;
  }, [data]);

  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((row) => {
      if (view !== "all" && row.status !== view) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [row.fullName, row.email, row.phone, row.reference, row.jobTitle]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [data, query, view]);

  const columns = React.useMemo(() => buildColumns(showJob), [showJob]);

  const table = useTable({
    columns,
    data: rows,
    features,
    getRowId: (row) => String(row.id),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnVisibility, pagination, sorting },
  });

  function changeView(value: string) {
    setView(value as View);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  const views: View[] = ["all", ...APPLICATION_STATUSES];
  const label = (value: View) =>
    value === "all" ? "All" : STATUS_LABELS[value];

  return (
    <Tabs
      className="w-full flex-col justify-start gap-4"
      onValueChange={changeView}
      value={view}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
        <Label className="sr-only" htmlFor="status-view">
          Show
        </Label>
        <Select onValueChange={changeView} value={view}>
          <SelectTrigger
            className="flex w-fit @5xl/main:hidden"
            id="status-view"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {views.map((value) => (
              <SelectItem key={value} value={value}>
                {label(value)} ({counts.get(value) ?? 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TabsList className="hidden h-10 @5xl/main:flex">
          {views.map((value) => (
            <TabsTrigger
              className="gap-1.5 px-3 text-sm"
              key={value}
              value={value}
            >
              {label(value)}
              {(counts.get(value) ?? 0) > 0 ? (
                <Badge className="bg-muted-foreground/20 text-foreground h-5 min-w-5 rounded-full px-1.5 text-sm">
                  {counts.get(value)}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              aria-label="Search applicants"
              className="h-10 w-56 pl-9 text-sm"
              onChange={(event) => {
                setQuery(event.target.value);
                setPagination((current) => ({ ...current, pageIndex: 0 }));
              }}
              placeholder="Search name, phone…"
              value={query}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10" variant="outline">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    key={column.id}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {COLUMN_LABELS[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="h-11 text-sm"
                      colSpan={header.colSpan}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="py-3" key={cell.id}>
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="text-muted-foreground h-28 text-center text-[15px]"
                    colSpan={columns.length}
                  >
                    {query || view !== "all"
                      ? "Nothing matches this view."
                      : emptyText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-1">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {rows.length} application{rows.length === 1 ? "" : "s"}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label className="text-sm font-medium" htmlFor="rows-per-page">
                Rows per page
              </Label>
              <Select
                onValueChange={(value) => table.setPageSize(Number(value))}
                value={`${table.state.pagination.pageSize}`}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                className="hidden size-9 p-0 lg:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant="outline"
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                className="size-9"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                className="size-9"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                className="hidden size-9 lg:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
}
