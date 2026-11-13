// The order of the list a job was opened from, so the job page can swipe to
// the next and previous job. Kept per tab in sessionStorage.
const KEY = "etenesh:job-sequence";
const MAX = 200;

export interface JobSequenceEntry {
  slug: string;
  title: string;
}

export function saveJobSequence(entries: readonly JobSequenceEntry[]) {
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify(
        entries.slice(0, MAX).map(({ slug, title }) => ({ slug, title }))
      )
    );
  } catch {
    // Storage can be off (private mode); swiping then uses the fallback.
  }
}

function isEntry(value: unknown): value is JobSequenceEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as JobSequenceEntry).slug === "string" &&
    typeof (value as JobSequenceEntry).title === "string"
  );
}

export function readJobSequence(): JobSequenceEntry[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export interface JobNeighbors {
  index: number;
  next: JobSequenceEntry | null;
  prev: JobSequenceEntry | null;
  total: number;
}

// Where the current job sits. When it is not in the saved list (a shared
// link, a similar job), the fallback list is used with the job first.
export function jobNeighbors(
  slug: string,
  saved: readonly JobSequenceEntry[],
  fallback: readonly JobSequenceEntry[]
): JobNeighbors | null {
  let list = saved;
  let index = list.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    list = fallback;
    index = list.findIndex((entry) => entry.slug === slug);
  }
  if (index === -1 || list.length < 2) {
    return null;
  }
  return {
    index,
    next: list[index + 1] ?? null,
    prev: index > 0 ? (list[index - 1] ?? null) : null,
    total: list.length,
  };
}
