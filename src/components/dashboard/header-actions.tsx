import { IconExternalLink, IconPlus } from "@tabler/icons-react";

import { JobImportDialog } from "@/components/dashboard/job-import-dialog";
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
      <JobImportDialog />
      <Button asChild className="h-9">
        <a href="/dashboard/jobs/new">
          <IconPlus />
          Post a job
        </a>
      </Button>
    </>
  );
}
