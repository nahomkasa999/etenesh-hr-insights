"use client";

import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { COURSES, CourseCard, TelegramChat } from "./etenesh-mocks";
import { PhoneShot, ThemedBoardShot, ThemedShot } from "./shots";

interface Step {
  description: string;
  id: string;
  label: string;
  shot: ReactNode;
}

// Paper's desktop panel: an 800x500 shot pinned 40px in from the top left and
// cropped by the panel edge.
const PANEL_SHOT =
  "absolute top-6 left-6 w-[640px] md:top-10 md:left-10 md:w-[800px]";

// What a job seeker does on Etenesh, one tab per step.
const STEPS: readonly Step[] = [
  {
    description:
      "Search by title or company, then filter by city, job type and level.",
    id: "browse",
    label: "Browse and filter",
    shot: (
      <ThemedBoardShot
        alt="The board home with search, filter chips and the job list"
        className={PANEL_SHOT}
      />
    ),
  },
  {
    description:
      "Each job has its own page with the salary, deadline and requirements. On a phone, Apply stays pinned.",
    id: "read",
    label: "Read a role",
    shot: (
      <ThemedShot
        alt="A job page with salary, type, level and location above the description"
        className={PANEL_SHOT}
        name="jobLight"
      />
    ),
  },
  {
    description:
      "Fill in your details, upload your CV and answer a few questions. You get a reference number right away.",
    id: "apply",
    label: "Apply in minutes",
    shot: (
      <div className="absolute top-6 left-6 flex items-start gap-6 md:top-10 md:left-16 md:gap-8">
        <PhoneShot
          alt="The board home on a phone"
          className="w-[180px] md:w-[220px]"
          name="mobileHome"
        />
        <PhoneShot
          alt="A job page on a phone with the Apply bar pinned"
          className="mt-8 w-[180px] md:w-[220px]"
          name="mobileJob"
        />
      </div>
    ),
  },
  {
    description:
      "Connect to the Etenesh bot once. Every change to your application arrives as a Telegram message.",
    id: "telegram",
    label: "Follow on Telegram",
    shot: (
      <TelegramChat className="absolute top-6 left-6 md:top-10 md:left-16" />
    ),
  },
  {
    description:
      "Short video courses on CVs and interviews. Pay on Telegram and get your link the same day.",
    id: "courses",
    label: "Learn with a course",
    shot: (
      <div className="absolute top-6 left-6 flex items-start gap-6 md:top-10 md:left-16">
        {COURSES.map((course, index) => (
          <CourseCard
            className={index === 1 ? "mt-8" : undefined}
            course={course}
            key={course.title}
          />
        ))}
      </div>
    ),
  },
];

function indexOf(event: { currentTarget: HTMLButtonElement }): number {
  return Number(event.currentTarget.dataset.index);
}

// Arrow keys move through the tabs and wrap; Home and End jump to the ends.
function targetIndex(key: string, index: number): number | null {
  const moves: Record<string, number> = {
    ArrowDown: index + 1,
    ArrowLeft: index - 1,
    ArrowRight: index + 1,
    ArrowUp: index - 1,
    End: STEPS.length - 1,
    Home: 0,
  };
  const target = moves[key];
  if (target === undefined) {
    return null;
  }

  return (target + STEPS.length) % STEPS.length;
}

export function Walkthrough() {
  const baseId = useId();
  const [active, setActive] = useState(1);

  const tabId = (step: Step) => `${baseId}-tab-${step.id}`;
  const panelId = (step: Step) => `${baseId}-panel-${step.id}`;

  const onClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setActive(indexOf(event));
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const next = targetIndex(event.key, indexOf(event));
    if (next === null) {
      return;
    }

    event.preventDefault();
    setActive(next);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }, []);

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className="border-line hidden scroll-mt-14 border-b md:block"
      id="product"
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col gap-5 px-4 pt-10 pb-6 md:w-[300px] md:shrink-0 md:py-12 md:pr-8 md:pl-10">
          <p className="bg-tag text-muted-foreground flex h-5 items-center self-start rounded-sm px-[7px] text-[11px] leading-[14px] font-medium">
            For job seekers
          </p>
          <h2
            className="text-foreground text-[22px] leading-7 font-medium tracking-[-0.02em]"
            id={`${baseId}-heading`}
          >
            Built for the people applying
          </h2>
          <div
            aria-labelledby={`${baseId}-heading`}
            aria-orientation="vertical"
            className="flex flex-col"
            role="tablist"
          >
            {STEPS.map((step, index) => {
              const selected = index === active;

              return (
                <button
                  aria-controls={panelId(step)}
                  aria-describedby={
                    selected ? `${tabId(step)}-desc` : undefined
                  }
                  aria-labelledby={`${tabId(step)}-label`}
                  aria-selected={selected}
                  className={cn(
                    "group focus-visible:ring-ring relative flex flex-col gap-1.5 rounded-sm pl-4 text-left outline-none focus-visible:ring-2",
                    selected ? "pt-2.5 pb-3" : "py-2"
                  )}
                  data-index={index}
                  id={tabId(step)}
                  key={step.id}
                  onClick={onClick}
                  onKeyDown={onKeyDown}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                >
                  <span
                    className={cn(
                      "text-[14px] leading-5 font-medium",
                      selected
                        ? "text-foreground"
                        : "group-hover:text-muted-foreground text-subtle"
                    )}
                    id={`${tabId(step)}-label`}
                  >
                    {step.label}
                  </span>
                  {selected ? (
                    <>
                      <span
                        className="text-muted-foreground text-[13px] leading-[19px]"
                        id={`${tabId(step)}-desc`}
                      >
                        {step.description}
                      </span>
                      <span
                        aria-hidden="true"
                        className="bg-foreground absolute top-2.5 bottom-3 left-0 w-0.5"
                      />
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        {STEPS.map((step, index) => (
          <div
            aria-labelledby={tabId(step)}
            className="border-line relative h-[320px] flex-1 overflow-hidden border-t bg-(--panel) sm:h-[400px] md:h-[460px] md:border-t-0 md:border-l"
            hidden={index !== active}
            id={panelId(step)}
            key={step.id}
            role="tabpanel"
          >
            {step.shot}
          </div>
        ))}
      </div>
    </section>
  );
}
