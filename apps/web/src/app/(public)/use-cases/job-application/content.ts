import type { BeforeAfterScenario } from "@/app/(public)/(landingPage)/_components/beforeAfter/scenarios";
import { PLAN_LIMITS, formatFileSize } from "@convoform/common";
import { BETA_LIMITS } from "@convoform/file-storage/constants";

import { JOB_PROFILE } from "./jobApplicationStory";

export const steps = [
  {
    title: "Describe the role and what each answer needs",
    body: 'List the fields you need and what a complete answer looks like, such as experience in years, CTC in LPA (current and expected), and notice period in days or "Immediate". Review the generated form before you share it.',
  },
  {
    title: "Share the link with your job post",
    body: "Publish the form and share the link in your job post, careers page, LinkedIn post or WhatsApp replies. When an answer doesn't meet a field's requirements, ConvoForm can ask a follow-up before moving on.",
  },
  {
    title: "Review answers before you call",
    body: "See each answer with the full conversation. Export to CSV or send to Google Sheets, then decide who to call. Your team still verifies details and makes every hiring decision.",
  },
] as const;

export type JobFieldId =
  | "role"
  | "experience"
  | "ctc"
  | "notice"
  | "location"
  | "links";

export const jobFields: ReadonlyArray<{
  id: JobFieldId;
  label: string;
  detail: string;
  ask: string;
  why: string;
  example: string;
}> = [
  {
    id: "role",
    label: "Role",
    detail: "The opening they're applying for",
    ask: "Which role are you applying for?",
    why: "Keep applications for different openings apart",
    example: "Frontend Developer",
  },
  {
    id: "experience",
    label: "Experience",
    detail: "Total and relevant experience, in years",
    ask: "How many years of experience do you have, and in what?",
    why: "Compare candidates on the same scale",
    example: '3-4 → "Closer to 3 or 4?" → 4 yrs (React)',
  },
  {
    id: "ctc",
    label: "CTC",
    detail: "Current and expected CTC, in LPA",
    ask: "What's your current CTC, and what are you expecting?",
    why: "Know early whether the role's budget fits",
    example:
      '6 → "Is ₹6 LPA your current CTC, or what you\'re expecting?" → ₹6 LPA → ₹8 LPA',
  },
  {
    id: "notice",
    label: "Notice period",
    detail: `Days, "Immediate", or last working day if already serving notice`,
    ask: "What's your notice period?",
    why: "Plan a realistic joining date",
    example:
      'soon → "Are you serving notice now? If so, what\'s your last working day?" → Immediate',
  },
  {
    id: "location",
    label: "Location",
    detail: "Current city, and whether they can relocate or come on-site",
    ask: "Where are you based, and can you work from Bengaluru?",
    why: "Avoid calls with candidates who can't work from your location",
    example: "Pune, open to Bengaluru",
  },
  {
    id: "links",
    label: "Links",
    detail: "LinkedIn, portfolio or GitHub",
    ask: "Share your LinkedIn or a link to your work.",
    why: "See work before the call",
    example: "LinkedIn + GitHub",
  },
];

export const availableToday = [
  "Create a conversational form and describe what each answer should contain, or import an existing Google Form.",
  "Share one link anywhere: job posts, your careers page, LinkedIn, WhatsApp or Instagram. When an answer is unclear, ConvoForm can ask a follow-up.",
  "Add a CV upload: one PDF or JPG up to 5 MB per response.",
  "Review each answer with the conversation, export to CSV or send to Google Sheets.",
] as const;

export const notIncludedToday = [
  "ConvoForm collects answers. It doesn't rank, shortlist or reject candidates, read CVs, schedule interviews, message candidates on WhatsApp, or send applicants into an ATS. Your team does the screening and follow-up.",
  "AI can misunderstand an answer. Saved answers aren't verified salary, employment or background checks. Confirm important details with the candidate.",
] as const;

const betaResponses = PLAN_LIMITS.FREE_RESPONSES;
const betaStorage = formatFileSize(BETA_LIMITS.MAX_STORAGE_PER_ORG);
const maxFileSize = formatFileSize(BETA_LIMITS.MAX_FILE_SIZE);
const retentionDays = BETA_LIMITS.RETENTION_DAYS;

export const faqs = [
  {
    question: "What should a job application form ask?",
    answer:
      "Start with role, experience, current and expected CTC, notice period, location and a LinkedIn or portfolio link, plus your contact fields. Add role-specific questions, such as shifts for store staff or a portfolio for designers. Ask only for what you'll use.",
  },
  {
    question: "How is this different from a Google Form?",
    answer:
      "A Google Form saves whatever the candidate types. With ConvoForm you describe what each answer needs, like CTC in LPA or notice period in days, and it can ask a follow-up when an answer doesn't meet that before moving on. You can import an existing Google Form to start.",
  },
  {
    question: "Does ConvoForm screen or reject candidates?",
    answer:
      "No. It collects answers and asks follow-ups. It doesn't score, rank, shortlist or reject anyone. Your team reviews the answers and makes every hiring decision.",
  },
  {
    question: "Can candidates upload a CV?",
    answer:
      "Yes. Add a file upload field. In the beta, candidates can attach one PDF or JPG up to 5 MB per response, and files are kept for 30 days. Word files aren't supported, and ConvoForm doesn't read or parse CVs.",
  },
  {
    question: "Can I share it on WhatsApp or LinkedIn?",
    answer:
      "Yes. Share the form link in a job post, a WhatsApp message or group, LinkedIn or Instagram. Candidates open it in their browser. ConvoForm doesn't run inside WhatsApp and doesn't send WhatsApp messages.",
  },
  {
    question: "Can I use one form for several openings?",
    answer:
      "Yes. Add a role field with your open positions as choices, or create one form per role if the questions differ.",
  },
  {
    question: "Does it replace our ATS or job portal?",
    answer:
      "No. ConvoForm gives you a link and clear answers. Export to CSV or send to Google Sheets, then move candidates into the tools you already use. There's no direct ATS integration today.",
  },
  {
    question: "Is it free?",
    answer: `Yes. ConvoForm is in beta, and every feature is free while we're in beta. The beta limits are ${betaResponses} responses per organization and ${betaStorage} of file storage (files up to ${maxFileSize} each, kept for ${retentionDays} days).`,
  },
] as const;

export const candidateProfile = {
  title: "Candidate profile",
  caption:
    "Collected information stores shorter values, like “4 yrs (React)” or “₹6 LPA current · ₹8 LPA expected”.",
  fields: JOB_PROFILE,
} as const;

export const jobApplicationScenario: BeforeAfterScenario = {
  id: "job",
  tab: "Job application",
  panelTitle: "Job application",
  fieldLabel: "CTC *",
  typed: "6",
  staticNote:
    "Saved as typed. Your recruiter still has to call to ask what 6 means.",
  saved: "₹6 LPA → ₹8 LPA",
  messages: [
    {
      kind: "ai",
      text: "What's your current CTC, and what are you expecting?",
    },
    { kind: "user", text: "6", vague: true },
    {
      kind: "followUp",
      text: "Is ₹6 LPA your current CTC, or what you're expecting?",
    },
    { kind: "user", text: "current. expecting 8" },
  ],
  values: [
    { key: "Role", value: "Frontend Developer" },
    { key: "Experience", value: "4 yrs (React)" },
    { key: "CTC", value: "₹6 LPA → ₹8 LPA", highlighted: true },
    { key: "Notice", value: "Immediate" },
    { key: "Location", value: "Pune → Bengaluru OK" },
    { key: "Links", value: "LinkedIn, GitHub" },
  ],
};
