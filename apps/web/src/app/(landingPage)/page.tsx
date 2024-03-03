import { Features } from "@/app/(landingPage)/_components/features";
import { Hero } from "@/app/(landingPage)/_components/hero";
import { HowToUseSection } from "@/app/(landingPage)/_components/howToUse";
import { Pricing } from "@/app/(landingPage)/_components/pricing";
import { RequestFeatureCard } from "@/components/changeLogPage/requestFeatureCard";
import { NewFeature } from "./_components/newFeature";
import { ScreenshotSlider } from "./_components/screenshotsSlider";
import { SectionCard } from "./_components/sectionCard";
import { SectionShell } from "./_components/sectionShell";

export default function Home() {
  return (
    <div className="grid space-y-5 lg:space-y-20 ">
      <SectionShell>
        <Hero />
      </SectionShell>

      <SectionShell>
        <SectionCard title="What's New" stickyHeader>
          <NewFeature />
        </SectionCard>
      </SectionShell>
      <SectionShell className="max-lg:hidden">
        <SectionCard title="Screenshots" stickyHeader>
          <ScreenshotSlider />
        </SectionCard>
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
      <SectionShell>
        <div className="px-5">
          <RequestFeatureCard />
        </div>
      </SectionShell>
    </div>
  );
}
