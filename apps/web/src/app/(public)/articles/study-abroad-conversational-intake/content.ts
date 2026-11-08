import {
  intakeFields,
  studyAbroadScenario,
} from "@/app/(public)/use-cases/study-abroad/content";
import {
  studyAbroadArticlePath,
  studyAbroadUseCasePath,
} from "@/lib/marketingPaths";

/** The article reuses the use-case intake so both pages tell the same story. */
export { intakeFields, studyAbroadScenario };

export const article = {
  path: studyAbroadArticlePath,
  title: "AI Follow-ups vs. Typeform-Style Branching",
  headlineLead: "Branching picks a path.",
  headlineAccent: "A follow-up writes the question you didn’t.",
  headline:
    "Branching picks a path. A follow-up writes the question you didn’t.",
  description:
    "Scripted branching chooses from paths you wrote in advance. An AI follow-up writes a clarification for the answer it just received. A real six-field study-abroad intake shows the difference.",
  eyebrow: "Article · Study abroad",
  publishedAt: "2026-11-08",
  publishedLabel: "8 November 2026",
  readingTime: "8 min read",
  author: {
    name: "Utkarsh Anand",
    role: "Founder, ConvoForm",
    url: "https://www.linkedin.com/in/utkarshanand93/",
  },
  keywords: [
    "AI follow-up questions",
    "conversational forms vs conditional branching",
    "Typeform style branching",
    "AI student intake form",
    "study abroad enquiry form",
    "conversational intake form",
    "AI form follow-up questions",
  ],
  links: {
    useCase: studyAbroadUseCasePath,
    docs: "https://docs.convoform.com",
    formCreationDocs: "https://docs.convoform.com/concepts/form-creation",
    demo: "/view/demo",
    homeDemo: "/#demo",
  },
} as const;

export const introduction = {
  lead: "Both approaches can ask a second question. The difference is who wrote it: you, in advance, or the system, for the answer in front of it.",
  paragraphs: [
    "Most form builders treat a conversation as a decision tree. You add a question, define the answers, and connect each one to what comes next. Typeform-style logic made that model familiar, and it is genuinely useful.",
    "ConvoForm takes a different route for open-ended answers. It still collects the fields you define. But when an answer does not satisfy a field’s description, it can write a follow-up question for that specific answer instead of choosing from branches you prepared.",
    "The distinction is easy to blur in a demo and important in practice. This article uses the study-abroad intake from ConvoForm’s use-case page to make it concrete.",
  ],
  glance: [
    "Scripted branching selects among questions you wrote.",
    "An AI follow-up generates a clarification scoped to a field you configured.",
    "Your field list stays fixed; the wording of the follow-up does not.",
  ],
} as const;

export const branchingSection = {
  eyebrow: "01 — Scripted branching",
  heading: "A branch is logic you author in advance",
  paragraphs: [
    "A scripted branch starts with a condition. If the student picks Canada, ask for IELTS. If the budget is under a threshold, show a scholarship question. You define the options and connect each outcome to the next step. Before anyone opens the form, every route already exists.",
    "That determinism is a real advantage. You can test every path, point to the exact question a respondent will see, and explain the flow to a colleague. For consent, eligibility rules, or a questionnaire with a fixed set of answers, a branch is often the right tool.",
    "The limit appears when the answer is free text. Ask for a budget and a student might type “20”, “20 lakh”, “about 20L including living”, “not sure yet”, or a currency you did not anticipate. A branch can only react to conditions you wrote. To cover the long tail you add more branches, or you reduce the answer to options that lose the detail you wanted.",
  ],
  pullQuote: "A branch can only choose from questions you already wrote.",
} as const;

export const followUpSection = {
  eyebrow: "02 — AI follow-ups",
  heading: "A follow-up is written for the answer",
  paragraphs: [
    "ConvoForm starts with fields, not a decision tree. For each field, you describe what a complete answer should include. The study-abroad intake has six: destination, course, intake, marks, budget, and tests. The descriptions carry the detail a counsellor needs — a budget with its currency and scope, marks with a grading scale, an intake with its year.",
    "When an answer does not satisfy a field’s description, ConvoForm can generate a follow-up using the field, its requirements, and the conversation so far. It is not selecting a branch. It is composing the specific question that is missing, then storing the clarified answer and moving on through the configured fields.",
    "This changes what you can promise. You give up the guarantee that every follow-up sentence was written or approved by you. You gain a question that can meet an answer you did not predict. The field definitions and the full transcript stay readable, so your team can see what was asked and what was saved.",
  ],
  pullQuote: "A follow-up can ask for a detail you never thought to branch on.",
} as const;

