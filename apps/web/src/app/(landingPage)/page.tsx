import { Hero } from "@/app/(landingPage)/_components/hero";
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
      </div>

      <div className="my-10">
        <Achievements />
      </div>
      {/* New headline section */}
      <div className="py-8 lg:py-14">
        <div className="container mx-auto px-4 lg:px-10 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-2 text-gray-800">
            The <span className="text-brand-500">Only Open Source</span>{" "}
            conversational forms
          </h2>
        </div>
      </div>

      <SectionContainer>
        <Footer />
      </SectionContainer>
    </main>
  );
}
