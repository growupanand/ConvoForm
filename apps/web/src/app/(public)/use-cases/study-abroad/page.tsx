import { nohemi } from "@/app/fonts/customFonts";
import {
  studyAbroadArticlePath,
  studyAbroadUseCasePath,
} from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, CardContent, CardHeader } from "@convoform/ui";
import {
  BookOpenCheck,
  CalendarClock,
  Clock3,
  Flame,
  Globe2,
  GraduationCap,
  ListChecks,
  StickyNote,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Study-abroad student intake",
  description:
    "Why study-abroad consultancies use conversational intake instead of static forms—and what ConvoForm ships today versus what is planned.",
  alternates: {
    canonical: studyAbroadUseCasePath,
  },
  openGraph: {
    title: "Study-abroad student intake | ConvoForm",
    description:
      "Qualify student inquiries before a counsellor picks up the phone. Honest look at ConvoForm today and on the roadmap.",
    images: ["/api/og"],
  },
};

const painPoints = [
  {
    icon: Clock3,
    title: "The same questions, every inquiry",
    body: "WhatsApp and walk-ins restart from zero: marks, destination, course, intake, budget, tests. Counsellors spend the first call collecting basics.",
  },
  {
    icon: Flame,
    title: "Ready students wait in line",
    body: "Someone with IELTS done and an intake in mind gets the same queue as a browser. Slow first replies push them to the next consultancy.",
  },
  {
    icon: StickyNote,
    title: "Context lives in chats, not one place",
    body: "Notes scatter across messages and registers. Without a structured handoff, follow-ups depend on whoever remembers the thread.",
  },
] as const;

const exampleIntakeFields = [
  { icon: BookOpenCheck, label: "Marks" },
  { icon: Globe2, label: "Destination" },
  { icon: GraduationCap, label: "Course" },
  { icon: CalendarClock, label: "Intake" },
  { icon: Wallet, label: "Budget" },
  { icon: ListChecks, label: "Tests (IELTS / TOEFL / GRE)" },
] as const;

const shipsToday = [
  "AI conversational forms students complete on a link—no app install",
  "Form builder with field types, branching, and design controls",
  "Structured responses with full conversation transcripts",
  "Shareable links and embeddable forms for your site or campaigns",
  "Google Forms import and integrations such as Google Sheets",
] as const;

const planned = [
  "WhatsApp (or channel) summary to the counsellor after each intake",
  "Hot / warm / not-ready lead scoring from your qualification rules",
  "One-click study-abroad intake template tuned to consultancy workflows",
  "Automatic routing and booking nudges for qualified students",
] as const;

const productScreenshots = [
  {
    src: "/images/use-cases/study-abroad/conversational-form.png",
    alt: "ConvoForm demo form with a conversational question on screen",
    caption:
      "Live demo form at convoform.com/view/demo—students answer one question at a time.",
  },
  {
    src: "/images/use-cases/study-abroad/homepage-demo.png",
    alt: "ConvoForm homepage showing the interactive product demo",
    caption:
      "The same conversational experience your consultancy can publish today.",
  },
] as const;

export default function StudyAbroadUseCasePage() {
  return (
    <main className="container mx-auto px-4 pb-16 lg:px-10">
      <header className="mx-auto max-w-3xl py-10 text-center lg:py-16 lg:text-left">
        <Badge
          variant="outline"
          className="mb-4 text-xs font-medium px-3 py-1.5 lg:text-sm"
        >
          <GraduationCap className="me-1.5 size-4 text-brand-500" />
          Use case · Study-abroad consultancies
        </Badge>
        <h1
          className={cn(
            "text-3xl font-normal leading-normal text-gray-800 lg:text-5xl lg:leading-normal",
            nohemi.className,
          )}
        >
          Qualify student inquiries{" "}
          <span className="rounded-full bg-brand-500 px-3 text-white lg:px-4">
            before
          </span>{" "}
          a counsellor spends a minute on them
        </h1>
        <p className="mt-4 text-base text-subtle-foreground lg:text-lg">
          Founder-led consultancies in India lose hours to repeat intake on
          WhatsApp and walk-ins. A conversational intake collects the same facts
          your counsellor asks for—then hands off structured answers instead of
          a wall of chat.
        </p>
      </header>

      <section className="py-10 lg:py-14" aria-labelledby="pain-heading">
        <h2
          id="pain-heading"
          className="text-center text-2xl font-bold text-gray-800 lg:text-4xl"
        >
          Why a static form is not enough
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {painPoints.map((problem) => (
            <Card key={problem.title} className="rounded-3xl">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
                  <problem.icon className="size-5 text-brand-500" />
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="font-medium text-gray-800">{problem.title}</h3>
                <p className="text-sm text-subtle-foreground">{problem.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-10 lg:py-14" aria-labelledby="fields-heading">
        <h2
          id="fields-heading"
          className="text-center text-2xl font-bold text-gray-800 lg:text-4xl"
        >
          Example student intake fields
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-subtle-foreground">
          These are the fields from our study-abroad intake example—not a
          separate demo you have to build. You configure the same topics as
          questions in ConvoForm today.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          {exampleIntakeFields.map((field) => (
            <Card key={field.label} className="rounded-3xl">
              <CardContent className="flex flex-col items-center gap-3 pb-6 pt-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
                  <field.icon className="size-5 text-brand-500" />
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {field.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-10 lg:py-14" aria-labelledby="screenshots-heading">
        <h2
          id="screenshots-heading"
          className="text-center text-2xl font-bold text-gray-800 lg:text-4xl"
        >
          ConvoForm today
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-subtle-foreground">
          Screenshots captured from the live product (October 2026), not
          mockups.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {productScreenshots.map((shot) => (
            <figure key={shot.src} className="space-y-3">
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1280}
                  height={800}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="text-center text-sm text-subtle-foreground lg:text-left">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="py-10 lg:py-14" aria-labelledby="shipping-heading">
        <h2
          id="shipping-heading"
          className="text-center text-2xl font-bold text-gray-800 lg:text-4xl"
        >
          Ships today vs planned
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-subtle-foreground">
          We label roadmap items plainly so you are not sold futures as finished
          product.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-brand-200">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Badge className="bg-brand-500 text-white">Ships today</Badge>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 ps-5 text-sm text-gray-800">
                {shipsToday.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-dashed">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Badge variant="outline">Planned</Badge>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 ps-5 text-sm text-subtle-foreground">
                {planned.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-2xl py-8 text-center text-sm text-subtle-foreground">
        <p>
          Want the longer walkthrough with limitations spelled out? Read the{" "}
          <Link
            href={studyAbroadArticlePath}
            className="font-medium text-brand-600 underline-offset-4 hover:underline"
          >
            demonstration-led article
          </Link>
          . Try the{" "}
          <Link
            href="/view/demo"
            className="font-medium text-brand-600 underline-offset-4 hover:underline"
          >
            public demo form
          </Link>{" "}
          in another tab.
        </p>
      </section>

      <section className="flex flex-col items-center gap-4 py-10 text-center lg:py-14">
        <h2 className="max-w-xl text-2xl font-bold text-gray-800 lg:text-3xl">
          Build your student intake in ConvoForm
        </h2>
        <p className="max-w-lg text-subtle-foreground">
          Free to start. Configure your destinations, courses, and qualification
          questions—then share one link on WhatsApp or your site.
        </p>
        <Button
          size="lg"
          className="rounded-full py-3 font-montserrat text-base shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg lg:py-5"
          asChild
        >
          <Link href="/auth/register" rel="noreferrer nofollow noopener">
            Start building
          </Link>
        </Button>
      </section>
    </main>
  );
}
