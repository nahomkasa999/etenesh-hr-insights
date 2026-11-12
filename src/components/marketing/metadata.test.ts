import { expect, test } from "vitest";

import {
  marketingHomeMetadata,
  marketingLayoutMetadata,
  marketingPageMetadata,
} from "./metadata";
import { MARKETING_DESCRIPTION } from "./site";

test("marketing layout metadata is empty when the flag is off", () => {
  expect(marketingLayoutMetadata(false)).toEqual({});
});

test("marketing layout metadata is the Etenesh HR card when the flag is on", () => {
  const metadata = marketingLayoutMetadata(true);

  expect(metadata.title).toEqual({
    default: "Etenesh HR Insights: jobs in Ethiopia",
    template: "%s | Etenesh HR",
  });
  expect(metadata.description).toBe(MARKETING_DESCRIPTION);
  expect(metadata.icons).toEqual({
    apple: "/etenesh/icon-512.png",
    icon: "/etenesh/mark.png",
  });
  expect(metadata.openGraph).toMatchObject({
    images: [
      {
        alt: "Etenesh HR Insights: jobs in Ethiopia",
        height: 512,
        url: "/etenesh/icon-512.png",
        width: 512,
      },
    ],
    siteName: "Etenesh HR Insights",
  });
  expect(metadata.twitter).toMatchObject({
    card: "summary_large_image",
    images: ["/etenesh/icon-512.png"],
    title: "Etenesh HR Insights: jobs in Ethiopia",
  });
  expect(metadata.metadataBase).toBeInstanceOf(URL);
});

test("the marketing home takes the same card with its own title", () => {
  const layout = marketingLayoutMetadata(true);
  const home = marketingHomeMetadata();

  expect(home.title).toEqual({
    absolute: "Etenesh HR Insights: jobs in Ethiopia",
  });
  expect(home.description).toBe(MARKETING_DESCRIPTION);
  expect(home.icons).toEqual(layout.icons);
  expect(home.openGraph).toEqual({ ...layout.openGraph, url: "/" });
  expect(home.twitter).toEqual(layout.twitter);
  expect(home.alternates).toEqual({ canonical: "/" });
  expect(home.metadataBase).toBeInstanceOf(URL);
});

test("a marketing page sets its own canonical and og:url", () => {
  const page = marketingPageMetadata({
    description: "Simple pricing.",
    path: "/pricing",
    title: "Pricing",
  });

  expect(page.alternates).toEqual({ canonical: "/pricing" });
  expect(page.description).toBe("Simple pricing.");
  expect(page.title).toBe("Pricing");
  expect(page.icons).toEqual(marketingLayoutMetadata(true).icons);
  expect(page.openGraph).toMatchObject({
    description: "Simple pricing.",
    title: "Pricing",
    url: "/pricing",
  });
  expect(page.twitter).toMatchObject({
    description: "Simple pricing.",
    title: "Pricing",
  });
});
