import { Badge } from "@convoform/ui/components/ui/badge";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@convoform/ui/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { montserrat, nohemi } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { AnimatedTypingDots } from "@/components/common/typingDots";
import { getFrontendBaseUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { GithubStars } from "./githubStar";

export function Hero() {
  const demoFormLink = `${getFrontendBaseUrl()}/view/demo`;

  return (
    <section className="flex w-full flex-col justify-center gap-1 text-center">
      <div className="mb-3 flex flex-col items-center justify-center gap-3 lg:mb-5">
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
              <Image src="/github.svg" alt="github" width={15} height={15} />
            </span>
            <span>Proudly Open Source</span>
            <ChevronRight
              className="ml-1 transition-all group-hover:translate-x-0.5"
              size="15px"
            />
            <GithubStars />
          </Link>
        </Badge>
      </div>

      <Card className="border-none bg-transparent shadow-none lg:mb-12">
        <CardHeader className="mb-6">
          <h1
            className={cn(
              "text-3xl font-normal leading-normal  text-gray-700 lg:text-7xl lg:leading-snug",
              nohemi.className,
            )}
          >
            Create
            <span className="mx-3 rounded-full px-4 shadow-md outline outline-gray-100 lg:px-6">
              <AnimatedTypingDots dotClassName="bg-gray-700 lg:size-4 size-2" />
            </span>
            Your <br />
            <span className="bg-brand-500 convo-word me-1 rounded-full px-5 pb-1 pt-2 text-white lg:me-3 lg:pe-5 lg:ps-8 lg:pt-4 ">
              Convo
              <span className="convo-arrow bg-brand-500" />
            </span>{" "}
            Form
          </h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mx-auto text-xl font-normal leading-7">
            Build your own AI-Powered conversational form, Which are engaging
            and interactive forms that are easy to build and fun to answer.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          className={cn(
            "rounded-full lg:py-7 lg:text-lg",
            montserrat.className,
          )}
          asChild
        >
          <LinkN href="/auth/register" rel="noreferrer nofollow noopener">
            Get started
          </LinkN>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "rounded-full lg:py-7 lg:text-lg",
            montserrat.className,
          )}
          asChild
        >
          <LinkN href={demoFormLink} target="_blank">
            Try demo form
          </LinkN>
        </Button>
      </div>
      <div className="flex items-center justify-center">
        <Link
          href="https://peerlist.io/growupanand/project/convoform?utm_source=convoform.com"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Visit project page on Peerlist"
        >
          <div className="mt-10 overflow-hidden rounded-full bg-white p-4 shadow-md outline outline-gray-100">
            <Image
              src="/images/winnerPeerlist.svg"
              alt="winner project of the month"
              width={130}
              height={128}
              quality={100}
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
