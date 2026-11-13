// Shown the moment a job is tapped, while its page renders on the server.
// It mirrors the job page: header bar, letterhead, facts and description.
export function JobPageSkeleton() {
  const bar = "bg-surface-sub animate-pulse rounded";
  return (
    <div
      aria-busy="true"
      className="bg-background text-foreground flex min-h-screen flex-col"
      data-testid="job-page-skeleton"
    >
      <span className="sr-only" role="status">
        Loading job
      </span>
      <div className="bg-primary/15 fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
        <span className="bg-primary animate-link-pending absolute inset-y-0 w-1/3" />
      </div>
      <div className="border-line flex h-14 items-center gap-3 border-b px-4">
        <div className={`${bar} size-8 rounded-lg`} />
        <div className={`${bar} h-4 w-28`} />
      </div>
      <div className="max-w-board mx-auto w-full px-4 py-8">
        <div className={`${bar} mb-6 h-3 w-48`} />
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="md:bg-card md:ring-line flex flex-col gap-6 md:rounded-2xl md:px-12 md:pt-14 md:pb-12 md:ring-1">
            <div className="flex items-center gap-3">
              <div className={`${bar} size-11 rounded-lg`} />
              <div className="flex flex-col gap-2">
                <div className={`${bar} h-4 w-32`} />
                <div className={`${bar} h-3 w-44`} />
              </div>
            </div>
            <div className={`${bar} h-9 w-4/5`} />
            <div className={`${bar} h-4 w-36`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["a", "b", "c", "d"].map((key) => (
                <div className={`${bar} h-14 rounded-[10px]`} key={key} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {[
                "l1 w-full",
                "l2 w-11/12",
                "l3 w-4/5",
                "l4 w-full",
                "l5 w-3/4",
                "l6 w-5/6",
              ].map((line) => (
                <div className={`${bar} h-4 ${line}`} key={line} />
              ))}
            </div>
          </div>
          <div className="hidden flex-col gap-4 lg:flex">
            <div className={`${bar} h-40 rounded-[14px]`} />
            <div className={`${bar} h-28 rounded-[14px]`} />
          </div>
        </div>
      </div>
    </div>
  );
}
