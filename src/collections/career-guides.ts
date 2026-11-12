import type { CollectionConfig } from "payload";

import { isStaff } from "@/access/roles";

export const CareerGuides: CollectionConfig = {
  access: {
    create: isStaff,
    delete: isStaff,
    read: (args) => isStaff(args) || { _status: { equals: "published" } },
    update: isStaff,
  },
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", required: true, type: "text" },
    {
      index: true,
      name: "slug",
      type: "slug",
      unique: true,
      useAsSlug: "title",
    },
    { name: "topic", required: true, type: "text" },
    { maxLength: 240, name: "summary", required: true, type: "textarea" },
    { name: "body", required: true, type: "richText" },
  ],
  slug: "career-guides",
  versions: { drafts: true, maxPerDoc: 20 },
};
