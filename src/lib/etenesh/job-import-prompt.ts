import { EDUCATION_LEVELS } from "./vocab";

// Pasted into ChatGPT (or any AI) together with the job text. The reply is
// JSON that importFileSchema accepts.
export const JOB_IMPORT_PROMPT = `You turn job announcements into JSON for an Ethiopian job board. Read the job text I paste after the line "JOB TEXT:" and reply with ONLY one JSON object, with no explanation and no markdown fences. Put every job in the "jobs" array.

Shape of each job:
{
  "title": "string",
  "company": "string",
  "city": "string, for example Addis Ababa",
  "area": "string or null, a sub-city or neighbourhood",
  "category": "string, for example Accounting, IT & Software, Sales",
  "careerLevel": "Internship | Entry | Junior | Mid | Senior | Manager",
  "employmentType": "full-time | part-time | contract | internship",
  "workplaceType": "onsite | hybrid | remote",
  "deadline": "YYYY-MM-DD, the closing date",
  "positions": "number or null",
  "salaryMin": "number in ETB or null",
  "salaryMax": "number in ETB or null",
  "summary": "two or three plain sentences about the role",
  "about": "string or null, about the company",
  "responsibilities": ["short sentence", "..."],
  "requirements": ["short sentence", "..."],
  "benefits": ["short sentence", "..."],
  "criteria": {
    "minYearsExperience": "whole number, 0 if none is asked",
    "education": "one of: ${EDUCATION_LEVELS.join(" | ")}",
    "requiredSkills": ["skill an applicant can tick, 1 to 5 words", "..."],
    "languages": ["English", "..."]
  },
  "screeningQuestions": ["a question applicants answer in writing", "..."]
}

Rules: use only facts from the text. If the text gives no closing date, use a date 30 days from today. Use null or [] when something is not stated. Write 2 or 3 screeningQuestions that test the main requirements. Output valid JSON only.

JOB TEXT:
`;
