import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import { TopHeader } from "@/components/common/topHeader";
import type { Metadata } from "next";

import { ChevronDown } from "lucide-react";
import { Achievements } from "./_components/achievements";
import { DemoSection } from "./_components/demoSection";
import { Footer } from "./_components/footer";
import { ScreenshotSlider } from "./_components/screenshotsSlider";
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
      <div className="grid space-y-5 lg:space-y-32">
        <SectionContainer className="lg:min-h-screen relative flex items-center justify-center">
          <Hero />
          <div className="absolute bottom-10 animate-bounce max-lg:hidden">
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-2xl font-medium">Live Demo</span>
              <ChevronDown className="size-10 " />
            </div>
          </div>
        </SectionContainer>
        <SectionContainer>
          <DemoSection />
        </SectionContainer>
        <SectionContainer className="max-lg:hidden ">
          <ScreenshotSlider />
        </SectionContainer>
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
