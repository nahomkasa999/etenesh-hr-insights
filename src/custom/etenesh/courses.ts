export const courseIntroOrigin = "https://www.youtube-nocookie.com";

export const careerCourse = {
  audience:
    "For graduates, first-time job seekers, and people returning to the job market.",
  description:
    "Build a CV for a real vacancy, prepare examples for your interview, and set up a system for tracking applications.",
  lessons: [
    {
      description:
        "Read a job description, identify its requirements, and decide whether the role fits your experience.",
      title: "Find roles that fit",
    },
    {
      description:
        "Turn your experience into specific CV bullets and prepare a short cover letter for one vacancy.",
      title: "Write a tailored CV and cover letter",
    },
    {
      description:
        "Practice interview answers using examples of your work, projects, or volunteering.",
      title: "Prepare for interviews",
    },
    {
      description:
        "Check the submission instructions, track your applications, and plan when to follow up.",
      title: "Apply and follow up",
    },
  ],
  slug: "job-search-foundations",
  title: "Job Search Foundations",
  videoId: "BaW_AA8SmY0",
};

export const courses = [
  { ...careerCourse, price: 990 },
  {
    audience:
      "For applicants who want to tailor their documents to a specific vacancy.",
    description:
      "Build a readable CV and write a cover letter using evidence from your own experience.",
    lessons: [
      {
        description:
          "Identify the requirements your application needs to address.",
        title: "Read the vacancy",
      },
      {
        description:
          "Describe your contribution and the result in each example.",
        title: "Write experience bullets",
      },
      {
        description:
          "Use the checklist to connect your strongest examples to the role.",
        title: "Draft and review a letter",
      },
    ],
    price: 590,
    slug: "cv-and-cover-letter",
    title: "CV and Cover Letter",
  },
  {
    audience: "For anyone preparing for a first or upcoming interview.",
    description:
      "Prepare examples, rehearse common questions, and plan what to ask the interviewer.",
    lessons: [
      {
        description:
          "Review the employer and choose examples that match the work.",
        title: "Research the role",
      },
      {
        description:
          "Use the STAR method and a mock interview to make your examples clearer.",
        title: "Practice structured answers",
      },
      {
        description:
          "Create a preparation checklist and draft your follow-up message.",
        title: "Prepare for interview day",
      },
    ],
    price: 790,
    slug: "interview-preparation",
    title: "Interview Preparation",
  },
];

export function courseTelegramLink(title: string) {
  const message = encodeURIComponent(
    `Hi Etenesh, I'd like to ask about ${title}.`
  );
  return `https://t.me/eteneshinsights?text=${message}`;
}
