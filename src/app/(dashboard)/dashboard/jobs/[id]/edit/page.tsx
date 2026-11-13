import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EMPTY_JOB, JobForm } from "@/components/dashboard/job-form";
import { SiteHeader } from "@/components/dashboard/site-header";
import { getJob, requireStaff } from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Edit job" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { payload } = await requireStaff(`/dashboard/jobs/${id}/edit`);
  const job = await getJob(payload, id);
  if (!job) {
    notFound();
  }
  const criteria = job.criteria;
  return (
    <>
      <SiteHeader title={`Edit ${job.title}`} />
      <JobForm
        companies={[]}
        editId={Number(job.id)}
        initial={{
          ...EMPTY_JOB,
          deadline: job.validThrough ? job.validThrough.slice(0, 10) : "",
          education: criteria?.education ?? "None",
          minYearsExperience: String(criteria?.minYearsExperience ?? 0),
          published: job._status === "published",
          requiredSkills: (criteria?.requiredSkills ?? [])
            .map((row) => row.value)
            .join(", "),
          screeningQuestions: (criteria?.screeningQuestions ?? [])
            .map((row) => row.question)
            .join("\n"),
          summary: job.summary ?? "",
          title: job.title,
        }}
      />
    </>
  );
}
