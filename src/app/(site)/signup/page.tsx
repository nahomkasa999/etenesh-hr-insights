import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/account/auth-form";
import { BoardShell } from "@/components/board/board-shell";
import { safeNext } from "@/lib/auth/next-path";
import { getCandidateSession } from "@/lib/auth/server";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Create account",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  if (await getCandidateSession()) {
    redirect(safeNext(nextPath));
  }
  return (
    <BoardShell>
      <AuthForm mode="signup" next={nextPath} />
    </BoardShell>
  );
}
