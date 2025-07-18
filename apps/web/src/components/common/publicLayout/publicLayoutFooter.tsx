import { Button } from "@convoform/ui";
import { Card } from "@convoform/ui";
import { ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

import { marck_script } from "@/app/fonts/customFonts";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function PublicLayoutFooter({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "bg-emphasis border-4  shadow-none mt-10 lg:rounded-full px-5 py-10 lg:mb-10 lg:mt-20 lg:px-24",
        className,
      )}
    >
      <footer>
        <div className="flex  items-start justify-between ">
          <div className="flex flex-col items-start lg:flex-row lg:gap-5">
            <span className="text-subtle-foreground mb-5 p-2">
              ConvoForm © 2025
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
    <div className="flex items-center justify-end flex-wrap gap-3">
      <Button variant="secondary" asChild>
        <Link
          href="https://discord.gg/aeYtKyn2E2"
          target="_blank"
          rel="noreferrer nofollow noopener"
          className="flex items-center"
        >
          <span className="mr-1 lg:mr-1.5">
            <Image
              src="images/icons/discord.svg"
              alt="discord"
              width={16}
              height={16}
            />
          </span>
          <span className="font-normal">Join our Discord</span>
          <ExternalLink className="size-3 ms-1 transition-all group-hover:translate-x-0.5" />
        </Link>
      </Button>
      <Link
        href="https://github.com/growupanand/ConvoForm"
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label="Visit Github Repo"
      >
        <span>
          <Image
            src="images/icons/github.svg"
            alt="github"
            width={20}
            height={20}
          />
        </span>
      </Link>

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
      <Link
        href="mailto:contact@convoform.com"
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label="Send us an email"
      >
        <Mail size="20px" />
      </Link>
    </div>
  );
};

const OtherLinks = () => {
  return (
    <div className="flex max-lg:flex-col items-start justify-start">
      <Button variant="link" size="sm" asChild>
        <Link href="/changelog">Changelog</Link>
      </Button>
      <Button variant="link" size="sm" asChild>
        <Link href="/privacy">Privacy Policy</Link>
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
