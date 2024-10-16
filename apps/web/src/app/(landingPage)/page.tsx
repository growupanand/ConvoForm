import { Features } from "@/app/(landingPage)/_components/features";
import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import Image from "next/image";
import Link from "next/link";
// import { NewFeature } from "./_components/newFeature";
import { ScreenshotSlider } from "./_components/screenshotsSlider";
import { SectionShell } from "./_components/sectionShell";

export default function Home() {
  return (
    <div className="mt-5 grid space-y-5 lg:mt-10 lg:space-y-20">
      <SectionShell>
        <Hero />
      </SectionShell>

      {/* <SectionShell>
        <SectionCard title="What's New">
          <NewFeature />
        </SectionCard>
      </SectionShell> */}
      <SectionShell className="max-lg:hidden">
        <ScreenshotSlider />
      </SectionShell>

      <SectionShell>
        <Features />
      </SectionShell>
      <SectionShell>
        <div className="grid gap-1 lg:grid-cols-2">
          <HowToUseSection />
          <Pricing />
        </div>
      </SectionShell>
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
  );
}
