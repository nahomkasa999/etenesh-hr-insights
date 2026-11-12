import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BoardShell } from "@/components/board/board-shell";
import { getCareerGuides } from "@/custom/etenesh/guides";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [guide] = await getCareerGuides((await params).slug);
  return guide
    ? { description: guide.summary, title: guide.title }
    : { title: "Career guide" };
}

export default async function GuidePage({ params }: Props) {
  const [guide] = await getCareerGuides((await params).slug);
  if (!guide) {
    notFound();
  }

  return (
    <BoardShell>
      <article className="bg-card mx-auto max-w-3xl rounded-2xl border px-6 py-8 md:px-12 md:py-12">
        <Link
          className="text-sm font-medium underline underline-offset-4"
          href="/blog"
        >
          Back to career guides
        </Link>
        <p className="text-muted-foreground mt-7 mb-2 text-sm font-semibold">
          {guide.topic}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {guide.title}
        </h1>
        <p className="text-muted-foreground mt-4 mb-8 text-lg leading-relaxed">
          {guide.summary}
        </p>
        <RichText
          className="space-y-4 leading-relaxed [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
          data={guide.body}
        />
        <Link
          className="bg-primary text-primary-foreground mt-8 inline-block rounded-lg px-4 py-2 text-sm font-semibold"
          href="/#latest-jobs"
        >
          Browse jobs
        </Link>
      </article>
    </BoardShell>
  );
}
