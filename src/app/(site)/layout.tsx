import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { ThemeScript } from "@/components/theme/theme-script";
import { isMarketingEnabled } from "@/config/flags";
import { eteneshBrand } from "@/custom/etenesh/brand";
import { getSiteSettings } from "@/lib/read";
import { boardIcons } from "@/lib/seo/icons";
import { FONT_VARIABLE_CLASSES } from "@/theme/fonts";

import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  await headers();
  const settings = await getSiteSettings();

  return {
    icons: boardIcons(
      isMarketingEnabled(),
      settings.logoUrl ?? eteneshBrand.logo
    ),
    robots: { follow: true, index: false },
    title: {
      default: settings.name,
      template: `%s | ${settings.name}`,
    },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html className={FONT_VARIABLE_CLASSES} lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
