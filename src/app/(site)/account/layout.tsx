import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountNav, SignOutButton } from "@/components/account/account-nav";
import { BoardShell } from "@/components/board/board-shell";
import { getCandidateSession } from "@/lib/auth/server";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "My account",
};

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCandidateSession();
  if (!session) {
    redirect("/signin?next=/account");
  }
  return (
    <BoardShell>
      <div className="-mt-4 flex flex-col gap-6 md:-mt-2">
        <div className="from-primary/10 ring-line flex items-center gap-3 rounded-2xl bg-gradient-to-br to-transparent p-4 ring-1 ring-inset">
          <span className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
            {(session.name || session.email).trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-[17px] font-semibold">
              Hi, {(session.name || session.email).split(" ")[0]}
            </p>
            <p className="text-muted-foreground truncate text-[13px]">
              {session.email}
            </p>
          </div>
          <div className="hidden md:block">
            <SignOutButton />
          </div>
        </div>
        <AccountNav />
        {children}
      </div>
    </BoardShell>
  );
}
