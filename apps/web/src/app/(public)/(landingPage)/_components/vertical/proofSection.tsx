import { Card, CardContent } from "@convoform/ui";
import { ShieldCheck } from "lucide-react";

export function ProofSection() {
  return (
    <section className="py-14 lg:py-20">
      <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
        Proof, when it is earned
      </h2>
      <Card className="mx-auto mt-10 max-w-2xl rounded-3xl border-dashed">
        <CardContent className="flex flex-col items-center gap-3 pt-10 pb-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-50">
            <ShieldCheck className="size-6 text-brand-500" />
          </span>
          <p className="max-w-md text-sm text-subtle-foreground">
            Results and logos from our first design partners will appear here.
            Until then, this space stays empty instead of showing made-up
            numbers or borrowed logos.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
