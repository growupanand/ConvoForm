import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import { TopHeader } from "@/components/common/topHeader";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    <main className="min-h-screen">
      <TopHeader className="lg:fixed max-lg:mb-10 top-0 z-50" />
      <div className="grid space-y-5 lg:space-y-32">
        <SectionContainer className="lg:min-h-screen flex items-center justify-center">
          <Hero />
        </SectionContainer>
        <DemoSection />

        {/* <SectionShell>
        <SectionCard title="What's New">
          <NewFeature />
        </SectionCard>
      </SectionShell> */}
        <SectionContainer className="max-lg:hidden">
          <ScreenshotSlider />
        </SectionContainer>
        <SectionContainer>
          <div className="grid gap-1 lg:grid-cols-2">
            <HowToUseSection />
            <Pricing />
          </div>
        </SectionContainer>
        <div className="flex items-center justify-center">
          <Link
            href="https://peerlist.io/growupanand/project/convoform?utm_source=convoform.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Visit project page on Peerlist"
          >
            <div className="overflow-hidden rounded-full bg-white p-4 shadow-md outline outline-gray-100">
              <Image
                src="/images/winnerPeerlist.svg"
                alt="winner project of the month"
                width={130}
                height={128}
                quality={100}
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="lg:container">
        <Footer />
      </div>
    </main>
  );
}
