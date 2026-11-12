"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useState } from "react";

export function PracticeApplication({
  job,
}: {
  job?: { title: string; companyName: string; href: string };
}) {
  const [complete, setComplete] = useState(false);
  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComplete(true);
  }, []);

  return (
    <main className="bg-background text-foreground min-h-screen px-5 py-12">
      <div className="bg-card mx-auto max-w-lg rounded-2xl border p-7 md:p-10">
        <Link
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4"
          href={job?.href ?? "/jobs"}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {job ? "Back to job" : "Back to jobs"}
        </Link>
        <p className="text-muted-foreground mt-7 text-sm font-semibold">
          Demo application
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {job ? `Apply for ${job.title}` : "Practice application"}
        </h1>
        {job ? <p className="mt-2 font-medium">{job.companyName}</p> : null}
        <p className="text-muted-foreground mt-3 mb-6 text-sm leading-relaxed">
          Use sample information to try the applicant experience. This form
          sends and stores no data.
        </p>
        {complete ? (
          <div
            className="bg-accent text-accent-foreground rounded-xl p-5"
            role="status"
          >
            <h2 className="font-semibold">Practice application complete</h2>
            <p className="mt-1 text-sm">
              Your sample application stayed in this browser tab.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium">
              Sample name
              <input
                autoComplete="off"
                className="bg-background mt-1 block w-full rounded-lg border p-2.5"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Sample email
              <input
                autoComplete="off"
                className="bg-background mt-1 block w-full rounded-lg border p-2.5"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-medium">
              Sample note
              <textarea
                className="bg-background mt-1 block w-full rounded-lg border p-2.5"
                required
                rows={3}
              />
            </label>
            <button
              className="bg-primary text-primary-foreground w-full rounded-lg p-3 text-sm font-semibold"
              type="submit"
            >
              Complete practice application
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
