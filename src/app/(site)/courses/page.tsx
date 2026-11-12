import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BoardShell } from "@/components/board/board-shell";
import { careerCourse, careerCoursePath } from "@/custom/etenesh/courses";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <BoardShell>
      <section className="mx-auto max-w-5xl px-2 pt-4 pb-12 md:px-6 md:pt-10">
        <h1 className="text-4xl font-semibold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-3 mb-8 max-w-2xl text-base leading-relaxed">
          Learn how to find roles that fit, prepare your documents, and show
          what you can do in an interview.
        </p>
        <article className="bg-card grid overflow-hidden rounded-2xl border md:grid-cols-[1fr_1.4fr]">
          <div className="grid min-h-44 place-items-center bg-[#102743] bg-[radial-gradient(ellipse_at_bottom_right,#126a62,transparent_75%)] p-8 text-[#b7ebcf]">
            <GraduationCap
              aria-hidden="true"
              className="size-24 stroke-[1.15]"
            />
          </div>
          <div className="flex flex-col justify-center p-7 md:p-10">
            <p className="text-muted-foreground mb-3 text-sm font-medium">
              Course preview
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {careerCourse.title}
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {careerCourse.description}
            </p>
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
              href={careerCoursePath}
            >
              Preview course <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </article>
      </section>
    </BoardShell>
  );
}
