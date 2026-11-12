"use client";

import { Bookmark } from "lucide-react";
import { useCallback } from "react";

import { useJobList } from "@/components/board/saved-jobs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RowSaveButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const saved = useJobList("saved");
  const on = saved.has(slug);
  const { toggle } = saved;
  const onClick = useCallback(() => toggle(slug), [slug, toggle]);

  return (
    <Button
      aria-label={on ? `Remove ${title} from saved jobs` : `Save ${title}`}
      aria-pressed={on}
      className="relative z-10 size-11"
      data-testid="job-row-save"
      onClick={onClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Bookmark
        aria-hidden="true"
        className={cn("size-5", on && "fill-current")}
      />
    </Button>
  );
}
