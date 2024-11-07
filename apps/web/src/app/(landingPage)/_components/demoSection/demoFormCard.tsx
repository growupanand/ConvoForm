"use client";

import BrowserWindow from "@/components/common/browserWindow";
import { FormViewer } from "@/components/formViewer";
import { getFrontendBaseUrl } from "@/lib/url";
import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DEMO_FORM_ID } from "../constants";

const demoFormLink = `${getFrontendBaseUrl()}/view/${DEMO_FORM_ID}`;

export const DemoFormCard = ({ isInView }: { isInView: boolean }) => {
  const [showForm, setShowForm] = useState(false);

  const initializeForm = async () => {
    await animate(".form-card", { opacity: 1 }, { delay: 0.2, duration: 0.5 });
    setShowForm(true);
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
          className="shadow-none"
          link={demoFormLink}
          hideCopyButton
        >
          <div className="w-[800px] h-[600px] flex flex-col items-center justify-center">
            {showForm && <FormViewer isPreview />}
          </div>
        </BrowserWindow>
      </motion.div>
    </div>
  );
};
