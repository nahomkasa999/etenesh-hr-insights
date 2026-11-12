import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { ThemeScript } from "@/components/theme/theme-script";
import { Toaster } from "@/components/ui/sonner";
import { FONT_VARIABLE_CLASSES } from "@/theme/fonts";

import "../globals.css";
import "./dashboard.css";

export const metadata: Metadata = {
  icons: { icon: "/etenesh/logo.webp" },
  robots: { follow: false, index: false },
  title: { default: "HR dashboard", template: "%s | Etenesh HR" },
};

export default async function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      className={`${FONT_VARIABLE_CLASSES} etenesh-dashboard`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body className="bg-sidebar font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
