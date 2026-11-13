"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/jobs", label: "Jobs for you" },
  { href: "/account/applications", label: "Applications" },
  { href: "/account/profile", label: "Profile & documents" },
  { href: "/account/auto-apply", label: "Auto apply" },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Account"
      className="border-line -mx-4 [scrollbar-width:none] overflow-x-auto border-b px-4"
      data-no-swipe
    >
      <ul className="flex min-w-max gap-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/account"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex h-11 items-center border-b-2 px-3 text-[14px] font-medium whitespace-nowrap",
                  active
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const onClick = useCallback(async () => {
    setBusy(true);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }, [router]);
  return (
    <button
      className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[14px]"
      data-testid="sign-out"
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      <LogOut aria-hidden="true" className="size-4" />
      Sign out
    </button>
  );
}
