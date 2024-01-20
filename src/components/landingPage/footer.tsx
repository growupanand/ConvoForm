import Link from "next/link";
import { Github, Instagram, Mail, Twitter } from "lucide-react";

import { marck_script, montserrat } from "@/app/fonts";
import { brandName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function Footer() {
  return (
    <footer className="mb-2 mt-10 w-full max-lg:px-6 lg:mb-5 lg:mt-20">
      <div className="flex flex-col items-center justify-start gap-2 lg:flex-row lg:gap-5">
        <span aria-label="App name" className={montserrat.className}>
          {brandName}
        </span>
        <div className="flex items-center gap-3">
          <Button variant="link" className="px-0" asChild>
            <Link
              href="https://github.com/growupanand/ConvoForm"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Visit Github Repo"
            >
              <Github size={20} />
            </Link>
          </Button>

          <Button variant="link" className="px-0" asChild>
            <Link
              href="https://www.instagram.com/growupanand"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Visit Instagram page"
            >
              <Instagram size="20px" />
            </Link>
          </Button>
          <Button variant="link" className="px-0" asChild>
            <Link
              href="https://twitter.com/growupanand"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Visit Twitter page"
            >
              <Twitter size="20px" />
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
        <span className="lg:ml-auto">
          <span className={cn("text-sm font-light", montserrat.className)}>
            Created by
          </span>
          <Link
            href="https://www.linkedin.com/in/utkarshanand93/"
            target="_blank"
            aria-label="Visit Utkarsh Anand's Linkedin Profile"
            rel="noopener noreferrer nofollow"
          >
            <span
              className={cn(
                "ml-1 text-2xl font-extrabold underline",
                marck_script.className,
              )}
            >
              Utkarsh Anand
            </span>
          </Link>
        </span>
      </div>
    </footer>
  );
}
