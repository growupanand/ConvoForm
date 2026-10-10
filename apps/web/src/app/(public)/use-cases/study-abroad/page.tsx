import { nohemi } from "@/app/fonts/customFonts";
import { ScreenshotFrame } from "@/components/common/screenshotFrame";

import { studyAbroadUseCasePath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";
import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Student Intake Forms for Study Abroad Consultants",
  description:
    "Collect destination, course, intake, marks, budget and test details through an AI conversation. Give your study-abroad counsellors context before the first call.",
  keywords: [
    "student intake form for study abroad consultants",
    "study abroad enquiry form",
    "student profile collection",
    "conversational forms for education consultants",
    "study abroad lead qualification",
    "AI student intake form",
  ],
  alternates: {
    canonical: studyAbroadUseCasePath,
  },
  openGraph: {
    title: "Student Intake Forms for Study Abroad Consultants",
    description:
      "Collect destination, course, intake, marks, budget and test details through an AI conversation. Give your study-abroad counsellors context before the first call.",
    images: ["/api/og"],
  },
};

const steps = [
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

const intakeFields = [
  {
    detail: "Destination",
    ask: "Preferred country, or that the student is still exploring",
    why: "Establish the starting point without treating uncertainty as a bad lead",
  },
  {
    detail: "Course",
    ask: "Subject area and intended level of study",
    why: "Understand what the student wants to pursue",
  },
  {
    detail: "Intake",
    ask: "Preferred start month or term, with the year",
    why: "Understand the student's timeline",
  },
  {
    detail: "Marks",
    ask: "Latest qualification, marks or CGPA, and grading scale",
    why: "Prepare for an academic-profile discussion",
  },
  {
    detail: "Budget",
    ask: "Approximate amount, currency, and whether it includes living costs",
    why: "Start a realistic conversation about affordability",
  },
  {
    detail: "Tests",
    ask: "Relevant test, score if taken, or current preparation status",
    why: "Know what is already available and what needs planning",
  },
] as const;

const availableToday = [
  "Create a conversational form and describe what each answer should contain.",
  "Publish a link. When an answer does not meet a field, ConvoForm can ask a follow-up.",
  "Review the collected answers and the conversation before you follow up.",
] as const;

const faqs = [
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

const sectionSpacing = "mt-16 border-t pt-12 lg:mt-20";

function CreateIntakeLink() {
  return (
    <Button
      size="lg"
      className="rounded-full px-6 font-montserrat text-base"
      asChild
    >
      <Link href="/auth/register" rel="noreferrer nofollow noopener">
        Create a student intake form
      </Link>
    </Button>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "text-3xl leading-tight text-foreground lg:text-4xl",
        nohemi.className,
      )}
    >
      {children}
    </h2>
  );
}

