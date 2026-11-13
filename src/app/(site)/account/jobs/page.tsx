import Link from "next/link";
import { redirect } from "next/navigation";

import { JobMatchList } from "@/components/account/job-match-list";
import { getAccount } from "@/lib/auth/account";
import { values } from "@/lib/etenesh/candidates";
import { appliedJobIds, loadOpenJobs, rankJobs } from "@/lib/etenesh/recommend";

export const metadata = { title: "Jobs for you" };

export default async function AccountJobsPage() {
  const account = await getAccount();
  if (!account) {
    redirect("/signin?next=/account/jobs");
  }
  const { candidate, payload } = account;
  const [jobs, applied] = await Promise.all([
    loadOpenJobs(payload),
    appliedJobIds(payload, candidate),
  ]);
  const matches = rankJobs(candidate, jobs, { exclude: applied, limit: 40 });
  const thin =
    values(candidate.skills).length === 0 &&
    values(candidate.preferredCategories).length === 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-lg font-medium">
          Most relevant jobs for you
        </h2>
        <p className="text-muted-foreground text-sm">
          Ranked by your skills, experience, education and what you are looking
          for. Jobs you already applied for are hidden.
        </p>
      </div>
      {thin ? (
        <p className="bg-surface-sub text-muted-foreground rounded-lg px-3 py-2 text-sm">
          Add your skills and preferred categories in{" "}
          <Link className="text-foreground underline" href="/account/profile">
            your profile
          </Link>{" "}
          to sharpen these matches.
        </p>
      ) : null}
      <JobMatchList
        empty="No open jobs right now. Check back soon."
        matches={matches}
      />
    </section>
  );
}
