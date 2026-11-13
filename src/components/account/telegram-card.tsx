import { Send } from "lucide-react";

// Connect the Etenesh bot: /status on demand, and a message on every
// status change.
export function TelegramCard({
  connected,
  link,
}: {
  connected: boolean;
  link: string | null;
}) {
  if (!(connected || link)) {
    return null;
  }
  return (
    <section
      className="bg-card ring-line flex flex-col gap-3 rounded-xl p-4 ring-1 ring-inset sm:flex-row sm:items-center sm:justify-between"
      data-testid="telegram-card"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
          <Send aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-foreground text-[15px] font-medium">
            {connected ? "Telegram updates are on" : "Get updates on Telegram"}
          </p>
          <p className="text-muted-foreground text-[13px] leading-5">
            {connected
              ? "We message you when an application changes. Send /status to the bot any time."
              : "Connect the Etenesh bot to get a message when your status changes, and ask /status any time."}
          </p>
        </div>
      </div>
      {link ? (
        <a
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-sky-500 px-4 text-sm font-medium text-white hover:bg-sky-600"
          href={link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {connected ? "Open bot" : "Connect Telegram"}
        </a>
      ) : null}
    </section>
  );
}
