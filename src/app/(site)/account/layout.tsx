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
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-subtle text-[13px]">Signed in as</p>
            <p className="text-foreground truncate text-[15px] font-medium">
              {session.name || session.email}
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
