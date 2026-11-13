import { redirect } from "next/navigation";

import { ApplicationList } from "@/components/account/application-list";
import { getAccount } from "@/lib/auth/account";
import { listCandidateApplications } from "@/lib/etenesh/candidates";
import type { Application } from "@/payload-types";

export const metadata = { title: "My applications" };

export default async function AccountApplicationsPage() {
  const account = await getAccount();
  if (!account) {
    redirect("/signin?next=/account/applications");
  }
  const applications = await listCandidateApplications(
    account.payload,
    account.candidate.id,
    100
  );
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-lg font-medium">
          Track your applications
        </h2>
        <p className="text-muted-foreground text-sm">
          The status updates as the hiring team reviews your application.
        </p>
      </div>
      <ApplicationList applications={applications as Application[]} />
    </section>
  );
}
