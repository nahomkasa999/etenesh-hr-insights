import config from "@payload-config";
import { getPayload } from "payload";

export async function getCareerGuides(slug?: string) {
  const payload = await getPayload({ config });
  const published = { _status: { equals: "published" } };
  const result = await payload.find({
    collection: "career-guides",
    depth: 0,
    draft: false,
    limit: slug ? 1 : 24,
    overrideAccess: false,
    sort: "id",
    where: slug ? { and: [published, { slug: { equals: slug } }] } : published,
  });
  return result.docs;
}
