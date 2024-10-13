import Image from "next/image";

import type { FormDesignRenderSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import BrandName from "../common/brandName";

type Props = {
  endScreenMessage?: string;
  endScreenCTAUrl?: string;
  endScreenCTALabel?: string;
  formDesign: FormDesignRenderSchema;
};

export const EndScreen = (props: Props) => {
  const { formDesign } = props;
  const message = props.endScreenMessage || "Thank you for filling the form!";
  const ctaButtonLabel = props.endScreenCTALabel || "Close window";
  const showCTAButton =
    props.endScreenCTAUrl && props.endScreenCTAUrl.trim().length > 0;
  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1
            style={{ color: formDesign.fontColor }}
            className="whitespace-break-spaces break-words text-center font-extrabold text-4xl   transition-colors duration-500"
          >
            {message}
          </h1>
        </motion.div>

        {showCTAButton ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-center mt-10">
              <Button
                size="lg"
                className="font-montserrat whitespace-break-spaces rounded-full  font-medium transition-all hover:scale-110 active:scale-100 text-xl h-auto py-2 gap-2"
              >
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-muted-foreground text-center text-lg mt-6">
              You can now close this window.
            </p>
          </motion.div>
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
        <p className="text-muted-foreground mr-2 text-lg">Created using</p>
        <BrandName className="text-lg font-bold" />
      </div>
    </div>
  );
};
