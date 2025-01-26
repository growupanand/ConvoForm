import { Badge } from "@convoform/ui";
import { Button } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { nohemi } from "@/app/fonts/customFonts";
import { LinkN } from "@/components/common/linkN";
import { AnimatedTypingDots } from "@/components/common/typingDots";
import { cn } from "@/lib/utils";
import { GithubStars } from "./githubStar";

export function Hero() {
  return (
    <section className="flex w-full flex-col justify-center items-center gap-1 text-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <Badge
          variant="outline"
          className="group text-sm font-medium lg:px-4 lg:py-3 lg:text-base"
        >
          <Link
            href="https://github.com/growupanand/ConvoForm"
            target="_blank"
            rel="noreferrer nofollow noopener"
            className="flex items-center"
          >
            <span className="mr-2">
              <Image
                src="images/icons/github.svg"
                alt="github"
                width={15}
                height={15}
              />
            </span>
            <span className="font-normal">Proudly Open Source</span>
            <ChevronRight
              className="ml-1 transition-all group-hover:translate-x-0.5"
              size="15px"
            />
            <GithubStars />
          </Link>
        </Badge>
      </div>

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="mb-6">
          <h1
            className={cn(
              "text-3xl font-normal leading-normal  text-gray-700 lg:text-7xl lg:leading-snug",
              nohemi.className,
            )}
          >
            Create
            <span className="mx-3 rounded-full px-4 shadow-md outline outline-gray-100 lg:px-6 align-middle ">
              <AnimatedTypingDots dotClassName="bg-gray-700 lg:size-4 size-2" />
            </span>
            Your <br />
            <span className="bg-brand-500 rounded-full px-5 me-2 lg:me-6 text-white relative inline-flex   ">
              Convo
              <span className="z-10 absolute -bottom-2 lg:-bottom-6 left-0 lg:left-2 rotate-[20deg] size-0 border-brand-500 border-r-[20px] border-t-[20px] lg:border-r-[40px] lg:border-t-[40px] border-r-transparent" />
            </span>
            Form
          </h1>
        </CardHeader>
        <CardContent>
          <div className=" mx-auto text-2xl lg:text-nowrap text-left font-normal leading-7">
            AI-powered conversational forms that are easy, engaging, and fun to
            use.
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          className="rounded-full lg:py-7 lg:text-lg font-montserrat"
          asChild
        >
          <LinkN href="/auth/register" rel="noreferrer nofollow noopener">
            Get started
          </LinkN>
        </Button>
      </div>
    </section>
  );
}
