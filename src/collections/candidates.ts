import type { CollectionConfig, FieldAccess } from "payload";

import { isStaff } from "@/access/roles";
import {
  JOB_EMPLOYMENT_LABELS,
  JOB_WORKPLACE_LABELS,
} from "@/lib/domain/job-vocab";
import {
  DOCUMENT_KIND_LABELS,
  DOCUMENT_KINDS,
} from "@/lib/etenesh/candidate-vocab";
import { EDUCATION_LEVELS } from "@/lib/etenesh/vocab";

const noOne: FieldAccess = () => false;

const textRows = (name: string, label: string) => ({
  fields: [{ name: "value", required: true, type: "text" as const }],
  label,
  name,
  type: "array" as const,
});

// A job seeker's profile. The person signs in with Better Auth (the
// candidate_user table); this row holds what they fill in on the site.
// Candidates edit it through /account, never through the Payload API.
export const Candidates: CollectionConfig = {
  access: {
    create: () => false,
    delete: isStaff,
    read: isStaff,
    update: isStaff,
  },
  admin: {
    defaultColumns: ["fullName", "email", "headline", "autoApply", "updatedAt"],
    group: "Hiring",
    useAsTitle: "email",
  },
  fields: [
    {
      admin: { readOnly: true },
      index: true,
      label: "Account id",
      name: "authUserId",
      required: true,
      type: "text",
      unique: true,
    },
    { index: true, name: "email", required: true, type: "email" },
    { name: "fullName", type: "text" },
    { name: "phone", type: "text" },
    { name: "city", type: "text" },
    { name: "headline", type: "text" },
    { name: "summary", type: "textarea" },
    { min: 0, name: "yearsExperience", type: "number" },
    {
      name: "education",
      options: EDUCATION_LEVELS.map((value) => ({ label: value, value })),
      type: "select",
    },
    textRows("skills", "Skills"),
    textRows("preferredCategories", "Preferred categories"),
    textRows("preferredLocations", "Preferred locations"),
    {
      hasMany: true,
      name: "preferredTypes",
      options: Object.entries(JOB_EMPLOYMENT_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
      type: "select",
    },
    {
      hasMany: true,
      name: "preferredWorkplaces",
      options: Object.entries(JOB_WORKPLACE_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
      type: "select",
    },
    {
      admin: {
        description: "Set when the candidate connects the Telegram bot.",
        readOnly: true,
      },
      index: true,
      name: "telegramChatId",
      type: "text",
    },
    {
      admin: {
        description:
          "When on, Etenesh applies for matching jobs on the candidate's behalf.",
      },
      defaultValue: false,
      name: "autoApply",
      type: "checkbox",
    },
    {
      defaultValue: 70,
      label: "Auto apply minimum match",
      max: 100,
      min: 40,
      name: "autoApplyMinScore",
      type: "number",
    },
    {
      defaultValue: 5,
      label: "Auto apply limit per day",
      max: 20,
      min: 1,
      name: "autoApplyDailyLimit",
      type: "number",
    },
    {
      label: "Auto apply cover note",
      name: "autoApplyNote",
      type: "textarea",
    },
    {
      admin: { readOnly: true },
      label: "Auto apply last run",
      name: "autoApplyLastRun",
      type: "date",
    },
    {
      admin: { readOnly: true },
      fields: [
        { name: "at", type: "date" },
        { name: "jobTitle", type: "text" },
        { name: "outcome", type: "text" },
        { name: "detail", type: "text" },
      ],
      label: "Auto apply log",
      name: "autoApplyLog",
      type: "array",
    },
  ],
  slug: "candidates",
  timestamps: true,
  versions: false,
};

// Files a candidate keeps on their profile: CV, cover letter, certificates.
// Stored as base64 like application CVs, served only to the owner and staff.
export const CandidateDocuments: CollectionConfig = {
  access: {
    create: () => false,
    delete: isStaff,
    read: isStaff,
    update: isStaff,
  },
  admin: {
    defaultColumns: ["name", "kind", "candidate", "createdAt"],
    group: "Hiring",
    useAsTitle: "name",
  },
  fields: [
    {
      index: true,
      name: "candidate",
      relationTo: "candidates",
      required: true,
      type: "relationship",
    },
    {
      defaultValue: "cv",
      index: true,
      name: "kind",
      options: DOCUMENT_KINDS.map((value) => ({
        label: DOCUMENT_KIND_LABELS[value],
        value,
      })),
      required: true,
      type: "select",
    },
    { name: "name", required: true, type: "text" },
    { admin: { readOnly: true }, name: "mimeType", type: "text" },
    { admin: { readOnly: true }, name: "size", type: "number" },
    {
      access: { read: noOne, update: noOne },
      admin: { hidden: true },
      name: "data",
      type: "textarea",
    },
  ],
  slug: "candidate-documents",
  timestamps: true,
  versions: false,
};
