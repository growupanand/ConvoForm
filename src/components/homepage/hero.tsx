import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { auth } from "@clerk/nextjs";
import Image from "next/image";

export function Hero() {
  const demoFormLink = process.env.DEMO_FORM_LINK;
  const { userId } = auth();
  const isLoggedin = !!userId;

  return (
    <div className="my-10 flex w-full flex-col justify-center gap-1 px-3 py-4 text-center md:my-15 md:p-6">
      <div>
        <Badge variant="outline">
          <Link
            href="https://github.com/growupanand/smart-form-wizard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center"
          >
            <span className="mr-2">
              <Image src="/github.svg" alt="github" width={15} height={15} />
            </span>
            <span>Proudly Open Source</span>
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Badge>
      </div>
      <div className="flex flex-col gap-6 mb-3">
        <h1
          className={cn(
            "text-foreground font-semibold text-4xl md:text-6xl",
            "bg-gradient-to-tl from-[hsl(var(--muted))] from-0% to-[hsl(var(--foreground))] to-30% bg-clip-text text-transparent"
          )}
        >
          Create your own conversational form
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-lg md:max-w-lg md:text-xl">
          Build engaging and interactive forms that are easy to fill and fun to
          answer.
        </p>
      </div>
      <div className="flex justify-center items-center gap-3">
        <Button size="lg" className="rounded-full sm:w-auto" asChild>
          <Link href={isLoggedin ? "/dashboard" : "/auth/register"}>
            Get started
          </Link>
        </Button>
        {demoFormLink && (
          <Button
            size="lg"
            variant="outline"
            className="rounded-full sm:w-auto font-semibold"
            asChild
          >
            <Link href={demoFormLink} target="_blank">
              Try demo form
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
