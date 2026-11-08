import { Hero } from "@/app/(public)/(landingPage)/_components/hero";
import { JsonLd } from "@/components/common/jsonLd";
import {
  createFaqPageJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/structuredData";
import type { Metadata } from "next";
import { DemoSection } from "./_components/demoSection";
import { FAQ_ITEMS } from "./_components/faq/content";
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
      <JsonLd data={softwareApplicationJsonLd} />
      <JsonLd data={createFaqPageJsonLd(FAQ_ITEMS)} />

      <Hero />

      <HowItWorksSection />

      <div
        id="use-cases"
        className="mx-auto my-12 max-w-[1160px] scroll-mt-20 px-4"
      >
        <UseCases />
      </div>

      <section
        id="demo"
        aria-labelledby="demo-heading"
        className="min-w-0 scroll-mt-20 overflow-x-clip px-4 pb-[76px] pt-10 font-sans min-[900px]:pb-[112px]"
      >
        <div className="mx-auto w-full max-w-[1160px]">
          <div className="text-center">
            <h2
              id="demo-heading"
              className="mx-auto max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink"
            >
              Live demo
            </h2>
          </div>
          <div className="mt-8 min-[900px]:mt-10">
            <DemoSection />
          </div>
        </div>
      </section>

      <TrustSection />

      <FounderNote />

      <FaqSection />

      <FinalCtaSection />
    </main>
  );
}
