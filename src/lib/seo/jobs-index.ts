import type { Metadata } from "next";

const IMAGE = {
  alt: "Etenesh HR. Find your next job in Ethiopia.",
  height: 630,
  url: "/etenesh/jobs-share.png",
  width: 1200,
};

export function jobsIndexMetadata(input: {
  description: string;
  marketing: boolean;
  siteUrl: string;
}): Metadata {
  const siteUrl = input.siteUrl.endsWith("/")
    ? input.siteUrl.slice(0, -1)
    : input.siteUrl;
  const url = `${siteUrl}/jobs`;

  return {
    alternates: {
      canonical: url,
      types: {
        "application/feed+json": `${siteUrl}/feed.json`,
        "application/rss+xml": `${siteUrl}/feed.xml`,
      },
    },
    description: input.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: input.description,
      images: input.marketing ? [IMAGE] : undefined,
      siteName: input.marketing ? "Etenesh HR" : undefined,
      title: "Jobs",
      url,
    },
    title: "Jobs",
    twitter: {
      card: input.marketing ? "summary_large_image" : "summary",
      description: input.description,
      images: input.marketing ? [IMAGE.url] : undefined,
      title: "Jobs",
    },
  };
}
