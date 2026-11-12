"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useCallback, useState } from "react";

import { careerCourse, courseIntroOrigin } from "./courses";

export function CourseIntro() {
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => setPlaying(true), []);

  return (
    <section aria-label="Course introduction">
      <div className="bg-accent relative aspect-video overflow-hidden rounded-2xl">
        {playing ? (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            src={`${courseIntroOrigin}/embed/${careerCourse.videoId}?autoplay=1&rel=0`}
            title="Etenesh HR Insights course introduction"
          />
        ) : (
          <button
            className="bg-accent text-accent-foreground hover:bg-accent/70 focus-visible:outline-ring flex h-full w-full flex-col items-center justify-center gap-4 px-5 text-center focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
            onClick={play}
            type="button"
          >
            <span className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-full">
              <Play aria-hidden="true" className="size-6 fill-current" />
            </span>
            <span className="text-sm font-semibold">
              Play course introduction
            </span>
          </button>
        )}
      </div>
      <a
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        href={`https://www.youtube.com/watch?v=${careerCourse.videoId}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        Watch on YouTube <ArrowUpRight aria-hidden="true" size={14} />
      </a>
    </section>
  );
}
