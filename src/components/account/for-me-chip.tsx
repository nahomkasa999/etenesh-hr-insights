"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";

// Signed-in candidates get a "For me" chip on the board: jobs ranked by
// how well they match the profile.
export function ForMeChip() {
  const { data } = authClient.useSession();
  if (!data) {
    return null;
  }
  return (
    <Link
      className="bg-primary/10 text-primary hover:bg-primary/15 inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium lg:h-7 lg:rounded-[8px] lg:text-[13px]"
      data-testid="for-me-chip"
      href="/account/jobs"
    >
      <Sparkles aria-hidden="true" className="size-3.5" />
      For me
    </Link>
  );
}
