// Shared words for jobs, applications and the HR dashboard.

export const EDUCATION_LEVELS = [
  "None",
  "Grade 10",
  "Grade 12",
  "TVET Certificate",
  "Diploma",
  "Bachelor's degree",
  "Master's degree",
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export function educationRank(level: string | null | undefined): number {
  const index = EDUCATION_LEVELS.indexOf(level as EducationLevel);
  return index === -1 ? 0 : index;
}

// The path an application takes, in order. on_hold and rejected can happen
// at any step.
export const APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "on_hold",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  hired: "Hired",
  interview: "Interview",
  offer: "Offer sent",
  on_hold: "On hold",
  rejected: "Rejected",
  shortlisted: "Shortlisted",
  submitted: "New",
  under_review: "Under review",
};

// What a candidate reads about each status, on Telegram and on the
// tracking page.
export const STATUS_MESSAGES: Record<ApplicationStatus, string> = {
  hired: "Congratulations! You have been hired.",
  interview:
    "You are invited to an interview. We will send the time and place.",
  offer: "Good news! We have sent you a job offer.",
  on_hold: "Your application is on hold. We will get back to you.",
  rejected: "Thank you for applying. The employer has chosen other candidates.",
  shortlisted: "Good news! You have been shortlisted.",
  submitted: "We received your application.",
  under_review: "Your application is now under review.",
};

// The next steps HR can take from each status, as button labels.
export const STATUS_ACTIONS: Record<
  ApplicationStatus,
  { label: string; to: ApplicationStatus }[]
> = {
  hired: [],
  interview: [
    { label: "Send offer", to: "offer" },
    { label: "Put on hold", to: "on_hold" },
    { label: "Reject", to: "rejected" },
  ],
  offer: [
    { label: "Mark as hired", to: "hired" },
    { label: "Reject", to: "rejected" },
  ],
  on_hold: [
    { label: "Back to review", to: "under_review" },
    { label: "Shortlist", to: "shortlisted" },
    { label: "Reject", to: "rejected" },
  ],
  rejected: [{ label: "Reopen", to: "under_review" }],
  shortlisted: [
    { label: "Invite to interview", to: "interview" },
    { label: "Put on hold", to: "on_hold" },
    { label: "Reject", to: "rejected" },
  ],
  submitted: [
    { label: "Start review", to: "under_review" },
    { label: "Shortlist", to: "shortlisted" },
    { label: "Reject", to: "rejected" },
  ],
  under_review: [
    { label: "Shortlist", to: "shortlisted" },
    { label: "Put on hold", to: "on_hold" },
    { label: "Reject", to: "rejected" },
  ],
};
