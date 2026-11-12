"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useState } from "react";

export default function PracticeApplication() {
  const [complete, setComplete] = useState(false);
  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComplete(true);
  }, []);

  return (
    <main className="bg-background text-foreground min-h-screen px-5 py-12">
      <div className="bg-card mx-auto max-w-lg rounded-2xl border p-7 md:p-10">
        <Link
          className="text-sm font-medium underline underline-offset-4"
          href="/"
        >
          Back to the job board
        </Link>
        <p className="text-muted-foreground mt-7 text-sm font-semibold">
          Pitch demo · Fictional vacancy
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Practice application
        </h1>
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
