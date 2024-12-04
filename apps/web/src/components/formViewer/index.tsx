"use client";

import { useCallback } from "react";

import { AskScreen } from "@/components/formViewer/askScreen";
import { EndScreen } from "@/components/formViewer/endScreen";
import { TopProgressBar } from "@/components/formViewer/topProgressBar";
import { WelcomeScreen } from "@/components/formViewer/welcomeScreen";
import { useFormContext } from "./formContext";

type Props = {
  isPreview?: boolean;
};

export function FormViewer({ isPreview }: Readonly<Props>) {
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

  const shouldShowProgressBar =
    !isPreview &&
    (currentSection === "questions-screen" ||
      currentSection === "ending-screen");

  const handleCTAClick = useCallback(async () => {
    await startConversation();
    setCurrentSection("questions-screen");
  }, []);

  const handlePostCTAClick = useCallback(
    () => setCurrentSection("questions-screen"),
    [],
  );

  return (
    <div className="container max-w-[800px]">
      {shouldShowProgressBar && (
        <TopProgressBar totalProgress={totalSubmissionProgress} />
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
    </div>
  );
}
