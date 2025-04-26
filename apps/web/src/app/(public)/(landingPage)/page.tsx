import { Hero } from "@/app/(public)/(landingPage)/_components/hero";
import type { Metadata } from "next";
import { Achievements } from "./_components/achievements";
import { DemoSection } from "./_components/demoSection";
import { LazyLiveDemoResponses } from "./_components/demoSection/LazyLiveDemoResponses";
import { DemoResponsesShell } from "./_components/demoSection/demoResponsesShell";

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
    <main className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 lg:items-center lg:min-h-[calc(100vh-6rem)]">
        <Hero />
        <DemoSection />
      </div>

      {/* Live Responses Section */}
      <div className="my-12 flex justify-center max-lg:hidden">
        <DemoResponsesShell>
          <LazyLiveDemoResponses />
        </DemoResponsesShell>
      </div>

      <div className="my-10">
        <Achievements />
      </div>
      {/* New headline section */}
      <div className="py-8 lg:py-14">
        <div className="container mx-auto px-4 lg:px-10 text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-2 text-gray-800">
            The <span className="text-brand-500">AI-Powered</span>{" "}
            conversational forms{" "}
            <span className="text-brand-500">you need</span>
          </h2>
        </div>
      </div>
    </main>
  );
}
