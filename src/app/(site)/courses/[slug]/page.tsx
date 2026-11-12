import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BoardShell } from "@/components/board/board-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CourseIntro } from "@/custom/etenesh/course-intro";
import { courses, courseTelegramLink } from "@/custom/etenesh/courses";
import { getTranslation } from "@/custom/etenesh/language-server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((entry) => entry.slug === slug);
  return course
    ? { description: course.description, title: course.title }
    : { title: "Course" };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = courses.find((entry) => entry.slug === slug);
  if (!course) {
    notFound();
  }

  const t = await getTranslation();

  return (
    <BoardShell>
      <article className="mx-auto grid max-w-5xl gap-7 px-2 pt-4 pb-12 md:px-6 md:pt-10">
        <Button asChild className="min-h-11 w-fit" variant="outline">
          <Link href="/courses">
            <ArrowLeft aria-hidden="true" /> {t("Back to courses")}
          </Link>
        </Button>
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <header>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {t(course.title)}
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {t(course.description)}
            </p>
            <p className="mt-4 text-sm leading-relaxed">{t(course.audience)}</p>
            <p className="mt-5 text-2xl font-semibold">ETB {course.price}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("Demo price")}
            </p>
            <Button asChild className="mt-3 min-h-11">
              <a
                href={courseTelegramLink(course.title)}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("Ask about enrollment")} <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </header>
          {"videoId" in course ? (
            <CourseIntro
              heading={t("Course introduction")}
              watchLabel={t("Watch on YouTube")}
            />
          ) : null}
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("Course outline")}
            </h2>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal divide-y pl-6">
              {course.lessons.map((lesson) => (
                <li className="py-4 pl-2" key={lesson.title}>
                  <h3 className="font-semibold">{t(lesson.title)}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {t(lesson.description)}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </article>
    </BoardShell>
  );
}
