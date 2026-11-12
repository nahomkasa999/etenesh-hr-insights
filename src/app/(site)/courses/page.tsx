import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BoardShell } from "@/components/board/board-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CourseIntro } from "@/custom/etenesh/course-intro";
import { courses, courseTelegramLink } from "@/custom/etenesh/courses";
import { getTranslation } from "@/custom/etenesh/language-server";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const t = await getTranslation();
  return (
    <BoardShell>
      <section className="mx-auto grid max-w-5xl gap-8 px-2 pt-4 pb-12 md:px-6 md:pt-10">
        <header>
          <h1 className="text-4xl font-semibold tracking-tight">
            {t("Courses")}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-relaxed">
            {t(
              "Get step-by-step help with your job search, CV, and interviews."
            )}
          </p>
        </header>
        <div className="max-w-3xl">
          <h2 className="mb-3 text-xl font-semibold">
            {t("Watch the introduction")}
          </h2>
          <CourseIntro
            heading={t("Course introduction")}
            watchLabel={t("Watch on YouTube")}
          />
        </div>
        <section>
          <h2 className="mb-1 text-2xl font-semibold tracking-tight">
            {t("Courses and pricing")}
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {t(
              "Demo prices. Contact Etenesh on Telegram for enrollment details."
            )}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.slug}>
                <CardHeader>
                  <GraduationCap
                    aria-hidden="true"
                    className="text-accent-foreground mb-2 size-7"
                  />
                  <h3 className="text-lg font-semibold">{t(course.title)}</h3>
                  <p className="text-xl font-semibold">ETB {course.price}</p>
                  <CardDescription className="text-sm leading-relaxed">
                    {t(course.description)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto flex-wrap gap-2">
                  <Button asChild className="min-h-11">
                    <Link href={`/courses/${course.slug}`}>
                      {t("Preview course")}
                    </Link>
                  </Button>
                  <Button asChild className="min-h-11" variant="outline">
                    <a
                      href={courseTelegramLink(course.title)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Telegram <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </BoardShell>
  );
}
