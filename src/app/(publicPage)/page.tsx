import { Hero } from "@/components/homepage/hero";
import { Features } from "@/components/homepage/features";
import { Pricing } from "@/components/homepage/pricing";
import { HowToUseSection } from "@/components/homepage/howToUse";
export default async function Home() {
  return (
    <div className="grid space-y-5 ">
      <Hero />
      <Features />
      <div className="grid lg:grid-cols-2 gap-1">
        <HowToUseSection />
        <Pricing />
      </div>
    </div>
  );
}
