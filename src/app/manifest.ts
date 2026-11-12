import type { MetadataRoute } from "next";
import { notFound } from "next/navigation";

import { MARKETING_DESCRIPTION } from "@/components/marketing/site";
import { isMarketingEnabled } from "@/config/flags";

// Bordful branding only. Forks get a 404 so they never install a Bordful PWA.
export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  if (!isMarketingEnabled()) {
    notFound();
  }

  return {
    background_color: "#f5f5f4",
    description: MARKETING_DESCRIPTION,
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "692x577",
        src: "/etenesh/logo.webp",
        type: "image/webp",
      },
      {
        purpose: "any",
        sizes: "692x577",
        src: "/etenesh/logo.webp",
        type: "image/webp",
      },
    ],
    name: "Etenesh HR Insights",
    short_name: "Etenesh HR",
    start_url: "/",
    theme_color: "#0077e6",
  };
}
