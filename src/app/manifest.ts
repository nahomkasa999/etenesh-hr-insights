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
        sizes: "256x256",
        src: "/etenesh/mark.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/etenesh/icon-512.png",
        type: "image/png",
      },
    ],
    name: "Etenesh HR Insights",
    short_name: "Etenesh HR",
    start_url: "/",
    theme_color: "#0077e6",
  };
}
