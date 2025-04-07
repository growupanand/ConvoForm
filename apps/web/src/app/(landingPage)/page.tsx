import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import { TopHeader } from "@/components/common/topHeader";
import type { Metadata } from "next";
import { Achievements } from "./_components/achievements";
import { DemoSection } from "./_components/demoSection";
import { Footer } from "./_components/footer";
import { SectionContainer } from "./_components/sectionShell";

export const metadata: Metadata = {
  title: {
    absolute: "ConvoForm | Create Conversational Forms",
  },
  openGraph: {
    title: {
      absolute: "ConvoForm | Create Conversational Forms",
    },
    images: ["/api/og"],
  },
};

export default function Home() {
  return (
    <main>
      <TopHeader className="lg:fixed max-lg:mb-10 top-0 z-50" />
      <div className="grid space-y-5 lg:space-y-32 ">
        <div className="container mx-auto lg:px-10 grid lg:grid-cols-2 gap-8 lg:items-center lg:min-h-screen lg:py-16">
          <Hero />
          <DemoSection />
        </div>
        <SectionContainer>
          <div className="grid gap-1 lg:grid-cols-2">
            <HowToUseSection />
            <Pricing />
          </div>
          <div className="mt-10">
            <Achievements />
          </div>
        </SectionContainer>
      </div>
      <SectionContainer>
        <Footer />
      </SectionContainer>
    </main>
  );
}
