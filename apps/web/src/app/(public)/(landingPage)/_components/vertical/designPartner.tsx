import { Card, CardContent } from "@convoform/ui";
import { Handshake } from "lucide-react";
import { DemoCtaButton } from "./demoCta";

export function DesignPartnerSection() {
  return (
    <section className="py-14 lg:py-20">
      <Card className="rounded-3xl bg-brand-500 text-white">
        <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10 text-center lg:pt-14 lg:pb-14">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/15">
            <Handshake className="size-6 text-white" />
          </span>
          <h2 className="text-2xl lg:text-4xl font-bold">
            Onboarding 3 consultancies as design partners
          </h2>
          <p className="max-w-xl text-sm lg:text-base text-white/85">
            Get the full qualification flow set up around your counselling
            process, direct access to the founder, and a say in what gets built
            next. In return, we learn from your real student inquiries.
          </p>
          <DemoCtaButton className="bg-white text-brand-600 hover:bg-white/90">
            Apply for a design-partner spot
          </DemoCtaButton>
        </CardContent>
      </Card>
    </section>
  );
}
