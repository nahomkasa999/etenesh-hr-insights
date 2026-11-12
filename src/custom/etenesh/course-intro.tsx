import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { careerCourse, courseIntroOrigin } from "./courses";

export function CourseIntro({
  heading = "Course introduction",
  watchLabel = "Watch on YouTube",
}: {
  heading?: string;
  watchLabel?: string;
}) {
  return (
    <section aria-label={heading}>
      <iframe
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
        className="bg-muted aspect-video w-full rounded-xl border"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        src={`${courseIntroOrigin}/embed/${careerCourse.videoId}?rel=0`}
        title={heading}
      />
      <Button asChild className="mt-2 min-h-11" variant="outline">
        <a
          href={`https://www.youtube.com/watch?v=${careerCourse.videoId}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {watchLabel} <ArrowUpRight aria-hidden="true" />
        </a>
      </Button>
    </section>
  );
}
