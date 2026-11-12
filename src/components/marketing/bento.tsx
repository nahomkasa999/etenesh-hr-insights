import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";
import { TelegramChat } from "./etenesh-mocks";
import { SectionHeader } from "./section-header";
import { PhoneShot, Shot } from "./shots";

// Example numbers for the employer card: one job's applicants after the
// criteria check.
const EXAMPLE_APPLIED = 38;
const EXAMPLE_MATCHED = 12;

// The four cards' copy, shared by the phone list and the desktop bento.
const CARDS = {
  alerts: {
    description:
      "Search, read and apply from any phone. The Apply button is always in reach.",
    title: "Made for your phone",
  },
  brand: {
    description:
      "Salary, deadline and requirements up front, so you know before you apply.",
    title: "Clear, honest listings",
  },
  paid: {
    description:
      "Post one job or paste a whole list. Only applicants who meet your criteria reach you.",
    title: "Employers get the right people",
  },
  seo: {
    description:
      "Connect once. Each step of your application arrives as a message.",
    title: "Updates on Telegram",
  },
} as const;

const PHONE_ORDER = ["alerts", "brand", "seo", "paid"] as const;

function Card({
  children,
  className,
  description,
  inverse = false,
  title,
}: {
  children: ReactNode;
  className?: string;
  description: string;
  inverse?: boolean;
  title: string;
}) {
  return (
    <div
      className={cn(
        "text-foreground relative flex flex-col gap-1 overflow-hidden px-4 py-6 md:px-7",
        inverse ? "marketing-dark bg-(--inverse-card)" : "bg-card",
        className
      )}
    >
      <h3 className="text-[16px] leading-[22px] font-medium">{title}</h3>
      <p className="text-muted-foreground text-[13px] leading-[19px]">
        {description}
      </p>
      {children}
    </div>
  );
}

export function Bento() {
  return (
    <section
      aria-labelledby="marketing-bento-heading"
      className="border-line scroll-mt-14 border-b"
      id="employers"
    >
      <Container className="md:border-line pt-10 pb-5 md:border-b md:pt-16 md:pb-10">
        <SectionHeader
          eyebrow="Why Etenesh"
          id="marketing-bento-heading"
          phone="mono"
          title="Simple for job seekers."
          titleMuted="Simple for employers."
        />
      </Container>
      {/* Paper's phone home keeps the copy and drops the pictures. */}
      <ul className="flex flex-col gap-5 px-4 pb-10 md:hidden">
        {PHONE_ORDER.map((key) => (
          <li
            className="bg-card ring-line flex flex-col gap-1.5 rounded-[14px] p-[18px] ring-1 ring-inset"
            key={key}
          >
            <h3 className="text-foreground text-[15px] leading-[18px] font-medium">
              {CARDS[key].title}
            </h3>
            <p className="text-muted-foreground text-[13px] leading-[19px]">
              {CARDS[key].description}
            </p>
          </li>
        ))}
      </ul>
      <div className="bg-line hidden gap-px md:grid md:grid-cols-2">
        <Card className="h-[440px]" {...CARDS.alerts}>
          <div className="absolute top-[100px] left-[70px] flex items-start gap-[30px]">
            <PhoneShot
              alt="The board home on a phone"
              className="w-[190px]"
              name="mobileHome"
            />
            <PhoneShot
              alt="A job page on a phone"
              className="mt-8 w-[190px]"
              name="mobileJob"
            />
          </div>
        </Card>
        <Card className="h-[440px]" {...CARDS.brand}>
          <Shot
            alt="The board in the light theme"
            className="absolute top-[110px] left-4 h-[273px] w-[480px] rounded-lg shadow-[0_0_0_1px_var(--line),0_16px_32px_-12px_rgb(0_0_0/20%)] md:left-7 md:h-[319px] md:w-[560px]"
            name="boardLight"
          />
          <Shot
            alt="The board with a dark theme"
            className="absolute top-[200px] left-24 h-[273px] w-[480px] rounded-lg shadow-[0_0_0_1px_rgb(255_255_255/6%),0_24px_48px_-12px_rgb(0_0_0/45%)] md:left-[140px] md:h-[319px] md:w-[560px]"
            name="boardDark"
          />
        </Card>
        <Card className="min-h-[300px] pb-0" {...CARDS.seo}>
          <TelegramChat className="mt-[31px] w-full max-w-[420px] self-start" />
        </Card>
        <Card className="min-h-[300px]" inverse {...CARDS.paid}>
          <div className="mt-[31px] flex flex-col">
            <dl className="flex gap-2.5">
              <div className="flex flex-1 flex-col gap-1 rounded-[10px] p-3.5 ring-1 ring-(--kbd-on-outline) ring-inset">
                <dt className="text-muted-foreground text-[12px] leading-4">
                  Applied
                </dt>
                <dd className="text-[22px] leading-[26px] font-medium">
                  {EXAMPLE_APPLIED}
                </dd>
                <dd className="text-subtle text-[11px] leading-[14px]">
                  For one job
                </dd>
              </div>
              <div className="bg-primary text-primary-foreground flex flex-1 flex-col gap-1 rounded-[10px] p-3.5">
                <dt className="text-primary-foreground/65 text-[12px] leading-4">
                  Met your criteria
                </dt>
                <dd className="text-[22px] leading-[26px] font-medium">
                  {EXAMPLE_MATCHED}
                </dd>
                <dd className="text-primary-foreground/65 text-[11px] leading-[14px]">
                  Ready to review
                </dd>
              </div>
            </dl>
            <p
              aria-hidden="true"
              className="bg-primary text-primary-foreground mt-[18px] flex h-9 items-center justify-center rounded-lg text-[13px] leading-4 font-medium"
            >
              Review matched applicants &#8599;
            </p>
            <p className="text-subtle mt-3.5 font-mono text-[10px] leading-3">
              Example numbers.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
