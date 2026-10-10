import { Hero } from "@/app/(public)/(landingPage)/_components/hero";
import type { Metadata } from "next";
import { Achievements } from "./_components/achievements";
import { DemoSection } from "./_components/demoSection";
import { LazyLiveDemoResponses } from "./_components/demoSection/LazyLiveDemoResponses";
import { DemoResponsesShell } from "./_components/demoSection/demoResponsesShell";
import { Technologies } from "./_components/technologies";
import { UseCases } from "./_components/useCases";

export const metadata: Metadata = {
  title: {
    absolute: "ConvoForm | Create Conversational Forms",
  },
  alternates: {
    canonical: "/",
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
      <div className="grid min-w-0 lg:grid-cols-2 gap-8 lg:items-center lg:min-h-[calc(100vh-6rem)]">
        <Hero />
        <DemoSection />
      </div>

      {/* Live Responses Section */}
      <div className="my-12 flex justify-center max-lg:hidden">
        <DemoResponsesShell>
          <LazyLiveDemoResponses />
        </DemoResponsesShell>
      </div>

      <div className="my-12">
        <UseCases />
      </div>

      {/* New headline section */}
      <div className="min-w-0 py-8 lg:py-14">
        <div className="container mx-auto min-w-0 max-w-full px-4 text-center lg:px-10">
          <h2 className="mb-2 max-w-full break-words text-2xl font-bold text-gray-800 lg:text-4xl">
            The <span className="text-brand-500">AI-Powered</span>{" "}
            conversational forms{" "}
            <span className="text-brand-500">you need</span>
          </h2>
        </div>
      </div>

      {/* Technologies section with Docker support */}
      <div className="my-12">
        <Technologies />
      </div>

      <div className="my-10">
        <Achievements />
      </div>
    </main>
  );
}
