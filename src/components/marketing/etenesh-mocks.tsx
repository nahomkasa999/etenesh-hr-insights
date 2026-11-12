import { PlayIcon, SendIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Drawn previews of the Telegram updates and the course shop. They sit where
// the template shows screenshots, in the same hairline-and-shadow frame.

const FRAME =
  "bg-card overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--shot-ring),0_30px_60px_-24px_var(--shot-shadow)]";

const MESSAGES = [
  {
    text: "Application received for Junior Accountant at Abay Agro Processing. Your reference is ET-2026-0042.",
    time: "09:14",
  },
  { text: "Your application is now under review.", time: "Mon 11:02" },
  {
    text: "Good news! You have been shortlisted for an interview.",
    time: "Wed 16:40",
  },
  {
    text: "Interview: Tuesday 2 December, 10:00, Bole office. Reply /status any time.",
    time: "Wed 16:41",
  },
] as const;

export function TelegramChat({ className }: { className?: string }) {
  return (
    <div
      aria-label="Example Telegram updates from the Etenesh bot"
      className={cn(FRAME, "flex w-[340px] flex-col", className)}
      role="img"
    >
      <div className="border-line flex items-center gap-2.5 border-b px-4 py-3">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-[13px] font-medium">
          E
        </span>
        <span className="flex flex-col">
          <span className="text-foreground text-[13px] leading-4 font-medium">
            Etenesh HR
          </span>
          <span className="text-subtle text-[11px] leading-[14px]">bot</span>
        </span>
      </div>
      <ul className="flex flex-col gap-2 bg-(--panel) px-3 py-4">
        {MESSAGES.map((message) => (
          <li
            className="bg-card ring-line max-w-[260px] rounded-[12px] rounded-bl-[4px] px-3 py-2 ring-1 ring-inset"
            key={message.text}
          >
            <p className="text-foreground text-[12.5px] leading-[18px]">
              {message.text}
            </p>
            <p className="text-subtle mt-1 text-right text-[10px] leading-3">
              {message.time}
            </p>
          </li>
        ))}
        <li className="bg-primary text-primary-foreground self-end rounded-[12px] rounded-br-[4px] px-3 py-2 text-[12.5px] leading-[18px]">
          /status
        </li>
      </ul>
      <div className="border-line flex items-center justify-between border-t px-4 py-2.5">
        <span className="text-subtle text-[12px] leading-4">Message</span>
        <SendIcon aria-hidden="true" className="text-primary size-4" />
      </div>
    </div>
  );
}

export interface CourseCardData {
  lessons: string;
  price: string;
  title: string;
  tone: string;
}

export const COURSES: readonly CourseCardData[] = [
  {
    lessons: "6 short videos",
    price: "500 ETB",
    title: "Write a CV that gets read",
    tone: "from-[#0077e6] to-[#00b4f0]",
  },
  {
    lessons: "8 short videos",
    price: "750 ETB",
    title: "Interview ready in one week",
    tone: "from-[#248f24] to-[#56d117]",
  },
] as const;

export function CourseCard({
  className,
  course,
}: {
  className?: string;
  course: CourseCardData;
}) {
  return (
    <div className={cn(FRAME, "flex w-[260px] flex-col", className)}>
      <div
        className={cn(
          "relative flex h-[140px] items-center justify-center bg-gradient-to-br",
          course.tone
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-white/90">
          <PlayIcon aria-hidden="true" className="size-4 text-black" />
        </span>
      </div>
      <div className="flex flex-col gap-1 px-4 pt-3.5 pb-4">
        <p className="text-foreground text-[14px] leading-5 font-medium">
          {course.title}
        </p>
        <p className="text-muted-foreground text-[12px] leading-4">
          {course.lessons}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-foreground text-[16px] leading-5 font-medium">
            {course.price}
          </span>
          <span className="bg-primary text-primary-foreground rounded-md px-2.5 py-1.5 text-[12px] leading-4 font-medium">
            Buy on Telegram
          </span>
        </div>
      </div>
    </div>
  );
}
