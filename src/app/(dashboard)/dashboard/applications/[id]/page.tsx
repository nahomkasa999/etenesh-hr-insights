import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconDownload,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  NoteForm,
  StatusActions,
} from "@/components/dashboard/application-actions";
import { SiteHeader } from "@/components/dashboard/site-header";
import { MatchBadge, StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApplication, requireStaff } from "@/lib/etenesh/dashboard-data";
import { type ApplicationStatus, STATUS_LABELS } from "@/lib/etenesh/vocab";

export const metadata: Metadata = { title: "Application" };

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  timeZone: "Africa/Addis_Ababa",
  year: "numeric",
});

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) {
    return "";
  }
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-[15px] font-medium">{value || "—"}</dd>
    </div>
  );
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { payload } = await requireStaff(`/dashboard/applications/${id}`);
  const app = await getApplication(payload, id);
  if (!app) {
    notFound();
  }
  const status = app.status as ApplicationStatus;
  const jobId = typeof app.job === "object" ? app.job.id : app.job;

  return (
    <>
      <SiteHeader
        actions={
          <Button asChild className="h-9" variant="outline">
            <Link href={`/dashboard/jobs/${jobId}`}>
              <IconArrowLeft />
              All applicants for this job
            </Link>
          </Button>
        }
        title={app.fullName}
      />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">{app.fullName}</h2>
            <p className="text-muted-foreground text-[15px]">
              Applied for{" "}
              <span className="text-foreground font-medium">
                {app.jobTitle}
              </span>{" "}
              at {app.companyName} · {app.reference} ·{" "}
              {dateTime.format(new Date(app.createdAt))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MatchBadge score={app.matchScore ?? 0} />
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Contact and background
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Fact label="Phone" value={app.phone} />
                  <Fact label="Email" value={app.email} />
                  <Fact label="City" value={app.city ?? ""} />
                  <Fact
                    label="Experience"
                    value={`${app.yearsExperience ?? 0} year${app.yearsExperience === 1 ? "" : "s"}`}
                  />
                  <Fact label="Education" value={app.education ?? ""} />
                  <Fact
                    label="Skills"
                    value={(app.skills ?? [])
                      .map((row) => row.value)
                      .join(", ")}
                  />
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="h-10">
                    <a
                      href={`/api/cv/${app.id}`}
                      rel="noopener"
                      target="_blank"
                    >
                      <IconDownload />
                      Open CV {app.cvName ? `(${formatSize(app.cvSize)})` : ""}
                    </a>
                  </Button>
                  <Button asChild className="h-10" variant="outline">
                    <a href={`tel:${app.phone.replace(/\s+/gu, "")}`}>
                      <IconPhone />
                      Call
                    </a>
                  </Button>
                  <Button asChild className="h-10" variant="outline">
                    <a href={`mailto:${app.email}`}>
                      <IconMail />
                      Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Answers to the employer's questions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(app.answers ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-[15px]">
                    This job had no questions.
                  </p>
                ) : (
                  app.answers?.map((row, index) => (
                    <div className="flex flex-col gap-1" key={row.id ?? index}>
                      <p className="text-muted-foreground text-sm">
                        {index + 1}. {row.question}
                      </p>
                      <p className="text-[15px] leading-6 whitespace-pre-wrap">
                        {row.answer}
                      </p>
                    </div>
                  ))
                )}
                {app.coverNote ? (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground text-sm">
                        Cover note
                      </p>
                      <p className="text-[15px] leading-6 whitespace-pre-wrap">
                        {app.coverNote}
                      </p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Internal notes</CardTitle>
                <CardDescription className="text-sm">
                  Only the HR team sees these.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {(app.notes ?? []).map((note, index) => (
                  <div
                    className="bg-muted/60 rounded-lg p-3"
                    key={note.id ?? index}
                  >
                    <p className="text-[15px] whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {note.author} ·{" "}
                      {note.at ? dateTime.format(new Date(note.at)) : ""}
                    </p>
                  </div>
                ))}
                <NoteForm id={app.id} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next step</CardTitle>
                <CardDescription className="text-sm">
                  Now: {STATUS_LABELS[status]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatusActions
                  id={app.id}
                  name={app.fullName}
                  status={status}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Criteria check</CardTitle>
                <CardDescription className="text-sm">
                  {app.matchScore ?? 0}% match with what the employer asked for
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {(app.matchMet ?? []).map((row) => (
                  <p
                    className="flex items-center gap-2 text-[15px]"
                    key={row.id ?? row.value}
                  >
                    <IconCircleCheck className="size-5 shrink-0 text-green-600" />
                    {row.value}
                  </p>
                ))}
                {(app.matchMissed ?? []).map((row) => (
                  <p
                    className="text-muted-foreground flex items-center gap-2 text-[15px]"
                    key={row.id ?? row.value}
                  >
                    <IconCircleX className="size-5 shrink-0" />
                    {row.value}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-3">
                  {[...(app.history ?? [])].reverse().map((entry, index) => (
                    <li className="flex gap-3" key={entry.id ?? index}>
                      <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium">
                          {STATUS_LABELS[entry.status as ApplicationStatus] ??
                            entry.status}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {entry.by} ·{" "}
                          {entry.at ? dateTime.format(new Date(entry.at)) : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
