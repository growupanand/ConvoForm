import { Features } from "@/app/(landingPage)/_components/features";
import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import BrowserWindow from "@/components/common/browserWindow";
import { getFrontendBaseUrl } from "@/lib/url";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { DEMO_FORM_ID } from "./_components/constants";
import { DemoCardSkeleton } from "./_components/demoCard";
import { ScreenshotSlider } from "./_components/screenshotsSlider";
import { SectionContainer } from "./_components/sectionShell";

const LazyDemoCard = dynamic(
  () => import("./_components/demoCard").then((mod) => mod.DemoCard),
  {
    ssr: false,
    loading: () => <DemoCardSkeleton />,
  },
);

export default function Home() {
  const demoFormLink = `${getFrontendBaseUrl()}/view/${DEMO_FORM_ID}`;

  return (
    <div className="mt-5 grid space-y-5 lg:mt-32 lg:space-y-32">
      <SectionContainer>
        <Hero />
      </SectionContainer>
      <SectionContainer className="max-lg:hidden">
        <BrowserWindow link={demoFormLink} hideCopyButton>
          <div className="min-h-[500px] flex items-center justify-center">
            <LazyDemoCard />
          </div>
        </BrowserWindow>
      </SectionContainer>

      {/* <SectionShell>
        <SectionCard title="What's New">
          <NewFeature />
        </SectionCard>
      </SectionShell> */}
      <SectionContainer className="max-lg:hidden">
        <ScreenshotSlider />
      </SectionContainer>

      <SectionContainer>
        <Features />
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
  );
}
