import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BoardShell } from "@/components/board/board-shell";
import { CourseIntro } from "@/custom/etenesh/course-intro";
import { careerCourse } from "@/custom/etenesh/courses";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await params).slug === careerCourse.slug
    ? { description: careerCourse.description, title: careerCourse.title }
    : { title: "Course" };
}

export default async function CoursePage({ params }: Props) {
  if ((await params).slug !== careerCourse.slug) {
    notFound();
  }

  return (
    <BoardShell>
      <article className="mx-auto max-w-5xl px-2 pt-4 pb-12 md:px-6 md:pt-10">
        <Link
          className="text-sm font-medium underline underline-offset-4"
          href="/courses"
        >
          Back to courses
        </Link>
        <div className="my-7 grid gap-8 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Course preview
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {careerCourse.title}
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {careerCourse.description}
            </p>
            <p className="mt-4 text-sm leading-relaxed">
              {careerCourse.audience}
            </p>
          </div>
          <CourseIntro />
        </div>
        <section className="bg-card mt-8 rounded-2xl border p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">
            Course outline
          </h2>
          <ol className="divide-y">
            {careerCourse.lessons.map((lesson, index) => (
              <li className="flex gap-4 py-4" key={lesson.title}>
                <span
                  aria-hidden="true"
                  className="bg-accent text-accent-foreground grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {lesson.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </BoardShell>
  );
}
