// Words for candidate accounts: document kinds and file rules.

export const DOCUMENT_KINDS = [
  "cv",
  "cover_letter",
  "certificate",
  "id",
  "other",
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  certificate: "Certificate",
  cover_letter: "Cover letter",
  cv: "CV",
  id: "ID or passport",
  other: "Other",
};

export const DOCUMENT_MAX_BYTES = 4 * 1024 * 1024;
export const DOCUMENT_MAX_COUNT = 10;

// PDFs and Word files for everything; certificates and IDs may also be photos.
export const DOCUMENT_TYPES: Record<string, string> = {
  "application/msword": ".doc",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export function fileType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return (
    Object.entries(DOCUMENT_TYPES).find(
      ([type, suffix]) =>
        suffix === extension || (extension === ".jpeg" && type === "image/jpeg")
    )?.[0] ?? file.type
  );
}

export function isCvType(type: string): boolean {
  return type === "application/pdf" || type.includes("word");
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return DOCUMENT_KINDS.includes(value as DocumentKind);
}
