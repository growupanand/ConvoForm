import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full mb-5 mt-20 py-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="link" className="text-lg" asChild>
            <Link href="/">Smart form wizard</Link>
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
        </div>
        <Button variant="outline" asChild>
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
