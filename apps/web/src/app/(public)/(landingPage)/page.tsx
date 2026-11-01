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

      <div
        id="use-cases"
        className="mx-auto my-12 max-w-[1160px] scroll-mt-20 px-4"
      >
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
      <div className="mx-auto my-12 max-w-[1160px] px-4">
        <Technologies />
      </div>

      <div className="my-10">
        <Achievements />
      </div>
    </main>
  );
}
