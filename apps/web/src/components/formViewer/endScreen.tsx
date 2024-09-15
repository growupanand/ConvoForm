import Image from "next/image";

import { Button } from "@convoform/ui/components/ui/button";
import Link from "next/link";
import BrandName from "../common/brandName";

type Props = {
  endScreenMessage?: string;
  endScreenCTAUrl?: string;
  endScreenCTALabel?: string;
};

export const EndScreen = (props: Props) => {
  const message = props.endScreenMessage || "Thank you for filling the form!";
  const ctaButtonLabel = props.endScreenCTALabel || "Done";
  const showCTAButton =
    props.endScreenCTAUrl && props.endScreenCTAUrl.trim().length > 0;
  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <h1 className="whitespace-break-spaces break-words text-center text-2xl font-semibold lg:text-4xl mb-4">
          {message}
        </h1>
        {showCTAButton ? (
          <div className="flex items-center justify-center">
            <Button size="lg">
              <Link
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                href={props.endScreenCTAUrl!}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Form submission completed"
              >
                {ctaButtonLabel}
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            You can now close this window.
          </p>
        )}
      </div>
      <div className="relative mt-10 h-[200px] w-full">
        <Image
          src="/images/GroovySittingDoodle.svg"
          alt="thank you image"
          fill
        />
      </div>
      <div className="mt-2 flex items-center">
        <p className="text-muted-foreground mr-2 text-sm">Form created using</p>
        <BrandName />
      </div>
    </div>
  );
};
