"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { authClient } from "@/lib/auth/client";

const ROW =
  "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[14px]";

// Account links at the bottom of the phone menu, when signed in.
export function MenuAccount({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const signOut = useCallback(async () => {
    onDone();
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }, [onDone, router]);
  if (!data) {
    return null;
  }
  return (
    <div className="border-line mt-2 flex flex-col border-t pt-2">
      <Link className={ROW} href="/account" onClick={onDone}>
        <UserRound aria-hidden="true" className="size-4" />
        My account
      </Link>
      <button
        className={ROW}
        data-testid="menu-sign-out"
        onClick={signOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-4" />
        Sign out
      </button>
    </div>
  );
}
