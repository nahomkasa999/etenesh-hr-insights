import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldAccess,
} from "payload";

import { isStaff } from "@/access/roles";
import {
  APPLICATION_STATUSES,
  EDUCATION_LEVELS,
  STATUS_LABELS,
} from "@/lib/etenesh/vocab";

const options = <T extends string>(
  values: readonly T[],
  labels?: Record<T, string>
) => values.map((value) => ({ label: labels?.[value] ?? value, value }));

const noOne: FieldAccess = () => false;

// Every status change is written to the history with who made it and when.
const recordStatusChange: CollectionBeforeChangeHook = ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (context.skipHistory) {
    return data;
  }
  const previous = originalDoc?.status;
  const next = data.status ?? previous;
  if (operation === "create" || (next && next !== previous)) {
    const history = Array.isArray(data.history)
      ? data.history
      : (originalDoc?.history ?? []);
    data.history = [
      ...history,
      {
        at: new Date().toISOString(),
        by: req.user?.email ?? "Applicant",
        status: next ?? "submitted",
      },
    ];
  }
  return data;
};

export const Applications: CollectionConfig = {
  access: {
    // Applicants submit through /api/apply, which writes as the server.
    create: isStaff,
    delete: isStaff,
    read: isStaff,
    update: isStaff,
  },
  admin: {
    defaultColumns: [
      "fullName",
      "jobTitle",
      "status",
      "matchScore",
      "createdAt",
    ],
    group: "Hiring",
    useAsTitle: "fullName",
  },
  fields: [
    {
      admin: { readOnly: true },
      index: true,
      name: "reference",
      required: true,
      type: "text",
      unique: true,
    },
    {
      index: true,
      name: "job",
      relationTo: "jobs",
      required: true,
      type: "relationship",
    },
    { admin: { readOnly: true }, name: "jobTitle", type: "text" },
    { admin: { readOnly: true }, name: "companyName", type: "text" },
    {
      defaultValue: "submitted",
      index: true,
      name: "status",
      options: options(APPLICATION_STATUSES, STATUS_LABELS),
      required: true,
      type: "select",
    },
    { name: "fullName", required: true, type: "text" },
    { name: "email", required: true, type: "email" },
    { name: "phone", required: true, type: "text" },
    { name: "city", type: "text" },
    { min: 0, name: "yearsExperience", type: "number" },
    { name: "education", options: options(EDUCATION_LEVELS), type: "select" },
    {
      fields: [{ name: "value", required: true, type: "text" }],
      name: "skills",
      type: "array",
    },
    {
      fields: [
        { name: "question", required: true, type: "text" },
        { name: "answer", type: "textarea" },
      ],
      name: "answers",
      type: "array",
    },
    { name: "coverNote", type: "textarea" },
    {
      admin: { readOnly: true },
      index: true,
      label: "Match score",
      max: 100,
      min: 0,
      name: "matchScore",
      type: "number",
    },
    {
      admin: { readOnly: true },
      fields: [{ name: "value", required: true, type: "text" }],
      label: "Criteria met",
      name: "matchMet",
      type: "array",
    },
    {
      admin: { readOnly: true },
      fields: [{ name: "value", required: true, type: "text" }],
      label: "Criteria missed",
      name: "matchMissed",
      type: "array",
    },
    {
      admin: { readOnly: true },
      label: "CV file name",
      name: "cvName",
      type: "text",
    },
    {
      admin: { readOnly: true },
      label: "CV type",
      name: "cvType",
      type: "text",
    },
    {
      admin: { readOnly: true },
      label: "CV size",
      name: "cvSize",
      type: "number",
    },
    // The CV itself, base64. Served only through /api/cv/<id> to staff.
    {
      access: { read: noOne, update: noOne },
      admin: { hidden: true },
      name: "cvData",
      type: "textarea",
    },
    {
      fields: [
        { name: "text", required: true, type: "textarea" },
        { name: "author", type: "text" },
        { name: "at", type: "date" },
      ],
      label: "Internal notes",
      name: "notes",
      type: "array",
    },
    {
      admin: { readOnly: true },
      fields: [
        { name: "status", type: "text" },
        { name: "by", type: "text" },
        { name: "at", type: "date" },
      ],
      label: "History",
      name: "history",
      type: "array",
    },
    {
      admin: {
        description: "The candidate account that sent it, when signed in.",
        readOnly: true,
      },
      index: true,
      name: "candidate",
      relationTo: "candidates",
      type: "relationship",
    },
    {
      admin: { readOnly: true },
      defaultValue: "form",
      index: true,
      name: "source",
      options: [
        { label: "Apply form", value: "form" },
        { label: "Auto apply", value: "auto" },
      ],
      type: "select",
    },
    {
      admin: { hidden: true },
      index: true,
      name: "telegramChatId",
      type: "text",
    },
  ],
  hooks: { beforeChange: [recordStatusChange] },
  slug: "applications",
  versions: false,
};
