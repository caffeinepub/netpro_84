export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Engineering",
  "Sales",
  "Legal",
  "Consulting",
  "Media",
  "Other",
];

export const EXPERIENCE_LEVELS = [
  "Entry",
  "Mid",
  "Senior",
  "Director",
  "Executive",
];

export const POST_TYPES = ["Article", "Question", "Insight"] as const;
export type PostTypeStr = (typeof POST_TYPES)[number];
