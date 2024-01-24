import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { getFrontendBaseUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { GithubStars } from "./githubStar";

export function Hero() {
  const demoFormLink = getFrontendBaseUrl() + "/view/demo";

  return (
    <section className="md:my-15 my-10 flex w-full flex-col justify-center gap-1 py-4 text-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <Link
          href="https://github.com/growupanand/ConvoForm"
          target="_blank"
          rel="noreferrer nofollow noopener"
        >
          <GithubStars />
        </Link>
        <Badge variant="outline" className="group text-sm font-normal">
          <Link
            href="https://github.com/growupanand/ConvoForm"
            target="_blank"
            rel="noreferrer nofollow noopener"
            className="flex items-center"
          >
            <span className="mr-2">
              <Image src="/github.svg" alt="github" width={15} height={15} />
            </span>
            <span>Proudly Open Source</span>
            <ChevronRight
              className="ml-1 transition-all group-hover:translate-x-0.5"
              size="15px"
            />
          </Link>
        </Badge>
      </div>
      <div className="mb-3 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-gray-700 lg:text-6xl ">
          Create your own AI-Powered conversational form
        </h1>
        <p className="mx-auto text-lg text-muted-foreground lg:text-2xl">
          Build engaging and interactive forms that are easy to fill and fun to
          answer.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          className={cn("rounded-full lg:text-lg", montserrat.className)}
          asChild
        >
          <LinkN href="/auth/register" rel="noreferrer nofollow noopener">
            Get started
          </LinkN>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn("rounded-full  lg:text-lg", montserrat.className)}
          asChild
        >
          <LinkN href={demoFormLink} target="_blank">
            Try demo form
          </LinkN>
        </Button>
      </div>
    </section>
  );
}
