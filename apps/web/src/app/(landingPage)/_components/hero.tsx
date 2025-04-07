import { Badge } from "@convoform/ui";
import { Button } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { ChevronRight, Circle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { nohemi } from "@/app/fonts/customFonts";
import { LinkN } from "@/components/common/linkN";
import { AnimatedTypingDots } from "@/components/common/typingDots";
import { cn } from "@/lib/utils";
import { GithubStars } from "./githubStar";

export function Hero() {
  return (
    <section className="flex w-full flex-col justify-start items-center lg:items-start gap-2 lg:gap-3 text-center lg:text-left">
      <div className="flex flex-col items-center lg:items-start justify-start gap-2 lg:gap-3">
        <Badge
          variant="outline"
          className="group text-xs font-medium px-3 py-1 lg:px-4 lg:py-3 lg:text-base"
        >
          <Link
            href="https://github.com/growupanand/ConvoForm"
            target="_blank"
            rel="noreferrer nofollow noopener"
            className="flex items-center"
          >
            <span className="mr-1 lg:mr-2">
              <Image
                src="images/icons/github.svg"
                alt="github"
                width={12}
                height={12}
                className="lg:size-[15px] size-[12px]"
              />
            </span>
            <span className="font-normal">Proudly Open Source</span>
            <ChevronRight
              className="ml-1 transition-all group-hover:translate-x-0.5"
              size="12px"
            />
            <GithubStars />
          </Link>
        </Badge>
      </div>

      <Card className="border-none bg-transparent shadow-none w-full">
        <CardHeader className="mb-6 lg:mb-10 px-0">
          <h1
            className={cn(
              "text-3xl lg:text-5xl font-normal leading-tight text-gray-800 lg:leading-snug",
              nohemi.className,
            )}
          >
            Turn Static Forms
            <br />
            Into Smart
            <span className="mx-1 lg:mx-2 rounded-full px-2 shadow-md outline outline-gray-100 lg:px-5 align-middle">
              <AnimatedTypingDots dotClassName="bg-gray-700 lg:size-3 size-1.5" />
            </span>{" "}
            <br />
            <span className="bg-brand-500 rounded-full px-3 lg:px-4 me-1 lg:me-5 text-white relative inline-flex">
              Convo
              <span className="max-lg:hidden z-10 absolute -bottom-1 lg:-bottom-5 left-0 lg:left-2 rotate-[20deg] size-0 border-brand-500 border-r-[10px] border-t-[10px] lg:border-r-[30px] lg:border-t-[30px] border-r-transparent" />
            </span>
            Forms
          </h1>
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-xl lg:text-2xl text-center lg:text-left font-normal leading-7 lg:leading-7 text-muted-foreground max-w-xl mx-auto lg:mx-0">
            <p>Forms that pass the vibe check 😎</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 lg:gap-3 mt-4 lg:mt-3 font-medium text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                <Circle className="size-3 lg:size-4 fill-brand-500 text-brand-500" />
                No coding required
              </span>
              <span className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                <Circle className="size-3 lg:size-4 fill-brand-500 text-brand-500" />
                No credit card required
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 mt-6 lg:mt-4">
        <Button
          size="lg"
          className="rounded-full py-3 lg:py-5 text-base lg:text-base font-montserrat shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
          asChild
        >
          <LinkN href="/auth/register" rel="noreferrer nofollow noopener">
            Create your first form
          </LinkN>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="lg:hidden rounded-full py-3 lg:py-5 text-base font-montserrat hover:bg-gray-50 w-11/12 lg:w-auto"
          asChild
        >
          <LinkN
            href="/view/demo"
            target="_blank"
            rel="noreferrer nofollow noopener"
          >
            See demo
          </LinkN>
        </Button>
      </div>
    </section>
  );
}
