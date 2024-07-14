import { AspectRatio } from "@convoform/ui/components/ui/aspect-ratio";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function NewFeature() {
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3 lg:pt-6">
        <div className="lg:col-span-2">
          <div
            id="feature-image"
            className="overflow-hidden rounded-xl border lg:shadow-xl lg:transition lg:hover:scale-110"
          >
            <AspectRatio ratio={4 / 3}>
              <Image
                alt="screenshot of new feature in ConvoForm"
                src="/screenshots/newFeature.png"
                fill
                quality={100}
              />
            </AspectRatio>
          </div>
        </div>
        <div className="lg:col-span-1 lg:pt-5">
          <div className="">
            <h4 className=" mb-1   gap-2 whitespace-nowrap text-2xl font-normal lg:mb-5 lg:text-3xl">
              React npm Package
            </h4>
            <p className="text-md whitespace-break-spaces text-justify">
              Integrate conversational forms into your React applications
              effortlessly using the headless React hook.
              <Link
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Visit npm package website"
                href="https://www.npmjs.com/package/@convoform/react"
              >
                <span className="mt-3 flex items-center">
                  <span>@convoform/react</span>{" "}
                  <ExternalLink className="ms-2 h-4 w-4" />
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
