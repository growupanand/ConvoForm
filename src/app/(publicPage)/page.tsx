import { Features } from "@/components/homepage/features";
import { Hero } from "@/components/homepage/hero";
import { HowToUseSection } from "@/components/homepage/howToUse";
import { Pricing } from "@/components/homepage/pricing";

export default async function Home() {
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
