import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

// "short" is the tighter wording the home section uses.
export const questions: {
  answer: ReactNode;
  question: string;
  short?: string;
  // Plain text for FAQPage JSON-LD when `answer` is not a string.
  text?: string;
}[] = [
  {
    answer:
      "An Ethiopian job board and HR service. Browse real vacancies, apply with your CV and follow your application on Telegram.",
    question: "What is Etenesh HR Insights?",
    short: "What is Etenesh HR?",
  },
  {
    answer:
      "Yes. Applying for jobs is always free. You only pay if you choose to buy a course.",
    question: "Is it free to apply?",
  },
  {
    answer:
      "After you apply, tap Get updates on Telegram. Our bot sends you a message each time your application moves forward. Send /status to see where it is.",
    question: "How do I follow my application?",
  },
  {
    answer:
      "Each employer sets minimum requirements, like years of experience or a degree. If you do not meet them, we tell you before you start, so you do not waste your time.",
    question: "Why can I not apply for some jobs?",
    short: "Why can I not apply for a job?",
  },
  {
    answer:
      "Tap Buy on Telegram, pay the price shown and send us the payment screenshot. Our team checks it and sends your course link the same day.",
    question: "How do I pay for a course?",
  },
];

export function faqPlainAnswers(): { answer: string; question: string }[] {
  return questions.map((item) => ({
    answer: item.text ?? (typeof item.answer === "string" ? item.answer : ""),
    question: item.question,
  }));
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      className="text-subtle size-3.5 shrink-0 transition-transform group-open:rotate-180"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  );
}

// Paper's phone home uses a 16px chevron. The +/− marker is desktop only.
function PhoneChevron() {
  return (
    <svg
      aria-hidden="true"
      className="text-subtle size-4 shrink-0 transition-transform group-open:rotate-180 md:hidden"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function PlusMinus() {
  return (
    <span
      aria-hidden="true"
      className="text-subtle hidden text-[15px] leading-[18px] md:inline"
    >
      <span className="group-open:hidden">+</span>
      <span className="hidden group-open:inline">−</span>
    </span>
  );
}

function QuestionList({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("border-line w-full border-b", className)}>
      {questions.map((item, index) => (
        <details
          className={cn(
            "group border-line border-t",
            compact ? "py-4" : "py-4 md:py-[18px]"
          )}
          key={item.question}
          open={index === 0}
        >
          <summary
            className={cn(
              "text-foreground flex cursor-pointer items-center justify-between gap-4 rounded-sm text-[15px] leading-[18px] font-medium",
              compact ? "md:text-[14px] md:leading-5" : "md:leading-[22px]"
            )}
          >
            {compact ? (item.short ?? item.question) : item.question}
            {compact ? (
              <>
                <PhoneChevron />
                <PlusMinus />
              </>
            ) : (
              <Chevron />
            )}
          </summary>
          <p
            className={cn(
              "text-muted-foreground text-[14px] leading-[21px]",
              compact
                ? "max-w-[560px] pt-2 md:text-[13px] md:leading-5"
                : "max-w-[600px] pt-2 md:leading-[22px]"
            )}
          >
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

// "section" is the home layout: heading on the left, questions on the right.
// "page" stacks a centered heading over the list, as on the pricing page.
export function Faq({ variant = "section" }: { variant?: "section" | "page" }) {
  if (variant === "page") {
    return (
      <Section className="md:py-[72px]" id="faq">
        <Container className="flex flex-col gap-6 md:items-center md:gap-8">
          <SectionHeader
            className="gap-2.5 md:items-center md:text-center md:[&>h2]:text-[28px] md:[&>h2]:leading-[34px] md:[&>h2]:tracking-[-0.03em] [&>p]:hidden md:[&>p]:block md:[&>p]:text-[15px] md:[&>p]:leading-[23px]"
            description="Everything you need to know before you start."
            title="Frequently asked"
            titleMuted="questions."
          />
          <QuestionList className="md:max-w-[720px]" />
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-12">
        <SectionHeader
          className="md:w-[320px]"
          eyebrow="FAQ"
          phone="mono"
          title="Questions."
          titleMuted="Short answers."
        />
        <QuestionList className="md:max-w-[620px]" compact />
      </Container>
    </Section>
  );
}
