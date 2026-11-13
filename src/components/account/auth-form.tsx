"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/next-path";

type Mode = "signin" | "signup";

const COPY: Record<
  Mode,
  {
    cta: string;
    other: string;
    otherCta: string;
    otherHref: string;
    title: string;
  }
> = {
  signin: {
    cta: "Sign in",
    other: "New to Etenesh?",
    otherCta: "Create an account",
    otherHref: "/signup",
    title: "Welcome back",
  },
  signup: {
    cta: "Create account",
    other: "Already have an account?",
    otherCta: "Sign in",
    otherHref: "/signin",
    title: "Create your candidate account",
  },
};

function message(error: { code?: string; message?: string; status?: number }) {
  const code = error.code ?? "";
  if (code.includes("INVALID_EMAIL_OR_PASSWORD") || error.status === 401) {
    return "That email and password do not match. Check them and try again.";
  }
  if (code.includes("USER_ALREADY_EXISTS")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (code.includes("PASSWORD_TOO_SHORT")) {
    return "Use at least 8 characters for your password.";
  }
  if (error.status === 429) {
    return "Too many tries. Wait a minute and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
}

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];
  const target = safeNext(next);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const name = String(form.get("name") ?? "").trim();
      if (mode === "signup" && name.length < 2) {
        setError("Please type your full name.");
        return;
      }
      if (password.length < 8) {
        setError("Use at least 8 characters for your password.");
        return;
      }
      setBusy(true);
      setError(null);
      const result =
        mode === "signup"
          ? await authClient.signUp.email({ email, name, password })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(message(result.error));
        setBusy(false);
        return;
      }
      router.replace(target);
      router.refresh();
    },
    [mode, router, target]
  );

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-[28px] leading-9 font-medium tracking-[-0.02em]">
          {copy.title}
        </h1>
        <p className="text-muted-foreground text-[15px] leading-6">
          {mode === "signup"
            ? "Save your CV and details once, apply in a tap, track every application and let Etenesh apply for matching jobs."
            : "Sign in to track your applications and see jobs that fit you."}
        </p>
      </div>
      {error ? (
        <Alert data-testid="auth-error" variant="destructive">
          <AlertCircle />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      ) : null}
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        {mode === "signup" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="auth-name">Full name</Label>
            <Input
              autoComplete="name"
              className="h-11 text-base md:text-sm"
              id="auth-name"
              name="name"
              required
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            autoComplete="email"
            className="h-11 text-base md:text-sm"
            id="auth-email"
            inputMode="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            className="h-11 text-base md:text-sm"
            id="auth-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
          {mode === "signup" ? (
            <p className="text-subtle text-[13px]">At least 8 characters.</p>
          ) : null}
        </div>
        <Button
          className="h-11 text-sm"
          data-testid="auth-submit"
          disabled={busy}
          type="submit"
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {copy.cta}
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        {copy.other}{" "}
        <Link
          className="text-foreground font-medium underline underline-offset-2"
          href={`${copy.otherHref}${next ? `?next=${encodeURIComponent(target)}` : ""}`}
        >
          {copy.otherCta}
        </Link>
      </p>
    </div>
  );
}
