import type { Metadata } from "next";
import { headers } from "next/headers";

import { BoardHome } from "@/components/board/board-home";
import { BoardShell } from "@/components/board/board-shell";
import { TaxonomyIndex } from "@/components/board/taxonomy-index";
import { MARKETING_DESCRIPTION } from "@/components/marketing/site";
import { isMarketingEnabled } from "@/config/flags";
import { resolveServerUrl } from "@/config/server-url";
import type { BoardSearchParams } from "@/lib/board/query";
import { jobsIndexMetadata } from "@/lib/seo/jobs-index";

export async function generateMetadata(): Promise<Metadata> {
  await headers();
  const marketing = isMarketingEnabled();

  return jobsIndexMetadata({
    description: marketing ? MARKETING_DESCRIPTION : "Browse open roles.",
    marketing,
    siteUrl: resolveServerUrl(),
  });
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<BoardSearchParams>;
}) {
  const params = await searchParams;
  if (isMarketingEnabled() || params.for_me === "true") {
    return <BoardHome hideFooter searchParams={params} />;
  }

  return (
    <BoardShell hideFooter>
      <TaxonomyIndex kind="location" />
    </BoardShell>
  );
}
