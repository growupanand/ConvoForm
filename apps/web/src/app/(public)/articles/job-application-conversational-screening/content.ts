import {
  jobApplicationScenario,
  jobFields,
} from "@/app/(public)/use-cases/job-application/content";
import {
  jobApplicationArticlePath,
  jobApplicationUseCasePath,
  studyAbroadArticlePath,
} from "@/lib/marketingPaths";

/** The article reuses the use-case fields so both pages tell the same story. */
export { jobApplicationScenario, jobFields };

export const article = {
  path: jobApplicationArticlePath,
  title: "AI Follow-ups vs. Branching in Job Application Screening",
  headlineLead: "A branch routes the answer.",
  headlineAccent: "A follow-up asks what it means.",
  headline: "A branch routes the answer. A follow-up asks what it means.",
  description:
    "A candidate types “6” for CTC. Scripted branching can only route on answers you planned for. A follow-up asks whether that 6 is current or expected pay, using ConvoForm’s six-field job application.",
  eyebrow: "Article · Job applications",
  publishedAt: "2026-11-08",
  publishedLabel: "8 November 2026",
  readingTime: "9 min read",
  author: {
    name: "Utkarsh Anand",
    role: "Founder, ConvoForm",
    url: "https://www.linkedin.com/in/utkarshanand93/",
  },
  keywords: [
    "job application screening form",
    "AI follow-up questions",
    "conversational screening form",
    "conditional branching vs AI forms",
    "Typeform style branching alternative",
    "candidate CTC question",
    "AI job application form",
  ],
  links: {
    useCase: jobApplicationUseCasePath,
    studyAbroadArticle: studyAbroadArticlePath,
    docs: "https://docs.convoform.com",
    formCreationDocs: "https://docs.convoform.com/concepts/form-creation",
    demo: "/view/demo",
    homeDemo: "/#demo",
  },
} as const;

export const introduction = {
  lead: "Most screening calls begin with questions the form was supposed to answer. Then a candidate writes “6” under CTC, and the call starts with a translation.",
  paragraphs: [
    "A job application asks for the facts a recruiter needs before a conversation: the role, years of experience, current and expected pay, notice period, location, and somewhere to see the candidate’s work. The fields are not complicated. The answers are.",
    "A plain form stores what was typed. A form with scripted logic routes on it. ConvoForm’s job-application use case takes a third approach: when an answer is too thin for the field’s description, it can ask a follow-up written for that answer. CTC is the cleanest place to see the difference, because “6” is an entirely normal thing for a candidate to type.",
    "This is a product example, not a customer story. It uses the same six fields and the same scenario that render the job-application use-case page, and the data on both pages is illustrative.",
  ],
  glance: [
    "A branch selects a path you wrote before the form was shared.",
    "A follow-up is generated for the answer that just arrived, scoped to a field you configured.",
    "The saved CTC answer goes from “6” to ₹6 LPA current and ₹8 LPA expected.",
  ],
} as const;

export const branchingSection = {
  eyebrow: "01 — Scripted branching",
  heading: "A branch is a decision made without the answer",
  paragraphs: [
    "Screening logic is usually a script. If the candidate needs visa sponsorship, show these questions. If they cannot relocate, stop. If the role is sales, ask about quota. Every condition is written before the first application arrives, because whoever builds the form has to decide what every possible answer means.",
    "That is the right shape for closed questions. Work authorization, shift availability, a required licence, or a fixed salary band can all be exact. A branch can prove that every candidate who answered “no” saw the same follow-up. For consistency and compliance, that is a real advantage.",
    "Free-text answers break the assumption that the options are known. CTC is the obvious one: a number without a unit, a period, or a distinction between current and expected pay. Notice period is close behind. “Soon” could mean two weeks, a month, or already serving notice. “3-4” years of experience is a range, not a figure.",
    "You can write branches for all of these. But each branch needs a condition, and each condition needs an answer format you predicted. The long tail — “6 fixed, 8 variable”, “₹6.5L”, “current 6, expecting 8-9”, “negotiable for the right role” — is where branches get expensive and the answers get flattened.",
  ],
  pullQuote:
    "A branch can choose a question. It cannot ask what the answer meant.",
} as const;

export const followUpSection = {
  eyebrow: "02 — AI follow-ups",
  heading: "A follow-up starts from the field’s description",
  paragraphs: [
    "In ConvoForm, a field is more than a label. The CTC field in the job-application form is described as “Current and expected CTC, in LPA”. That description is what the follow-up works from, together with the answer and the conversation so far.",
    "For the answer “6”, the follow-up can ask whether 6 is the current CTC or the expected one. The candidate replies “current. expecting 8”, and the answer saved for the recruiter becomes ₹6 LPA current and ₹8 LPA expected. The follow-up did not invent a salary. It asked the candidate to be precise about the one they had already given.",
    "The same mechanism applies to experience ranges and vague notice periods. “3-4” can produce a question about which end is closer. “Soon” can produce a question about whether notice is being served and when the last working day is. Each follow-up is composed for that answer, not selected from a list of pre-approved sentences.",
    "This is also the part that takes getting used to. You no longer know the exact wording every candidate will see. You do know which fields they will be asked about, and you can read the transcript afterward to see what was asked and what was saved.",
  ],
  pullQuote: "The field stays fixed. The question in the middle can change.",
} as const;

