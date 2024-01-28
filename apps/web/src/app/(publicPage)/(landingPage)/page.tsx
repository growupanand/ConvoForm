import { Features } from "@/components/landingPage/features";
import { Hero } from "@/components/landingPage/hero";
import { HowToUseSection } from "@/components/landingPage/howToUse";
import { Pricing } from "@/components/landingPage/pricing";

export default function Home() {
  return (
    <div className="grid space-y-5 ">
      <Hero />
      <Features />
      <div className="grid gap-1 lg:grid-cols-2">
        <HowToUseSection />
        <Pricing />
      </div>
    </div>
  );
}
