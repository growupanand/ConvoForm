"use client";

import { FormDesignLayout } from "@/app/(formSubmissionPage)/view/[formId]/_components/formDesignLayout";
import BrowserWindow from "@/components/common/browserWindow";
import { FormViewer } from "@/components/formViewer";
import { getFrontendBaseUrl } from "@/lib/url";
import { animate, motion } from "motion/react";
import { useEffect, useState } from "react";
import { DEMO_FORM_ID } from "../constants";

const demoFormLink = `${getFrontendBaseUrl()}/view/${DEMO_FORM_ID}`;

export const DemoFormCard = ({ isInView }: { isInView: boolean }) => {
  const [animationFinished, setAnimationFinished] = useState(false);

  const initializeForm = async () => {
    await animate(".form-card", { opacity: 1 }, { delay: 0.2, duration: 0.5 });
    setAnimationFinished(true);
  };

  useEffect(() => {
    if (isInView) {
      initializeForm();
    }
  }, [isInView]);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} className="form-card">
        <BrowserWindow
          className="shadow-none w-[800px] h-[600px]"
          link={demoFormLink}
          hideCopyButton
        >
          <FormDesignLayout>
            {animationFinished && (
              <div className="h-full flex flex-col items-center justify-center">
                <FormViewer />
              </div>
            )}
          </FormDesignLayout>
        </BrowserWindow>
      </motion.div>
    </div>
  );
};
