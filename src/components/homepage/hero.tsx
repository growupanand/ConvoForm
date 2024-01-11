import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function Hero() {
  const demoFormLink = process.env.DEMO_FORM_LINK;
  const { userId } = auth();
  const isLoggedin = !!userId;

  return (
    <div className="md:my-15 my-10 flex w-full flex-col justify-center gap-1 px-3 py-4 text-center md:p-6">
      <div>
        <Badge variant="outline">
          <Link
            href="https://github.com/growupanand/smart-form-wizard"
            target="_blank"
            rel="noreferrer nofollow noopener"
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
      <div className="mb-3 flex flex-col gap-6">
        <h1
          className={cn(
            "text-4xl font-semibold text-foreground md:text-6xl",
            "bg-gradient-to-tl from-[hsl(var(--muted))] from-0% to-[hsl(var(--foreground))] to-30% bg-clip-text text-transparent",
          )}
        >
          Create your own AI-Powered conversational form
        </h1>
        <p className="mx-auto max-w-md text-lg text-muted-foreground md:max-w-lg md:text-xl">
          Build engaging and interactive forms that are easy to fill and fun to
          answer.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          className={cn("rounded-full sm:w-auto", montserrat.className)}
          asChild
        >
          <Link
            href={isLoggedin ? "/dashboard" : "/auth/register"}
            rel="noreferrer nofollow noopener"
          >
            Get started
          </Link>
        </Button>
        {demoFormLink && (
          <Button
            size="lg"
            variant="outline"
            className={cn(
              "rounded-full font-semibold sm:w-auto",
              montserrat.className,
            )}
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
