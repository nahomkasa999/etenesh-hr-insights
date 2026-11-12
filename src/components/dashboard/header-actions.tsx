import { IconExternalLink, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export function HeaderActions() {
  return (
    <>
      <Button asChild className="hidden h-9 sm:flex" variant="outline">
        <a href="/jobs" rel="noopener" target="_blank">
          <IconExternalLink />
          View job board
        </a>
      </Button>
      <Button asChild className="h-9">
        <a href="/admin/collections/jobs/create">
          <IconPlus />
          Post a job
        </a>
      </Button>
    </>
  );
}
