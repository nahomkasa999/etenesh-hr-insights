import type { JSX, ReactNode } from "react";

import {
  BoardSearchForm,
  searchHiddenFields,
} from "@/components/board/board-search-form";
import { SiteFooter } from "@/components/board/site-footer";
import { SiteHeader } from "@/components/board/site-header";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/skip-link";
import { bordfulConfig } from "@/config";
import { isMarketingEnabled } from "@/config/flags";
import { BOARD_HOME_PATH, getNav } from "@/config/nav";
import { customSlots } from "@/custom";
import { eteneshBrand } from "@/custom/etenesh/brand";
import { getLanguage } from "@/custom/etenesh/language-server";
import { buildTaxonomyArchivePath } from "@/lib/board/paths";
import { loadBoardPool } from "@/lib/board/pool";
import type { BoardQuery, BoardQueryOptions } from "@/lib/board/query";
import { getBordfeedConnectionPublic, getSiteSettings } from "@/lib/read";

export async function BoardShell({
  children,
  fullBleed = false,
  hidePostCta = false,
  search,
  showBoardControls = true,
}: {
  children: ReactNode;
  fullBleed?: boolean;
  // Post pages already are the post flow, so the footer band is redundant.
  hidePostCta?: boolean;
  // Board listings pass their query so a header search keeps the filters,
  // and the search shows as a row under the brand bar on phones.
  search?: { options: BoardQueryOptions; query: BoardQuery };
  showBoardControls?: boolean;
}): Promise<JSX.Element> {
  const [settings, connection, pool, language] = await Promise.all([
    getSiteSettings(),
    getBordfeedConnectionPublic(),
    loadBoardPool(),
    search ? getLanguage() : undefined,
  ]);
  const marketing = isMarketingEnabled();
  const logoUrl = settings.logoUrl ?? (marketing ? null : eteneshBrand.logo);
  const nav = getNav({
    alertsEnabled: settings.alerts.enabled,
    marketing,
    postJobEnabled: settings.postJob.enabled,
  });
  const HeaderSlot = customSlots.header;
  const FooterSlot = customSlots.footer;
  const { social } = bordfulConfig;
  const remoteCount = pool.filter(
    (card) => card.workplaceType === "remote"
  ).length;

  const listingSearch = !marketing && search !== undefined;
  const searchForm = (
    <BoardSearchForm
      count={pool.length}
      hidden={search ? searchHiddenFields(search.query, search.options) : []}
      language={language}
      q={search?.query.q ?? ""}
    />
  );

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SkipLink />
      {HeaderSlot ? (
        <HeaderSlot />
      ) : (
        <SiteHeader
          bordfulMark={marketing}
          cta={nav.cta}
          homeHref={marketing ? BOARD_HOME_PATH : "/"}
          logoUrl={logoUrl}
          name={settings.name}
          navItems={nav.header}
          search={!showBoardControls || listingSearch ? undefined : searchForm}
          searchHotkey={listingSearch}
          searchOnPhone={!listingSearch && search !== undefined}
          social={social}
          views={
            showBoardControls
              ? {
                  allCount: pool.length,
                  allHref: BOARD_HOME_PATH,
                  remoteCount,
                  remoteHref: buildTaxonomyArchivePath("location", "remote"),
                }
              : undefined
          }
        />
      )}
      <main className="flex-1" id={MAIN_CONTENT_ID}>
        {listingSearch ? (
          <div
            className="border-line border-b px-4 py-4 lg:px-6"
            id="latest-jobs"
          >
            <div className="max-w-xl">{searchForm}</div>
          </div>
        ) : null}
        {fullBleed ? (
          children
        ) : (
          <div className="max-w-board mx-auto w-full px-4 py-8">{children}</div>
        )}
      </main>
      {FooterSlot ? (
        <FooterSlot />
      ) : (
        <SiteFooter
          bordfulMark={marketing}
          columns={nav.footerColumns}
          durationDays={settings.postJob.durationDays}
          logoUrl={logoUrl}
          name={settings.name}
          priceLabel={settings.postJob.priceLabel}
          showAttribution={marketing && connection.showAttribution}
          showCta={settings.postJob.enabled && !hidePostCta}
          social={social}
          tagline={settings.tagline}
        />
      )}
    </div>
  );
}
