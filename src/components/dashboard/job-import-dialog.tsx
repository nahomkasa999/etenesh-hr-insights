"use client";

import { IconCheck, IconCopy, IconFileImport } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { importJobsFromJson } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { JOB_IMPORT_PROMPT } from "@/lib/etenesh/job-import-prompt";

// Step 1 copies the prompt. Step 2 takes the AI's JSON reply and posts the
// jobs.
export function JobImportDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [json, setJson] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(JOB_IMPORT_PROMPT);
      setCopied(true);
    } catch {
      toast.error("Could not copy. Select the text and copy it yourself.");
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setCopied(false);
      copyPrompt();
    }
  }

  function create() {
    setError("");
    startTransition(async () => {
      const result = await importJobsFromJson(json);
      if (result.ok) {
        toast.success(`${result.created} job(s) posted`);
        setOpen(false);
        setJson("");
        router.push("/dashboard/jobs");
        router.refresh();
      } else {
        setError(result.error ?? "Could not post the jobs.");
      }
    });
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button className="h-9" variant="outline">
          <IconFileImport />
          Load JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post jobs from JSON</DialogTitle>
          <DialogDescription className="text-[15px]">
            Let an AI do the typing in two steps.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-[15px] font-medium">
            1. The prompt is copied. Paste it into ChatGPT, then paste your job
            text under it.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button className="h-9" onClick={copyPrompt} variant="outline">
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? "Copied" : "Copy prompt"}
            </Button>
            <Button asChild className="h-9" variant="outline">
              <a href="https://chatgpt.com" rel="noopener" target="_blank">
                Open chatgpt.com
              </a>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[15px] font-medium">
            2. Paste the AI's reply here.
          </p>
          <Textarea
            className="min-h-56 font-mono text-sm"
            onChange={(event) => setJson(event.target.value)}
            placeholder='{ "jobs": [ … ] }'
            value={json}
          />
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            className="h-11 self-end px-6 text-[15px]"
            disabled={pending || json.trim() === ""}
            onClick={create}
          >
            Create jobs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
