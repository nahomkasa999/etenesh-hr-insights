import { redirect } from "next/navigation";
import { BoardListing } from "@/components/board/board-listing";
import { BoardShell } from "@/components/board/board-shell";
import { isMarketingEnabled } from "@/config/flags";
import { getAccount } from "@/lib/auth/account";
import { jobsFilterHref } from "@/lib/board/links";
import { loadBoardPool } from "@/lib/board/pool";
import {
  type BoardSearchParams,
  boardQueryFromSearchParams,
} from "@/lib/board/query";
import { withTextMatches } from "@/lib/board/text-search";
import { buildBoardView } from "@/lib/board/view";
import { appliedJobIds, loadOpenJobs, rankJobs } from "@/lib/etenesh/recommend";
import { getSiteSettings } from "@/lib/read";

export async function BoardHome({
  hideFooter = false,
  searchParams = {},
}: {
  hideFooter?: boolean;
  searchParams?: BoardSearchParams;
}) {
  const [settings, cards] = await Promise.all([
    getSiteSettings(),
    loadBoardPool(),
  ]);
  const options = { defaultPerPage: settings.board.jobsPerPage };
  const parsed = boardQueryFromSearchParams(searchParams, options);
  const query = await withTextMatches(parsed);
  if (query.forMe) {
    const account = await getAccount();
    if (!account) {
      redirect(
        `/signin?next=${encodeURIComponent(jobsFilterHref(query, options))}`
      );
    }
    const { candidate, payload } = account;
    const [jobs, applied] = await Promise.all([
      loadOpenJobs(payload),
      appliedJobIds(payload, candidate),
    ]);
    const boardIds = new Set(cards.map((card) => card.id));
    query.forMeIds = rankJobs(
      candidate,
      jobs.filter((job) => boardIds.has(String(job.id))),
      { exclude: applied, limit: 40 }
    ).map(({ job }) => String(job.id));
  }
  if (query.page > 1 && buildBoardView(cards, query).outOfRange) {
    redirect(jobsFilterHref({ ...query, page: 1 }, options));
  }

  return (
    <BoardShell fullBleed hideFooter={hideFooter} search={{ options, query }}>
      <BoardListing
        alertsEnabled={settings.alerts.enabled}
        cards={cards}
        heading={settings.board.title}
        headingTestId="board-hero"
        intro={settings.board.description}
        layout="app"
        marketing={isMarketingEnabled()}
        options={options}
        postJob={settings.postJob.enabled ? settings.postJob : null}
        query={query}
      />
    </BoardShell>
  );
}
