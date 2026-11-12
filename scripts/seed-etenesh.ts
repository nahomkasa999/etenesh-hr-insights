import type { PostgresAdapter } from "@payloadcms/db-postgres";
import { getPayload } from "payload";

import { eteneshBrand } from "../src/custom/etenesh/brand";
import { ethiojobsListings } from "../src/custom/etenesh/listings";
import { starterGuides } from "../src/custom/etenesh/starter-guides";
import {
  htmlToLexical,
  textToLexical,
} from "../src/lib/bordfeed/html-to-lexical";
import { slugify } from "../src/lib/bordfeed/map-company";
import config from "../src/payload.config";
import type { CareerGuide, Job } from "../src/payload-types";

const payload = await getPayload({ config });

try {
  const users = await payload.count({
    collection: "users",
    overrideAccess: true,
  });
  if (users.totalDocs === 0) {
    const { DEMO_EDITOR_EMAIL: email, DEMO_EDITOR_PASSWORD: password } =
      process.env;
    if (!(email && password) || password.length < 16) {
      throw new Error(
        "Set DEMO_EDITOR_EMAIL and a strong DEMO_EDITOR_PASSWORD to initialize the first admin."
      );
    }
    await payload.create({
      collection: "users",
      data: { email, password, roles: ["admin"] },
      overrideAccess: true,
    });
  }

  const settings = await payload.findGlobal({
    overrideAccess: true,
    slug: "site-settings",
  });
  if (!settings.id) {
    await payload.updateGlobal({
      data: {
        board: {
          description:
            "Selected vacancies from Ethiojobs. Open a listing for the original requirements and application instructions.",
          title: "Jobs in Ethiopia",
        },
        name: eteneshBrand.name,
        tagline: eteneshBrand.tagline,
      },
      overrideAccess: true,
      slug: "site-settings",
    });
  }

  const openListings = ethiojobsListings
    .map((listing) => ({
      ...listing,
      validThrough: new Date(
        `${listing.deadline}T23:59:59+03:00`
      ).toISOString(),
    }))
    .filter((listing) => Date.parse(listing.validThrough) > Date.now());

  const companyIds = new Map(
    await Promise.all(
      [...new Set(openListings.map((listing) => listing.company))].map(
        async (name) => {
          const slug = slugify(name);
          const {
            docs: [existing],
          } = await payload.find({
            collection: "companies",
            depth: 0,
            limit: 1,
            overrideAccess: true,
            where: { slug: { equals: slug } },
          });
          const company =
            existing ??
            (await payload.create({
              collection: "companies",
              data: { name, origin: "manual", slug },
              overrideAccess: true,
            }));
          return [name, company.id] as const;
        }
      )
    )
  );

  await Promise.all(
    openListings.map(async (listing) => {
      const sourceListingUrl = `https://ethiojobs.net/job/${listing.path}`;
      const {
        docs: [existing],
      } = await payload.find({
        collection: "jobs",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { sourceListingUrl: { equals: sourceListingUrl } },
      });
      if (existing) {
        return;
      }

      await payload.create({
        collection: "jobs",
        data: {
          _status: "published",
          applyUrl: sourceListingUrl,
          categories: [{ value: listing.category }],
          company: companyIds.get(listing.company),
          companyName: listing.company,
          countryCode: "ET",
          description: textToLexical(
            `${listing.summary}\n\nSource: Ethiojobs. Open the original vacancy for the full requirements and application steps.`
          ) as Job["description"],
          employmentType: listing.fullTime ? "full-time" : undefined,
          locality: listing.city,
          locationDisplay: listing.city
            ? `${listing.city}, Ethiopia`
            : "Ethiopia",
          origin: "manual",
          slug: listing.path.slice(listing.path.indexOf("-") + 1),
          sourceListingUrl,
          summary: listing.summary,
          title: listing.title,
          validThrough: listing.validThrough,
          workplaceType: "onsite",
        },
        overrideAccess: true,
      });
    })
  );

  await Promise.all(
    starterGuides.map(async (guide) => {
      const existing = await payload.count({
        collection: "career-guides",
        overrideAccess: true,
        where: { slug: { equals: guide.slug } },
      });
      if (existing.totalDocs > 0) {
        return;
      }
      const { body, ...fields } = guide;
      await payload.create({
        collection: "career-guides",
        data: {
          ...fields,
          _status: "published",
          body: htmlToLexical(
            body
              .map(
                ([heading, paragraph]) =>
                  `<h2>${heading}</h2><p>${paragraph}</p>`
              )
              .join("")
          ) as CareerGuide["body"],
        },
        overrideAccess: true,
      });
    })
  );
  console.log("Etenesh HR Insights content is ready.");
} finally {
  const { pool } = payload.db as typeof payload.db &
    Pick<PostgresAdapter, "pool">;
  await payload.destroy();
  await pool?.end();
}
