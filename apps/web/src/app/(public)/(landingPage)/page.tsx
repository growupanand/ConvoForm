import type { Metadata } from "next";
import { CaptureGridSection } from "./_components/vertical/captureGrid";
import { DesignPartnerSection } from "./_components/vertical/designPartner";
import { FaqSection } from "./_components/vertical/faqSection";
import { FinalCtaSection } from "./_components/vertical/finalCta";
import { HowItWorksSection } from "./_components/vertical/howItWorks";
import { ProblemSection } from "./_components/vertical/problemSection";
import { ProofSection } from "./_components/vertical/proofSection";
import { RoiSection } from "./_components/vertical/roiSection";
import { VerticalHero } from "./_components/vertical/verticalHero";

export const metadata: Metadata = {
  title: {
    absolute: "ConvoForm | Qualify every student inquiry",
  },
  openGraph: {
    title: {
      absolute: "ConvoForm | Qualify every student inquiry",
    },
    images: ["/api/og"],
  },
};

export default function Home() {
  return (
    <main className="container mx-auto">
      <VerticalHero />
      <ProblemSection />
      <HowItWorksSection />
      <CaptureGridSection />
      <RoiSection />
      <ProofSection />
      <DesignPartnerSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
