"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function ForMeChip({ active, href }: { active: boolean; href: string }) {
  const { data } = authClient.useSession();
  if (!(active || data)) {
    return null;
  }
  return (
    <Link
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium lg:h-7 lg:rounded-[8px] lg:text-[13px]",
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-primary/10 text-primary hover:bg-primary/15"
      )}
      data-active={active ? "true" : undefined}
      data-testid="for-me-chip"
      href={href}
      prefetch={false}
      scroll={false}
    >
      <Sparkles aria-hidden="true" className="size-3.5" />
      For me
    </Link>
  );
}
