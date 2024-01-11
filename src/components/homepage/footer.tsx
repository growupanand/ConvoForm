import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { brandName } from "@/lib/constants";
import { Button } from "../ui/button";

export function Footer() {
  return (
    <footer className="mb-2 mt-10 w-full max-lg:px-6 lg:mb-5 lg:mt-20">
      <div className="flex flex-col items-center justify-start gap-2 lg:flex-row">
        <span aria-label="App name" className={montserrat.className}>
          {brandName}
        </span>

        <Button variant="link" size="icon" className="" asChild>
          <Link
            href="https://github.com/growupanand/smart-form-wizard"
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Visit Github Repo"
          >
            <Image src="/github.svg" alt="Github logo" width={20} height={20} />
          </Link>
        </Button>
        <p className="text-md flex items-center text-muted-foreground">
          <Mail className="mr-2 h-5 w-5" /> contact@convoform.com
        </p>
        <span className="text-md lg:ml-auto">
          Created by{" "}
          <Link
            href="https://www.linkedin.com/in/utkarshanand93/"
            target="_blank"
            aria-label="Visit Utkarsh Anand's Linkedin Profile"
            rel="noopener noreferrer nofollow"
          >
            <span className="font-medium">Utkarsh Anand</span>
          </Link>
        </span>
      </div>
    </footer>
  );
}
