import Link from "next/link";
import { redirect } from "next/navigation";

import { AutoApplyPanel } from "@/components/account/auto-apply-panel";
import { LinkPending } from "@/components/board/link-pending";
import { getAccount } from "@/lib/auth/account";
import { buildJobPath } from "@/lib/board/paths";
import { listDocuments, missingForApply } from "@/lib/etenesh/candidates";
import { appliedJobIds, loadOpenJobs, rankJobs } from "@/lib/etenesh/recommend";

export const metadata = { title: "Auto apply" };

function when(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export default async function AutoApplyPage() {
  const account = await getAccount();
  if (!account) {
    redirect("/signin?next=/account/auto-apply");
  }
  const { candidate, payload } = account;
  const [documents, jobs, applied] = await Promise.all([
    listDocuments(payload, candidate.id),
    loadOpenJobs(payload),
    appliedJobIds(payload, candidate),
  ]);
  // Good matches auto apply cannot send: the employer asks questions only
  // the candidate can answer. The form opens prefilled from the profile.
  const minScore = candidate.autoApplyMinScore ?? 70;
  const waiting = rankJobs(candidate, jobs, {
    exclude: applied,
    limit: jobs.length,
  })
    .filter(
      (match) =>
        match.appliesHere &&
        match.eligible &&
        match.hasQuestions &&
        match.score >= minScore
    )
    .slice(0, 10);
  const missing = missingForApply(
    candidate,
    documents.some((doc) => doc.kind === "cv")
  );
  const log = candidate.autoApplyLog ?? [];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-lg font-medium">Auto apply</h2>
          <p className="text-muted-foreground text-sm">
            Let Etenesh apply for you. Every application shows under
            Applications, marked "Auto applied".
          </p>
        </div>
        <AutoApplyPanel
          initial={{
            autoApply: candidate.autoApply ?? false,
            autoApplyDailyLimit: candidate.autoApplyDailyLimit ?? 5,
            autoApplyMinScore: candidate.autoApplyMinScore ?? 70,
            autoApplyNote: candidate.autoApplyNote ?? "",
          }}
          missing={missing}
        />
      </section>
      {waiting.length > 0 ? (
        <section
          className="flex flex-col gap-3"
          data-testid="auto-apply-waiting"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-base font-medium">
              Waiting for your answers
            </h2>
            <p className="text-muted-foreground text-sm">
              These match you well, but the employer asks a few questions. Your
              details are filled in; just answer and send.
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {waiting.map((match) => (
              <li
                className="bg-card ring-line relative flex items-center justify-between gap-3 rounded-xl p-3.5 ring-1 ring-inset"
                key={match.job.id}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {match.job.title}
                  </p>
                  <p className="text-muted-foreground truncate text-[13px]">
                    {match.job.companyName} · {match.score}% match
                  </p>
                </div>
                <Link
                  className="bg-primary text-primary-foreground hover:bg-primary/90 relative inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-[13px] font-medium"
                  href={`${buildJobPath(match.job.slug)}#apply`}
                >
                  Answer and send
                  <LinkPending />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-base font-medium">
          Recent activity
          {candidate.autoApplyLastRun ? (
            <span className="text-subtle ml-2 text-[13px] font-normal">
              Last run {when(candidate.autoApplyLastRun)}
            </span>
          ) : null}
        </h2>
        {log.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing yet.</p>
        ) : (
          <ul
            className="divide-line flex flex-col divide-y"
            data-testid="auto-apply-log"
          >
            {log.map((entry) => (
              <li
                className="flex items-start justify-between gap-3 py-2.5"
                key={entry.id ?? `${entry.at}-${entry.jobTitle}`}
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm">
                    {entry.jobTitle}
                  </p>
                  <p className="text-muted-foreground text-[13px]">
                    {entry.detail}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span
                    className={
                      entry.outcome === "applied"
                        ? "rounded-md bg-green-600/10 px-1.5 py-0.5 text-[12px] font-medium text-green-700 dark:text-green-400"
                        : "bg-tag text-muted-foreground rounded-md px-1.5 py-0.5 text-[12px] font-medium"
                    }
                  >
                    {entry.outcome === "applied" ? "Applied" : "Skipped"}
                  </span>
                  <span className="text-subtle text-[11px]">
                    {when(entry.at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
