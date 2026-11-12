import { educationRank } from "./vocab";

export interface JobCriteria {
  education?: string | null;
  minYearsExperience?: number | null;
  requiredSkills?: string[];
}

export interface ApplicantFacts {
  education: string;
  skills: string[];
  yearsExperience: number;
}

export interface MatchResult {
  eligible: boolean;
  met: string[];
  missed: string[];
  score: number;
}

const normalize = (value: string) => value.trim().toLowerCase();

// Years and education are must-haves: missing either blocks the
// application. Skills only change the score HR sorts by.
export function matchApplicant(
  criteria: JobCriteria,
  applicant: ApplicantFacts
): MatchResult {
  const met: string[] = [];
  const missed: string[] = [];

  const minYears = criteria.minYearsExperience ?? 0;
  const yearsOk = applicant.yearsExperience >= minYears;
  if (minYears > 0) {
    (yearsOk ? met : missed).push(
      `${minYears}+ year${minYears === 1 ? "" : "s"} of experience`
    );
  }

  const education = criteria.education ?? "None";
  const educationOk =
    educationRank(applicant.education) >= educationRank(education);
  if (education !== "None") {
    (educationOk ? met : missed).push(`${education} or higher`);
  }

  const required = criteria.requiredSkills ?? [];
  const have = new Set(applicant.skills.map(normalize));
  let skillsHave = 0;
  for (const skill of required) {
    if (have.has(normalize(skill))) {
      skillsHave += 1;
      met.push(skill);
    } else {
      missed.push(skill);
    }
  }
  const skillsRatio = required.length === 0 ? 1 : skillsHave / required.length;

  const score = Math.round(
    (yearsOk ? 40 : 0) + (educationOk ? 30 : 0) + 30 * skillsRatio
  );

  return { eligible: yearsOk && educationOk, met, missed, score };
}
