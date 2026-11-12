import { educationRank } from "@/lib/etenesh/vocab";

const YEARS_RE = /^\d{1,2}$/u;

export interface Requirements {
  education: string;
  minYearsExperience: number;
}

export interface Profile {
  education: string;
  yearsExperience: string;
}

export function parseYears(value: string): number | null {
  const trimmed = value.trim();
  if (!YEARS_RE.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

// Plain sentence: "Needs 2+ years of experience and a Bachelor's degree."
export function describeRequirements(req: Requirements): string {
  const parts: string[] = [];
  if (req.minYearsExperience > 0) {
    parts.push(
      `${req.minYearsExperience}+ ${req.minYearsExperience === 1 ? "year" : "years"} of experience`
    );
  }
  if (educationRank(req.education) > 0) {
    parts.push(
      req.education === "Bachelor's degree" ||
        req.education === "Master's degree"
        ? `a ${req.education}`
        : `${req.education} or higher`
    );
  }
  if (parts.length === 0) {
    return "No special experience or education is needed.";
  }
  return `Needs ${parts.join(" and ")}.`;
}

// Kind messages for each requirement the person does not meet. Empty when
// eligible or while the answers are still blank.
export function missedRequirements(
  req: Requirements,
  profile: Profile
): string[] {
  const missed: string[] = [];
  const years = parseYears(profile.yearsExperience);
  if (years !== null && years < req.minYearsExperience) {
    missed.push(
      `This job needs at least ${req.minYearsExperience} ${req.minYearsExperience === 1 ? "year" : "years"} of experience. You told us ${years}.`
    );
  }
  if (
    profile.education &&
    educationRank(profile.education) < educationRank(req.education)
  ) {
    missed.push(
      `This job needs ${req.education} or higher. You chose ${profile.education}.`
    );
  }
  return missed;
}

export function canContinue(req: Requirements, profile: Profile): boolean {
  return (
    parseYears(profile.yearsExperience) !== null &&
    profile.education !== "" &&
    missedRequirements(req, profile).length === 0
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
