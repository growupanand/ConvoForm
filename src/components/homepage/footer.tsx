import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { brandName } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full mb-2 lg:mb-5 mt-10 lg:mt-20 max-lg:px-6">
      <div className="flex flex-col lg:flex-row justify-start items-center gap-3">
        <Button variant="link" className="text-lg py-0" asChild>
          <Link href="/">{brandName}</Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Created by{" "}
          <Link
            href="https://www.linkedin.com/in/utkarshanand93/"
            target="_blank"
          >
            <span className="font-bold">Utkarsh Anand</span>
          </Link>
        </span>
        <Button variant="outline" className="max-lg:w-full lg:ml-auto" asChild>
          <Link
            href="https://github.com/growupanand/smart-form-wizard"
            target="_blank"
          >
            <span className="mr-2">
              <Image src="/github.svg" alt="github" width={20} height={20} />
            </span>
            <span>View on Github</span>
          </Link>
        </Button>
      </div>
    </footer>
  );
}
