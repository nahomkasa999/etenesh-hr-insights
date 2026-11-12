import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PracticeApplication } from "@/custom/etenesh/practice-application";
import { buildJobPath, isPublicJobSlug } from "@/lib/board/paths";
import { getJobBySlug } from "@/lib/read";

export const metadata: Metadata = { title: "Demo application" };

export default async function DemoApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string | string[] }>;
}) {
  const { job: slug } = await searchParams;
  if (slug === undefined) {
    return <PracticeApplication />;
  }
  if (typeof slug !== "string" || !isPublicJobSlug(slug)) {
    notFound();
  }

  const job = await getJobBySlug(slug);
  if (!job) {
    notFound();
  }

  return (
    <PracticeApplication
      job={{
        companyName: job.companyName,
        href: buildJobPath(job.slug),
        title: job.title,
      }}
    />
  );
}
