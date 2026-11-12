import type { Metadata } from "next";
import { headers } from "next/headers";

import { MarketingHome } from "@/app/(marketing)/_components/marketing-home";
import { BoardShell } from "@/components/board/board-shell";
import { JsonLd } from "@/components/marketing/json-ld";
import { marketingHomeMetadata } from "@/components/marketing/metadata";
import { isMarketingEnabled } from "@/config/flags";
import { resolveServerUrl } from "@/config/server-url";
import { CareerHero } from "@/custom/etenesh/career-hero";
import { marketingHomeJsonLd } from "@/lib/seo/structured-data";

// The Etenesh homepage inherits the site metadata.
export async function generateMetadata(): Promise<Metadata> {
  await headers();

  return isMarketingEnabled() ? marketingHomeMetadata() : {};
}

export default async function HomePage() {
  if (isMarketingEnabled()) {
    const nonce = (await headers()).get("x-nonce") ?? undefined;

    return (
      <>
        <JsonLd data={marketingHomeJsonLd(resolveServerUrl())} nonce={nonce} />
        <MarketingHome />
      </>
    );
  }

  return (
    <BoardShell fullBleed showBoardControls={false}>
      <CareerHero />
    </BoardShell>
  );
}
