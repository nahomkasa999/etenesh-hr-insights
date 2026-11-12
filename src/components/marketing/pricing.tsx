import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Container } from "./container";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

// The home section shows a shorter card: Paper's own lines, three features
// and the deploy button on the free plan.
interface HomePlan {
  badge?: string;
  cta: string;
  description: string;
  features: readonly string[];
  href: string;
  unit: string;
}

interface Plan {
  cta: string;
  description: string;
  external: boolean;
  features: readonly string[];
  highlight?: boolean;
  home: HomePlan;
  href: string;
  name: string;
  price: string;
}

// Example courses until the course shop is built. Buying happens on
// Telegram and the Etenesh team checks each payment by hand.
const COURSE_URL = "/#courses";

const plans: readonly Plan[] = [
  {
    cta: "Buy on Telegram",
    description: "Six short videos on writing a CV employers read",
    external: false,
    features: [
      "6 short videos",
      "CV template included",
      "Watch on any phone",
      "Yours to keep",
    ],
    home: {
      badge: "Most popular",
      cta: "Buy on Telegram",
      description:
        "Six short videos on writing a CV that gets you called for interviews.",
      features: [
        "6 short videos",
        "CV template included",
        "Watch on any phone",
      ],
      href: COURSE_URL,
      unit: "ETB",
    },
    href: COURSE_URL,
    name: "Write a CV that gets read",
    price: "500",
  },
  {
    cta: "Buy on Telegram",
    description: "Practice the questions Ethiopian employers ask",
    external: false,
    features: [
      "8 short videos",
      "Common questions and answers",
      "Watch on any phone",
      "Yours to keep",
    ],
    highlight: true,
    home: {
      cta: "Buy on Telegram",
      description:
        "Practice the questions Ethiopian employers ask, and how to answer them.",
      features: [
        "8 short videos",
        "Common questions and answers",
        "Watch on any phone",
      ],
      href: COURSE_URL,
      unit: "ETB",
    },
    href: COURSE_URL,
    name: "Interview ready in one week",
    price: "750",
  },
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="text-foreground size-3.5 shrink-0"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  );
}

function PlanBody({ plan, primary }: { plan: Plan; primary: boolean }) {
  return (
    <>
      <h2 className="text-foreground text-[15px] leading-[18px] font-medium md:leading-[22px]">
        {plan.name}
      </h2>
      <p className="flex items-baseline gap-1.5">
        <span className="text-foreground text-[40px] leading-[48px] font-medium tracking-[-0.03em] md:leading-[46px]">
          {plan.price}
        </span>
      </p>
      <p className="text-muted-foreground text-[13px] leading-4 md:leading-[19px]">
        {plan.description}
      </p>
      <ul className="flex flex-col gap-2 md:py-3">
        {plan.features.map((feature) => (
          <li
            className="text-muted-foreground flex items-center gap-2 text-[14px] leading-[18px] md:text-[13px] md:leading-[19px]"
            key={feature}
          >
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        asChild
        className={cn(
          "h-11 w-full px-4 text-[15px] leading-[18px] md:h-9 md:w-auto md:self-start md:text-[13px] md:leading-[1.5]",
          !primary && "shadow-xs"
        )}
        variant={primary ? "default" : "outline"}
      >
        <a
          href={plan.href}
          rel={plan.external ? "noopener noreferrer" : undefined}
          target={plan.external ? "_blank" : undefined}
        >
          {plan.cta}
        </a>
      </Button>
    </>
  );
}

function HomePlanBody({ plan, primary }: { plan: Plan; primary: boolean }) {
  const { home } = plan;

  // Paper's phone card drops the badge and draws the check icons; from md
  // up it is the flush cell with the badge and plain check marks.
  return (
    <>
      <div className="flex items-center justify-between md:h-5">
        <h3 className="text-foreground text-[15px] leading-[18px] font-medium md:leading-5">
          {plan.name}
        </h3>
        {home.badge ? (
          <span className="bg-primary text-primary-foreground hidden h-5 items-center rounded-md px-[7px] text-[11px] leading-[14px] font-medium md:flex">
            {home.badge}
          </span>
        ) : null}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="text-foreground text-[40px] leading-[48px] font-medium tracking-[-0.03em] md:leading-[44px] md:tracking-[-0.035em]">
          {plan.price}
        </span>
        <span className="text-subtle text-[13px] leading-[18px]">
          {home.unit}
        </span>
      </p>
      <p className="text-muted-foreground text-[13px] leading-4 md:leading-5">
        {home.description}
      </p>
      <ul className="flex flex-col gap-2 md:gap-0.5">
        {home.features.map((feature) => (
          <li
            className="text-muted-foreground flex items-center gap-2 text-[14px] leading-[18px] md:items-start md:text-[13px] md:leading-5"
            key={feature}
          >
            <span className="md:hidden">
              <CheckIcon />
            </span>
            <span aria-hidden="true" className="text-subtle hidden md:inline">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        asChild
        className={cn(
          "h-11 w-full gap-[7px] px-3.5 text-[15px] leading-[18px] md:h-[34px] md:w-auto md:self-start md:text-[13px] md:leading-[1.5]",
          !primary && "shadow-xs"
        )}
        variant={primary ? "default" : "outline"}
      >
        <a href={home.href}>{home.cta}</a>
      </Button>
    </>
  );
}

// Standalone pricing page: two cards side by side, the paid plan outlined.
function PricingCards() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid w-full max-w-[856px] gap-3 md:grid-cols-2 md:gap-4">
        {plans.map((plan) => (
          <div
            className={cn(
              "bg-card flex flex-col gap-3.5 rounded-[14px] p-[22px] md:gap-2.5 md:rounded-xl md:p-7",
              plan.highlight
                ? "ring-foreground ring-1"
                : "ring-1 ring-(--shot-ring)"
            )}
            key={plan.name}
          >
            <PlanBody plan={plan} primary={Boolean(plan.highlight)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Pricing({
  variant = "section",
}: {
  variant?: "section" | "standalone";
}) {
  if (variant === "standalone") {
    return <PricingCards />;
  }

  // Home section: two flush cells, the free plan on the raised surface. On
  // a phone Paper stacks them as rounded cards, the free plan outlined.
  return (
    <Section id="courses" padding="flush">
      <Container className="border-line pt-10 pb-5 md:border-b md:pt-16 md:pb-10">
        <SectionHeader
          eyebrow="Courses"
          phone="mono"
          title="Learn what employers want."
          titleMuted="Pay on Telegram."
        />
      </Container>
      <div className="grid gap-5 px-4 md:grid-cols-2 md:gap-0 md:px-0">
        {plans.map((plan, index) => (
          <div
            className={cn(
              "border-line bg-card flex flex-col gap-3.5 rounded-[14px] p-[22px] ring-1 md:gap-4 md:rounded-none md:px-10 md:py-9 md:ring-0",
              index === 0
                ? "ring-foreground md:border-r"
                : "ring-line md:bg-transparent"
            )}
            key={plan.name}
          >
            <HomePlanBody plan={plan} primary={index === 0} />
          </div>
        ))}
      </div>
      <Container className="border-line pt-5 pb-10 md:border-t md:py-3.5">
        <p className="text-subtle text-[11px] leading-[14px]">
          Pay on Telegram. Our team checks your payment and sends your course
          link the same day.
        </p>
      </Container>
    </Section>
  );
}
