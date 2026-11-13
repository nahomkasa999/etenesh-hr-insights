export interface MarketingLink {
  href: string;
  label: string;
}

export interface MarketingLinkColumn {
  items: MarketingLink[];
  title: string;
}

export const MARKETING_HEADER_LINKS: MarketingLink[] = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/#courses", label: "Courses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export const MARKETING_FOOTER_COLUMNS: MarketingLinkColumn[] = [
  {
    items: [
      { href: "/jobs", label: "Browse jobs" },
      { href: "/companies", label: "Companies" },
      { href: "/saved", label: "Saved jobs" },
      { href: "/#how-it-works", label: "How it works" },
    ],
    title: "Job seekers",
  },
  {
    items: [
      { href: "/#courses", label: "Courses" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#employers", label: "For employers" },
    ],
    title: "Learn",
  },
  {
    items: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/dashboard", label: "Sign in" },
    ],
    title: "Company",
  },
];
