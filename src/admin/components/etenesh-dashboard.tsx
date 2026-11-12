import {
  Briefcase,
  Building2,
  ClipboardList,
  FileJson,
  GraduationCap,
  Plus,
  Send,
} from "lucide-react";
import type { Payload } from "payload";

const ZONE = "Africa/Addis_Ababa";
const DAY_MS = 86_400_000;

function greeting(now: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      timeZone: ZONE,
    }).format(now)
  );
  if (hour < 12) {
    return "Good morning";
  }
  return hour < 18 ? "Good afternoon" : "Good evening";
}

const longDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: ZONE,
    weekday: "long",
    year: "numeric",
  }).format(date);

const shortDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: ZONE,
      }).format(new Date(value))
    : "No deadline";

function daysLeft(value: string | null | undefined, now: Date): string | null {
  if (!value) {
    return null;
  }
  const days = Math.ceil((new Date(value).getTime() - now.getTime()) / DAY_MS);
  if (days < 0) {
    return "Closed";
  }
  return days <= 1 ? "Closes today" : `${days} days left`;
}

interface Tile {
  hint: string;
  label: string;
  pending?: boolean;
  value: string;
}

interface Action {
  description: string;
  href?: string;
  icon: typeof Briefcase;
  title: string;
}

const ACTIONS: Action[] = [
  {
    description: "Fill in one simple form. It goes live on the board.",
    href: "/admin/collections/jobs/create",
    icon: Plus,
    title: "Post a job",
  },
  {
    description: "See every job, change one, or close it.",
    href: "/admin/collections/jobs",
    icon: Briefcase,
    title: "See all jobs",
  },
  {
    description: "Add an employer once, then pick it on each job.",
    href: "/admin/collections/companies/create",
    icon: Building2,
    title: "Add a company",
  },
];

const NEXT: Action[] = [
  {
    description: "Paste a list of jobs from Claude and post them all at once.",
    icon: FileJson,
    title: "Import jobs from a list",
  },
  {
    description: "See who applied, who meets the criteria, and move them on.",
    icon: ClipboardList,
    title: "Review applications",
  },
  {
    description: "Updates reach each applicant on Telegram automatically.",
    icon: Send,
    title: "Telegram updates",
  },
  {
    description: "Add a video, a thumbnail and a price. Sell on Telegram.",
    icon: GraduationCap,
    title: "Sell courses",
  },
];

export async function EteneshDashboard({ payload }: { payload: Payload }) {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * DAY_MS);
  const open = {
    _status: { equals: "published" },
    validThrough: { greater_than: now.toISOString() },
  };

  const [openJobs, closingSoon, companies, recent] = await Promise.all([
    payload.count({
      collection: "jobs",
      overrideAccess: true,
      where: open as never,
    }),
    payload.count({
      collection: "jobs",
      overrideAccess: true,
      where: {
        and: [open, { validThrough: { less_than: inAWeek.toISOString() } }],
      } as never,
    }),
    payload.count({ collection: "companies", overrideAccess: true }),
    payload.find({
      collection: "jobs",
      depth: 0,
      draft: true,
      limit: 8,
      overrideAccess: true,
      sort: "-updatedAt",
    }),
  ]);

  const tiles: Tile[] = [
    {
      hint: "On the board now",
      label: "Open jobs",
      value: String(openJobs.totalDocs),
    },
    {
      hint: "Deadline in 7 days",
      label: "Closing this week",
      value: String(closingSoon.totalDocs),
    },
    {
      hint: "Employers on the board",
      label: "Companies",
      value: String(companies.totalDocs),
    },
    {
      hint: "Arrives in the next step",
      label: "Applications",
      pending: true,
      value: "—",
    },
  ];

  return (
    <div className="et-dash">
      <header className="et-dash-head">
        <div>
          <p className="et-eyebrow">{longDate(now)}</p>
          <h1 className="et-title">
            {greeting(now)}.
            <span className="et-title-muted"> Welcome back.</span>
          </h1>
          <p className="et-lead">
            Here is what is happening on your job board.
          </p>
        </div>
        <div className="et-head-actions">
          <a
            className="et-btn et-btn-outline"
            href="/jobs"
            rel="noopener"
            target="_blank"
          >
            View job board ↗
          </a>
          <a
            className="et-btn et-btn-primary"
            href="/admin/collections/jobs/create"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={2} />
            Post a job
          </a>
        </div>
      </header>

      <ul className="et-tiles">
        {tiles.map((tile) => (
          <li
            className={tile.pending ? "et-tile et-tile-pending" : "et-tile"}
            key={tile.label}
          >
            <p className="et-tile-label">{tile.label}</p>
            <p className="et-tile-value">{tile.value}</p>
            <p className="et-tile-hint">{tile.hint}</p>
          </li>
        ))}
      </ul>

      <section className="et-section">
        <h2 className="et-h2">What would you like to do?</h2>
        <ul className="et-actions">
          {ACTIONS.map((action) => (
            <li key={action.title}>
              <a className="et-action" href={action.href}>
                <span className="et-action-icon">
                  <action.icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.75}
                  />
                </span>
                <span className="et-action-title">{action.title}</span>
                <span className="et-action-text">{action.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="et-section">
        <div className="et-section-head">
          <h2 className="et-h2">Recent jobs</h2>
          <a className="et-link" href="/admin/collections/jobs">
            See all jobs →
          </a>
        </div>
        <div className="et-table">
          <div className="et-row et-row-head">
            <span>Job</span>
            <span>Deadline</span>
            <span>Status</span>
          </div>
          {recent.docs.map((job) => {
            const left = daysLeft(job.validThrough, now);
            const published = job._status === "published";
            return (
              <a
                className="et-row"
                href={`/admin/collections/jobs/${job.id}`}
                key={job.id}
              >
                <span className="et-row-main">
                  <span className="et-row-title">{job.title}</span>
                  <span className="et-row-sub">{job.companyName}</span>
                </span>
                <span className="et-row-date">
                  {shortDate(job.validThrough)}
                  {left ? <span className="et-row-sub">{left}</span> : null}
                </span>
                <span>
                  <span
                    className={published ? "et-pill et-pill-live" : "et-pill"}
                  >
                    {published ? "Live" : "Draft"}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="et-section">
        <div className="et-section-head">
          <h2 className="et-h2">Coming in the next steps</h2>
        </div>
        <ul className="et-next">
          {NEXT.map((item) => (
            <li className="et-next-item" key={item.title}>
              <span className="et-action-icon et-action-icon-muted">
                <item.icon aria-hidden="true" size={18} strokeWidth={1.75} />
              </span>
              <span className="et-action-title">{item.title}</span>
              <span className="et-action-text">{item.description}</span>
              <span className="et-pill">Next step</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
