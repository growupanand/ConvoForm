import { Button } from "@convoform/ui/components/ui/button";
import { Card } from "@convoform/ui/components/ui/card";
import { ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

import { marck_script } from "@/app/fonts/customFonts";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Footer() {
  return (
    <Card className="lg:rounded-tremor-full bg-brand-50 shadow-brand-100 mt-10 rounded-none px-5 py-10 lg:mb-10 lg:mt-20 lg:px-24">
      <footer>
        <div className="flex  items-start justify-between ">
          <div className="flex flex-col items-start lg:flex-row lg:gap-5">
            <span className="text-muted-foreground mb-5 p-2">
              ConvoForm © 2024
            </span>
            <OtherLinks />
          </div>
          <div className="flex flex-col justify-end">
            <SocialIcons />
          </div>
        </div>
        <div className="flex items-center justify-center pt-5 lg:pt-10">
          <MadeBy />
        </div>
      </footer>
    </Card>
  );
}

const SocialIcons = () => {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="link" className="px-0" asChild>
        <Link
          href="https://github.com/growupanand/ConvoForm"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Visit Github Repo"
        >
          <Image
            src="images/icons/github.svg"
            alt="github"
            width={20}
            height={20}
          />
        </Link>
      </Button>

      <Button variant="link" className="px-0" asChild>
        <Link
          href="https://www.instagram.com/growupanand"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Visit Instagram page"
        >
          <Image
            src="images/icons/instagram.svg"
            alt="github"
            width={20}
            height={20}
          />
        </Link>
      </Button>
      <Button variant="link" className="px-0" asChild>
        <Link
          href="https://twitter.com/growupanand"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Visit Twitter page"
        >
          <Image
            src="images/icons/twitter.svg"
            alt="github"
            width={20}
            height={20}
          />
        </Link>
      </Button>
      <Button variant="link" className="px-0" asChild>
        <Link
          href="mailto:contact@convoform.com"
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Send us an email"
        >
          <Mail size="20px" className="mr-2" />
        </Link>
      </Button>
    </div>
  );
};

const OtherLinks = () => {
  return (
    <div className="flex flex-col items-start justify-start">
      <Button variant="link" size="sm" asChild>
        <Link href="/changelog">Changelog</Link>
      </Button>
      <Button variant="link" size="sm" asChild>
        <Link
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Visit npm package website"
          href="https://www.npmjs.com/package/@convoform/react"
        >
          <span className="flex items-center">
            <span>@convoform/react</span>{" "}
            <ExternalLink className="ms-2 h-4 w-4" />
          </span>
        </Link>
      </Button>
    </div>
  );
};

const MadeBy = () => {
  return (
    <div className="">
      <span className={cn("text-sm font-light")}>Made with ❤️ by</span>
      <Link
        href="https://www.linkedin.com/in/utkarshanand93/"
        target="_blank"
        aria-label="Visit Utkarsh Anand's Linkedin Profile"
        rel="noopener noreferrer nofollow"
      >
        <span
          className={cn(
            " ml-1 text-2xl font-extrabold underline",
            marck_script.className,
          )}
        >
          Utkarsh Anand
        </span>
      </Link>
    </div>
  );
};
