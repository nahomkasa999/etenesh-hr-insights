"use client";

import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DOCUMENT_KIND_LABELS,
  DOCUMENT_KINDS,
  DOCUMENT_MAX_BYTES,
  type DocumentKind,
} from "@/lib/etenesh/candidate-vocab";

export interface DocumentRow {
  createdAt: string;
  id: number;
  kind: DocumentKind;
  name: string;
  size: number;
}

function size(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function DocumentsPanel({ documents }: { documents: DocumentRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<DocumentKind>(
    documents.some((doc) => doc.kind === "cv") ? "certificate" : "cv"
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"upload" | number | null>(null);

  const upload = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!file) {
        setError("Choose a file first.");
        return;
      }
      if (file.size > DOCUMENT_MAX_BYTES) {
        setError("Files must be smaller than 4 MB.");
        return;
      }
      setBusy("upload");
      setError(null);
      const body = new FormData();
      body.set("kind", kind);
      body.set("file", file);
      const response = await fetch("/api/account/documents", {
        body,
        method: "POST",
      }).catch(() => null);
      const data = (await response?.json().catch(() => null)) as {
        error?: string;
      } | null;
      setBusy(null);
      if (!response?.ok) {
        setError(data?.error ?? "Upload failed. Please try again.");
        return;
      }
      setFile(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      router.refresh();
    },
    [file, kind, router]
  );

  const remove = useCallback(
    async (id: number) => {
      setBusy(id);
      await fetch(`/api/account/documents/${id}`, { method: "DELETE" }).catch(
        () => null
      );
      setBusy(null);
      router.refresh();
    },
    [router]
  );

  const onRemove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      remove(Number(event.currentTarget.value)),
    [remove]
  );
  const onKind = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) =>
      setKind(event.target.value as DocumentKind),
    []
  );
  const onFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col gap-4" data-testid="documents-panel">
      {documents.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li
              className="bg-card ring-line flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset"
              key={doc.id}
            >
              <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <FileText aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {doc.name}
                </p>
                <p className="text-subtle text-[12px]">
                  {DOCUMENT_KIND_LABELS[doc.kind]} · {size(doc.size)}
                </p>
              </div>
              <a
                aria-label={`Download ${doc.name}`}
                className="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center rounded-lg"
                href={`/api/account/documents/${doc.id}`}
              >
                <Download aria-hidden="true" className="size-4" />
              </a>
              <button
                aria-label={`Delete ${doc.name}`}
                className="text-muted-foreground hover:text-destructive flex size-9 items-center justify-center rounded-lg"
                disabled={busy === doc.id}
                onClick={onRemove}
                type="button"
                value={doc.id}
              >
                {busy === doc.id ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Trash2 aria-hidden="true" className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-surface-sub text-muted-foreground rounded-xl p-4 text-sm">
          No files yet. Upload your CV first: it is used for one-tap apply and
          auto apply.
        </p>
      )}

      <form
        className="ring-line ring-dashed flex flex-col gap-3 rounded-xl p-4 ring-1 ring-inset md:flex-row md:items-end"
        onSubmit={upload}
      >
        <label className="flex flex-col gap-2 md:w-48">
          <span className="text-sm font-medium">Type</span>
          <select
            className="bg-card ring-line-strong h-11 rounded-lg px-3 text-base ring-1 ring-inset md:text-sm"
            onChange={onKind}
            value={kind}
          >
            {DOCUMENT_KINDS.map((value) => (
              <option key={value} value={value}>
                {DOCUMENT_KIND_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-medium">File</span>
          <input
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="file:bg-tag file:text-foreground text-muted-foreground h-11 w-full rounded-lg text-sm file:mr-3 file:h-11 file:rounded-lg file:border-0 file:px-3 file:font-medium"
            data-testid="document-file"
            onChange={onFile}
            ref={fileRef}
            type="file"
          />
        </label>
        <Button
          className="h-11 px-5 text-sm"
          data-testid="document-upload"
          disabled={busy === "upload"}
          type="submit"
        >
          {busy === "upload" ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="size-4" />
          )}
          Upload
        </Button>
      </form>
      <p className="text-subtle text-[12px]">
        PDF or Word for your CV and cover letter. Certificates and IDs can also
        be photos (JPG or PNG). Up to 4 MB each. Only you and the hiring team
        can open them.
      </p>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