export const exampleSection = {
  eyebrow: "03 — The real example",
  heading: "The same six fields, and the answer “6”",
  paragraphs: [
    "The example below imports the fields and the scenario from the job-application use-case content, so the article and the product page cannot drift into two different stories.",
    "Each field carries the detail a recruiter needs, and the example column shows what a usable answer looks like once the detail is there.",
  ],
  tableLabel: "Imported from the job-application use-case content",
  sceneCaption:
    "The static form saves the answer exactly as typed: “6”. The conversational form asks whether that is current or expected CTC. The candidate answers “current. expecting 8”, and the recruiter sees ₹6 LPA current and ₹8 LPA expected before the call.",
  sceneNote:
    "No branch was written for the answer “6”. The follow-up was generated against the CTC field’s description and the conversation so far.",
  callout: {
    label: "What changed",
    body: "The follow-up did not verify the salary. It made the claim specific enough to use.",
  },
} as const;

export const notSection = {
  eyebrow: "04 — Scope",
  heading: "What a follow-up is not",
  paragraphs: [
    "A follow-up makes an answer clearer. It does not turn a job application into an assessment. These boundaries matter before you put a form in front of candidates.",
  ],
  items: [
    {
      title: "It is not a shortlisting tool",
      body: "ConvoForm does not score, rank, compare, shortlist, or reject candidates. It collects and clarifies the fields you configured; a person still decides who moves forward.",
    },
    {
      title: "It is not a background check",
      body: "A clarified CTC, notice period, or experience figure is still what the candidate said. Nothing is verified against payslips, offer letters, or references.",
    },
    {
      title: "It is not an interview",
      body: "The follow-up is scoped to the current field. It does not assess motivation, culture fit, or communication style, and it does not hold an open conversation.",
    },
    {
      title: "It is not a CV reader",
      body: "Candidates can attach a CV for a recruiter to open, but ConvoForm does not parse or read it. The answer you review comes from the conversation you configured.",
    },
    {
      title: "It is not your ATS",
      body: "Answers can be exported to CSV or sent to Google Sheets. There is no direct ATS integration today, and ConvoForm does not schedule interviews or message candidates.",
    },
    {
      title: "It is not deterministic",
      body: "The same unclear answer can produce different follow-up wording on different runs. Read the conversation before acting on an important detail.",
    },
  ],
} as const;

export const limitationsSection = {
  eyebrow: "05 — Limitations",
  heading: "Limitations, stated plainly",
  paragraphs: [
    "The point of a follow-up is a clearer answer, not a more impressive demo. These are the limits a hiring team should know before using one in a live application.",
  ],
  items: [
    {
      title: "Follow-ups are not verification",
      body: "Salary, notice period, experience, and work authorization are claims until you check them. A clarified answer is easier to discuss, not proof that it is true.",
    },
    {
      title: "The AI can misread a candidate",
      body: "A follow-up may accept an answer that is still vague, or ask for a detail that misses the point. Reviewing the conversation is part of the workflow, not an optional extra.",
    },
    {
      title: "Wording varies between runs",
      body: "Two candidates can get different sentences for the same kind of answer. If a question must be identical for every applicant, use a fixed question or a scripted branch.",
    },
    {
      title: "Field descriptions set the ceiling",
      body: "The model works inside what you describe. “Current and expected CTC, in LPA” gives it something to check; “CTC” does not. The quality of the field definition still matters.",
    },
    {
      title: "Hiring rules still apply",
      body: "A generated follow-up does not replace your policies on equal opportunity, candidate consent, data retention, or anything else your process requires. You remain responsible for the questions you ask.",
    },
    {
      title: "A recruiter still decides",
      body: "ConvoForm gives the first call a better starting point. Your team reviews the answers, verifies what matters, and makes every hiring decision.",
    },
  ],
} as const;

export const chooseSection = {
  eyebrow: "06 — Choosing",
  heading: "When a scripted branch is still the right tool",
  paragraphs: [
    "Branching and follow-ups are not competing answers to the same question. They are different answers to different questions.",
  ],
  branching: {
    title: "Keep a scripted branch when…",
    items: [
      "The answers are a closed set: authorization, shifts, licences, fixed salary bands.",
      "Every candidate must see the same question in the same order.",
      "The routing affects eligibility, consent, or a legal requirement.",
      "You need to audit every path before the form goes live.",
    ],
  },
  followUp: {
    title: "Use a generated follow-up when…",
    items: [
      "The answer is free text with many partial, informal versions.",
      "The missing detail depends on what the candidate already said.",
      "You want clarification, not a detour to another question.",
      "A recruiter reads the conversation before deciding the next step.",
    ],
  },
  closing:
    "A screening form can use both. Branch where the answer must be exact. Follow up where the answer needs to be understood. The mistake is expecting a generated follow-up to behave like a branch — it will not ask the same question every time, and it will not make the decision for you.",
} as const;

export const relatedArticle = {
  eyebrow: "Related article",
  heading: "The same distinction, applied to a student budget",
  body: "The study-abroad article uses the same comparison on a different field: a student types “20” for budget, and the follow-up asks for the currency and what the amount covers. If you want the mechanism without the hiring context, start there.",
  linkLabel: "Read the study-abroad article",
} as const;

export const cta = {
  eyebrow: "See it in context",
  heading: "See the screening form this article describes",
  body: "The job-application use-case page walks through the same six fields, the same CTC follow-up, and what ConvoForm does not do today. The demo lets you try a conversational form before you create one.",
  primaryLabel: "See the job-application use case",
  secondaryLabel: "Try the demo form",
  docsLabel: "docs",
  homeDemoLabel: "try the live demo on the homepage",
  buildNote:
    "Prefer to build? Create a screening form, share it with the role, and test a few unclear answers before candidates arrive.",
  quote: "A branch routes the answer. A follow-up asks what it means.",
} as const;
