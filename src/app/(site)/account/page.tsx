import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationList } from "@/components/account/application-list";
import { JobMatchList } from "@/components/account/job-match-list";
import { TelegramCard } from "@/components/account/telegram-card";
import { getAccount } from "@/lib/auth/account";
import {
  listCandidateApplications,
  listDocuments,
  missingForApply,
  profileCompleteness,
} from "@/lib/etenesh/candidates";
import { appliedJobIds, loadOpenJobs, rankJobs } from "@/lib/etenesh/recommend";
import { botUsername, linkToken } from "@/lib/etenesh/telegram";
import type { Application } from "@/payload-types";

const ACTIVE = new Set([
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
]);

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card ring-line flex flex-col gap-1 rounded-xl p-4 ring-1 ring-inset">
      <dt className="text-subtle text-[12px]">{label}</dt>
      <dd className="text-foreground text-2xl font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  );
}

export default async function AccountPage() {
  const account = await getAccount();
  if (!account) {
    redirect("/signin?next=/account");
  }
  const { candidate, payload } = account;
  const [documents, applications, jobs, applied, bot] = await Promise.all([
    listDocuments(payload, candidate.id),
    listCandidateApplications(payload, candidate.id, 20),
    loadOpenJobs(payload),
    appliedJobIds(payload, candidate),
    botUsername(),
  ]);
  const connected = Boolean(candidate.telegramChatId);
  let telegramLink: string | null = null;
  if (bot) {
    telegramLink = connected
      ? `https://t.me/${bot}`
      : `https://t.me/${bot}?start=${linkToken(candidate.id)}`;
  }
  const hasCv = documents.some((doc) => doc.kind === "cv");
  const complete = profileCompleteness(candidate, hasCv);
  const missing = missingForApply(candidate, hasCv);
  const matches = rankJobs(candidate, jobs, { exclude: applied, limit: 5 });
  const active = applications.filter((item) => ACTIVE.has(item.status)).length;
  const interviews = applications.filter((item) =>
    ["interview", "offer", "hired"].includes(item.status)
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {complete < 100 ? (
        <section className="bg-primary/5 ring-primary/20 flex flex-col gap-3 rounded-xl p-4 ring-1 ring-inset md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-foreground text-[15px] font-medium">
              Your profile is {complete}% complete
            </p>
            <div className="bg-primary/15 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${complete}%` }}
              />
            </div>
            {missing.length > 0 ? (
              <p className="text-muted-foreground text-[13px]">
                Add {missing.join(", ").toLowerCase()} to apply in one tap and
                use auto apply.
              </p>
            ) : (
              <p className="text-muted-foreground text-[13px]">
                Add skills, a headline and what you are looking for to get
                better matches.
              </p>
            )}
          </div>
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium"
            href="/account/profile"
          >
            Complete profile
          </Link>
        </section>
      ) : null}

      <TelegramCard connected={connected} link={telegramLink} />

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Applications" value={applications.length} />
        <Stat label="In progress" value={active} />
        <Stat label="Interviews and offers" value={interviews} />
        <Stat label="Auto apply" value={candidate.autoApply ? "On" : "Off"} />
      </dl>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-lg font-medium">Jobs for you</h2>
          <Link
            className="text-muted-foreground hover:text-foreground text-sm"
            href="/account/jobs"
          >
            See all
          </Link>
        </div>
        <JobMatchList
          empty="No open jobs right now. Check back soon."
          matches={matches}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-lg font-medium">
            Recent applications
          </h2>
          {applications.length > 0 ? (
            <Link
              className="text-muted-foreground hover:text-foreground text-sm"
              href="/account/applications"
            >
              See all
            </Link>
          ) : null}
        </div>
        <ApplicationList
          applications={applications.slice(0, 3) as Application[]}
          compact
        />
      </section>
    </div>
  );
}
