import type { Metadata } from "next";

import { LoginForm } from "@/components/dashboard/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only paths inside the dashboard are allowed, so the link cannot send
  // someone to another site.
  const target = next?.startsWith("/dashboard") ? next : "/dashboard";
  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <LoginForm next={target} />
    </main>
  );
}