export const exampleSection = {
  eyebrow: "03 — The real example",
  heading: "The same six fields, one unfinished answer",
  paragraphs: [
    "The example below comes from the same content that renders the study-abroad use-case page. It is a product example, not a customer testimonial; the use-case page labels it as illustrative data.",
    "These are the six fields, with the detail each one asks for and the kind of answer a counsellor can use.",
  ],
  tableLabel: "Imported from the study-abroad use-case content",
  sceneCaption:
    "The static form saves exactly what was typed: “20”. The conversational form asks whether 20 is in INR and whether it covers tuition, living, or both. The student answers “20 lakh INR a year, incl. living”. What the counsellor reviews is “₹20 lakh per year, tuition + living”.",
  sceneNote:
    "No branch was written for the answer “20”. The follow-up was generated against the budget field’s description and the conversation so far.",
  callout: {
    label: "What changed",
    body: "The follow-up did not make the budget true. It made it specific enough to discuss.",
  },
} as const;

export const notSection = {
  eyebrow: "04 — Scope",
  heading: "What an AI follow-up is not",
  paragraphs: [
    "The mechanism is narrower than “an AI that chats with students”. These boundaries matter when you decide where to use it.",
  ],
  items: [
    {
      title: "It is not validation",
      body: "An accepted answer means the field’s description was satisfied — not that a transcript, bank statement, or test score was checked. The student can still be wrong, approximate, or optimistic.",
    },
    {
      title: "It is not qualification or ranking",
      body: "ConvoForm does not decide whether a student is a good lead, ready to apply, or admissible. It collects what you asked for so a person can decide what happens next.",
    },
    {
      title: "It is not a counsellor",
      body: "It does not recommend universities, assess visa eligibility, or run an unrestricted conversation. It asks about the fields you configured.",
    },
    {
      title: "It is not deterministic",
      body: "The same unclear answer can produce different follow-up wording on different runs. Read the conversation before acting on an important detail.",
    },
    {
      title: "It is not an open-ended chat",
      body: "The follow-up is scoped to the current field. The AI does not add new topics or wander away from the intake you designed.",
    },
    {
      title: "It is not a replacement for review",
      body: "Your team still reads the answers, checks what matters, and decides how to follow up. The transcript is there to make that review easier.",
    },
  ],
} as const;

export const limitationsSection = {
  eyebrow: "05 — Limitations",
  heading: "Limitations, stated plainly",
  paragraphs: [
    "A follow-up improves the detail of an answer. It does not make the answer authoritative. These are the limits we would want a counsellor to know before relying on the transcript.",
  ],
  items: [
    {
      title: "Follow-ups are not verification",
      body: "A clarified answer is still a student’s claim, not a checked document. Grades, budgets, and test status need the same verification you would do for any enquiry.",
    },
    {
      title: "The AI can misread an answer",
      body: "A follow-up may miss the detail you wanted, or accept a response that is still vague. Reviewing the conversation is part of the workflow, not an optional extra.",
    },
    {
      title: "Field descriptions set the ceiling",
      body: "Vague requirements produce vague follow-ups. The model works within what you describe, so the quality of the field definition still matters.",
    },
    {
      title: "Wording changes between runs",
      body: "If your process requires every respondent to see identical questions, use scripted branching. Generated wording is not a fixed script.",
    },
    {
      title: "This is a bounded intake",
      body: "It collects the fields you configure. It does not hold an open counselling conversation or make admissions decisions.",
    },
    {
      title: "A counsellor still decides",
      body: "ConvoForm collects context. Your counsellors verify details, assess suitable options, and make the recommendation.",
    },
  ],
} as const;

export const chooseSection = {
  eyebrow: "06 — Choosing",
  heading: "When scripted branching is still the better tool",
  paragraphs: [
    "The point is not that branching is obsolete. It is that branching and a generated follow-up solve different problems.",
  ],
  branching: {
    title: "Keep a scripted branch when…",
    items: [
      "The exact path must be identical for every respondent.",
      "The answers are a fixed set and every route is known in advance.",
      "Routing changes consent, eligibility, or compliance.",
      "You need to audit the full flow question by question.",
    ],
  },
  followUp: {
    title: "Use a generated follow-up when…",
    items: [
      "The answer is free text with a long tail of incomplete versions.",
      "You need a specific clarification, not a pre-written path.",
      "The detail needed depends on what the student already said.",
      "Your team reviews a transcript and makes the next decision.",
    ],
  },
  closing:
    "They are different tools. Use branching where the path must be exact, and a conversational field where the answer needs interpreting. The mistake is assuming they are the same mechanism because both can ask a second question.",
} as const;

export const cta = {
  eyebrow: "See it in context",
  heading: "See the intake this article describes",
  body: "The study-abroad use-case page walks through the same six fields, the same budget follow-up, and what ConvoForm does not do today. The demo lets you try a conversational form before you create one.",
  primaryLabel: "See the study-abroad use case",
  secondaryLabel: "Try the demo form",
  docsLabel: "docs",
  homeDemoLabel: "try the live demo on the homepage",
  buildNote:
    "Prefer to build? Create a student intake form and test a few unclear answers before you share it.",
  quote: "Branching picks a path. A follow-up writes the question you didn’t.",
} as const;
