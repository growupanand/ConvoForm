import { Badge } from "@convoform/ui";
import { Button } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { CheckCircle2, ChevronRight, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { nohemi } from "@/app/fonts/customFonts";
import { AnimatedTypingDots } from "@/components/common/typingDots";
import { cn } from "@/lib/utils";
import { GithubStars } from "./githubStar";
import { UserStats } from "./userStats";

export function Hero() {
  return (
    <section className="flex w-full flex-col justify-start items-center lg:items-start gap-2 lg:gap-3 text-center lg:text-left">
      <Badge
        variant="outline"
        className="group text-xs font-medium px-2 py-0.5 lg:px-3 lg:py-2 lg:text-sm"
      >
        <Link
          href="https://github.com/growupanand/ConvoForm"
          target="_blank"
          rel="noreferrer nofollow noopener"
          className="flex items-center"
        >
          <span className="mr-1 lg:mr-1.5">
            <Image
              src="images/icons/github.svg"
              alt="github"
              width={10}
              height={10}
              className="lg:size-[13px] size-[10px]"
            />
          </span>
          <span className="font-normal">Proudly Open Source</span>
          <ChevronRight
            className="ml-1 transition-all group-hover:translate-x-0.5"
            size="10px"
          />
          <GithubStars />
        </Link>
      </Badge>

      <Card className="border-none bg-transparent shadow-none w-full">
        <CardHeader className="mb-6 px-0 space-y-0">
          <h1
            className={cn(
              "text-3xl lg:text-5xl font-normal text-gray-800 leading-normal lg:leading-normal",
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

        <CardContent className="px-0 flex justify-center lg:justify-start">
          <div className="flex flex-wrap max-lg:flex-col max-lg:items-start justify-start gap-2 font-medium text-base text-muted-foreground">
            <span className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1.5">
              <CheckCircle2 className="size-6 fill-brand-500 text-white" />
              100% Free
            </span>
            <span className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1.5">
              <CheckCircle2 className="size-6 fill-brand-500 text-white" />
              No credit card required
            </span>
            <span className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1.5">
              <CheckCircle2 className="size-6 fill-brand-500 text-white" />
              Enterprise-grade features
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex max-lg:flex-col max-lg:justify-center items-center gap-3 mt-6 lg:mt-4">
        <Button
          size="lg"
          className="rounded-full py-3 lg:py-5 text-base lg:text-base font-montserrat shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
          asChild
        >
          <Link href="/auth/register" rel="noreferrer nofollow noopener">
            Start Building
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-[1px] w-4 bg-gray-300 " />
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="h-[1px] w-4 bg-gray-300 " />
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="rounded-full py-3 text-[#673AB7] lg:py-5 text-base lg:text-base font-montserrat shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]"
          asChild
        >
          <Link href="/auth/register" rel="noreferrer nofollow noopener">
            <FileText className="size-6 me-2 text-[#673AB7]" />
            Import Google Form
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="lg:hidden mt-4 rounded-full py-3 lg:py-5 text-base font-montserrat hover:bg-gray-50"
          asChild
        >
          <Link
            href="/view/demo"
            target="_blank"
            rel="noreferrer nofollow noopener"
          >
            See demo form
          </Link>
        </Button>
      </div>
      {/* User stats added to hero section */}
      <div className="mt-6 lg:mt-8 w-full flex justify-center lg:justify-start">
        <UserStats />
      </div>
    </section>
  );
}
