import { PlayIcon, SendIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
    <Card
      aria-label="Example Telegram updates from the Etenesh bot"
      className={cn(FRAME, "w-[340px] gap-0 border-0 py-0", className)}
      role="img"
    >
      <CardHeader className="border-line flex items-center gap-2.5 border-b px-4 py-3 [.border-b]:pb-3">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-[13px] font-medium">
          E
        </span>
        <span className="flex flex-col">
          <span className="text-foreground text-[13px] leading-4 font-medium">
            Etenesh HR
          </span>
          <span className="text-subtle text-[11px] leading-[14px]">bot</span>
        </span>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="flex flex-col gap-2 bg-(--panel) px-3 py-4">
          {MESSAGES.map((message) => (
            <li key={message.text}>
              <Card className="max-w-[260px] gap-1 rounded-[12px] rounded-bl-[4px] px-3 py-2 shadow-none">
                <p className="text-foreground text-[12.5px] leading-[18px]">
                  {message.text}
                </p>
                <p className="text-subtle text-right text-[10px] leading-3">
                  {message.time}
                </p>
              </Card>
            </li>
          ))}
          <li className="self-end">
            <Badge className="bg-primary text-primary-foreground rounded-[12px] rounded-br-[4px] px-3 py-2 text-[12.5px] leading-[18px] font-normal">
              /status
            </Badge>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="border-line flex items-center justify-between border-t px-4 py-2.5 [.border-t]:pt-2.5">
        <span className="text-subtle text-[12px] leading-4">Message</span>
        <SendIcon aria-hidden="true" className="text-primary size-4" />
      </CardFooter>
    </Card>
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
    <Card className={cn(FRAME, "w-[260px] gap-0 border-0 py-0", className)}>
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
      <CardContent className="flex flex-col gap-1 px-4 pt-3.5">
        <p className="text-foreground text-[14px] leading-5 font-medium">
          {course.title}
        </p>
        <p className="text-muted-foreground text-[12px] leading-4">
          {course.lessons}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-4 pt-3 pb-4">
        <span className="text-foreground text-[16px] leading-5 font-medium">
          {course.price}
        </span>
        <Button asChild className="h-7 px-2.5 text-[12px]" size="sm">
          <span>Buy on Telegram</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