export default function StudyAbroadUseCasePage() {
  return (
    <main className="container pb-24 pt-8 lg:pt-14">
      <header className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1
            className={cn(
              "max-w-xl text-4xl leading-tight text-foreground lg:text-5xl lg:leading-tight",
              nohemi.className,
            )}
          >
            Start counselling with a student profile, not a blank slate
          </h1>
          <p className="mt-5 text-lg text-foreground">
            AI student intake forms for study-abroad consultancies
          </p>
          <p className="mt-4 max-w-prose text-base leading-7 text-foreground">
            Collect destination, course, intake, marks, budget and test status
            before the first call. Students answer in their own words; ConvoForm
            can ask a follow-up when details are unclear.
          </p>
          <div className="mt-8">
            <CreateIntakeLink />
          </div>
          <p className="mt-4 max-w-prose text-sm leading-6 text-foreground">
            Your counsellors make the recommendations. ConvoForm helps collect
            the context.
          </p>
        </div>
        <ScreenshotFrame
          src="/images/use-cases/study-abroad/budget-clarification.png"
          alt="ConvoForm follow-up asking whether 20k covers tuition only or also living costs"
          caption="This follow-up asks for the currency and whether the amount covers tuition or living costs. It refers to “20k”, not the amount as typed."
          width={782}
          height={250}
          browser
          priority
        />
      </header>

      <section
        className={cn(sectionSpacing, "mx-auto max-w-prose")}
        aria-labelledby="pain-heading"
      >
        <SectionHeading id="pain-heading">
          A name and phone number aren&apos;t enough to start counselling
        </SectionHeading>
        <div className="mt-6 space-y-4 text-base leading-7 text-foreground">
          <p>
            An enquiry often arrives with a name and a phone number. Country,
            course, intake, marks, budget and test status still have to come out
            before counselling can be useful.
          </p>
          <p>
            A standard form can ask for a currency and a test status directly.
            Free-text still needs a follow-up when the meaning is unclear: a
            budget of &quot;20&quot; does not say the currency or what the
            amount covers, and &quot;not yet&quot; is a status, not a score.
          </p>
        </div>
      </section>

      <section className={sectionSpacing} aria-labelledby="steps-heading">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading id="steps-heading">
              Keep the fields. Change how you ask for them.
            </SectionHeading>
            <p className="mt-6 max-w-prose text-base leading-7 text-foreground">
              You decide which details matter. ConvoForm asks for them in a
              conversation, and can follow up when an answer is unclear.
            </p>
            <ol className="mt-8 list-none space-y-8 p-0">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-2"
                >
                  <span
                    className={cn(
                      "pt-0.5 text-2xl leading-none text-brand-600",
                      nohemi.className,
                    )}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-foreground">
                      {step.body}
                    </p>
                    {index === 0 ? (
                      <p className="mt-3 text-base leading-7">
                        <Link
                          href="https://docs.convoform.com/concepts/form-creation"
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-foreground underline underline-offset-4"
                        >
                          How form creation works
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <ScreenshotFrame
            src="/images/use-cases/study-abroad/collected-fields.png"
            alt="Collected study-abroad answers, with marks stored as 84 percent"
            caption="Collected information stores shorter values. In this example marks are “84%”, and the budget is “25 lakh INR per year, tuition + living”."
            width={520}
            height={390}
            size="md"
            browser
          />
        </div>
        <div className="mt-10">
          <CreateIntakeLink />
        </div>
      </section>

      <section className={sectionSpacing} aria-labelledby="fields-heading">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="fields-heading">
            Collect the six details your first call needs
          </SectionHeading>
          <p className="mt-6 max-w-prose text-base leading-7 text-foreground">
            This study-abroad example uses six fields. Adjust the descriptions
            to match your consultancy&apos;s process.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl lg:hidden">
          <div className="divide-y overflow-hidden rounded-2xl border">
            {intakeFields.map((field) => (
              <div key={field.detail} className="space-y-4 p-4">
                <p className="text-base font-medium text-foreground">
                  {field.detail}
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    What to ask for
                  </p>
                  <p className="mt-1 text-base leading-7 text-foreground">
                    {field.ask}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Why it helps the counsellor
                  </p>
                  <p className="mt-1 text-base leading-7 text-foreground">
                    {field.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 hidden max-w-4xl overflow-x-auto rounded-2xl border lg:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[18%] text-foreground">
                  Student detail
                </TableHead>
                <TableHead className="w-[41%] text-foreground">
                  What to ask for
                </TableHead>
                <TableHead className="text-foreground">
                  Why it helps the counsellor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intakeFields.map((field) => (
                <TableRow key={field.detail}>
                  <TableCell className="align-top font-medium text-foreground">
                    {field.detail}
                  </TableCell>
                  <TableCell className="align-top leading-6 text-foreground">
                    {field.ask}
                  </TableCell>
                  <TableCell className="align-top leading-6 text-foreground">
                    {field.why}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-foreground">
          A student who hasn&apos;t chosen a country or taken IELTS may still be
          worth speaking to. Configure the intake to capture &quot;not
          decided&quot; and &quot;not taken yet&quot; honestly, rather than
          pushing students to invent an answer.
        </p>
      </section>

      <section
        className={cn(sectionSpacing, "mx-auto max-w-5xl")}
        aria-labelledby="scope-heading"
      >
        <SectionHeading id="scope-heading">
          What you can use today, and what isn&apos;t included
        </SectionHeading>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Available today
            </h3>
            <ul className="mt-4 list-disc space-y-3 ps-5 text-base leading-7 text-foreground">
              {availableToday.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Not included in this intake workflow today
            </h3>
            <div className="mt-4 space-y-4 text-base leading-7 text-foreground">
              <p>
                Today, ConvoForm collects answers and lets your team review the
                conversation. It does not score leads, send WhatsApp summaries
                or book counselling appointments. Your team handles follow-up.
              </p>
              <p>
                AI can misunderstand an answer. Accepted answers are not
                verified academic records, proof of funds or an admissions
                assessment. Review important details with the student.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(sectionSpacing, "mx-auto max-w-3xl")}
        aria-labelledby="faq-heading"
      >
        <SectionHeading id="faq-heading">
          Questions from consultancy owners
        </SectionHeading>
        <div className="mt-6 border-t">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="border-b [&[open]_svg]:rotate-180"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </summary>
              <p className="max-w-prose pb-4 text-base leading-7 text-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section
        className={cn(sectionSpacing, "mx-auto max-w-prose")}
        aria-labelledby="close-heading"
      >
        <SectionHeading id="close-heading">
          Give your next counselling call a better starting point
        </SectionHeading>
        <p className="mt-6 text-base leading-7 text-foreground">
          Collect the student&apos;s plans and current situation before the
          call. Let your counsellor spend that conversation understanding the
          student, rather than starting from a name and number.
        </p>
        <div className="mt-8">
          <CreateIntakeLink />
        </div>
        <p className="mt-4 text-sm leading-6 text-foreground">
          Start with destination, course, intake, marks, budget and tests.
          Review the form, test a few unclear answers, then share it.
        </p>
      </section>
    </main>
  );
}
