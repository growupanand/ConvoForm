// The job-application hero's example data, shared by the animated scene and
// its static frames so the first paint, the poster and the live run never
// drift apart.

export type JobMessage = {
  from: "me" | "them";
  text: string;
  followUp?: boolean;
};

export const JOB_MESSAGES: readonly JobMessage[] = [
  {
    from: "them",
    text: "What's your current CTC, and what are you expecting?",
  },
  { from: "me", text: "6" },
  {
    from: "them",
    text: "Is ₹6 LPA your current CTC, or what you're expecting?",
    followUp: true,
  },
  { from: "me", text: "current. expecting 8" },
] as const;

/** The candidate profile the conversation produces, in grid order. */
export const JOB_PROFILE: ReadonlyArray<{
  key: string;
  value: string;
  highlighted?: boolean;
}> = [
  { key: "Role", value: "Frontend Developer" },
  { key: "Experience", value: "4 yrs (React)" },
  {
    key: "CTC",
    value: "₹6 LPA current · ₹8 LPA expected",
    highlighted: true,
  },
  { key: "Notice period", value: "Immediate" },
  { key: "Location", value: "Pune, open to Bengaluru" },
  { key: "Links", value: "LinkedIn + GitHub" },
] as const;
