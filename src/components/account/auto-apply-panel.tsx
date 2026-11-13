"use client";

import { AlertCircle, CheckCircle2, Loader2, Play, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useCallback, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface AutoApplySettings {
  autoApply: boolean;
  autoApplyDailyLimit: number;
  autoApplyMinScore: number;
  autoApplyNote: string;
}

interface RunReply {
  applied?: number;
  bestScore?: number | null;
  missing?: string[];
  outcomes?: {
    detail: string;
    jobTitle: string;
    outcome: string;
    reference?: string;
  }[];
}

export function AutoApplyPanel({
  initial,
  missing,
}: {
  initial: AutoApplySettings;
  // Profile fields that block auto apply until filled.
  missing: string[];
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<RunReply | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (next: AutoApplySettings) => {
      setSaving(true);
      setSaved(false);
      setError(null);
      const response = await fetch("/api/account/profile", {
        body: JSON.stringify(next),
        headers: { "content-type": "application/json" },
        method: "PUT",
      }).catch(() => null);
      setSaving(false);
      if (!response?.ok) {
        setError("We could not save your settings. Please try again.");
        return false;
      }
      setSaved(true);
      router.refresh();
      return true;
    },
    [router]
  );

  const runNow = useCallback(async () => {
    setRunning(true);
    setError(null);
    setRun(null);
    const response = await fetch("/api/account/auto-apply", {
      method: "POST",
    }).catch(() => null);
    const data = (await response?.json().catch(() => null)) as RunReply | null;
    setRunning(false);
    if (!(response?.ok && data)) {
      setError("Auto apply could not run. Please try again.");
      return;
    }
    setRun(data);
    router.refresh();
  }, [router]);

  const toggle = useCallback(async () => {
    const next = { ...settings, autoApply: !settings.autoApply };
    setSettings(next);
    const ok = await save(next);
    // Turning it on applies straight away instead of waiting for tomorrow.
    if (ok && next.autoApply && missing.length === 0) {
      await runNow();
    }
  }, [missing.length, runNow, save, settings]);

  // The two sliders carry their setting as `name`.
  const onRange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setSettings((prev) => ({ ...prev, [name]: Number(value) }));
  }, []);
  const onNote = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setSettings((prev) => ({ ...prev, autoApplyNote: value }));
  }, []);
  const onSave = useCallback(() => save(settings), [save, settings]);

  const blocked = missing.length > 0;

  return (
    <div className="flex flex-col gap-6" data-testid="auto-apply-panel">
      {blocked ? (
        <Alert>
          <AlertCircle />
          <AlertTitle>Finish your profile first</AlertTitle>
          <AlertDescription className="text-sm">
            Auto apply needs: {missing.join(", ")}.{" "}
            <Link className="text-foreground underline" href="/account/profile">
              Go to your profile
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-card ring-line flex items-center justify-between gap-4 rounded-xl p-4 ring-1 ring-inset">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              settings.autoApply
                ? "bg-primary text-primary-foreground"
                : "bg-tag text-muted-foreground"
            )}
          >
            <Zap aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-foreground text-[15px] font-medium">
              Auto apply is {settings.autoApply ? "on" : "off"}
            </p>
            <p className="text-muted-foreground text-[13px] leading-5">
              Every day Etenesh sends your profile and CV to new jobs that match
              you well. Jobs with employer questions are left for you.
            </p>
          </div>
        </div>
        <button
          aria-checked={settings.autoApply}
          aria-label="Auto apply"
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
            settings.autoApply ? "bg-primary" : "bg-line-strong"
          )}
          data-testid="auto-apply-toggle"
          disabled={saving || running || (blocked && !settings.autoApply)}
          onClick={toggle}
          role="switch"
          type="button"
        >
          <span
            className={cn(
              "bg-card absolute top-1 size-5 rounded-full shadow transition-all",
              settings.autoApply ? "left-6" : "left-1"
            )}
          />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-sm" htmlFor="aa-score">
            Minimum match (%)
          </Label>
          <input
            className="bg-card text-foreground ring-line-strong h-11 w-full rounded-lg px-3 text-base ring-1 ring-inset md:text-sm"
            id="aa-score"
            inputMode="numeric"
            max={100}
            min={40}
            name="autoApplyMinScore"
            onChange={onRange}
            type="number"
            value={settings.autoApplyMinScore}
          />
          <p className="text-subtle text-[12px]">
            40 to 100. Higher means fewer, closer matches.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm" htmlFor="aa-limit">
            Applications per day (max)
          </Label>
          <input
            className="bg-card text-foreground ring-line-strong h-11 w-full rounded-lg px-3 text-base ring-1 ring-inset md:text-sm"
            id="aa-limit"
            inputMode="numeric"
            max={20}
            min={1}
            name="autoApplyDailyLimit"
            onChange={onRange}
            type="number"
            value={settings.autoApplyDailyLimit}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-sm" htmlFor="aa-note">
            Cover note sent with auto applications
          </Label>
          <Textarea
            className="min-h-24 text-base md:text-sm"
            id="aa-note"
            onChange={onNote}
            placeholder="A few lines about you that fit most jobs you want."
            value={settings.autoApplyNote}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          className="h-11 px-5 text-sm"
          disabled={saving}
          onClick={onSave}
          type="button"
          variant="outline"
        >
          {saving ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          Save settings
        </Button>
        <Button
          className="h-11 px-5 text-sm"
          data-testid="auto-apply-run"
          disabled={running || blocked}
          onClick={runNow}
          type="button"
        >
          {running ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Play aria-hidden="true" className="size-4" />
          )}
          {running ? "Finding jobs…" : "Run now"}
        </Button>
        {saved && !saving ? (
          <p
            className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Saved
          </p>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      ) : null}

      {run ? (
        <RunResult minScore={settings.autoApplyMinScore} run={run} />
      ) : null}
    </div>
  );
}

function emptyMessage(run: RunReply, minScore: number): string {
  if (typeof run.bestScore === "number" && run.bestScore < minScore) {
    return `No job matched at least ${minScore}% yet. Your best open match is ${run.bestScore}%. Lower the minimum, or add skills and categories to your profile.`;
  }
  return "No new jobs to apply for right now. We check again every day.";
}

function RunResult({ minScore, run }: { minScore: number; run: RunReply }) {
  const outcomes = run.outcomes ?? [];
  return (
    <div
      className="bg-surface-sub flex flex-col gap-2 rounded-xl p-4"
      data-testid="auto-apply-result"
      role="status"
    >
      <p className="text-foreground text-sm font-medium">
        {run.applied
          ? `Applied for ${run.applied} job${run.applied === 1 ? "" : "s"}.`
          : emptyMessage(run, minScore)}
      </p>
      {outcomes.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {outcomes.map((item) => (
            <li
              className="text-muted-foreground text-[13px]"
              key={`${item.jobTitle}-${item.outcome}`}
            >
              <span className="text-foreground">{item.jobTitle}</span>:{" "}
              {item.outcome === "applied"
                ? `applied (${item.detail}, ${item.reference})`
                : item.detail}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
