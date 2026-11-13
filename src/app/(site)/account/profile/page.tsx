import { redirect } from "next/navigation";

import {
  type DocumentRow,
  DocumentsPanel,
} from "@/components/account/documents-panel";
import { ProfileForm } from "@/components/account/profile-form";
import { getAccount } from "@/lib/auth/account";
import { listDocuments, values } from "@/lib/etenesh/candidates";
import { loadOpenJobs } from "@/lib/etenesh/recommend";

export const metadata = { title: "Profile and documents" };

function distinct(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.trim();
    if (key) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([item]) => item);
}

export default async function AccountProfilePage() {
  const account = await getAccount();
  if (!account) {
    redirect("/signin?next=/account/profile");
  }
  const { candidate, payload } = account;
  const [documents, jobs] = await Promise.all([
    listDocuments(payload, candidate.id),
    loadOpenJobs(payload),
  ]);
  // Suggestions come from the jobs on the board, most common first.
  const categories = distinct(
    jobs.flatMap((job) => values(job.categories)),
    20
  );
  const skills = distinct(
    jobs.flatMap((job) => [
      ...values(job.criteria?.requiredSkills),
      ...values(job.skills),
    ]),
    16
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-foreground text-lg font-medium">Documents</h2>
          <p className="text-muted-foreground text-sm">
            Your newest CV is sent when you apply from your profile or use auto
            apply.
          </p>
        </div>
        <DocumentsPanel
          documents={documents.map(
            (doc): DocumentRow => ({
              createdAt: doc.createdAt,
              id: doc.id,
              kind: doc.kind,
              name: doc.name,
              size: doc.size ?? 0,
            })
          )}
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-foreground text-lg font-medium">Your profile</h2>
        <ProfileForm
          categories={categories}
          initial={{
            city: candidate.city ?? "",
            education: candidate.education ?? "",
            fullName: candidate.fullName ?? "",
            headline: candidate.headline ?? "",
            phone: candidate.phone ?? "",
            preferredCategories: values(candidate.preferredCategories),
            preferredLocations: values(candidate.preferredLocations),
            preferredTypes: candidate.preferredTypes ?? [],
            preferredWorkplaces: candidate.preferredWorkplaces ?? [],
            skills: values(candidate.skills),
            summary: candidate.summary ?? "",
            yearsExperience:
              candidate.yearsExperience === null ||
              candidate.yearsExperience === undefined
                ? ""
                : String(candidate.yearsExperience),
          }}
          skillSuggestions={skills}
        />
      </section>
    </div>
  );
}
