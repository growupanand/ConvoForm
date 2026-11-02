import { Hero } from "@/app/(public)/(landingPage)/_components/hero";
import type { Metadata } from "next";
import { Achievements } from "./_components/achievements";
import { BeforeAfterSection } from "./_components/beforeAfter";
import { DemoSection } from "./_components/demoSection";
import { LazyLiveDemoResponses } from "./_components/demoSection/LazyLiveDemoResponses";
import { DemoResponsesShell } from "./_components/demoSection/demoResponsesShell";
import { FaqSection } from "./_components/faq/faqSection";
import { FinalCtaSection } from "./_components/finalCta/finalCtaSection";
import { FounderNote } from "./_components/founder/founderNote";
import { HowItWorksSection } from "./_components/howItWorks/howItWorksSection";
import { TrustSection } from "./_components/trust/trustSection";
import { UseCases } from "./_components/useCases";

export const metadata: Metadata = {
  title: {
    absolute: "ConvoForm | Create Conversational Forms",
  },
  description:
    "ConvoForm turns a static form into a short conversation. AI drafts the form, respondents answer in chat, and vague answers get a follow-up before they are saved.",
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      absolute: "ConvoForm | Create Conversational Forms",
    },
    description:
      "ConvoForm turns a static form into a short conversation. AI drafts the form, respondents answer in chat, and vague answers get a follow-up before they are saved.",
  },
  openGraph: {
    title: {
      absolute: "ConvoForm | Create Conversational Forms",
    },
    description:
      "ConvoForm turns a static form into a short conversation. AI drafts the form, respondents answer in chat, and vague answers get a follow-up before they are saved.",
  },
};

export default function Home() {
  return (
    <main className="min-w-0">
      <Hero />

      {/* The real demo form stays exactly as it is, directly under the hero. */}
      <section
        id="demo"
        aria-labelledby="demo-heading"
        className="mx-auto w-full max-w-[1160px] scroll-mt-20 px-4 pt-2 font-sans min-[900px]:pt-4"
      >
        <h2 id="demo-heading" className="sr-only">
          Live demo
        </h2>
        <DemoSection />
      </section>

      {/* Live Responses Section */}
      <div className="mx-auto my-12 flex max-w-[1160px] justify-center px-4 max-lg:hidden">
        <DemoResponsesShell>
          <LazyLiveDemoResponses />
        </DemoResponsesShell>
      </div>

      <HowItWorksSection />

      <BeforeAfterSection />

      <div
        id="use-cases"
        className="mx-auto my-12 max-w-[1160px] scroll-mt-20 px-4"
      >
        <UseCases />
      </div>

      <div className="my-10">
        <Achievements />
      </div>

      <TrustSection />

      <FounderNote />

      <FaqSection />

      <FinalCtaSection />
    </main>
  );
}
