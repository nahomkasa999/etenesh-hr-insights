import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BoardShell } from "@/components/board/board-shell";
import { getCareerGuides } from "@/custom/etenesh/guides";

export const metadata: Metadata = { title: "Career guides" };

export default async function BlogPage() {
  const guides = await getCareerGuides();

  return (
    <BoardShell>
      <section className="mx-auto max-w-5xl px-2 pt-4 pb-12 md:px-6 md:pt-10">
        <div className="bg-primary text-primary-foreground mb-9 rounded-2xl px-6 py-9 md:px-10">
          <BookOpen aria-hidden="true" className="mb-4 size-7" />
          <h1 className="text-4xl font-semibold tracking-tight">
            Career guides
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed">
            Practical lessons on writing a CV, preparing for an interview, and
            getting your applications ready.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <Link
              className="group bg-card hover:border-primary focus-visible:outline-ring flex min-h-56 flex-col rounded-2xl border p-6 focus-visible:outline-2"
              href={`/blog/${guide.slug}`}
              key={guide.id}
            >
              <span className="bg-accent text-accent-foreground mb-4 w-fit rounded-full px-3 py-1 text-xs font-semibold">
                {guide.topic}
              </span>
              <h2 className="text-lg leading-tight font-semibold">
                {guide.title}
              </h2>
              <p className="text-muted-foreground mt-2 mb-4 text-sm leading-relaxed">
                {guide.summary}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold">
                Read guide <ArrowUpRight aria-hidden="true" size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </BoardShell>
  );
}
