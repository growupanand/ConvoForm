import { Badge } from "@convoform/ui";
import { Button } from "@convoform/ui";
import { GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";

import { nohemi } from "@/app/fonts/customFonts";
import { cn } from "@/lib/utils";
import { DemoCtaButton } from "./demoCta";
import { CounsellorSummaryMock } from "./summaryMock";

export function VerticalHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:items-center lg:min-h-[calc(100vh-6rem)]">
      <div className="flex w-full flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        <Badge
          variant="outline"
          className="text-xs font-medium px-3 py-1.5 lg:text-sm"
        >
          <GraduationCap className="size-4 me-1.5 text-brand-500" />
          For study-abroad consultancies
        </Badge>

        <h1
          className={cn(
            "text-3xl lg:text-5xl font-normal text-gray-800 leading-normal lg:leading-normal",
            nohemi.className,
          )}
        >
          Qualify every student inquiry{" "}
          <span className="bg-brand-500 rounded-full px-3 lg:px-4 text-white">
            before
          </span>{" "}
          a counsellor spends a minute on it
        </h1>

        <p className="max-w-xl text-base lg:text-lg text-subtle-foreground">
          One AI conversation captures marks, destination, course, intake,
          budget, test scores, backlogs and visa history, scores the lead hot,
          warm or not-ready, and sends your counsellor a WhatsApp summary.
        </p>

        <div className="mt-2 flex max-lg:flex-col items-center gap-3">
          <DemoCtaButton />
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full py-3 lg:py-5 text-base font-montserrat shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
            asChild
          >
            <Link href="#how-it-works">
              <PlayCircle className="size-5 me-2" />
              Watch a 90-second demo
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <CounsellorSummaryMock />
      </div>
    </section>
  );
}
