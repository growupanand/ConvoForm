import type { BeforeAfterScenario } from "@/app/(public)/(landingPage)/_components/beforeAfter/scenarios";

export const steps = [
  {
    title: "Define the profile you need",
    body: "Describe the fields you need, including a budget with its currency and scope, marks with a grading scale, and an intake with its year. Review the generated form before you share it.",
  },
  {
    title: "Share the form link",
    body: "Publish the form and share its link from your website, social bio or enquiry replies. When an answer does not meet a field, ConvoForm can ask a follow-up before it saves the answer and moves on.",
  },
  {
    title: "Review the answers before following up",
    body: "Review the collected answers and the conversation, then decide what still needs checking. A counsellor still needs to verify the student's details and assess suitable options.",
  },
] as const;

export type IntakeFieldId =
  | "destination"
  | "course"
  | "intake"
  | "marks"
  | "budget"
  | "tests";

export const intakeFields: ReadonlyArray<{
  id: IntakeFieldId;
  detail: string;
  ask: string;
  why: string;
  example: string;
}> = [
  {
    id: "destination",
    detail: "Destination",
    ask: "Preferred country, or that the student is still exploring",
    why: "Establish the starting point without treating uncertainty as a bad lead",
    example: "Canada, UK",
  },
  {
    id: "course",
    detail: "Course",
    ask: "Subject area and intended level of study",
    why: "Understand what the student wants to pursue",
    example: "Master's, Computer Science",
  },
  {
    id: "intake",
    detail: "Intake",
    ask: "Preferred start month or term, with the year",
    why: "Understand the student's timeline",
    example: "September 2027",
  },
  {
    id: "marks",
    detail: "Marks",
    ask: "Latest qualification, marks or CGPA, and grading scale",
    why: "Prepare for an academic-profile discussion",
    example: "84%",
  },
  {
    id: "budget",
    detail: "Budget",
    ask: "Approximate amount, currency, and whether it includes living costs",
    why: "Start a realistic conversation about affordability",
    example: "₹20 lakh per year, tuition + living",
  },
  {
    id: "tests",
    detail: "Tests",
    ask: "Relevant test, score if taken, or current preparation status",
    why: "Know what is already available and what needs planning",
    example: "IELTS not taken yet",
  },
];

export const availableToday = [
  "Create a conversational form and describe what each answer should contain.",
  "Publish a link. When an answer does not meet a field, ConvoForm can ask a follow-up.",
  "Review the collected answers and the conversation before you follow up.",
] as const;

export const notIncludedToday = [
  "Today, ConvoForm collects answers and lets your team review the conversation. It does not score leads, send WhatsApp summaries or book counselling appointments. Your team handles follow-up.",
  "AI can misunderstand an answer. Accepted answers are not verified academic records, proof of funds or an admissions assessment. Review important details with the student.",
] as const;

export const faqs = [
  {
    question: "What should a study-abroad enquiry form collect?",
    answer:
      "Start with destination, course, intake, marks, budget and test status. Include enough detail to make the answers usable, such as the intake year, grading scale and budget currency. Collect only the additional personal information your team actually needs for follow-up.",
  },
  {
    question: "How is this different from a standard enquiry form?",
    answer:
      "A standard form collects values in fields. ConvoForm asks for those values through a conversation and can generate a clarification when an answer doesn't meet the field requirements. You still control the information to collect; the AI generates the wording of the questions.",
  },
  {
    question: "Is this just conditional branching?",
    answer:
      "Not in its core follow-up flow. Conditional branching selects a question or path you've set up. ConvoForm generates a question using the current field and conversation context when an answer needs clarification. It then continues through the configured fields. That doesn't mean the AI can run an unrestricted counselling conversation or make admissions decisions.",
  },
  {
    question:
      "Can students answer if they haven't taken IELTS or chosen a country?",
    answer:
      'Design the relevant fields to accept that status. "Not taken yet" or "still deciding" can be useful information for a counsellor. Test the form before sharing it so the requirements don\'t force a score or a destination from a student who doesn\'t have one.',
  },
  {
    question: "Can I use it for enquiries from Instagram or WhatsApp?",
    answer:
      "You can share the published web-form link in your social bio or enquiry replies. The student completes the conversation on the web. Sharing a link through WhatsApp is different from running the intake inside WhatsApp. ConvoForm does not send WhatsApp summaries or run a native WhatsApp bot.",
  },
  {
    question: "Does ConvoForm automatically qualify or rank students?",
    answer:
      "It checks whether an answer satisfies a form field's requirements. That's different from deciding whether a student is ready to apply or ranking a sales lead. Your team still reviews the profile and decides what to do next.",
  },
  {
    question: "Will it recommend universities or assess visa eligibility?",
    answer:
      "This intake collects information. It isn't a university-matching service or a visa adviser. Your counsellors remain responsible for recommendations, current entry requirements and any visa guidance.",
  },
  {
    question: "Does it replace our CRM or follow-up process?",
    answer:
      "No. ConvoForm collects answers and lets your team review the conversation. It does not hand off to a CRM, book a counselling appointment, or send follow-up messages. Your team handles follow-up.",
  },
] as const;

const profileFields: ReadonlyArray<{
  key: string;
  value: string;
  highlighted?: boolean;
}> = [
  { key: "Destination", value: "Canada, UK" },
  { key: "Course", value: "Master's, Computer Science" },
  { key: "Intake", value: "September 2027" },
  { key: "Marks", value: "84%" },
  {
    key: "Budget",
    value: "₹20 lakh per year, tuition + living",
    highlighted: true,
  },
  { key: "Tests", value: "IELTS not taken yet" },
];

export const studentProfile = {
  title: "Student profile",
  caption:
    "Collected information stores shorter values, like “84%” or “₹20 lakh per year, tuition + living”.",
  fields: profileFields,
} as const;

export const studyAbroadScenario: BeforeAfterScenario = {
  id: "study",
  tab: "Study abroad",
  panelTitle: "Study abroad enquiry",
  fieldLabel: "Budget *",
  typed: "20",
  staticNote:
    "Saved as typed. Your counsellor still has to call to ask 20 what, and for what.",
  saved: "₹20 lakh per year, tuition + living",
  messages: [
    {
      kind: "ai",
      text: "What budget do you have in mind for your studies?",
    },
    { kind: "user", text: "20", vague: true },
    {
      kind: "followUp",
      text: "Thanks! Is that in INR, and does 20 cover tuition only or living costs too?",
    },
    { kind: "user", text: "20 lakh INR a year, incl. living" },
  ],
  values: [
    { key: "Destination", value: "Canada, UK" },
    { key: "Course", value: "Master's, CS" },
    { key: "Intake", value: "Sept 2027" },
    { key: "Marks", value: "84%" },
    {
      key: "Budget",
      value: "₹20 lakh/yr, tuition + living",
      highlighted: true,
    },
    { key: "Tests", value: "IELTS not taken yet" },
  ],
};
