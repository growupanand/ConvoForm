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
    <section className="md:my-15 my-10 flex w-full flex-col justify-center gap-1 py-4 text-center">
      <div>
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
            className={cn("rounded-full  lg:text-lg", montserrat.className)}
            asChild
          >
            <Link href={demoFormLink} target="_blank">
              Try demo form
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
