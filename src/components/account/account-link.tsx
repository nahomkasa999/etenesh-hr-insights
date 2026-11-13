"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

// Header entry to the candidate account: "Sign in" when signed out, the
// person's initial when signed in. Reads the session in the browser so board
// pages stay cacheable.
export function AccountLink() {
  const { data, isPending } = authClient.useSession();
  if (isPending) {
    return <span aria-hidden="true" className="size-7" />;
  }
  if (!data) {
    return (
      <Link
        className={cn(
          "text-foreground ring-line-strong hover:bg-surface-sub inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[14px] font-medium ring-1 ring-inset md:h-7 md:rounded-[8px] md:px-2.5 md:text-[13px]",
          FOCUS
        )}
        data-testid="header-sign-in"
        href="/signin"
      >
        <UserRound aria-hidden="true" className="size-3.5" />
        Sign in
      </Link>
    );
  }
  const initial =
    (data.user.name || data.user.email).trim().charAt(0).toUpperCase() || "?";
  return (
    <Link
      aria-label="My account"
      className={cn(
        "bg-primary/10 text-primary hover:bg-primary/15 flex size-8 items-center justify-center rounded-full text-[13px] font-semibold md:size-7",
        FOCUS
      )}
      data-testid="header-account"
      href="/account"
      title={data.user.email}
    >
      {initial}
    </Link>
  );
}
