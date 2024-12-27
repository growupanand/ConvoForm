"use client";

import { useCallback } from "react";

import { AskScreen } from "@/components/formViewer/askScreen";
import { EndScreen } from "@/components/formViewer/endScreen";
import { TopProgressBar } from "@/components/formViewer/topProgressBar";
import { WelcomeScreen } from "@/components/formViewer/welcomeScreen";
import { AnimatePresence } from "framer-motion";
import { useFormContext } from "./formContext";

type Props = {
  isPreview?: boolean;
};

export function FormViewer({ isPreview: _ }: Readonly<Props>) {
  const {
    currentSection,
    setCurrentSection,
    convoFormHook,
    currentFormDesign,
    endScreenMessage,
    totalSubmissionProgress,
    form,
  } = useFormContext();

  const {
    submitAnswer,
    currentQuestion,
    isBusy,
    currentField,
    startConversation,
  } = convoFormHook;

  const shouldShowProgressBar = currentSection === "questions-screen";

  const handleCTAClick = useCallback(async () => {
    await startConversation();
    setCurrentSection("questions-screen");
  }, []);

  const handlePostCTAClick = useCallback(
    () => setCurrentSection("questions-screen"),
    [],
  );

  const handleResetForm = useCallback(() => {
    convoFormHook.resetForm();
    setCurrentSection("landing-screen");
  }, [convoFormHook, setCurrentSection]);

  return (
    <div className="container max-w-[800px]">
      <AnimatePresence mode="wait">
        {shouldShowProgressBar && (
          <TopProgressBar
            totalProgress={totalSubmissionProgress}
            onReset={handleResetForm}
          />
        )}
        {((currentSection as string) === "" ||
          currentSection === "landing-screen" ||
          currentSection === "default-screen") && (
          <WelcomeScreen
            onCTAClick={handleCTAClick}
            postCTAClick={handlePostCTAClick}
            title={form.welcomeScreenTitle}
            message={form.welcomeScreenMessage}
            CTALabel={form.welcomeScreenCTALabel}
            fontColor={currentFormDesign.fontColor}
          />
        )}

        {currentSection === "questions-screen" && (
          <AskScreen
            currentQuestion={currentQuestion}
            isFormBusy={isBusy}
            submitAnswer={submitAnswer}
            currentField={currentField}
            fontColor={currentFormDesign.fontColor}
          />
        )}
        {currentSection === "ending-screen" && (
          <EndScreen
            endScreenMessage={endScreenMessage}
            endScreenCTALabel={form.endScreenCTALabel || undefined}
            endScreenCTAUrl={form.endScreenCTAUrl || undefined}
            fontColor={currentFormDesign.fontColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
